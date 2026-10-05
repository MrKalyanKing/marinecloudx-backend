import { BadRequestException, Inject, Injectable, Logger, Optional } from "@nestjs/common";

import type { EducationEntry, WorkExperienceEntry } from "../../entities";
import {
  NullAiResumeExtractor,
  type AiResumeExtractor,
} from "./ai-resume-extractor";
import { ResumeParserService, type ParsedResume } from "./resume-parser.service";

export type ResumeExtractionMethod = "document" | "ai" | "partial";

export interface ResumeExtractionResult extends ParsedResume {
  method: ResumeExtractionMethod;
  /** True when core identity fields look trustworthy for autofill. */
  reliable: boolean;
  message?: string;
}

export const AI_RESUME_EXTRACTOR = Symbol("AI_RESUME_EXTRACTOR");

/**
 * Orchestrates resume autofill:
 *   Level 1 — document text extraction (PDF / DOCX / text)
 *   Level 2 — structured heuristic mapping
 *   Level 3 — AI only when Level 1/2 cannot reliably extract required fields
 */
@Injectable()
export class ResumeExtractionService {
  private readonly logger = new Logger(ResumeExtractionService.name);
  private readonly ai: AiResumeExtractor;

  constructor(
    @Inject(ResumeParserService) private readonly parser: ResumeParserService,
    @Optional() @Inject(AI_RESUME_EXTRACTOR) ai?: AiResumeExtractor,
  ) {
    this.ai = ai ?? new NullAiResumeExtractor();
  }

  async extract(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<ResumeExtractionResult> {
    let parsed: ParsedResume;
    try {
      parsed = await this.parser.parse(buffer, mimeType, fileName);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.warn(`Document parse failed for ${fileName}: ${(err as Error).message}`);
      throw new BadRequestException(
        "We couldn't read that resume. Please try a clear PDF or DOCX, or apply manually instead.",
      );
    }

    if (this.isReliable(parsed)) {
      const { rawText: _raw, ...safe } = parsed;
      return {
        ...safe,
        method: "document",
        reliable: true,
        message: "Details extracted from your resume. Please review before submitting.",
      };
    }

    if (this.ai.enabled && parsed.rawText) {
      try {
        const aiResult = await this.ai.extract({
          text: parsed.rawText,
          fileName,
        });
        if (aiResult) {
          const merged = this.merge(parsed, aiResult);
          const { rawText: _raw, ...safe } = merged;
          return {
            ...safe,
            method: "ai",
            reliable: this.isReliable(merged),
            message: this.isReliable(merged)
              ? "Details extracted with AI assistance. Please review before submitting."
              : "Some details could not be extracted. Please complete the missing fields.",
          };
        }
      } catch (err) {
        this.logger.warn(`AI resume extraction skipped: ${(err as Error).message}`);
      }
    }

    const { rawText: _raw, ...safe } = parsed;
    return {
      ...safe,
      method: "partial",
      reliable: false,
      message:
        "We could only extract some details. Please review and complete the form before submitting.",
    };
  }

  private isReliable(parsed: ParsedResume): boolean {
    const hasEmail = Boolean(parsed.email?.includes("@"));
    const hasName = Boolean(parsed.candidateName && parsed.candidateName.trim().length >= 2);
    return hasEmail && hasName;
  }

  private merge(base: ParsedResume, ai: {
    candidateName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    currentJobTitle?: string;
    yearsOfExperience?: number;
    summary?: string;
    skills?: string[];
  }): ParsedResume {
    return {
      candidateName: base.candidateName || ai.candidateName,
      email: base.email || ai.email,
      phone: base.phone || ai.phone,
      location: base.location || ai.location,
      linkedinUrl: base.linkedinUrl || ai.linkedinUrl,
      githubUrl: base.githubUrl || ai.githubUrl,
      portfolioUrl: base.portfolioUrl || ai.portfolioUrl,
      currentJobTitle: base.currentJobTitle || ai.currentJobTitle,
      yearsOfExperience: base.yearsOfExperience ?? ai.yearsOfExperience,
      summary: base.summary || ai.summary,
      skills: base.skills.length > 0 ? base.skills : (ai.skills ?? []),
      education: base.education,
      workExperience: base.workExperience,
      rawTextPreview: base.rawTextPreview,
      rawText: base.rawText,
    };
  }
}
