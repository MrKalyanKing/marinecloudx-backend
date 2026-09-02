import {
  BlogCategoryEntity,
  BlogPostEntity,
  BlogTagEntity,
  CaseStudyEntity,
  FaqEntity,
  IndustryEntity,
  MediaEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectMediaEntity,
  ServiceEntity,
  ServiceFeatureEntity,
  TestimonialEntity,
  TechnologyEntity,
} from "../../entities";
import type { EntityTarget, ObjectLiteral } from "typeorm";

/**
 * CMS resource registry — the backend half of the legacy
 * `src/features/cms/services/registry.ts`. One generic controller/service
 * drives all twelve content types from this description, instead of twelve
 * copies of the same CRUD.
 *
 * The admin app's own registry (field labels, form layout — Phase 11) is a
 * separate, UI-facing concern; this one is data-shape and publication rules.
 */

export type PublicationMode = "status" | "statusOnly" | "active" | "none";

export type FieldKind =
  | "text"
  | "textarea"
  | "slug"
  | "number"
  | "url"
  | "enum"
  | "boolean"
  | "relation"
  | "relationMany";

export interface CmsField {
  name: string;
  kind: FieldKind;
  required?: boolean;
  /** For kind "relation" / "relationMany": the resource key it points at. */
  target?: string;
  /** Actual TypeORM relation property name, when it differs from `name`. */
  relationProperty?: string;
  /** For kind "enum": accepted values. */
  enumValues?: readonly string[];
}

/** A repeatable child collection replaced transactionally on save. */
export interface CmsChild {
  key: string;
  entity: EntityTarget<ObjectLiteral>;
  parentField: string;
  fields: CmsField[];
}

export interface CmsResource {
  key: string;
  entity: EntityTarget<ObjectLiteral>;
  titleField: string;
  searchFields: string[];
  orderBy: Record<string, "ASC" | "DESC">;
  publication: PublicationMode;
  publicationField?: string;
  hasPublishedAt?: boolean;
  slugField?: string;
  fields: CmsField[];
  /** Relation property names to load for list / detail reads. */
  listRelations?: string[];
  detailRelations?: string[];
  children?: CmsChild[];
}

