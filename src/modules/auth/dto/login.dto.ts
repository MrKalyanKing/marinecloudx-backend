import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ type: String, example: "admin@marinecloudx.com", maxLength: 320, description: "User email address" })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ type: String, example: "••••••••", minLength: 1, maxLength: 200, description: "Account password" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password!: string;
}
