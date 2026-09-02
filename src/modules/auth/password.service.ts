import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

/**
 * Password hashing. bcrypt, cost 12 (OWASP-recommended), `bcryptjs` so there is
 * no native binary to build or ship.
 *
 * `verifyWithDummy` spends comparable CPU whether or not the account exists —
 * an unknown email costs the same as a wrong password, so timing cannot be
 * used to enumerate addresses.
 */
@Injectable()
export class PasswordService {
  private readonly cost: number;
  /** A real bcrypt hash to compare against when there is no user. */
  private dummyHash: string | null = null;

  constructor() {
    this.cost = Number(process.env.AUTH_BCRYPT_COST ?? 12);
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  /**
   * Verifies `plain` against `hash`. When `hash` is null (no such user, or an
   * invited account with no password), still runs a real comparison against a
   * throwaway hash and returns false.
   */
  async verifyWithDummy(plain: string, hash: string | null): Promise<boolean> {
    if (!hash) {
      if (!this.dummyHash) {
        this.dummyHash = await bcrypt.hash("dummy-value-never-matches", this.cost);
      }
      await bcrypt.compare(plain, this.dummyHash);
      return false;
    }
    return bcrypt.compare(plain, hash);
  }
}
