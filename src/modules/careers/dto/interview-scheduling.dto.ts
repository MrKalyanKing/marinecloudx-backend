import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ApplicationSource, ApplicationStatus } from "../../../contracts";

export class CreateCandidateDto {
  @ApiProperty({ example: "Rahul Kumar" })
  @IsString()
  @IsNotEmpty()
  candidateName!: string;

  @ApiProperty({ example: "rahul@example.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "+91 9876543210" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "job-id-uuid" })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @ApiProperty({ enum: ApplicationSource, default: ApplicationSource.LINKEDIN })
  @IsEnum(ApplicationSource)
  applicationSource!: ApplicationSource;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.SHORTLISTED })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: "Applied via LinkedIn job post, 2+ years SEO experience." })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInterviewRoundDto {
  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  roundNumber?: number;

  @ApiProperty({ example: "Round 1: Skills Assessment" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ default: 30, example: 30 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(180)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: "Preliminary technical & role assessment." })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: "https://meet.google.com/abc-defg-hij" })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class UpdateMeetingLinkDto {
  @ApiProperty({ example: "https://meet.google.com/abc-defg-hij" })
  @IsString()
  @IsNotEmpty()
  meetingLink!: string;
}

export class TimeWindowDto {
  @ApiProperty({ example: "10:00", description: "HH:mm format (24h)" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "startTime must be in HH:mm 24-hour format" })
  startTime!: string;

  @ApiProperty({ example: "13:00", description: "HH:mm format (24h)" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "endTime must be in HH:mm 24-hour format" })
  endTime!: string;
}

export class ConfigureAvailabilityDto {
  @ApiProperty({ example: "2026-10-10", description: "YYYY-MM-DD" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate must be YYYY-MM-DD" })
  startDate!: string;

  @ApiProperty({ example: "2026-10-16", description: "YYYY-MM-DD" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "endDate must be YYYY-MM-DD" })
  endDate!: string;

  @ApiProperty({
    example: ["MON", "TUE", "WED", "THU", "FRI"],
    description: "Array of days: MON, TUE, WED, THU, FRI, SAT, SUN",
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  daysOfWeek!: string[];

  @ApiProperty({ type: [TimeWindowDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TimeWindowDto)
  timeWindows!: TimeWindowDto[];

  @ApiPropertyOptional({ default: 30, example: 30 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(180)
  durationMinutes?: number;

  @ApiPropertyOptional({ default: 0, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  bufferMinutes?: number;

  @ApiPropertyOptional({ default: "Asia/Kolkata", example: "Asia/Kolkata" })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class BookSlotDto {
  @ApiProperty({ example: "slot_abc123" })
  @IsString()
  @IsNotEmpty()
  slotId!: string;

  @ApiPropertyOptional({ example: "Looking forward to speaking with the team." })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: "Asia/Kolkata", example: "Asia/Kolkata" })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ example: "Candidate requested cancellation." })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RescheduleBookingDto {
  @ApiProperty({ example: "slot_xyz789" })
  @IsString()
  @IsNotEmpty()
  newSlotId!: string;

  @ApiPropertyOptional({ example: "Candidate requested different time." })
  @IsOptional()
  @IsString()
  reason?: string;
}