export const CMS_RESOURCES: Record<string, CmsResource> = {
  services: {
    key: "services",
    entity: ServiceEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { order: "ASC" },
    publication: "status",
    publicationField: "status",
    hasPublishedAt: true,
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "shortDescription", kind: "textarea" },
      { name: "fullDescription", kind: "textarea" },
      { name: "order", kind: "number" },
      { name: "seoTitle", kind: "text" },
      { name: "seoDescription", kind: "textarea" },
      { name: "coverMediaId", kind: "relation", target: "media" },
      { name: "technologyIds", kind: "relationMany", target: "technologies", relationProperty: "technologies" },
    ],
    listRelations: ["coverMedia"],
    detailRelations: ["coverMedia", "features", "technologies", "industries", "projects"],
    children: [
      {
        key: "features",
        entity: ServiceFeatureEntity,
        parentField: "serviceId",
        fields: [
          { name: "name", kind: "text", required: true },
          { name: "description", kind: "text" },
          { name: "order", kind: "number" },
        ],
      },
    ],
  },

  industries: {
    key: "industries",
    entity: IndustryEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { order: "ASC" },
    publication: "active",
    publicationField: "isActive",
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "description", kind: "textarea" },
      { name: "order", kind: "number" },
    ],
  },

  technologies: {
    key: "technologies",
    entity: TechnologyEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { order: "ASC" },
    publication: "active",
    publicationField: "isActive",
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "category", kind: "enum", required: true },
      { name: "order", kind: "number" },
    ],
  },

  projects: {
    key: "projects",
    entity: ProjectEntity,
    titleField: "title",
    searchFields: ["title", "slug"],
    orderBy: { order: "ASC" },
    publication: "status",
    publicationField: "publicationStatus",
    hasPublishedAt: true,
    slugField: "slug",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "shortDescription", kind: "textarea" },
      { name: "fullDescription", kind: "textarea" },
      { name: "categoryId", kind: "relation", target: "project-categories" },
      { name: "industryIds", kind: "relationMany", target: "industries", relationProperty: "industries" },
      { name: "serviceIds", kind: "relationMany", target: "services", relationProperty: "services" },
      { name: "technologyIds", kind: "relationMany", target: "technologies", relationProperty: "technologies" },
      { name: "status", kind: "enum" },
      { name: "liveUrl", kind: "url" },
      { name: "coverMediaId", kind: "relation", target: "media" },
      { name: "featured", kind: "boolean" },
      { name: "order", kind: "number" },
      { name: "seoTitle", kind: "text" },
      { name: "seoDescription", kind: "textarea" },
    ],
    listRelations: ["category", "coverMedia"],
    detailRelations: [
      "category",
      "coverMedia",
      "services",
      "industries",
      "technologies",
      "media",
      "caseStudy",
    ],
    children: [
      {
        key: "media",
        entity: ProjectMediaEntity,
        parentField: "projectId",
        fields: [
          { name: "mediaId", kind: "relation", target: "media", required: true },
          { name: "role", kind: "enum" },
          { name: "caption", kind: "text" },
          { name: "order", kind: "number" },
        ],
      },
    ],
  },

  "project-categories": {
    key: "project-categories",
    entity: ProjectCategoryEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { order: "ASC" },
    publication: "none",
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "description", kind: "textarea" },
      { name: "order", kind: "number" },
    ],
  },

  "case-studies": {
    key: "case-studies",
    entity: CaseStudyEntity,
    titleField: "id",
    searchFields: [],
    orderBy: { createdAt: "DESC" },
    publication: "status",
    publicationField: "status",
    hasPublishedAt: true,
    fields: [
      { name: "projectId", kind: "relation", target: "projects", required: true },
      { name: "challenge", kind: "textarea" },
      { name: "approach", kind: "textarea" },
      { name: "solution", kind: "textarea" },
      { name: "implementation", kind: "textarea" },
      { name: "results", kind: "textarea" },
      { name: "seoTitle", kind: "text" },
      { name: "seoDescription", kind: "textarea" },
    ],
    listRelations: ["project"],
    detailRelations: ["project"],
  },

  testimonials: {
    key: "testimonials",
    entity: TestimonialEntity,
    titleField: "authorName",
    searchFields: ["authorName", "companyName"],
    orderBy: { order: "ASC" },
    publication: "status",
    publicationField: "status",
    hasPublishedAt: true,
    fields: [
      { name: "authorName", kind: "text", required: true },
      { name: "authorRole", kind: "text" },
      { name: "companyName", kind: "text" },
      { name: "content", kind: "textarea", required: true },
      { name: "rating", kind: "number" },
      { name: "projectId", kind: "relation", target: "projects" },
      { name: "photoMediaId", kind: "relation", target: "media" },
      { name: "order", kind: "number" },
    ],
    listRelations: [],
    detailRelations: ["project", "photoMedia"],
  },

  faqs: {
    key: "faqs",
    entity: FaqEntity,
    titleField: "question",
    searchFields: ["question", "category"],
    orderBy: { order: "ASC" },
    publication: "statusOnly",
    publicationField: "status",
    fields: [
      { name: "question", kind: "text", required: true },
      { name: "answer", kind: "textarea", required: true },
      { name: "category", kind: "text" },
      { name: "order", kind: "number" },
    ],
  },

  blog: {
    key: "blog",
    entity: BlogPostEntity,
    titleField: "title",
    searchFields: ["title", "slug"],
    orderBy: { createdAt: "DESC" },
    publication: "status",
    publicationField: "status",
    hasPublishedAt: true,
    slugField: "slug",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "excerpt", kind: "textarea" },
      { name: "content", kind: "textarea" },
      { name: "categoryId", kind: "relation", target: "blog-categories" },
      { name: "tagIds", kind: "relationMany", target: "blog-tags", relationProperty: "tags" },
      { name: "coverMediaId", kind: "relation", target: "media" },
      { name: "seoTitle", kind: "text" },
      { name: "seoDescription", kind: "textarea" },
    ],
    listRelations: ["category", "coverMedia"],
    detailRelations: ["category", "coverMedia", "tags"],
  },

  "blog-categories": {
    key: "blog-categories",
    entity: BlogCategoryEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { order: "ASC" },
    publication: "none",
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "description", kind: "textarea" },
      { name: "order", kind: "number" },
    ],
  },

  "blog-tags": {
    key: "blog-tags",
    entity: BlogTagEntity,
    titleField: "name",
    searchFields: ["name", "slug"],
    orderBy: { name: "ASC" },
    publication: "none",
    slugField: "slug",
    fields: [
      { name: "name", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
    ],
  },

  media: {
    key: "media",
    entity: MediaEntity,
    titleField: "filename",
    searchFields: ["filename", "originalFilename", "altText"],
    orderBy: { createdAt: "DESC" },
    publication: "none",
    fields: [
      { name: "filename", kind: "text", required: true },
      { name: "altText", kind: "text" },
    ],
  },
};

export type CmsResourceKey = keyof typeof CMS_RESOURCES;

export function isCmsResourceKey(value: string): value is CmsResourceKey {
  return value in CMS_RESOURCES;
}

export function getResource(key: string): CmsResource {
  const resource = CMS_RESOURCES[key];
  if (!resource) throw new Error(`Unknown CMS resource: ${key}`);
  return resource;
}
