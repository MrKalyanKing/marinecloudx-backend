import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ProjectsQueryDto {
  @ApiPropertyOptional({ type: Number, description: "Page number (1-based)", minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: "Number of items per page (1-100)",
    minimum: 1,
    maximum: 100,
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ type: String, description: "Filter by category slug" })
  @IsOptional()
  @IsString()
  category?: string;
}
