import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { CaseStudyEntity } from "../../entities";
import { type MediaRefDto, toMediaRef } from "../_shared/media.dto";

const PUBLISHED = PublicationStatus.PUBLISHED;

export interface CaseStudyCardDto {
  publishedAt: string | null;
  project: {
    title: string;
    slug: string;
    shortDescription: string | null;
    coverMedia: MediaRefDto | null;
  };
}

export interface CaseStudyDetailDto {
  challenge: string | null;
  approach: string | null;
  solution: string | null;
  implementation: string | null;
  results: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  project: {
    title: string;
    slug: string;
    shortDescription: string | null;
    liveUrl: string | null;
    coverMedia: MediaRefDto | null;
    category: { name: string; slug: string } | null;
    industries: { name: string; slug: string }[];
    services: { name: string; slug: string }[];
    technologies: { name: string; slug: string }[];
    media: { id: string; role: string; caption: string | null; media: MediaRefDto | null }[];
  };
}

/**
 * CaseStudy has no slug of its own — public URLs use the project's slug. BOTH
 * the case study and its project must be published; a published case study on
 * an unpublished project stays hidden.
 */
@Injectable()
export class CaseStudiesService {
  constructor(
    @InjectRepository(CaseStudyEntity)
    private readonly caseStudies: Repository<CaseStudyEntity>,
  ) {}

  async listPublished(): Promise<CaseStudyCardDto[]> {
    const rows = await this.caseStudies
      .createQueryBuilder("cs")
      .innerJoinAndSelect("cs.project", "project", "project.publicationStatus = :p", { p: PUBLISHED })
      .leftJoinAndSelect("project.coverMedia", "coverMedia")
      .where("cs.status = :s", { s: PUBLISHED })
      .orderBy("cs.publishedAt", "DESC")
      .getMany();

    return rows.map((cs) => ({
      publishedAt: cs.publishedAt?.toISOString() ?? null,
      project: {
        title: cs.project!.title,
        slug: cs.project!.slug,
        shortDescription: cs.project!.shortDescription,
        coverMedia: toMediaRef(cs.project!.coverMedia),
      },
    }));
  }

  async getByProjectSlug(slug: string): Promise<CaseStudyDetailDto> {
    const cs = await this.caseStudies
      .createQueryBuilder("cs")
      .innerJoinAndSelect(
        "cs.project",
        "project",
        "project.publicationStatus = :p AND project.slug = :slug",
        { p: PUBLISHED, slug },
      )
      .leftJoinAndSelect("project.coverMedia", "coverMedia")
      .leftJoinAndSelect("project.category", "category")
      .leftJoinAndSelect("project.industries", "industries", "industries.isActive = true")
      .leftJoinAndSelect("project.services", "services", "services.status = :p")
      .leftJoinAndSelect("project.technologies", "technologies", "technologies.isActive = true")
      .leftJoinAndSelect("project.media", "pmedia")
      .leftJoinAndSelect("pmedia.media", "pmediaFile")
      .where("cs.status = :s", { s: PUBLISHED })
      .getOne();

    if (!cs) throw new NotFoundException();
    const project = cs.project!;

    return {
      challenge: cs.challenge,
      approach: cs.approach,
      solution: cs.solution,
      implementation: cs.implementation,
      results: cs.results,
      seoTitle: cs.seoTitle,
      seoDescription: cs.seoDescription,
      publishedAt: cs.publishedAt?.toISOString() ?? null,
      updatedAt: cs.updatedAt.toISOString(),
      project: {
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        liveUrl: project.liveUrl,
        coverMedia: toMediaRef(project.coverMedia),
        category: project.category ? { name: project.category.name, slug: project.category.slug } : null,
        industries: (project.industries ?? [])
          .sort((a, b) => a.order - b.order)
          .map((i) => ({ name: i.name, slug: i.slug })),
        services: (project.services ?? [])
          .sort((a, b) => a.order - b.order)
          .map((s) => ({ name: s.name, slug: s.slug })),
        technologies: (project.technologies ?? [])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((t) => ({ name: t.name, slug: t.slug })),
        media: (project.media ?? [])
          .sort((a, b) => a.order - b.order)
          .map((m) => ({ id: m.id, role: m.role, caption: m.caption, media: toMediaRef(m.media) })),
      },
    };
  }
}
