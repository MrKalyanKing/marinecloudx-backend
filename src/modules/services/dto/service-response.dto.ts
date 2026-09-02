/**
 * Wire shapes for the public services API.
 *
 * These are the response contract — deliberately NOT the entity. Internal
 * columns (audit fields, unpublished siblings, FK ids that carry no meaning to
 * a visitor) are never included. Kept in the backend for now; promoted to
 * packages/contracts/dto when the frontend consumes it (Phase 12).
 */

export interface MediaRefDto {
  id: string;
  url: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ServiceListItemDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  publishedAt: string | null;
  coverMedia: MediaRefDto | null;
}

export interface ServiceFeatureDto {
  id: string;
  name: string;
  description: string | null;
}

export interface TaxonomyRefDto {
  name: string;
  slug: string;
}

export interface ServiceDetailDto extends ServiceListItemDto {
  fullDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  features: ServiceFeatureDto[];
  industries: TaxonomyRefDto[];
  technologies: TaxonomyRefDto[];
  projects: { title: string; slug: string; shortDescription: string | null }[];
}
