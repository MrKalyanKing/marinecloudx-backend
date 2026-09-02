import * as bcrypt from "bcryptjs";
import type { DataSource } from "typeorm";

import { UserStatus } from "../../contracts";
import { RoleEntity, UserEntity } from "../../entities";

/**
 * DEVELOPMENT-ONLY admin bootstrap — ported from the legacy `prisma/seed.ts`.
 *
 * Skipped unless BOTH `DEV_ADMIN_EMAIL` and `DEV_ADMIN_PASSWORD` are set. No
 * password is hardcoded or defaulted anywhere. Refuses to run against
 * `NODE_ENV=production` so a stray env var cannot create a backdoor account on
 * a live system. Minimum password length 12 (OWASP-aligned, bcrypt cost 12).
 */
export async function seedDevAdmin(dataSource: DataSource): Promise<void> {
  const email = process.env.DEV_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("seed: skipped dev admin (DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD not set)");
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a development admin account with NODE_ENV=production.");
  }

  if (password.length < 12) {
    throw new Error("DEV_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const roles = dataSource.getRepository(RoleEntity);
  const users = dataSource.getRepository(UserEntity);

  const superAdmin = await roles.findOne({ where: { slug: "super-admin" } });
  if (!superAdmin) {
    throw new Error("super-admin role not found — run the system seed first.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await users.findOne({ where: { email } });

  if (existing) {
    await users.update(existing.id, {
      passwordHash,
      status: UserStatus.ACTIVE,
      roleId: superAdmin.id,
    });
  } else {
    await users.save(
      users.create({
        name: "Development Admin",
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        roleId: superAdmin.id,
      }),
    );
  }

  // The address is printed so you know which account exists. Never the password.
  console.log(`seed: development admin ready — ${email} (Super Admin)`);
}
