import { v7 as uuidv7 } from "uuid";

/**
 * UUIDv7 — time-ordered, so B-tree index inserts stay local (the property the
 * legacy schema chose `uuid(7)` primary keys for; TypeORM's own `uuid`
 * generator emits v4, which would lose it).
 *
 * Used by entities in a `@BeforeInsert` hook to fill the primary key.
 */
export function newId(): string {
  return uuidv7();
}
