import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CmsListQueryDto {
  @ApiPropertyOptional({ type: String, description: "Full-text search" })
  @IsOptional()
  @IsString()
  search?: string;

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

export class PublishActionDto {
  @ApiProperty({
    type: String,
    enum: ["publish", "unpublish"],
    example: "publish",
    description: "'publish' sets publishedAt to now; 'unpublish' clears it.",
  })
  @IsIn(["publish", "unpublish"])
  action!: "publish" | "unpublish";
}
