import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PDFParse } from "pdf-parse";

import type { EducationEntry, WorkExperienceEntry } from "../../entities";

export interface ParsedResume {
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
  skills: string[];
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  rawTextPreview?: string;
  /** Full extracted text for internal AI fallback only — never returned to clients. */
  rawText?: string;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}/;
const LINKEDIN_RE = /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i;
const GITHUB_RE = /https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i;
const URL_RE = /https?:\/\/[^\s)]+/gi;

const SKILL_CANDIDATES = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C#", "C++", "PHP", "Ruby",
  "React", "Next.js", "Vue", "Angular", "Node.js", "NestJS", "Express", "Django", "Flask",
  "Spring", "PostgreSQL", "MySQL", "MongoDB", "Redis", "AWS", "Azure", "GCP", "Docker",
  "Kubernetes", "CI/CD", "GraphQL", "REST", "HTML", "CSS", "Tailwind", "Figma", "SQL",
  "Prisma", "TypeORM", "Kafka", "RabbitMQ", "Terraform", "Linux", "Git",
];

/**
 * Best-effort resume text extraction + heuristic field mapping.
 * Hard failures (unsupported type / corrupt PDF) become BadRequestException.
 */
@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  async parse(buffer: Buffer, mimeType: string, fileName: string): Promise<ParsedResume> {
    const text = await this.extractText(buffer, mimeType, fileName);
    if (!text.trim()) {
      throw new BadRequestException(
        "We couldn't read any text from this resume. Please try a clear PDF or DOCX, or apply manually.",
      );
    }
    const mapped = this.mapFields(text);
    return {
      ...mapped,
      rawTextPreview: text.slice(0, 500),
      rawText: text.slice(0, 20_000),
    };
  }

  private async extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
    const lower = fileName.toLowerCase();
    const isPdf = mimeType === "application/pdf" || lower.endsWith(".pdf");

    if (isPdf) {
      let parser: PDFParse | null = null;
      try {
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result?.text ?? "";
      } catch (err) {
        this.logger.warn(`PDF parse failed for ${fileName}: ${(err as Error).message}`);
        throw new BadRequestException(
          "We couldn't open this PDF. Please try another file, or apply manually.",
        );
      } finally {
        if (parser) await parser.destroy().catch(() => undefined);
      }
    }

    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lower.endsWith(".docx");

    if (isDocx) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        return result?.value ?? "";
      } catch (err) {
        this.logger.warn(`DOCX parse failed for ${fileName}: ${(err as Error).message}`);
        throw new BadRequestException(
          "We couldn't open this Word file. Please try a PDF or DOCX, or apply manually.",
        );
      }
    }

    if (lower.endsWith(".doc") || mimeType === "application/msword") {
      throw new BadRequestException(
        "This older Word format isn't supported. Please upload a PDF or DOCX instead.",
      );
    }

    if (
      mimeType.startsWith("text/") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".md")
    ) {
      return buffer.toString("utf8");
    }

    throw new BadRequestException(
      "Please upload your resume as a PDF or DOCX file.",
    );
  }

  private mapFields(text: string): ParsedResume {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const email = text.match(EMAIL_RE)?.[0]?.toLowerCase();
    const phoneMatch = text.match(PHONE_RE);
    const phone = phoneMatch?.[0]?.replace(/\s+/g, " ").trim();
    const linkedinUrl = text.match(LINKEDIN_RE)?.[0];
    const githubUrl = text.match(GITHUB_RE)?.[0];

    const urls = text.match(URL_RE) ?? [];
    const portfolioUrl = urls.find(
      (u) =>
        !/linkedin\.com/i.test(u) &&
        !/github\.com/i.test(u) &&
        !/mailto:/i.test(u),
    );

    let candidateName: string | undefined;
    for (const line of lines.slice(0, 8)) {
      if (EMAIL_RE.test(line) || PHONE_RE.test(line) || /^https?:/i.test(line)) continue;
      if (line.length < 3 || line.length > 80) continue;
      if (/resume|curriculum|cv|profile/i.test(line)) continue;
      candidateName = line.replace(/\s{2,}/g, " ");
      break;
    }

    const skills = SKILL_CANDIDATES.filter((skill) =>
      new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text),
    );

    const yearsMatch = text.match(
      /(\d{1,2}(?:\.\d)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/i,
    );
    const yearsOfExperience = yearsMatch ? Number(yearsMatch[1]) : undefined;

    const summary = this.extractSection(text, [
      "professional summary",
      "summary",
      "profile",
      "about me",
      "objective",
    ]);

    const experienceBlock = this.extractSection(text, [
      "work experience",
      "experience",
      "employment history",
      "professional experience",
    ]);
    const educationBlock = this.extractSection(text, [
      "education",
      "academic",
      "qualifications",
    ]);

    const workExperience = this.parseExperience(experienceBlock ?? "");
    const education = this.parseEducation(educationBlock ?? "");

    const currentJobTitle =
      workExperience[0]?.position ??
      lines.find((l) => /developer|engineer|designer|manager|analyst|architect/i.test(l));

    return {
      candidateName,
      email,
      phone: phone && phone.replace(/\D/g, "").length >= 8 ? phone : undefined,
      location: this.guessLocation(lines),
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      currentJobTitle,
      yearsOfExperience: Number.isFinite(yearsOfExperience) ? yearsOfExperience : undefined,
      summary: summary?.slice(0, 2000),
      skills,
      education,
      workExperience,
    };
  }

  private extractSection(text: string, headings: string[]): string | undefined {
    const lower = text.toLowerCase();
    for (const heading of headings) {
      const idx = lower.indexOf(heading);
      if (idx < 0) continue;
      const after = text.slice(idx + heading.length).replace(/^[\s:\-–—]+/, "");
      const next = after.search(
        /\n\s*(experience|education|skills|projects|certifications|awards|languages|interests)\b/i,
      );
      return (next > 0 ? after.slice(0, next) : after.slice(0, 2500)).trim();
    }
    return undefined;
  }

  private parseExperience(block: string): WorkExperienceEntry[] {
    if (!block) return [];
    const entries: WorkExperienceEntry[] = [];
    const chunks = block
      .split(/\n{2,}|(?=\n[A-Z][^\n]{2,60}\n)/)
      .filter((c) => c.trim().length > 10);
    for (const chunk of chunks.slice(0, 8)) {
      const lines = chunk.split(/\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const dateLine = lines.find(
        (l) => /\b(20\d{2}|19\d{2})\b/.test(l) && /[-–—to]|present|current/i.test(l),
      );
      const dates = dateLine?.match(/(20\d{2}|19\d{2}|Present|Current)/gi) ?? [];
      entries.push({
        position: lines[0]?.slice(0, 200),
        company: lines[1]?.slice(0, 200),
        startDate: dates[0],
        endDate: dates[1] ?? null,
        isCurrent: /present|current/i.test(dateLine ?? ""),
        description: lines.slice(dateLine ? 3 : 2).join(" ").slice(0, 2000),
      });
    }
    return entries;
  }

  private parseEducation(block: string): EducationEntry[] {
    if (!block) return [];
    const entries: EducationEntry[] = [];
    const chunks = block.split(/\n{2,}/).filter((c) => c.trim().length > 5);
    for (const chunk of chunks.slice(0, 6)) {
      const lines = chunk.split(/\n/).map((l) => l.trim()).filter(Boolean);
      const dates = chunk.match(/(20\d{2}|19\d{2})/g) ?? [];
      entries.push({
        degree: lines[0]?.slice(0, 200),
        institution: lines[1]?.slice(0, 200),
        startDate: dates[0],
        endDate: dates[1] ?? dates[0],
      });
    }
    return entries;
  }

  private guessLocation(lines: string[]): string | undefined {
    const locRe =
      /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)\b/;
    for (const line of lines.slice(0, 12)) {
      const m = line.match(locRe);
      if (m && !EMAIL_RE.test(line)) return `${m[1]}, ${m[2]}`;
    }
    return undefined;
  }
}
