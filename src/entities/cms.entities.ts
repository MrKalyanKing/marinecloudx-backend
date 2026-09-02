import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";

import {
  ProjectMediaRole,
  ProjectStatus,
  PublicationStatus,
  TechnologyCategory,
} from "../contracts";
import { BaseIdEntity, BaseMutableEntity } from "./_shared/primary-id";
import type { MediaEntity } from "./system.entities";
import type { UserEntity } from "./auth.entities";

/**
 * CMS — offering, portfolio and content. 1:1 with the legacy tables.
 *
 * The six many-to-many links reuse Prisma's implicit join tables **by their
 * exact names** (`_ServiceToTechnology`, `_IndustryToService`, …) with columns
 * `A` / `B`, so the existing data is used unchanged. Ownership of each
 * `@JoinTable` is chosen so `A` is the alphabetically-first model, matching
 * Prisma's convention.
 */

/* ------------------------------- Service ------------------------------- */

@Index("Service_status_order_idx", ["status", "order"])
@Index("Service_publishedAt_idx", ["publishedAt"])
@Index("Service_coverMediaId_idx", ["coverMediaId"])
@Entity({ name: "Service" })
export class ServiceEntity extends BaseMutableEntity {
  @Index("Service_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("Service_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  shortDescription!: string | null;

  @Column({ type: "text", nullable: true })
  fullDescription!: string | null;

  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  status!: PublicationStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "text", nullable: true })
  seoTitle!: string | null;

  @Column({ type: "text", nullable: true })
  seoDescription!: string | null;

  @Column({ type: "text", nullable: true })
  coverMediaId!: string | null;

  @ManyToOne("Media", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "coverMediaId" })
  coverMedia?: MediaEntity | null;



  @OneToMany("ServiceFeature", "service")
  features?: ServiceFeatureEntity[];

  /** Owning side of `_ServiceToTechnology` (A = Service, B = Technology). */
  @ManyToMany("Technology", "services")
  @JoinTable({
    name: "_ServiceToTechnology",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  technologies?: TechnologyEntity[];

  /** Inverse of `Industry.services`. */
  @ManyToMany("Industry", "services")
  industries?: IndustryEntity[];

  /** Inverse of `Project.services`. */
  @ManyToMany("Project", "services")
  projects?: ProjectEntity[];
}

@Index("ServiceFeature_serviceId_order_idx", ["serviceId", "order"])
@Entity({ name: "ServiceFeature" })
export class ServiceFeatureEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  serviceId!: string;

  @ManyToOne("Service", "features", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "serviceId" })
  service?: ServiceEntity;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;


}

/* ------------------------------ Industry ------------------------------ */

