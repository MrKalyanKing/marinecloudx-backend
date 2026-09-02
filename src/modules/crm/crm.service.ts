import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, type SelectQueryBuilder } from "typeorm";

import { LeadStatus, UserStatus } from "../../contracts";
import {
  ContactEntity,
  IndustryEntity,
  LeadActivityEntity,
  LeadEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  ServiceEntity,
  TaskEntity,
  UserEntity,
} from "../../entities";
import { CRM_ASSIGNABLE_ROLE_SLUGS } from "../auth/roles";

export interface PipelineQuery {
  search?: string;
  assignedUserId?: string;
  serviceId?: string;
  sourceId?: string;
  priority?: string;
  cardsPerStage?: number;
}

const DEFAULT_CARDS_PER_STAGE = 15;
const MAX_CARDS_PER_STAGE = 50;

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(PipelineStageEntity) private readonly stages: Repository<PipelineStageEntity>,
    @InjectRepository(LeadSourceEntity) private readonly sources: Repository<LeadSourceEntity>,
    @InjectRepository(IndustryEntity) private readonly industries: Repository<IndustryEntity>,
    @InjectRepository(ServiceEntity) private readonly services: Repository<ServiceEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(LeadEntity) private readonly leads: Repository<LeadEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** Every configurable value the CRM UI needs, so nothing is hardcoded. */
  async config() {
    const [pipelineStages, sources, industries, services, users] = await Promise.all([
      this.stages.find({ where: { isActive: true }, order: { order: "ASC" } }),
      this.sources.find({ where: { isActive: true }, order: { order: "ASC" } }),
      this.industries.find({ where: { isActive: true }, order: { order: "ASC" } }),
      this.services.find({ order: { order: "ASC" }, select: { id: true, name: true, slug: true } }),
      this.users
        .createQueryBuilder("u")
        .innerJoinAndSelect("u.role", "role")
        .where("u.status = :active", { active: UserStatus.ACTIVE })
        .andWhere("role.slug IN (:...slugs)", { slugs: CRM_ASSIGNABLE_ROLE_SLUGS })
        .getMany(),
    ]);

    return {
      pipelineStages,
      sources,
      industries,
      services,
      users: users.map((u) => ({ id: u.id, name: u.name, roleSlug: u.role!.slug })),
    };
  }

  async dashboard() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const unfinished = ["PENDING", "IN_PROGRESS"];

    const [
      open,
      won,
      lost,
      archived,
      contacts,
      stages,
      stageCountsRaw,
      openTasks,
      overdueTasks,
      dueTodayTasks,
      recentLeads,
      recentActivities,
      recentStageChanges,
    ] = await Promise.all([
      this.leads.count({ where: { status: LeadStatus.OPEN } }),
      this.leads.count({ where: { status: LeadStatus.WON } }),
      this.leads.count({ where: { status: LeadStatus.LOST } }),
      this.leads.count({ where: { status: LeadStatus.ARCHIVED } }),
      this.dataSource.getRepository(ContactEntity).count(),
      this.stages.find({ where: { isActive: true }, order: { order: "ASC" } }),
      this.leads
        .createQueryBuilder("l")
        .select("l.pipelineStageId", "stageId")
        .addSelect("COUNT(l.id)", "count")
        .groupBy("l.pipelineStageId")
        .getRawMany<{ stageId: string; count: string }>(),
      this.dataSource
        .getRepository(TaskEntity)
        .createQueryBuilder("t")
        .where("t.status IN (:...u)", { u: unfinished })
        .getCount(),
      this.dataSource
        .getRepository(TaskEntity)
        .createQueryBuilder("t")
        .where("t.status IN (:...u)", { u: unfinished })
        .andWhere("t.dueAt < :now", { now })
        .getCount(),
      this.dataSource
        .getRepository(TaskEntity)
        .createQueryBuilder("t")
        .where("t.status IN (:...u)", { u: unfinished })
        .andWhere("t.dueAt >= :s AND t.dueAt < :e", { s: startOfToday, e: endOfToday })
        .getCount(),
      this.leads.find({
        order: { createdAt: "DESC" },
        take: 5,
        relations: { contact: true, pipelineStage: true, source: true, assignedUser: true },
      }),
      this.dataSource
        .getRepository(LeadActivityEntity)
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.user", "user")
        .leftJoinAndSelect("a.lead", "lead")
        .leftJoinAndSelect("lead.contact", "contact")
        .orderBy("a.occurredAt", "DESC")
        .take(5)
        .getMany(),
      this.dataSource
        .getRepository(LeadActivityEntity)
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.lead", "lead")
        .leftJoinAndSelect("lead.contact", "contact")
        .where("a.type = :t", { t: "STAGE_CHANGED" })
        .orderBy("a.occurredAt", "DESC")
        .take(5)
        .getMany(),
    ]);

    const byStage = new Map(stageCountsRaw.map((r) => [r.stageId, Number(r.count)]));

    return {
      leads: { total: open + won + lost + archived, open, won, lost, archived },
      contacts: { total: contacts },
      tasks: { open: openTasks, overdue: overdueTasks, dueToday: dueTodayTasks },
      pipeline: stages.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        order: s.order,
        isWon: s.isWon,
        isLost: s.isLost,
        leadCount: byStage.get(s.id) ?? 0,
      })),
      recentLeads,
      recentActivities,
      recentStageChanges,
    };
  }

  async pipeline(query: PipelineQuery) {
    const cardsPerStage = Math.min(
      MAX_CARDS_PER_STAGE,
      Math.max(1, query.cardsPerStage ?? DEFAULT_CARDS_PER_STAGE),
    );

    const stages = await this.stages.find({ where: { isActive: true }, order: { order: "ASC" } });

    const applyFilters = (qb: SelectQueryBuilder<LeadEntity>): SelectQueryBuilder<LeadEntity> => {
      if (query.search) {
        qb.andWhere(
          "(contact.firstName ILIKE :s OR contact.lastName ILIKE :s OR contact.email ILIKE :s)",
          { s: `%${query.search}%` },
        );
      }
      if (query.assignedUserId) qb.andWhere("l.assignedUserId = :u", { u: query.assignedUserId });
      if (query.serviceId) qb.andWhere("l.serviceId = :sv", { sv: query.serviceId });
      if (query.sourceId) qb.andWhere("l.sourceId = :sc", { sc: query.sourceId });
      if (query.priority) qb.andWhere("l.priority = :p", { p: query.priority });
      return qb;
    };

    // True counts: one grouped query for the whole filter set.
    const countQb = applyFilters(
      this.leads
        .createQueryBuilder("l")
        .leftJoin("l.contact", "contact")
        .select("l.pipelineStageId", "stageId")
        .addSelect("COUNT(l.id)", "count")
        .groupBy("l.pipelineStageId"),
    );
    const countRows = await countQb.getRawMany<{ stageId: string; count: string }>();
    const counts = new Map(countRows.map((r) => [r.stageId, Number(r.count)]));

    const columns = await Promise.all(
      stages.map(async (stage) => {
        const cardsQb = applyFilters(
          this.leads
            .createQueryBuilder("l")
            .leftJoinAndSelect("l.contact", "contact")
            .leftJoinAndSelect("l.assignedUser", "assignedUser")
            .where("l.pipelineStageId = :stageId", { stageId: stage.id }),
        );
        const cards = await cardsQb.orderBy("l.createdAt", "DESC").take(cardsPerStage).getMany();

        { const c = counts.get(stage.id) ?? 0; return { stage, leadCount: c, leads: cards }; }
      }),
    );

    return { columns, cardsPerStage };
  }
}
