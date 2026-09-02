import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class BlogQueryDto {
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1, description: "Page number (1-based)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 12, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ type: String, example: "maritime-tech", description: "Filter by category slug" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: String, example: "iot", description: "Filter by tag slug" })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ type: String, example: "vessel tracking", description: "Full-text search" })
  @IsOptional()
  @IsString()
  search?: string;
}