@Index("Industry_isActive_order_idx", ["isActive", "order"])
@Entity({ name: "Industry" })
export class IndustryEntity extends BaseMutableEntity {
  @Index("Industry_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("Industry_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;



  /** Owning side of `_IndustryToService` (A = Industry, B = Service). */
  @ManyToMany("Service", "industries")
  @JoinTable({
    name: "_IndustryToService",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  services?: ServiceEntity[];

  /** Owning side of `_IndustryToProject` (A = Industry, B = Project). */
  @ManyToMany("Project", "industries")
  @JoinTable({
    name: "_IndustryToProject",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  projects?: ProjectEntity[];
}

@Index("Technology_category_order_idx", ["category", "order"])
@Index("Technology_isActive_idx", ["isActive"])
@Entity({ name: "Technology" })
export class TechnologyEntity extends BaseMutableEntity {
  @Index("Technology_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("Technology_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({
    type: "enum",
    enum: TechnologyCategory,
    enumName: "TechnologyCategory",
    default: TechnologyCategory.OTHER,
  })
  category!: TechnologyCategory;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;



  /** Inverse of `Service.technologies`. */
  @ManyToMany("Service", "technologies")
  services?: ServiceEntity[];

  /** Inverse of `Project.technologies`. */
  @ManyToMany("Project", "technologies")
  projects?: ProjectEntity[];
}

/* ------------------------------ Portfolio ------------------------------ */

@Entity({ name: "ProjectCategory" })
export class ProjectCategoryEntity extends BaseMutableEntity {
  @Index("ProjectCategory_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("ProjectCategory_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;



  @OneToMany("Project", "category")
  projects?: ProjectEntity[];
}

@Index("Project_categoryId_idx", ["categoryId"])
@Index("Project_coverMediaId_idx", ["coverMediaId"])
@Index("Project_publicationStatus_featured_order_idx", ["publicationStatus", "featured", "order"])
@Index("Project_publishedAt_idx", ["publishedAt"])
@Entity({ name: "Project" })
export class ProjectEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  title!: string;

  @Index("Project_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  shortDescription!: string | null;

  @Column({ type: "text", nullable: true })
  fullDescription!: string | null;

  @Column({ type: "text", nullable: true })
  categoryId!: string | null;

  @ManyToOne("ProjectCategory", "projects", {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "categoryId" })
  category?: ProjectCategoryEntity | null;

  /** Visibility on the public site. */
  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  publicationStatus!: PublicationStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  /** Delivery state of the real engagement — orthogonal to publication. */
  @Column({
    type: "enum",
    enum: ProjectStatus,
    enumName: "ProjectStatus",
    default: ProjectStatus.COMPLETED,
  })
  status!: ProjectStatus;

  @Column({ type: "boolean", default: false })
  featured!: boolean;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "text", nullable: true })
  liveUrl!: string | null;

  @Column({ type: "text", nullable: true })
  seoTitle!: string | null;

  @Column({ type: "text", nullable: true })
  seoDescription!: string | null;

  @Column({ type: "text", nullable: true })
  coverMediaId!: string | null;

  @ManyToOne("Media", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "coverMediaId" })
  coverMedia?: MediaEntity | null;



  /** Owning side of `_ProjectToService` (A = Project, B = Service). */
  @ManyToMany("Service", "projects")
  @JoinTable({
    name: "_ProjectToService",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  services?: ServiceEntity[];

  /** Owning side of `_ProjectToTechnology` (A = Project, B = Technology). */
  @ManyToMany("Technology", "projects")
  @JoinTable({
    name: "_ProjectToTechnology",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  technologies?: TechnologyEntity[];

  /** Inverse of `Industry.projects`. */
  @ManyToMany("Industry", "projects")
  industries?: IndustryEntity[];

  @OneToOne("CaseStudy", "project")
  caseStudy?: CaseStudyEntity | null;

  @OneToMany("ProjectMedia", "project")
  media?: ProjectMediaEntity[];

  @OneToMany("Testimonial", "project")
  testimonials?: TestimonialEntity[];
}

@Index("ProjectMedia_projectId_order_idx", ["projectId", "order"])
@Index("ProjectMedia_mediaId_idx", ["mediaId"])
@Index("ProjectMedia_projectId_mediaId_role_key", ["projectId", "mediaId", "role"], { unique: true })
@Entity({ name: "ProjectMedia" })
export class ProjectMediaEntity extends BaseIdEntity {
  @Column({ type: "text" })
  projectId!: string;

  @ManyToOne("Project", "media", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project?: ProjectEntity;

  @Column({ type: "text" })
  mediaId!: string;

  @ManyToOne("Media", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "mediaId" })
  media?: MediaEntity;

  @Column({
    type: "enum",
    enum: ProjectMediaRole,
    enumName: "ProjectMediaRole",
    default: ProjectMediaRole.GALLERY,
  })
  role!: ProjectMediaRole;

  @Column({ type: "text", nullable: true })
  caption!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;

}

@Index("CaseStudy_status_idx", ["status"])
@Index("CaseStudy_projectId_key", ["projectId"], { unique: true })
@Entity({ name: "CaseStudy" })
export class CaseStudyEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  projectId!: string;

  @OneToOne("Project", "caseStudy", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project?: ProjectEntity;

  @Column({ type: "text", nullable: true })
  challenge!: string | null;

  @Column({ type: "text", nullable: true })
  approach!: string | null;

  @Column({ type: "text", nullable: true })
  solution!: string | null;

  @Column({ type: "text", nullable: true })
  implementation!: string | null;

  @Column({ type: "text", nullable: true })
  results!: string | null;

  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  status!: PublicationStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  seoTitle!: string | null;

  @Column({ type: "text", nullable: true })
  seoDescription!: string | null;


}

/* -------------------------- Social proof / support -------------------------- */

@Index("Testimonial_status_order_idx", ["status", "order"])
@Index("Testimonial_projectId_idx", ["projectId"])
@Index("Testimonial_photoMediaId_idx", ["photoMediaId"])
@Entity({ name: "Testimonial" })
export class TestimonialEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  authorName!: string;

  @Column({ type: "text", nullable: true })
  authorRole!: string | null;

  @Column({ type: "text", nullable: true })
  companyName!: string | null;

  @Column({ type: "text" })
  content!: string;

  /** 1–5. Range enforced in the DTO layer. */
  @Column({ type: "int", nullable: true })
  rating!: number | null;

  @Column({ type: "text", nullable: true })
  photoMediaId!: string | null;

  @ManyToOne("Media", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "photoMediaId" })
  photoMedia?: MediaEntity | null;

  @Column({ type: "text", nullable: true })
  projectId!: string | null;

  @ManyToOne("Project", "testimonials", {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "projectId" })
  project?: ProjectEntity | null;

  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  status!: PublicationStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  @Column({ type: "int", default: 0 })
  order!: number;


}

@Index("Faq_status_order_idx", ["status", "order"])
@Index("Faq_category_idx", ["category"])
@Entity({ name: "Faq" })
export class FaqEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  question!: string;

  @Column({ type: "text" })
  answer!: string;

  @Column({ type: "text", nullable: true })
  category!: string | null;

  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  status!: PublicationStatus;

  @Column({ type: "int", default: 0 })
  order!: number;


}

/* --------------------------------- Blog --------------------------------- */

@Index("BlogPost_authorId_idx", ["authorId"])
@Index("BlogPost_categoryId_idx", ["categoryId"])
@Index("BlogPost_coverMediaId_idx", ["coverMediaId"])
@Index("BlogPost_status_publishedAt_idx", ["status", "publishedAt"])
@Entity({ name: "BlogPost" })
export class BlogPostEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  title!: string;

  @Index("BlogPost_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  excerpt!: string | null;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "text", nullable: true })
  authorId!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "authorId" })
  author?: UserEntity | null;

  @Column({ type: "text", nullable: true })
  categoryId!: string | null;

  @ManyToOne("BlogCategory", "posts", {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "categoryId" })
  category?: BlogCategoryEntity | null;

  @Column({ type: "text", nullable: true })
  coverMediaId!: string | null;

  @ManyToOne("Media", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "coverMediaId" })
  coverMedia?: MediaEntity | null;

  @Column({
    type: "enum",
    enum: PublicationStatus,
    enumName: "PublicationStatus",
    default: PublicationStatus.DRAFT,
  })
  status!: PublicationStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  seoTitle!: string | null;

  @Column({ type: "text", nullable: true })
  seoDescription!: string | null;



  /** Owning side of `_BlogPostToBlogTag` (A = BlogPost, B = BlogTag). */
  @ManyToMany("BlogTag", "posts")
  @JoinTable({
    name: "_BlogPostToBlogTag",
    joinColumn: { name: "A", referencedColumnName: "id" },
    inverseJoinColumn: { name: "B", referencedColumnName: "id" },
  })
  tags?: BlogTagEntity[];
}

@Entity({ name: "BlogCategory" })
export class BlogCategoryEntity extends BaseMutableEntity {
  @Index("BlogCategory_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("BlogCategory_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;



  @OneToMany("BlogPost", "category")
  posts?: BlogPostEntity[];
}

@Entity({ name: "BlogTag" })
export class BlogTagEntity extends BaseMutableEntity {
  @Index("BlogTag_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("BlogTag_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;



  /** Inverse of `BlogPost.tags`. */
  @ManyToMany("BlogPost", "tags")
  posts?: BlogPostEntity[];
}
