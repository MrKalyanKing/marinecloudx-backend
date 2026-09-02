import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TaskStatus } from "../../contracts";
import { TaskEntity } from "../../entities";
import { buildPagination, resolvePagination } from "../../common";
import type { CreateTaskDto, TaskListQueryDto, UpdateTaskDto } from "./dto/task.dto";

const UNFINISHED = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS];

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity) private readonly tasks: Repository<TaskEntity>,
  ) {}

  async list(query: TaskListQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    const qb = this.tasks
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.lead", "lead")
      .leftJoinAndSelect("t.assignedUser", "assignedUser")
      .orderBy("t.dueAt", "ASC");

    if (query.status) qb.andWhere("t.status = :status", { status: query.status });
    if (query.assignedUserId) qb.andWhere("t.assignedUserId = :u", { u: query.assignedUserId });
    if (query.leadId) qb.andWhere("t.leadId = :l", { l: query.leadId });
    if (query.priority) qb.andWhere("t.priority = :p", { p: query.priority });

    // Due-state is computed, never stored — a completed task is never overdue.
    if (query.due === "overdue") {
      qb.andWhere("t.dueAt < :now", { now: new Date() }).andWhere("t.status IN (:...s)", { s: UNFINISHED });
    } else if (query.due === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      qb.andWhere("t.dueAt >= :start AND t.dueAt < :end", { start, end }).andWhere("t.status IN (:...s)", {
        s: UNFINISHED,
      });
    } else if (query.due === "upcoming") {
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      qb.andWhere("t.dueAt >= :end", { end }).andWhere("t.status IN (:...s)", { s: UNFINISHED });
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();
    return { data: rows, pagination: buildPagination(pagination.page, pagination.pageSize, total) };
  }

  async create(dto: CreateTaskDto, actorUserId: string): Promise<TaskEntity> {
    return this.tasks.save(
      this.tasks.create({
        title: dto.title,
        description: dto.description ?? null,
        leadId: dto.leadId ?? null,
        assignedUserId: dto.assignedUserId ?? null,
        createdById: actorUserId,
        priority: dto.priority,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      }),
    );
  }

  async update(id: string, dto: UpdateTaskDto): Promise<void> {
    const task = await this.tasks.findOne({ where: { id } });
    if (!task) throw new NotFoundException();

    const patch: Partial<Pick<TaskEntity, "title" | "description" | "assignedUserId" | "priority" | "status" | "dueAt" | "completedAt">> = {};

    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.assignedUserId !== undefined) patch.assignedUserId = dto.assignedUserId;
    if (dto.priority !== undefined) patch.priority = dto.priority;
    if (dto.dueAt !== undefined) patch.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;

    if (dto.status !== undefined) {
      patch.status = dto.status;
      // Server-stamped, never client-supplied — cannot disagree with status.
      if (dto.status === TaskStatus.COMPLETED) {
        patch.completedAt = new Date();
      } else if (task.status === TaskStatus.COMPLETED) {
        patch.completedAt = null; // reopened
      }
    }

    if (Object.keys(patch).length > 0) {
      await this.tasks.update(id, patch);
    }
  }
}
