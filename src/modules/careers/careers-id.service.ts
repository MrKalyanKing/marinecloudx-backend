import { Injectable } from "@nestjs/common";
import type { EntityManager } from "typeorm";

export type CareersIdKind = "JOB" | "APPLICATION";

/**
 * Allocates human-readable Careers IDs from a DB-backed yearly sequence.
 * Must run inside a transaction that also inserts the Job / JobApplication row.
 */
@Injectable()
export class CareersIdService {
  async nextJobCode(em: EntityManager, at = new Date()): Promise<string> {
    const year = at.getUTCFullYear();
    const n = await this.nextValue(em, "JOB", year);
    return `MCX-${year}-${String(n).padStart(4, "0")}`;
  }

  async nextApplicationCode(em: EntityManager, at = new Date()): Promise<string> {
    const year = at.getUTCFullYear();
    const n = await this.nextValue(em, "APPLICATION", year);
    return `MCX-APP-${year}-${String(n).padStart(6, "0")}`;
  }

  private async nextValue(
    em: EntityManager,
    kind: CareersIdKind,
    year: number,
  ): Promise<number> {
    const rows = await em.query(
      `
        INSERT INTO "CareersIdSequence" ("kind", "year", "lastValue")
        VALUES ($1, $2, 1)
        ON CONFLICT ("kind", "year")
        DO UPDATE SET "lastValue" = "CareersIdSequence"."lastValue" + 1
        RETURNING "lastValue"
      `,
      [kind, year],
    );
    const value = Number(rows?.[0]?.lastValue);
    if (!Number.isFinite(value) || value < 1) {
      throw new Error(`Failed to allocate Careers ID sequence for ${kind}/${year}`);
    }
    return value;
  }
}
