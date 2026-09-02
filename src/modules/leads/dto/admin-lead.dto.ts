import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

import { ActivityType, LeadStatus, Priority } from "../../../contracts";

class AdminContactDto {
  @ApiProperty({ type: String, example: "Jane", minLength: 1, maxLength: 150 })
  @IsString()
  @Length(1, 150)
  firstName!: string;

  @ApiPropertyOptional({ type: String, example: "Smith", minLength: 1, maxLength: 150 })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  lastName?: string;

  @ApiPropertyOptional({ type: String, example: "jane@example.com", maxLength: 320 })
  @IsOptional()
  @IsString()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ type: String, example: "+91 9876543210", minLength: 3, maxLength: 40 })
  @IsOptional()
  @IsString()
  @Length(3, 40)
  phone?: string;

  @ApiPropertyOptional({ type: String, example: "Mariner Inc.", minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  company?: string;
}

/** Internal creation — a team member logging an enquiry from another channel. */
export class CreateAdminLeadDto {
  @ApiProperty({ type: () => AdminContactDto })
  @ValidateNested()
  @Type(() => AdminContactDto)
  contact!: AdminContactDto;

  @ApiProperty({ type: String, example: "src_01hx...", minLength: 1, maxLength: 64, description: "Lead source UUID" })
  @IsString()
  @Length(1, 64)
  sourceId!: string;

  @ApiPropertyOptional({ type: String, example: "Mariner Inc.", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({ type: String, example: "Needs vessel tracking module.", maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirement?: string;

  @ApiPropertyOptional({ type: Number, example: 10000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ type: Number, example: 50000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ type: String, example: "USD", minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  budgetCurrency?: string;

  @ApiPropertyOptional({ type: String, example: "Q4 2026", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeline?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.HIGH })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({ type: String, example: "svc_01hx...", minLength: 1, maxLength: 64 })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  serviceId?: string;

  @ApiPropertyOptional({ type: String, example: "ind_01hx...", minLength: 1, maxLength: 64 })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  industryId?: string;
}

export class UpdateAdminLeadDto {
  @ApiPropertyOptional({ type: String, example: "Updated Corp", maxLength: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string | null;

  @ApiPropertyOptional({ type: String, example: "Revised requirement.", maxLength: 5000, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirement?: string | null;

  @ApiPropertyOptional({ type: String, example: "Q1 2027", maxLength: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeline?: string | null;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({ type: String, example: "svc_01hx...", minLength: 1, maxLength: 64, nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  serviceId?: string | null;

  @ApiPropertyOptional({ type: String, example: "ind_01hx...", minLength: 1, maxLength: 64, nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  industryId?: string | null;

  @ApiPropertyOptional({ type: Number, example: 5000, minimum: 0, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMin?: number | null;

  @ApiPropertyOptional({ type: Number, example: 25000, minimum: 0, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMax?: number | null;

  @ApiPropertyOptional({ type: String, example: "EUR", minLength: 3, maxLength: 3, nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  budgetCurrency?: string | null;
}

export class ChangeStageDto {
  @ApiProperty({ type: String, example: "stage_01hx...", minLength: 1, maxLength: 64, description: "Target pipeline stage UUID" })
  @IsString()
  @Length(1, 64)
  pipelineStageId!: string;
}

export class AssignLeadDto {
  @ApiPropertyOptional({
    type: String,
    example: "usr_01hx...",
    minLength: 1,
    maxLength: 64,
    nullable: true,
    description: "User UUID to assign, or null to unassign",
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  userId?: string | null;
}

export class CreateNoteDto {
  @ApiProperty({ type: String, example: "Called the client — interested in Phase 2.", maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  content!: string;
}

const LOGGABLE_ACTIVITY_TYPES = [
  ActivityType.CALL,
  ActivityType.EMAIL,
  ActivityType.MEETING,
  ActivityType.MESSAGE,
  ActivityType.WHATSAPP,
  ActivityType.PROPOSAL_SENT,
  ActivityType.FOLLOW_UP,
  ActivityType.OTHER,
];

export class CreateActivityDto {
  @ApiProperty({
    enum: LOGGABLE_ACTIVITY_TYPES,
    example: ActivityType.CALL,
    description: "Type of sales activity",
  })
  @IsIn(LOGGABLE_ACTIVITY_TYPES)
  type!: ActivityType;

  @ApiPropertyOptional({ type: String, example: "Discussed project timeline.", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class LeadListQueryDto {
  @ApiPropertyOptional({ type: String, description: "Full-text search" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LeadStatus, description: "Filter by lead status" })
  @IsOptional()
  @IsIn(Object.values(LeadStatus))
  status?: LeadStatus;

  @ApiPropertyOptional({ type: String, example: "stage_01hx...", description: "Filter by pipeline stage UUID" })
  @IsOptional()
  @IsString()
  pipelineStageId?: string;

  @ApiPropertyOptional({ type: String, example: "src_01hx...", description: "Filter by source UUID" })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional({ type: String, example: "svc_01hx...", description: "Filter by service UUID" })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    type: String,
    example: "usr_01hx...",
    description: "Filter by assigned user UUID, or the literal 'unassigned'",
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
