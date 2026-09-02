import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { TestimonialEntity } from "../../entities";
import { type MediaRefDto, toMediaRef } from "../_shared/media.dto";

export interface TestimonialDto {
  id: string;
  authorName: string;
  authorRole: string | null;
  companyName: string | null;
  content: string;
  rating: number | null;
  photoMedia: MediaRefDto | null;
  project: { title: string; slug: string } | null;
}

const PUBLISHED = PublicationStatus.PUBLISHED;

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonials: Repository<TestimonialEntity>,
  ) {}

  async listPublished(): Promise<TestimonialDto[]> {
    const rows = await this.testimonials.find({
      where: { status: PUBLISHED },
      order: { order: "ASC", publishedAt: "DESC" },
      relations: { photoMedia: true, project: true },
    });

    return rows.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      authorRole: t.authorRole,
      companyName: t.companyName,
      content: t.content,
      rating: t.rating,
      photoMedia: toMediaRef(t.photoMedia),
      // The linked project is dropped unless it is itself published.
      project:
        t.project && t.project.publicationStatus === PUBLISHED
          ? { title: t.project.title, slug: t.project.slug }
          : null,
    }));
  }
}
