/**
 * Optional AI fallback for resume extraction.
 * Implementations must be provider-agnostic; the default is a no-op.
 */
export interface AiResumeExtractionInput {
  text: string;
  fileName: string;
}

export interface AiResumeExtractionResult {
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
}

export interface AiResumeExtractor {
  readonly enabled: boolean;
  extract(input: AiResumeExtractionInput): Promise<AiResumeExtractionResult | null>;
}

/** Default: never call an AI model. */
export class NullAiResumeExtractor implements AiResumeExtractor {
  readonly enabled = false;

  async extract(): Promise<AiResumeExtractionResult | null> {
    return null;
  }
}
