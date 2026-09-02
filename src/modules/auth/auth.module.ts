import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "../../entities";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

/**
 * Global so `AuthGuard` (registered as an APP_GUARD in AppModule) and
 * `PasswordService` (used by the seed and, later, user management) resolve
 * without every feature module re-importing this one.
 */
@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, AuthGuard],
  exports: [AuthService, PasswordService, TokenService, AuthGuard],
})
export class AuthModule {}

