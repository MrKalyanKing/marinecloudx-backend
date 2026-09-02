import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager, Repository } from "typeorm";

import { AuditLogEntity } from "../../entities";

export interface AuditEntry {
  userId: string | null;
  /** Verb, e.g. "cms.services.published", "crm.leads.stage_changed". */
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Append-only audit trail. `userId` is always the verified session actor,
 * never client-supplied. Pass a transaction's `EntityManager` to `record` so
 * the audit row commits or rolls back with the mutation it describes.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogs: Repository<AuditLogEntity>,
  ) {}

  async record(entry: AuditEntry, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(AuditLogEntity) : this.auditLogs;
    await repo.save(
      repo.create({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ?? null,
      }),
    );
  }
}
