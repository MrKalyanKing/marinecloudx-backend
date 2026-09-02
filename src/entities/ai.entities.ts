import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";

import { ConversationStatus, MessageRole } from "../contracts";
import { BaseIdEntity, BaseMutableEntity } from "./_shared/primary-id";
import { decimalTransformer } from "./_shared/transformers";
import type { LeadEntity } from "./crm.entities";
import type { ServiceEntity, IndustryEntity } from "./cms.entities";

/**
 * AI chatbot — visitor conversations and what the model extracted from them.
 * A conversation is NOT a lead; `leadId` is set only once one is promoted.
 */

@Index("Conversation_leadId_idx", ["leadId"])
@Index("Conversation_status_idx", ["status"])
@Index("Conversation_startedAt_idx", ["startedAt"])
@Entity({ name: "Conversation" })
export class ConversationEntity extends BaseMutableEntity {
  /** Anonymous browser/session identifier used to resume a chat. */
  @Index("Conversation_sessionId_key", { unique: true })
  @Column({ type: "text" })
  sessionId!: string;

  @Column({
    type: "enum",
    enum: ConversationStatus,
    enumName: "ConversationStatus",
    default: ConversationStatus.ACTIVE,
  })
  status!: ConversationStatus;

  @Column({ type: "text", nullable: true })
  leadId!: string | null;

  @ManyToOne("Lead", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "leadId" })
  lead?: LeadEntity | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: "timestamptz", precision: 6, default: () => "CURRENT_TIMESTAMP" })
  startedAt!: Date;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  endedAt!: Date | null;



  @OneToMany("Message", "conversation")
  messages?: MessageEntity[];

  @OneToOne("ConversationQualification", "conversation")
  qualification?: ConversationQualificationEntity | null;
}

@Index("Message_conversationId_createdAt_idx", ["conversationId", "createdAt"])
@Entity({ name: "Message" })
export class MessageEntity extends BaseIdEntity {
  @Column({ type: "text" })
  conversationId!: string;

  @ManyToOne("Conversation", "messages", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "conversationId" })
  conversation?: ConversationEntity;

  @Column({ type: "enum", enum: MessageRole, enumName: "MessageRole" })
  role!: MessageRole;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

}

@Index("ConversationQualification_serviceId_idx", ["serviceId"])
@Index("ConversationQualification_industryId_idx", ["industryId"])
@Entity({ name: "ConversationQualification" })
export class ConversationQualificationEntity extends BaseMutableEntity {
  @Index("ConversationQualification_conversationId_key", { unique: true })
  @Column({ type: "text" })
  conversationId!: string;

  @OneToOne("Conversation", "qualification", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "conversationId" })
  conversation?: ConversationEntity;

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

  @Column({ type: "text", nullable: true })
  intent!: string | null;

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

  @Column({ type: "int", nullable: true })
  score!: number | null;


}
