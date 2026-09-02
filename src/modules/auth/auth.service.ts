import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserStatus } from "../../contracts";
import { UserEntity } from "../../entities";
import type { AuthenticatedUser } from "../../common";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { capabilitiesForRole } from "./roles";

interface Attempt {
  count: number;
  resetAt: number;
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60_000;
/** Same generic failure for every path — never reveals which check failed. */
const INVALID = "Invalid email or password.";

@Injectable()
export class AuthService {
  /**
   * Process-local login throttle — **failures only**. A correct password never
   * consumes quota and a successful sign-in clears the counter, so a user who
   * mistyped four times is not locked out after getting in. Same honest
   * limitation as the rest of the rate limiting (per-process).
   */
  private readonly failures = new Map<string, Attempt>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  /**
   * Verifies credentials and returns a signed session token.
   *
   * Every failure — unknown email, wrong password, no password set, suspended
   * account, throttled client — returns the same `UnauthorizedException` with
   * the same message and spends comparable CPU. The suspended check runs AFTER
   * the password check, so status is not detectable without the password.
   */
  async login(email: string, password: string): Promise<string> {
    const key = email.trim().toLowerCase();

    if (this.isThrottled(key)) {
      // Cost a bcrypt comparison anyway so a throttled response is not faster.
      await this.passwords.verifyWithDummy(password, null);
      throw new UnauthorizedException(INVALID);
    }

    const user = await this.users.findOne({
      where: { email: key },
      select: { id: true, passwordHash: true, status: true },
    });

    const ok = await this.passwords.verifyWithDummy(password, user?.passwordHash ?? null);
    if (!user || !ok || user.status !== UserStatus.ACTIVE) {
      this.recordFailure(key);
      throw new UnauthorizedException(INVALID);
    }

    this.failures.delete(key);
    await this.users.update(user.id, { lastLoginAt: new Date() });
    return this.tokens.sign(user.id);
  }

  /**
   * Resolves a token to the caller's current identity + capabilities.
   *
   * A valid token is not enough: the user must still exist and still be ACTIVE.
   * Role and capabilities are read fresh here on every request.
   */
  async resolve(token: string): Promise<AuthenticatedUser | null> {
    const userId = this.tokens.verify(token);
    if (!userId) return null;

    const user = await this.users.findOne({
      where: { id: userId },
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roleId: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE || !user.role) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.role.id,
      roleSlug: user.role.slug,
      capabilities: capabilitiesForRole(user.role.slug),
    };
  }

  private isThrottled(key: string): boolean {
    const a = this.failures.get(key);
    return Boolean(a && a.resetAt > Date.now() && a.count >= LOGIN_LIMIT);
  }

  private recordFailure(key: string): void {
    const now = Date.now();
    const a = this.failures.get(key);
    if (!a || a.resetAt <= now) {
      this.failures.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    } else {
      a.count += 1;
    }
  }
}
