/**
 * Entity barrel + the canonical registration list.
 *
 * `ALL_ENTITIES` is passed to `TypeOrmModule.forRoot({ entities })` and to the
 * migration `DataSource`, so there is one list to keep in sync — never a glob.
 *
 * 28 entities, matching the 28 legacy Prisma models. The 6 many-to-many join
 * tables (`_ServiceToTechnology`, …) are declared via `@JoinTable` on the
 * owning entities and need no class of their own.
 */

export * from "./_shared/primary-id";
export * from "./_shared/transformers";

export { RoleEntity, UserEntity } from "./auth.entities";
export {
  ContactEntity,
  LeadEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  LeadActivityEntity,
  TaskEntity,
  LeadNoteEntity,
} from "./crm.entities";
export {
  ConversationEntity,
  MessageEntity,
  ConversationQualificationEntity,
} from "./ai.entities";
export {
  ServiceEntity,
  ServiceFeatureEntity,
  IndustryEntity,
  TechnologyEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectMediaEntity,
  CaseStudyEntity,
  TestimonialEntity,
  FaqEntity,
  BlogPostEntity,
  BlogCategoryEntity,
  BlogTagEntity,
} from "./cms.entities";
export { MediaEntity, NotificationEntity, AuditLogEntity } from "./system.entities";

import { RoleEntity, UserEntity } from "./auth.entities";
import {
  ContactEntity,
  LeadEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  LeadActivityEntity,
  TaskEntity,
  LeadNoteEntity,
} from "./crm.entities";
import {
  ConversationEntity,
  MessageEntity,
  ConversationQualificationEntity,
} from "./ai.entities";
import {
  ServiceEntity,
  ServiceFeatureEntity,
  IndustryEntity,
  TechnologyEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectMediaEntity,
  CaseStudyEntity,
  TestimonialEntity,
  FaqEntity,
  BlogPostEntity,
  BlogCategoryEntity,
  BlogTagEntity,
} from "./cms.entities";
import { MediaEntity, NotificationEntity, AuditLogEntity } from "./system.entities";

export const ALL_ENTITIES = [
  // auth
  RoleEntity,
  UserEntity,
  // crm
  ContactEntity,
  LeadEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  LeadActivityEntity,
  TaskEntity,
  LeadNoteEntity,
  // ai
  ConversationEntity,
  MessageEntity,
  ConversationQualificationEntity,
  // cms
  ServiceEntity,
  ServiceFeatureEntity,
  IndustryEntity,
  TechnologyEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectMediaEntity,
  CaseStudyEntity,
  TestimonialEntity,
  FaqEntity,
  BlogPostEntity,
  BlogCategoryEntity,
  BlogTagEntity,
  // system
  MediaEntity,
  NotificationEntity,
  AuditLogEntity,
] as const;
