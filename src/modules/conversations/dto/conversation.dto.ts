import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class StartConversationDto {
  @ApiPropertyOptional({
    type: Object,
    example: { locale: "en-IN", entryPage: "/services/vessel-tracking" },
    description: "Non-relational context (locale, entry page, user agent). Never stored as PII.",
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AppendMessageDto {
  @ApiProperty({
    type: String,
    example: "I would like to know more about your vessel tracking solution.",
    minLength: 1,
    maxLength: 8000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content!: string;

  @ApiPropertyOptional({
    type: Object,
    example: { attachmentId: "media_01hx..." },
    description: "Optional arbitrary message metadata",
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export interface MessageDto {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ConversationDto {
  sessionId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  messages: MessageDto[];
}
