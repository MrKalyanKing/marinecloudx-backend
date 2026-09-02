import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { ActivityType, LeadStatus, Priority, TaskStatus } from "../contracts";
import { BaseIdEntity, BaseMutableEntity } from "./_shared/primary-id";
import { decimalTransformer } from "./_shared/transformers";
import type { UserEntity } from "./auth.entities";
import type { ServiceEntity, IndustryEntity } from "./cms.entities";

/**
 * CRM — contacts, leads and the sales pipeline. 1:1 with the legacy tables.
 * Cross-file relations use string entity names to keep the entity modules free
 * of circular imports; the type annotations use `import type` (erased).
 */

@Index("Contact_phone_idx", ["phone"])
@Index("Contact_createdAt_idx", ["createdAt"])
@Entity({ name: "Contact" })
export class ContactEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  firstName!: string;

  @Column({ type: "text", nullable: true })
  lastName!: string | null;

  /** Unique so repeat enquiries de-duplicate. Nullable (phone/WhatsApp leads). */
  @Index("Contact_email_key", { unique: true })
  @Column({ type: "text", nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  phone!: string | null;

  @Column({ type: "text", nullable: true })
  company!: string | null;

  @Column({ type: "text", nullable: true })
  jobTitle!: string | null;

  @Column({ type: "text", nullable: true })
  website!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;



  @OneToMany("Lead", "contact")
  leads?: LeadEntity[];
}

@Index("LeadSource_isActive_order_idx", ["isActive", "order"])
@Entity({ name: "LeadSource" })
export class LeadSourceEntity extends BaseMutableEntity {
  @Index("LeadSource_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("LeadSource_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  isSystem!: boolean;

  @Column({ type: "int", default: 0 })
  order!: number;


}

@Index("PipelineStage_isActive_order_idx", ["isActive", "order"])
@Entity({ name: "PipelineStage" })
export class PipelineStageEntity extends BaseMutableEntity {
  @Index("PipelineStage_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("PipelineStage_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  isSystem!: boolean;

  /** Terminal-stage markers — reporting reads these, never a stage name. */
  @Column({ type: "boolean", default: false })
  isWon!: boolean;

  @Column({ type: "boolean", default: false })
  isLost!: boolean;


}

@Index("Lead_contactId_idx", ["contactId"])
@Index("Lead_sourceId_idx", ["sourceId"])
@Index("Lead_pipelineStageId_idx", ["pipelineStageId"])
@Index("Lead_assignedUserId_idx", ["assignedUserId"])
@Index("Lead_serviceId_idx", ["serviceId"])
@Index("Lead_industryId_idx", ["industryId"])
@Index("Lead_status_idx", ["status"])
@Index("Lead_priority_idx", ["priority"])
@Index("Lead_createdAt_idx", ["createdAt"])
@Index("Lead_status_pipelineStageId_createdAt_idx", ["status", "pipelineStageId", "createdAt"])
@Index("Lead_assignedUserId_status_idx", ["assignedUserId", "status"])
@Entity({ name: "Lead" })
export class LeadEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  contactId!: string;

  @ManyToOne("Contact", "leads", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "contactId" })
  contact?: ContactEntity;

  @Column({ type: "text", nullable: true })
  companyName!: string | null;

  @Column({ type: "text" })
  sourceId!: string;

  @ManyToOne("LeadSource", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "sourceId" })
  source?: LeadSourceEntity;

  @Column({ type: "text" })
  pipelineStageId!: string;

  @ManyToOne("PipelineStage", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "pipelineStageId" })
  pipelineStage?: PipelineStageEntity;

  @Column({ type: "text", nullable: true })
  assignedUserId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "assignedUserId" })
  assignedUser?: UserEntity | null;

  @Column({ type: "text", nullable: true })
  serviceId!: string | null;

  @ManyToOne("Service", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "serviceId" })
  service?: ServiceEntity | null;

  @Column({ type: "text", nullable: true })
  industryId!: string | null;

  @ManyToOne("Industry", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "industryId" })
  industry?: IndustryEntity | null;

  @Column({ type: "enum", enum: LeadStatus, enumName: "LeadStatus", default: LeadStatus.OPEN })
  status!: LeadStatus;

  @Column({ type: "enum", enum: Priority, enumName: "Priority", default: Priority.MEDIUM })
  priority!: Priority;

  /** 0–100. Range enforced in the DTO layer, not the DB. */
  @Column({ type: "int", nullable: true })
  qualificationScore!: number | null;

  @Column({ type: "text", nullable: true })
  requirement!: string | null;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  budgetMin!: number | null;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
  budgetMax!: number | null;

  @Column({ type: "char", length: 3, nullable: true })
  budgetCurrency!: string | null;

  @Column({ type: "text", nullable: true })
  timeline!: string | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  closedAt!: Date | null;



  @OneToMany("LeadActivity", "lead")
  activities?: LeadActivityEntity[];

  @OneToMany("Task", "lead")
  tasks?: TaskEntity[];

  @OneToMany("LeadNote", "lead")
  notes?: LeadNoteEntity[];
}

@Index("LeadActivity_leadId_occurredAt_idx", ["leadId", "occurredAt"])
@Index("LeadActivity_userId_idx", ["userId"])
@Index("LeadActivity_type_idx", ["type"])
@Entity({ name: "LeadActivity" })
export class LeadActivityEntity extends BaseIdEntity {
  @Column({ type: "text" })
  leadId!: string;

  @ManyToOne("Lead", "activities", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead?: LeadEntity;

  /** Null for system-generated activities. */
  @Column({ type: "text", nullable: true })
  userId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "userId" })
  user?: UserEntity | null;

  @Column({ type: "enum", enum: ActivityType, enumName: "ActivityType" })
  type!: ActivityType;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: "timestamptz", precision: 6, default: () => "CURRENT_TIMESTAMP" })
  occurredAt!: Date;

}

@Index("Task_leadId_idx", ["leadId"])
@Index("Task_createdById_idx", ["createdById"])
@Index("Task_status_idx", ["status"])
@Index("Task_dueAt_idx", ["dueAt"])
@Index("Task_assignedUserId_status_dueAt_idx", ["assignedUserId", "status", "dueAt"])
@Entity({ name: "Task" })
export class TaskEntity extends BaseMutableEntity {
  @Column({ type: "text", nullable: true })
  leadId!: string | null;

  @ManyToOne("Lead", "tasks", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "leadId" })
  lead?: LeadEntity | null;

  @Column({ type: "text", nullable: true })
  assignedUserId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "assignedUserId" })
  assignedUser?: UserEntity | null;

  @Column({ type: "text", nullable: true })
  createdById!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy?: UserEntity | null;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "enum", enum: TaskStatus, enumName: "TaskStatus", default: TaskStatus.PENDING })
  status!: TaskStatus;

  @Column({ type: "enum", enum: Priority, enumName: "Priority", default: Priority.MEDIUM })
  priority!: Priority;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  dueAt!: Date | null;

  /** Server-stamped on completion, cleared on reopen — never client-supplied. */
  @Column({ type: "timestamptz", precision: 6, nullable: true })
  completedAt!: Date | null;


}

@Index("LeadNote_leadId_createdAt_idx", ["leadId", "createdAt"])
@Index("LeadNote_authorId_idx", ["authorId"])
@Entity({ name: "LeadNote" })
export class LeadNoteEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  leadId!: string;

  @ManyToOne("Lead", "notes", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead?: LeadEntity;

  @Column({ type: "text", nullable: true })
  authorId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "authorId" })
  author?: UserEntity | null;

  @Column({ type: "text" })
  content!: string;


}
