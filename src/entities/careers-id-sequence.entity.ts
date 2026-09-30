import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Per-year counters for human-readable Careers IDs.
 * Rows are updated atomically via INSERT … ON CONFLICT DO UPDATE RETURNING.
 */
@Entity({ name: "CareersIdSequence" })
export class CareersIdSequenceEntity {
  @PrimaryColumn({ type: "text" })
  kind!: "JOB" | "APPLICATION";

  @PrimaryColumn({ type: "int" })
  year!: number;

  @Column({ type: "int", default: 0 })
  lastValue!: number;
}
