import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from "typeorm";

import { newId } from "../../common/utils/uuidv7";

/**
 * Base for every entity: a `text` primary key filled with a UUIDv7 on insert,
 * plus `createdAt`.
 *
 * The legacy schema stores ids as `TEXT` (Prisma `String @id @default(uuid(7))`),
 * not the `uuid` type, and relies on v7's time-ordering for index locality —
 * TypeORM's `@PrimaryGeneratedColumn("uuid")` would emit v4 and the wrong
 * column type, so the id is generated in application code.
 *
 * `createdAt` keeps `@CreateDateColumn`: the column was built with
 * `DEFAULT CURRENT_TIMESTAMP`, so letting the database fill it is correct.
 */
export abstract class BaseIdEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @CreateDateColumn({ type: "timestamptz", precision: 6 })
  createdAt!: Date;

  @BeforeInsert()
  protected assignId(): void {
    if (!this.id) {
      this.id = newId();
    }
  }
}

/**
 * Base for the mutable entities (everything except the four append-only ones:
 * LeadActivity, Message, ProjectMedia, AuditLog).
 *
 * `updatedAt` is a plain column stamped in application code, NOT
 * `@UpdateDateColumn`. Prisma built this column `NOT NULL` with **no database
 * default** (`@updatedAt` was client-managed); `@UpdateDateColumn` emits
 * `DEFAULT` on insert, which hits the not-null constraint. Stamping it here
 * reproduces Prisma's exact behaviour.
 */
export abstract class BaseMutableEntity extends BaseIdEntity {
  @Column({ type: "timestamptz", precision: 6 })
  updatedAt!: Date;

  @BeforeInsert()
  protected stampUpdatedAtOnInsert(): void {
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  protected stampUpdatedAtOnUpdate(): void {
    this.updatedAt = new Date();
  }
}
