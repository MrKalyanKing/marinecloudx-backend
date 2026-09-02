import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

import { Priority } from "../../../contracts";

class PublicContactDto {
  @ApiProperty({ type: String, example: "John", minLength: 1, maxLength: 150 })
  @IsString()
  @Length(1, 150)
  firstName!: string;

  @ApiPropertyOptional({ type: String, example: "Doe", minLength: 1, maxLength: 150 })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  lastName?: string;

  @ApiPropertyOptional({ type: String, example: "john@example.com", maxLength: 320 })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ type: String, example: "+91 98765 43210", minLength: 3, maxLength: 40 })
  @IsOptional()
  @IsString()
  @Length(3, 40)
  phone?: string;

  @ApiPropertyOptional({ type: String, example: "Acme Corp", minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  company?: string;
}

export class CreatePublicLeadDto {
  @ApiProperty({ type: () => PublicContactDto, description: "Contact information of the lead" })
  @ValidateNested()
  @Type(() => PublicContactDto)
  contact!: PublicContactDto;

  @ApiPropertyOptional({ type: String, example: "Acme Marine Solutions", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({
    type: String,
    example: "Looking for vessel tracking integration with our ERP.",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirement?: string;

  @ApiPropertyOptional({ type: Number, example: 50000, minimum: 0, description: "Budget lower bound in minor units" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ type: Number, example: 200000, minimum: 0, description: "Budget upper bound in minor units" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ type: String, example: "USD", minLength: 3, maxLength: 3, description: "ISO 4217 currency code" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  budgetCurrency?: string;

  @ApiPropertyOptional({ type: String, example: "Q3 2026", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeline?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM })
  @IsOptional()
  @IsIn(Object.values(Priority))
  priority?: Priority;

  @ApiPropertyOptional({ type: String, example: "svc_01hx...", minLength: 1, maxLength: 64, description: "Service UUID" })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  serviceId?: string;

  @ApiPropertyOptional({ type: String, example: "ind_01hx...", minLength: 1, maxLength: 64, description: "Industry UUID" })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  industryId?: string;
}
