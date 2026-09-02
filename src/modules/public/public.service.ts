import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import {
  BlogPostEntity,
  CaseStudyEntity,
  IndustryEntity,
  ProjectEntity,
  ServiceEntity,
} from "../../entities";

const PUBLISHED = PublicationStatus.PUBLISHED;

export interface SitemapEntryDto {
  slug: string;
  updatedAt: string;
}

export interface SitemapDto {
  services: SitemapEntryDto[];
  industries: SitemapEntryDto[];
  projects: SitemapEntryDto[];
  caseStudies: SitemapEntryDto[];
  posts: SitemapEntryDto[];
}

/**
 * Everything the public sitemap and `robots.txt` need. Only publicly indexable
 * records — a draft never appears here (verified in the legacy app's tests and
 * carried forward).
 */
@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(ServiceEntity) private readonly services: Repository<ServiceEntity>,
    @InjectRepository(IndustryEntity) private readonly industries: Repository<IndustryEntity>,
    @InjectRepository(ProjectEntity) private readonly projects: Repository<ProjectEntity>,
    @InjectRepository(CaseStudyEntity) private readonly caseStudies: Repository<CaseStudyEntity>,
    @InjectRepository(BlogPostEntity) private readonly posts: Repository<BlogPostEntity>,
  ) {}

  async sitemap(): Promise<SitemapDto> {
    const [services, industries, projects, caseStudyRows, posts] = await Promise.all([
      this.services.find({ where: { status: PUBLISHED }, select: { slug: true, updatedAt: true } }),
      this.industries.find({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.projects.find({
        where: { publicationStatus: PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      this.caseStudies
        .createQueryBuilder("cs")
        .innerJoin("cs.project", "project", "project.publicationStatus = :p", { p: PUBLISHED })
        .where("cs.status = :s", { s: PUBLISHED })
        .select(["project.slug AS slug", "cs.updatedAt AS \"updatedAt\""])
        .getRawMany<{ slug: string; updatedAt: Date }>(),
      this.posts.find({ where: { status: PUBLISHED }, select: { slug: true, updatedAt: true } }),
    ]);

    const map = (rows: { slug: string; updatedAt: Date }[]): SitemapEntryDto[] =>
      rows.map((r) => ({ slug: r.slug, updatedAt: new Date(r.updatedAt).toISOString() }));

    return {
      services: map(services),
      industries: map(industries),
      projects: map(projects),
      caseStudies: map(caseStudyRows),
      posts: map(posts),
    };
  }
}
