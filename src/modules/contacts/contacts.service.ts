import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ContactEntity } from "../../entities";
import { buildPagination, resolvePagination } from "../../common";
import type { ContactListQueryDto, CreateContactDto } from "./dto/contact.dto";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntity) private readonly contacts: Repository<ContactEntity>,
  ) {}

  async list(query: ContactListQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    const qb = this.contacts.createQueryBuilder("c").orderBy("c.createdAt", "DESC");

    if (query.search) {
      qb.andWhere(
        "(c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.email ILIKE :s OR c.phone ILIKE :s OR c.company ILIKE :s)",
        { s: `%${query.search}%` },
      );
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();
    return { data: rows, pagination: buildPagination(pagination.page, pagination.pageSize, total) };
  }

  async create(dto: CreateContactDto): Promise<ContactEntity> {
    const email = dto.email?.trim().toLowerCase() ?? null;
    if (email) {
      const existing = await this.contacts.findOne({ where: { email } });
      if (existing) return existing; // dedup, same rule as public capture
    }
    return this.contacts.save(
      this.contacts.create({
        firstName: dto.firstName,
        lastName: dto.lastName ?? null,
        email,
        phone: dto.phone ?? null,
        company: dto.company ?? null,
        jobTitle: dto.jobTitle ?? null,
        website: dto.website ?? null,
      }),
    );
  }

  async getById(id: string): Promise<ContactEntity> {
    const contact = await this.contacts.findOne({ where: { id }, relations: { leads: true } });
    if (!contact) throw new NotFoundException();
    return contact;
  }
}
