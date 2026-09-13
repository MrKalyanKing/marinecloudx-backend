import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import {
  BlogCategoryEntity,
  BlogPostEntity,
  BlogTagEntity,
} from "../../entities";
import { buildPagination, type Pagination } from "../../common";
import { type MediaRefDto, toMediaRef } from "../_shared/media.dto";

const PUBLISHED = PublicationStatus.PUBLISHED;

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
}

export interface PostCardDto {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  coverMedia: MediaRefDto | null;
  tags: { name: string; slug: string }[];
}

export interface PostDetailDto {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string; slug: string } | null;
  coverMedia: MediaRefDto | null;
  tags: { name: string; slug: string }[];
}

/**
 * Read model for the public blog.
 *
 * Filters compose *on top of* the `status = PUBLISHED` predicate, never instead
 * of it, so no combination of query params can widen a result set to include a
 * draft. Unknown category/tag slugs simply match nothing.
 */
@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly posts: Repository<BlogPostEntity>,
    @InjectRepository(BlogCategoryEntity)
    private readonly categories: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogTagEntity)
    private readonly tags: Repository<BlogTagEntity>,
  ) {}

  async listPublished(pagination: Pagination, filters: BlogFilters) {
    const qb = this.baseQuery(filters).orderBy("post.publishedAt", "DESC").addOrderBy("post.createdAt", "DESC");

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();

    return {
      data: rows.map((p) => this.toCard(p)),
      pagination: buildPagination(pagination.page, pagination.pageSize, total),
    };
  }

  async getPublishedBySlug(slug: string): Promise<PostDetailDto> {
    const p = await this.posts.findOne({
      where: { slug, status: PUBLISHED },
      relations: { category: true, coverMedia: true, tags: true },
    });
    if (!p) throw new NotFoundException();

    return {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      coverMedia: toMediaRef(p.coverMedia),
      tags: (p.tags ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => ({ name: t.name, slug: t.slug })),
    };
  }

  /** Categories and tags that have at least one published post. */
  async filterOptions() {
    const [categories, tags] = await Promise.all([
      this.categories
        .createQueryBuilder("c")
        .innerJoin("c.posts", "p", "p.status = :s", { s: PUBLISHED })
        .select(["c.name AS name", "c.slug AS slug"])
        .addSelect("COUNT(p.id)", "count")
        .groupBy("c.id")
        .orderBy("c.order", "ASC")
        .addOrderBy("c.name", "ASC")
        .getRawMany<{ name: string; slug: string; count: string }>(),
      this.tags
        .createQueryBuilder("t")
        .innerJoin("t.posts", "p", "p.status = :s", { s: PUBLISHED })
        .select(["t.name AS name", "t.slug AS slug"])
        .groupBy("t.id")
        .orderBy("t.name", "ASC")
        .limit(30)
        .getRawMany<{ name: string; slug: string }>(),
    ]);

    return {
      categories: categories.map((c) => ({ name: c.name, slug: c.slug, count: Number(c.count) })),
      tags: tags.map((t) => ({ name: t.name, slug: t.slug })),
    };
  }

  /** Same-category posts first, then any post sharing a tag. Deterministic. */
  async related(slug: string, limit = 3): Promise<PostCardDto[]> {
    const current = await this.posts.findOne({
      where: { slug, status: PUBLISHED },
      relations: { category: true, tags: true },
    });
    if (!current) throw new NotFoundException();

    const chosen = new Map<string, BlogPostEntity>();

    if (current.category) {
      const sameCategory = await this.baseQuery({ category: current.category.slug })
        .andWhere("post.slug != :slug", { slug })
        .orderBy("post.publishedAt", "DESC")
        .take(limit)
        .getMany();
      for (const p of sameCategory) chosen.set(p.slug, p);
    }

    const tagSlugs = (current.tags ?? []).map((t) => t.slug);
    if (chosen.size < limit && tagSlugs.length > 0) {
      const exclude = [slug, ...chosen.keys()];
      const shared = await this.posts
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.category", "category")
        .leftJoinAndSelect("post.coverMedia", "coverMedia")
        .leftJoinAndSelect("post.tags", "tags")
        .innerJoin("post.tags", "ft", "ft.slug IN (:...tagSlugs)", { tagSlugs })
        .where("post.status = :s", { s: PUBLISHED })
        .andWhere("post.slug NOT IN (:...exclude)", { exclude })
        .orderBy("post.publishedAt", "DESC")
        .take(limit - chosen.size)
        .getMany();
      for (const p of shared) chosen.set(p.slug, p);
    }

    if (chosen.size < limit) {
      const exclude = [slug, ...chosen.keys()];
      const fallback = await this.posts
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.category", "category")
        .leftJoinAndSelect("post.coverMedia", "coverMedia")
        .leftJoinAndSelect("post.tags", "tags")
        .where("post.status = :s", { s: PUBLISHED })
        .andWhere("post.slug NOT IN (:...exclude)", { exclude })
        .orderBy("post.publishedAt", "DESC")
        .take(limit - chosen.size)
        .getMany();
      for (const p of fallback) chosen.set(p.slug, p);
    }

    return [...chosen.values()].slice(0, limit).map((p) => this.toCard(p));
  }

  private baseQuery(filters: BlogFilters) {
    const qb = this.posts
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.category", "category")
      .leftJoinAndSelect("post.coverMedia", "coverMedia")
      .leftJoinAndSelect("post.tags", "tags")
      .where("post.status = :s", { s: PUBLISHED });

    if (filters.category) {
      qb.andWhere("category.slug = :cat", { cat: filters.category });
    }
    if (filters.tag) {
      // A second join on the same relation, aliased separately from the
      // `tags` join used for output, so the filter narrows without hiding the
      // post's other tags.
      qb.innerJoin("post.tags", "filterTag", "filterTag.slug = :tag", { tag: filters.tag });
    }
    const term = filters.search?.trim();
    if (term) {
      qb.andWhere(
        new Brackets((w) => {
          w.where("post.title ILIKE :term")
            .orWhere("post.excerpt ILIKE :term")
            .orWhere("post.slug ILIKE :term");
        }),
      ).setParameter("term", `%${term}%`);
    }

    return qb;
  }

  private toCard(p: BlogPostEntity): PostCardDto {
    return {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      coverMedia: toMediaRef(p.coverMedia),
      tags: (p.tags ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 3)
        .map((t) => ({ name: t.name, slug: t.slug })),
    };
  }
}
