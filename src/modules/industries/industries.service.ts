import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { IndustryEntity } from "../../entities";

export interface IndustryListItemDto {
  name: string;
  slug: string;
  description: string | null;
}

export interface IndustryDetailDto extends IndustryListItemDto {
  updatedAt: string;
  services: { name: string; slug: string; shortDescription: string | null }[];
  projects: { title: string; slug: string; shortDescription: string | null }[];
}

const ACTIVE = { isActive: true } as const;
const PUBLISHED = PublicationStatus.PUBLISHED;

/**
 * Read model for public industry content. `isActive = true` is the visibility
 * switch (Industry has no PublicationStatus column) and is baked into every
 * query — an inactive slug 404s exactly like a missing one.
 */
@Injectable()
export class IndustriesService {
  constructor(
    @InjectRepository(IndustryEntity)
    private readonly industries: Repository<IndustryEntity>,
  ) {}

  async listActive(): Promise<IndustryListItemDto[]> {
    const rows = await this.industries.find({
      where: ACTIVE,
      order: { order: "ASC", name: "ASC" },
    });
    return rows.map((i) => ({ name: i.name, slug: i.slug, description: i.description }));
  }

  async getActiveBySlug(slug: string): Promise<IndustryDetailDto> {
    const i = await this.industries.findOne({
      where: { slug, ...ACTIVE },
      relations: { services: true, projects: true },
    });
    if (!i) throw new NotFoundException();

    return {
      name: i.name,
      slug: i.slug,
      description: i.description,
      updatedAt: i.updatedAt.toISOString(),
      services: (i.services ?? [])
        .filter((s) => s.status === PUBLISHED)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.name, slug: s.slug, shortDescription: s.shortDescription })),
      projects: (i.projects ?? [])
        .filter((p) => p.publicationStatus === PUBLISHED)
        .sort((a, b) => a.order - b.order)
        .slice(0, 12)
        .map((p) => ({ title: p.title, slug: p.slug, shortDescription: p.shortDescription })),
    };
  }
}
