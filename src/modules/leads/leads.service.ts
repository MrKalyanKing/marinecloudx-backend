import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, type EntityManager, Repository } from "typeorm";

import { ActivityType, LeadStatus, Priority, UserStatus } from "../../contracts";
import {
  ContactEntity,
  IndustryEntity,
  LeadActivityEntity,
  LeadEntity,
  LeadNoteEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  ServiceEntity,
  UserEntity,
} from "../../entities";
import { buildPagination, resolvePagination } from "../../common";
import { CRM_ASSIGNABLE_ROLE_SLUGS } from "../auth/roles";
import type { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import type {
  AssignLeadDto,
  ChangeStageDto,
  CreateActivityDto,
  CreateAdminLeadDto,
  CreateNoteDto,
  LeadListQueryDto,
  UpdateAdminLeadDto,
} from "./dto/admin-lead.dto";

/** Public captures are always attributed here — a visitor cannot choose. */
const PUBLIC_SOURCE_SLUG = "website-form";

@Injectable()
export class LeadsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LeadEntity) private readonly leads: Repository<LeadEntity>,
    @InjectRepository(ContactEntity) private readonly contacts: Repository<ContactEntity>,
    @InjectRepository(LeadSourceEntity) private readonly sources: Repository<LeadSourceEntity>,
    @InjectRepository(PipelineStageEntity)
    private readonly stages: Repository<PipelineStageEntity>,
    @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
  ) {}

  // ---------------------------------------------------------------- public

  /** The proving slice — see docs/api.md. One transaction, server-derived lifecycle. */
  async createFromPublic(dto: CreatePublicLeadDto): Promise<{ id: string }> {
    return this.dataSource.transaction(async (m) => {
      const source = await m.getRepository(LeadSourceEntity).findOne({
        where: { slug: PUBLIC_SOURCE_SLUG },
      });
      if (!source || !source.isActive) {
        throw new BadRequestException("Lead capture is not configured.");
      }
      const entryStage = await this.entryStage(m.getRepository(PipelineStageEntity));

      await this.assertServiceIndustryExist(m, dto.serviceId, dto.industryId);
      const contact = await this.resolveContact(m.getRepository(ContactEntity), dto.contact);

      const lead = await this.insertLead(m, {
        contactId: contact.id,
        companyName: dto.companyName ?? null,
        sourceId: source.id,
        pipelineStageId: entryStage.id,
        serviceId: dto.serviceId ?? null,
        industryId: dto.industryId ?? null,
        priority: dto.priority ?? Priority.MEDIUM,
        requirement: dto.requirement ?? null,
        budgetMin: dto.budgetMin ?? null,
        budgetMax: dto.budgetMax ?? null,
        budgetCurrency: dto.budgetCurrency?.toUpperCase() ?? null,
        timeline: dto.timeline ?? null,
      });

      await this.logActivity(m, lead.id, null, ActivityType.LEAD_CREATED, "Lead captured from the website.", {
        source: PUBLIC_SOURCE_SLUG,
      });

      return { id: lead.id };
    });
  }

  // ----------------------------------------------------------------- admin

  async list(query: LeadListQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    const qb = this.leads
      .createQueryBuilder("lead")
      .leftJoinAndSelect("lead.contact", "contact")
      .leftJoinAndSelect("lead.source", "source")
      .leftJoinAndSelect("lead.pipelineStage", "pipelineStage")
      .leftJoinAndSelect("lead.assignedUser", "assignedUser")
      .leftJoinAndSelect("lead.service", "service")
      .orderBy("lead.createdAt", "DESC");

    if (query.search) {
      qb.andWhere(
        "(contact.firstName ILIKE :s OR contact.lastName ILIKE :s OR contact.email ILIKE :s OR lead.companyName ILIKE :s)",
        { s: `%${query.search}%` },
      );
    }
    if (query.status) qb.andWhere("lead.status = :status", { status: query.status });
    if (query.pipelineStageId) qb.andWhere("lead.pipelineStageId = :stage", { stage: query.pipelineStageId });
    if (query.sourceId) qb.andWhere("lead.sourceId = :source", { source: query.sourceId });
    if (query.serviceId) qb.andWhere("lead.serviceId = :service", { service: query.serviceId });
    if (query.assignedUserId === "unassigned") {
      qb.andWhere("lead.assignedUserId IS NULL");
    } else if (query.assignedUserId) {
      qb.andWhere("lead.assignedUserId = :assignee", { assignee: query.assignedUserId });
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();
    return { data: rows, pagination: buildPagination(pagination.page, pagination.pageSize, total) };
  }

  async getById(id: string): Promise<LeadEntity> {
    const lead = await this.leads.findOne({
      where: { id },
      relations: {
        contact: true,
        source: true,
        pipelineStage: true,
        assignedUser: true,
        service: true,
        industry: true,
        activities: true,
        tasks: true,
        notes: true,
      },
    });
    if (!lead) throw new NotFoundException();
    return lead;
  }

  async createAdmin(dto: CreateAdminLeadDto, actorUserId: string): Promise<{ id: string }> {
    return this.dataSource.transaction(async (m) => {
      const source = await m.getRepository(LeadSourceEntity).findOne({ where: { id: dto.sourceId } });
      if (!source || !source.isActive) throw new NotFoundException("Unknown or inactive source.");
      const entryStage = await this.entryStage(m.getRepository(PipelineStageEntity));

      await this.assertServiceIndustryExist(m, dto.serviceId, dto.industryId);
      const contact = await this.resolveContact(m.getRepository(ContactEntity), dto.contact);

      const lead = await this.insertLead(m, {
        contactId: contact.id,
        companyName: dto.companyName ?? null,
        sourceId: source.id,
        pipelineStageId: entryStage.id,
        serviceId: dto.serviceId ?? null,
        industryId: dto.industryId ?? null,
        priority: dto.priority ?? Priority.MEDIUM,
        requirement: dto.requirement ?? null,
        budgetMin: dto.budgetMin ?? null,
        budgetMax: dto.budgetMax ?? null,
        budgetCurrency: dto.budgetCurrency?.toUpperCase() ?? null,
        timeline: dto.timeline ?? null,
      });

      await this.logActivity(m, lead.id, actorUserId, ActivityType.LEAD_CREATED, "Lead created in the CRM.");
      return { id: lead.id };
    });
  }

  /** Business fields only. Only the keys actually sent are written. */
  async update(id: string, dto: UpdateAdminLeadDto, actorUserId: string): Promise<void> {
    await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(LeadEntity);
      const lead = await repo.findOne({ where: { id } });
      if (!lead) throw new NotFoundException();

      if (dto.serviceId !== undefined && dto.serviceId !== null) {
        const exists = await m.getRepository(ServiceEntity).exists({ where: { id: dto.serviceId } });
        if (!exists) throw new NotFoundException("Unknown service.");
      }
      if (dto.industryId !== undefined && dto.industryId !== null) {
        const exists = await m.getRepository(IndustryEntity).exists({ where: { id: dto.industryId } });
        if (!exists) throw new NotFoundException("Unknown industry.");
      }

      const changed: string[] = [];
      const patch: Record<string, unknown> = {};
      for (const key of [
        "companyName",
        "requirement",
        "timeline",
        "priority",
        "serviceId",
        "industryId",
        "budgetMin",
        "budgetMax",
        "budgetCurrency",
      ] as const) {
        if (dto[key] !== undefined) {
          patch[key] = dto[key];
          changed.push(key);
        }
      }
      if (changed.length === 0) return;

      await repo.update(id, patch);
      await this.logActivity(
        m,
        id,
        actorUserId,
        ActivityType.OTHER,
        `Updated: ${changed.join(", ")}`,
      );
    });
  }

  /**
   * `pipelineStageId` only. Status and `closedAt` are derived from the target
   * stage's own `isWon`/`isLost` flags — never from its name, never from the
   * client.
   */
  async changeStage(id: string, dto: ChangeStageDto, actorUserId: string): Promise<void> {
    await this.dataSource.transaction(async (m) => {
      const leadsRepo = m.getRepository(LeadEntity);
      const lead = await leadsRepo.findOne({ where: { id }, relations: { pipelineStage: true } });
      if (!lead) throw new NotFoundException();

      if (dto.pipelineStageId === lead.pipelineStageId) return; // no-op, no activity

      const target = await m
        .getRepository(PipelineStageEntity)
        .findOne({ where: { id: dto.pipelineStageId, isActive: true } });
      if (!target) throw new NotFoundException("Unknown or inactive pipeline stage.");

      const fromStage = lead.pipelineStage;
      const prevStatus = lead.status;
      let nextStatus = lead.status;
      let closedAt = lead.closedAt;

      if (target.isWon) {
        nextStatus = LeadStatus.WON;
        closedAt = new Date();
      } else if (target.isLost) {
        nextStatus = LeadStatus.LOST;
        closedAt = new Date();
      } else if (prevStatus === LeadStatus.WON || prevStatus === LeadStatus.LOST) {
        nextStatus = LeadStatus.OPEN;
        closedAt = null;
      }

      await leadsRepo.update(id, {
        pipelineStageId: target.id,
        status: nextStatus,
        closedAt,
      });

      await this.logActivity(m, id, actorUserId, ActivityType.STAGE_CHANGED, undefined, {
        fromStageId: fromStage?.id ?? null,
        fromStageName: fromStage?.name ?? null,
        toStageId: target.id,
        toStageName: target.name,
      });
      if (nextStatus !== prevStatus) {
        await this.logActivity(m, id, actorUserId, ActivityType.STATUS_CHANGED, undefined, {
          from: prevStatus,
          to: nextStatus,
        });
      }
    });
  }

  /** Assignee must be ACTIVE and hold `crm:write` — enforced server-side, not just hidden from a dropdown. */
  async assign(id: string, dto: AssignLeadDto, actorUserId: string): Promise<void> {
    await this.dataSource.transaction(async (m) => {
      const leadsRepo = m.getRepository(LeadEntity);
      const lead = await leadsRepo.findOne({ where: { id } });
      if (!lead) throw new NotFoundException();

      if (!dto.userId) {
        if (lead.assignedUserId === null) return;
        await leadsRepo.update(id, { assignedUserId: null });
        await this.logActivity(m, id, actorUserId, ActivityType.UNASSIGNED);
        return;
      }

      const user = await m.getRepository(UserEntity).findOne({
        where: { id: dto.userId },
        relations: { role: true },
      });
      const eligible =
        user &&
        user.status === UserStatus.ACTIVE &&
        user.role &&
        (CRM_ASSIGNABLE_ROLE_SLUGS as string[]).includes(user.role.slug);
      if (!eligible) throw new NotFoundException("Ineligible or unknown assignee.");

      if (lead.assignedUserId === dto.userId) return;
      await leadsRepo.update(id, { assignedUserId: dto.userId });
      await this.logActivity(m, id, actorUserId, ActivityType.ASSIGNED, undefined, {
        assignedUserId: dto.userId,
      });
    });
  }

  async addNote(id: string, dto: CreateNoteDto, actorUserId: string) {
    const exists = await this.leads.exists({ where: { id } });
    if (!exists) throw new NotFoundException();
    const repo = this.dataSource.getRepository(LeadNoteEntity);
    return repo.save(repo.create({ leadId: id, authorId: actorUserId, content: dto.content }));
  }

  async addActivity(id: string, dto: CreateActivityDto, actorUserId: string) {
    const exists = await this.leads.exists({ where: { id } });
    if (!exists) throw new NotFoundException();
    return this.logActivity(this.dataSource.manager, id, actorUserId, dto.type, dto.description);
  }

  // ---------------------------------------------------------------- helpers

  private async entryStage(repo: Repository<PipelineStageEntity>): Promise<PipelineStageEntity> {
    const stages = await repo.find({ where: { isActive: true }, order: { order: "ASC" } });
    const entry = stages.find((s) => !s.isWon && !s.isLost);
    if (!entry) throw new BadRequestException("No pipeline stage is available.");
    return entry;
  }

  private async assertServiceIndustryExist(
    m: EntityManager,
    serviceId?: string,
    industryId?: string,
  ): Promise<void> {
    if (serviceId) {
      const exists = await m.getRepository(ServiceEntity).exists({ where: { id: serviceId } });
      if (!exists) throw new NotFoundException("Unknown service.");
    }
    if (industryId) {
      const exists = await m.getRepository(IndustryEntity).exists({ where: { id: industryId } });
      if (!exists) throw new NotFoundException("Unknown industry.");
    }
  }

  private async resolveContact(
    repo: Repository<ContactEntity>,
    input: { firstName: string; lastName?: string; email?: string; phone?: string; company?: string },
  ): Promise<ContactEntity> {
    const email = input.email?.trim().toLowerCase() ?? null;
    const contact = email ? await repo.findOne({ where: { email } }) : null;

    if (contact) {
      const patch: { lastName?: string; phone?: string; company?: string } = {};
      if (!contact.lastName && input.lastName) patch.lastName = input.lastName;
      if (!contact.phone && input.phone) patch.phone = input.phone;
      if (!contact.company && input.company) patch.company = input.company;
      if (Object.keys(patch).length > 0) await repo.update(contact.id, patch);
      return contact;
    }

    return repo.save(
      repo.create({
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        email,
        phone: input.phone ?? null,
        company: input.company ?? null,
      }),
    );
  }

  private async insertLead(
    m: EntityManager,
    fields: {
      contactId: string;
      companyName: string | null;
      sourceId: string;
      pipelineStageId: string;
      serviceId: string | null;
      industryId: string | null;
      priority: Priority;
      requirement: string | null;
      budgetMin: number | null;
      budgetMax: number | null;
      budgetCurrency: string | null;
      timeline: string | null;
    },
  ): Promise<LeadEntity> {
    const repo = m.getRepository(LeadEntity);
    return repo.save(
      repo.create({
        ...fields,
        assignedUserId: null,
        status: LeadStatus.OPEN,
        qualificationScore: null,
        closedAt: null,
      }),
    );
  }

  private async logActivity(
    m: EntityManager,
    leadId: string,
    userId: string | null,
    type: ActivityType,
    description?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const repo = m.getRepository(LeadActivityEntity);
    await repo.save(
      repo.create({
        leadId,
        userId,
        type,
        description: description ?? null,
        metadata: metadata ?? null,
      }),
    );
  }
}
