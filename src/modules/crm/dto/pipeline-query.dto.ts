import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { Priority } from "../../../contracts";

export class PipelineQueryDto {
  @ApiPropertyOptional({ type: String, description: "Full-text search across lead fields" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: String, description: "Filter by assigned user UUID" })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ type: String, description: "Filter by service UUID" })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ type: String, description: "Filter by lead source UUID" })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional({ enum: Priority, description: "Filter by priority level" })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({
    type: Number,
    description: "Max cards returned per pipeline stage (1-50)",
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  cardsPerStage?: number;
}
