import type { ValueTransformer } from "typeorm";

/**
 * PostgreSQL returns `numeric` and `bigint` as strings (to avoid precision
 * loss). These transformers convert at the entity boundary so the rest of the
 * codebase deals in `number | null`, matching what the legacy Prisma client
 * exposed.
 */

/** `DECIMAL(12,2)` ↔ number. Null-safe. */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined): number | null =>
    value === null || value === undefined ? null : value,
  from: (value: string | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

/** `BIGINT` ↔ number. Values here (file sizes) are well within `Number.MAX_SAFE_INTEGER`. */
export const bigintTransformer: ValueTransformer = {
  to: (value: number | null | undefined): number | null =>
    value === null || value === undefined ? null : value,
  from: (value: string | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};
