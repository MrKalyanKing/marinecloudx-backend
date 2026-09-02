import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from "class-validator";

export class CreateContactDto {
  @ApiProperty({ type: String, example: "Jane", minLength: 1, maxLength: 150 })
  @IsString()
  @Length(1, 150)
  firstName!: string;

  @ApiPropertyOptional({ type: String, example: "Doe", minLength: 1, maxLength: 150 })
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

  @ApiPropertyOptional({ type: String, example: "Acme Corp", minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  company?: string;

  @ApiPropertyOptional({ type: String, example: "Fleet Manager", minLength: 1, maxLength: 150 })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  jobTitle?: string;

  @ApiPropertyOptional({ type: String, example: "https://acme.com", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;
}

export class ContactListQueryDto {
  @ApiPropertyOptional({ type: String, description: "Full-text search across name, email, company" })
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
