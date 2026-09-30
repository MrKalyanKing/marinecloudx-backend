import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import {
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  JobStatus,
} from "../../../contracts";

/* -------------------------------------------------------------------------- */
/* Shared nested shapes                                                        */
/* -------------------------------------------------------------------------- */

export class EducationEntryDto {
  @IsOptional() @IsString() @MaxLength(200) institution?: string;
  @IsOptional() @IsString() @MaxLength(200) degree?: string;
  @IsOptional() @IsString() @MaxLength(200) field?: string;
  @IsOptional() @IsString() @MaxLength(50) startDate?: string;
  @IsOptional() @IsString() @MaxLength(50) endDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}

export class WorkExperienceEntryDto {
  @IsOptional() @IsString() @MaxLength(200) company?: string;
  @IsOptional() @IsString() @MaxLength(200) position?: string;
  @IsOptional() @IsString() @MaxLength(50) startDate?: string;
  @IsOptional() @IsString() @MaxLength(50) endDate?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Jobs                                                                        */
/* -------------------------------------------------------------------------- */

export class JobListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
  @IsOptional() @IsString() @MaxLength(120) department?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
}

export class CreateJobDto {
  @IsString() @MinLength(2) @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MaxLength(120) department?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @IsString() @MinLength(10) @MaxLength(20000) description!: string;
  @IsOptional() @IsString() @MaxLength(20000) responsibilities?: string;
  @IsOptional() @IsString() @MaxLength(20000) requirements?: string;
  @IsOptional() @IsString() @MaxLength(10000) niceToHave?: string;
  @IsOptional() @IsString() @MaxLength(120) salaryRange?: string;
  @IsOptional() @IsDateString() applicationDeadline?: string;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
}

export class UpdateJobDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MaxLength(120) department?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(20000) description?: string;
  @IsOptional() @IsString() @MaxLength(20000) responsibilities?: string;
  @IsOptional() @IsString() @MaxLength(20000) requirements?: string;
  @IsOptional() @IsString() @MaxLength(10000) niceToHave?: string;
  @IsOptional() @IsString() @MaxLength(120) salaryRange?: string;
  @IsOptional() @IsDateString() applicationDeadline?: string | null;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
}

/* -------------------------------------------------------------------------- */
/* Applications                                                                */
/* -------------------------------------------------------------------------- */

export class ApplicationListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @IsOptional() @IsString() jobId?: string;
  @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @IsOptional() @IsString() @MaxLength(100) skill?: string;
  @IsOptional() @IsIn(["24h", "7d", "30d", "any"]) applied?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(50) minExperience?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(50) maxExperience?: number;
}

export class ChangeApplicationStatusDto {
  @IsEnum(ApplicationStatus) status!: ApplicationStatus;
}

export class BulkChangeStatusDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];

  @IsIn([
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ])
  status!: ApplicationStatus;
}

export class CreatePublicApplicationDto {
  @IsString() @MinLength(2) @MaxLength(200) candidateName!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsUrl() @MaxLength(500) linkedinUrl?: string;
  @IsOptional() @IsUrl() @MaxLength(500) githubUrl?: string;
  @IsOptional() @IsUrl() @MaxLength(500) portfolioUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) currentJobTitle?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(50) yearsOfExperience?: number;
  @IsOptional() @IsString() @MaxLength(5000) summary?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) skills?: string[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  education?: EducationEntryDto[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceEntryDto)
  workExperience?: WorkExperienceEntryDto[];
  @IsOptional() @IsString() @MaxLength(5000) coverLetter?: string;
  @IsOptional() @IsString() @MaxLength(120) noticePeriod?: string;
  @IsOptional() @IsString() @MaxLength(80) currentCtc?: string;
  @IsOptional() @IsString() @MaxLength(80) expectedCtc?: string;
  @IsOptional()
  @IsIn([ApplicationSource.RESUME_UPLOAD, ApplicationSource.MANUAL_APPLICATION, ApplicationSource.CAREERS_PAGE])
  applicationSource?: ApplicationSource;
}

export class ResumeUrlQueryDto {
  @IsOptional() @IsIn(["preview", "download"]) disposition?: "preview" | "download";
}
