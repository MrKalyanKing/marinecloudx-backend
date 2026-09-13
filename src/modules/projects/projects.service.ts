import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { ProjectCategoryEntity, ProjectEntity } from "../../entities";
import { buildPagination, type Pagination } from "../../common";
import { type MediaRefDto, toMediaRef } from "../_shared/media.dto";

const PUBLISHED = PublicationStatus.PUBLISHED;

export interface ProjectCardDto {
  title: string;
  slug: string;
  shortDescription: string | null;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  coverMedia: MediaRefDto | null;
  industries: { name: string; slug: string }[];
  technologies: { name: string; slug: string }[];
}

export interface ProjectDetailDto {
  title: string;
  slug: string;
  status: string;
  shortDescription: string | null;
  fullDescription: string | null;
  liveUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string; slug: string } | null;
  coverMedia: MediaRefDto | null;
  services: { name: string; slug: string }[];
  industries: { name: string; slug: string }[];
  technologies: { name: string; slug: string; category: string }[];
  media: { id: string; role: string; caption: string | null; media: MediaRefDto | null }[];
  caseStudy: { status: string } | null;
  testimonials: {
    authorName: string;
    authorRole: string | null;
    companyName: string | null;
    content: string;
    rating: number | null;
  }[];
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projects: Repository<ProjectEntity>,
    @InjectRepository(ProjectCategoryEntity)
    private readonly categories: Repository<ProjectCategoryEntity>,
  ) {}

  async listPublished(pagination: Pagination, categorySlug?: string) {
    const qb = this.projects
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.category", "category")
      .leftJoinAndSelect("project.coverMedia", "coverMedia")
      .leftJoinAndSelect("project.industries", "industries", "industries.isActive = true")
      .leftJoinAndSelect("project.technologies", "technologies", "technologies.isActive = true")
      .where("project.publicationStatus = :s", { s: PUBLISHED })
      .orderBy("project.featured", "DESC")
      .addOrderBy("project.order", "ASC")
      .addOrderBy("project.publishedAt", "DESC");

    if (categorySlug) {
      qb.andWhere("category.slug = :cat", { cat: categorySlug });
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();

    return {
      data: rows.map((p) => this.toCard(p)),
      pagination: buildPagination(pagination.page, pagination.pageSize, total),
    };
  }

  /** Categories with at least one published project. */
  async filterCategories() {
    const rows = await this.categories
      .createQueryBuilder("c")
      .innerJoin("c.projects", "p", "p.publicationStatus = :s", { s: PUBLISHED })
      .select(["c.name AS name", "c.slug AS slug"])
      .addSelect("COUNT(p.id)", "count")
      .groupBy("c.id")
      .orderBy("c.order", "ASC")
      .addOrderBy("c.name", "ASC")
      .getRawMany<{ name: string; slug: string; count: string }>();

    return rows.map((r) => ({ name: r.name, slug: r.slug, count: Number(r.count) }));
  }

  async getPublishedBySlug(slug: string): Promise<ProjectDetailDto> {
    const p = await this.projects.findOne({
      where: { slug, publicationStatus: PUBLISHED },
      relations: {
        category: true,
        coverMedia: true,
        services: true,
        industries: true,
        technologies: true,
        media: { media: true },
        caseStudy: true,
        testimonials: true,
      },
    });
    if (!p) throw new NotFoundException();

    return {
      title: p.title,
      slug: p.slug,
      status: p.status,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      liveUrl: p.liveUrl,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      coverMedia: toMediaRef(p.coverMedia),
      services: (p.services ?? [])
        .filter((s) => s.status === PUBLISHED)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.name, slug: s.slug })),
      industries: (p.industries ?? [])
        .filter((i) => i.isActive)
        .sort((a, b) => a.order - b.order)
        .map((i) => ({ name: i.name, slug: i.slug })),
      technologies: (p.technologies ?? [])
        .filter((t) => t.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => ({ name: t.name, slug: t.slug, category: t.category })),
      media: (p.media ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((m) => ({ id: m.id, role: m.role, caption: m.caption, media: toMediaRef(m.media) })),
      caseStudy: p.caseStudy ? { status: p.caseStudy.status } : null,
      testimonials: (p.testimonials ?? [])
        .filter((t) => t.status === PUBLISHED)
        .sort((a, b) => a.order - b.order)
        .map((t) => ({
          authorName: t.authorName,
          authorRole: t.authorRole,
          companyName: t.companyName,
          content: t.content,
          rating: t.rating,
        })),
    };
  }

  private toCard(p: ProjectEntity): ProjectCardDto {
    return {
      title: p.title,
      slug: p.slug,
      status: p.status,
      shortDescription: p.shortDescription,
      featured: p.featured,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      coverMedia: toMediaRef(p.coverMedia),
      industries: (p.industries ?? []).slice(0, 2).map((i) => ({ name: i.name, slug: i.slug })),
      technologies: (p.technologies ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 4)
        .map((t) => ({ name: t.name, slug: t.slug })),
    };
  }
}
