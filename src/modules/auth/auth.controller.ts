import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from "@nestjs/swagger";
import type { Response } from "express";

import { CurrentUser, Public, type AuthenticatedUser } from "../../common";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { LoginDto } from "./dto/login.dto";

interface SessionUserDto {
  id: string;
  name: string;
  email: string;
  roleSlug: string;
  capabilities: readonly string[];
}

/**
 * The backend owns authentication. Frontend and admin never implement their own
 * — they call these endpoints and hold the httpOnly cookie only.
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly cookieName: string;
  private readonly isProd: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly tokens: TokenService,
  ) {
    this.cookieName = process.env.AUTH_COOKIE_NAME ?? "mcx_session";
    this.isProd = (process.env.NODE_ENV ?? "development") === "production";
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login with email and password", description: "Sets an httpOnly cookie on success." })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Login successful — session cookie set." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionUserDto> {
    const token = await this.authService.login(dto.email, dto.password);
    this.setCookie(res, token);

    const user = await this.authService.resolve(token);
    if (!user) throw new UnauthorizedException("Invalid email or password.");
    return this.toDto(user);
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Logout — clears the session cookie" })
  @ApiResponse({ status: 200, description: "Cookie cleared." })
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(this.cookieName, { path: "/" });
    return { ok: true };
  }

  @Get("session")
  @ApiCookieAuth("mcx_session")
  @ApiOperation({ summary: "Get current authenticated session" })
  @ApiResponse({ status: 200, description: "Currently authenticated user." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  session(@CurrentUser() user: AuthenticatedUser | undefined): SessionUserDto {
    if (!user) throw new UnauthorizedException();
    return this.toDto(user);
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiCookieAuth("mcx_session")
  @ApiOperation({ summary: "Refresh — re-signs the session token and updates the cookie" })
  @ApiResponse({ status: 200, description: "Token refreshed." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  refresh(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Res({ passthrough: true }) res: Response,
  ): SessionUserDto {
    if (!user) throw new UnauthorizedException();
    this.setCookie(res, this.tokens.sign(user.id));
    return this.toDto(user);
  }

  private setCookie(res: Response, token: string): void {
    res.cookie(this.cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.isProd,
      path: "/",
      maxAge: this.tokens.maxAgeMs,
    });
  }

  private toDto(user: AuthenticatedUser): SessionUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleSlug: user.roleSlug,
      capabilities: user.capabilities,
    };
  }
}
