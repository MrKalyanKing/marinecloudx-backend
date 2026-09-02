import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { ServiceEntity } from "../../entities";
import type {
  ServiceDetailDto,
  ServiceListItemDto,
} from "./dto/service-response.dto";

/**
 * Read model for public service content.
 *
 * The publication predicate (`status = PUBLISHED`) is baked into every query
 * here — there is no method that can return a draft. Mirrors the safety
 * property of the legacy `content.ts`: an unpublished slug behaves exactly like
 * one that does not exist.
 */
@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: Repository<ServiceEntity>,
  ) {}

  async listPublished(): Promise<ServiceListItemDto[]> {
    const rows = await this.services.find({
      where: { status: PublicationStatus.PUBLISHED },
      order: { order: "ASC", name: "ASC" },
      relations: { coverMedia: true },
    });

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      shortDescription: s.shortDescription,
      publishedAt: s.publishedAt?.toISOString() ?? null,
      coverMedia: s.coverMedia
        ? {
            id: s.coverMedia.id,
            url: s.coverMedia.url,
            altText: s.coverMedia.altText,
            width: s.coverMedia.width,
            height: s.coverMedia.height,
          }
        : null,
    }));
  }

  async getPublishedBySlug(slug: string): Promise<ServiceDetailDto> {
    const s = await this.services.findOne({
      where: { slug, status: PublicationStatus.PUBLISHED },
      relations: {
        coverMedia: true,
        features: true,
        industries: true,
        technologies: true,
        projects: true,
      },
    });

    // Unpublished or missing are indistinguishable — no draft is ever confirmed.
    if (!s) {
      throw new NotFoundException();
    }

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      shortDescription: s.shortDescription,
      fullDescription: s.fullDescription,
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      publishedAt: s.publishedAt?.toISOString() ?? null,
      updatedAt: s.updatedAt.toISOString(),
      coverMedia: s.coverMedia
        ? {
            id: s.coverMedia.id,
            url: s.coverMedia.url,
            altText: s.coverMedia.altText,
            width: s.coverMedia.width,
            height: s.coverMedia.height,
          }
        : null,
      features: (s.features ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((f) => ({ id: f.id, name: f.name, description: f.description })),
      industries: (s.industries ?? [])
        .filter((i) => i.isActive)
        .sort((a, b) => a.order - b.order)
        .map((i) => ({ name: i.name, slug: i.slug })),
      technologies: (s.technologies ?? [])
        .filter((t) => t.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => ({ name: t.name, slug: t.slug })),
      projects: (s.projects ?? [])
        .filter((p) => p.publicationStatus === PublicationStatus.PUBLISHED)
        .sort((a, b) => a.order - b.order)
        .slice(0, 6)
        .map((p) => ({ title: p.title, slug: p.slug, shortDescription: p.shortDescription })),
    };
  }
}
