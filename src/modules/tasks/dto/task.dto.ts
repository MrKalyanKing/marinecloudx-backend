import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

import { Priority, TaskStatus } from "../../../contracts";

export class CreateTaskDto {
  @ApiProperty({ type: String, example: "Follow up on proposal", maxLength: 300 })
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional({ type: String, example: "Send the revised quote PDF and wait for confirmation.", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ type: String, example: "lead_01hx...", description: "Associated lead UUID" })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ type: String, example: "usr_01hx...", description: "User to assign the task to" })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({ type: String, example: "2026-10-01T12:00:00Z", description: "ISO 8601 due date" })
  @IsOptional()
  @IsISO8601()
  dueAt?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ type: String, example: "Send revised proposal", maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ type: String, example: "Updated description.", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ type: String, example: "usr_01hx...", nullable: true, description: "Reassign or pass null to unassign" })
  @IsOptional()
  @IsString()
  assignedUserId?: string | null;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({ enum: TaskStatus, description: "Setting COMPLETED auto-stamps completedAt" })
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  status?: TaskStatus;

  @ApiPropertyOptional({ type: String, example: "2026-11-01T12:00:00Z", nullable: true })
  @IsOptional()
  @IsISO8601()
  dueAt?: string | null;
}

export class TaskListQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: "Filter by task status" })
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  status?: TaskStatus;

  @ApiPropertyOptional({ type: String, example: "usr_01hx...", description: "Filter by assigned user" })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ type: String, example: "lead_01hx...", description: "Filter by linked lead" })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ enum: Priority, description: "Filter by priority" })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({
    type: String,
    enum: ["overdue", "today", "upcoming"],
    description: "Filter by due-date bucket",
  })
  @IsOptional()
  @IsIn(["overdue", "today", "upcoming"])
  due?: "overdue" | "today" | "upcoming";

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
