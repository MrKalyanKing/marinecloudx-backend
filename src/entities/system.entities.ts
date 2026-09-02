import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";

import { MediaType, NotificationChannel, NotificationStatus } from "../contracts";
import { BaseIdEntity, BaseMutableEntity } from "./_shared/primary-id";
import { bigintTransformer } from "./_shared/transformers";
import type { UserEntity } from "./auth.entities";
import type { LeadEntity } from "./crm.entities";

/**
 * System — media metadata, notification delivery records, and the append-only
 * audit trail.
 */

@Index("Media_type_idx", ["type"])
@Index("Media_uploadedById_idx", ["uploadedById"])
@Index("Media_createdAt_idx", ["createdAt"])
@Entity({ name: "Media" })
export class MediaEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  filename!: string;

  @Column({ type: "text", nullable: true })
  originalFilename!: string | null;

  /** Object-storage key. Unique — the same object is never registered twice. */
  @Index("Media_storageKey_key", { unique: true })
  @Column({ type: "text" })
  storageKey!: string;

  @Column({ type: "text", nullable: true })
  url!: string | null;

  @Column({ type: "enum", enum: MediaType, enumName: "MediaType", default: MediaType.IMAGE })
  type!: MediaType;

  @Column({ type: "text", nullable: true })
  mimeType!: string | null;

  @Column({ type: "bigint", nullable: true, transformer: bigintTransformer })
  size!: number | null;

  @Column({ type: "int", nullable: true })
  width!: number | null;

  @Column({ type: "int", nullable: true })
  height!: number | null;

  @Column({ type: "text", nullable: true })
  altText!: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: "text", nullable: true })
  uploadedById!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "uploadedById" })
  uploadedBy?: UserEntity | null;


}

@Index("Notification_userId_readAt_idx", ["userId", "readAt"])
@Index("Notification_leadId_idx", ["leadId"])
@Index("Notification_status_channel_createdAt_idx", ["status", "channel", "createdAt"])
@Entity({ name: "Notification" })
export class NotificationEntity extends BaseMutableEntity {
  @Column({ type: "enum", enum: NotificationChannel, enumName: "NotificationChannel" })
  channel!: NotificationChannel;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    enumName: "NotificationStatus",
    default: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;

  @Column({ type: "text", nullable: true })
  recipient!: string | null;

  @Column({ type: "text", nullable: true })
  userId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "userId" })
  user?: UserEntity | null;

  @Column({ type: "text", nullable: true })
  leadId!: string | null;

  @ManyToOne("Lead", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "leadId" })
  lead?: LeadEntity | null;

  @Column({ type: "text", nullable: true })
  subject!: string | null;

  @Column({ type: "text", nullable: true })
  body!: string | null;

  @Column({ type: "jsonb", nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: "int", default: 0 })
  attempts!: number;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  sentAt!: Date | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  failedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  errorMessage!: string | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  readAt!: Date | null;


}

@Index("AuditLog_userId_createdAt_idx", ["userId", "createdAt"])
@Index("AuditLog_entityType_entityId_idx", ["entityType", "entityId"])
@Index("AuditLog_action_idx", ["action"])
@Index("AuditLog_createdAt_idx", ["createdAt"])
@Entity({ name: "AuditLog" })
export class AuditLogEntity extends BaseIdEntity {
  /** SET NULL, not CASCADE — the trail survives the deletion of the actor. */
  @Column({ type: "text", nullable: true })
  userId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "userId" })
  user?: UserEntity | null;

  /** Verb, e.g. "service.published", "lead.stage_changed". */
  @Column({ type: "text" })
  action!: string;

  @Column({ type: "text" })
  entityType!: string;

  @Column({ type: "text", nullable: true })
  entityId!: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: "text", nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

}
