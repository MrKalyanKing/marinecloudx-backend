import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { FaqEntity } from "../../entities";

export interface FaqDto {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly faqs: Repository<FaqEntity>,
  ) {}

  async listPublished(): Promise<FaqDto[]> {
    const rows = await this.faqs.find({
      where: { status: PublicationStatus.PUBLISHED },
      order: { order: "ASC", createdAt: "ASC" },
    });
    return rows.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
    }));
  }
}
