import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, type EntityManager, In } from "typeorm";

import { PublicationStatus } from "../../contracts";
import { buildPagination, resolvePagination, type PageQuery } from "../../common";
import { AuditService } from "../audit/audit.service";
import {
  CMS_RESOURCES,
  getResource,
  isCmsResourceKey,
  type CmsField,
  type CmsResource,
} from "./registry";

type Body = Record<string, unknown>;

/**
 * Generic CMS engine — one repository/service/route stack drives all twelve
 * resources from `registry.ts`, instead of twelve copies of the same CRUD.
 *
 * Rules enforced here, for every resource, regardless of registry entry:
 *   - the `{resource}` key is validated against the registry before anything
 *     else touches the database — an unknown key is a 404, never an attempt
 *     to address an arbitrary entity
 *   - create always produces a draft (or `isActive:false`→true default for
 *     taxonomy — see `defaultsForCreate`); publishing is its own endpoint
 *   - update strips the publication column even if the client sends it
 *   - relation ids are verified to exist before writing (404, not a raw FK error)
 *   - a duplicate slug/name surfaces as 409 via the global exception filter
 *     (Postgres 23505), not a raw constraint error
 */
@Injectable()
export class CmsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly audit: AuditService,
  ) {}

  resolveResource(key: string): CmsResource {
    if (!isCmsResourceKey(key)) throw new NotFoundException(`Unknown CMS resource: ${key}`);
    return getResource(key);
  }

  summary() {
    return Promise.all(
      Object.values(CMS_RESOURCES).map(async (r) => ({
        key: r.key,
        count: await this.dataSource.getRepository(r.entity).count(),
      })),
    );
  }

  /** id/title pairs for relation dropdowns. */
  async options(key: string) {
    const resource = this.resolveResource(key);
    const rows = await this.dataSource.getRepository(resource.entity).find({
      order: resource.orderBy as never,
      select: { id: true, [resource.titleField]: true } as never,
    });
    return rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r[resource.titleField] }));
  }

  async list(key: string, query: PageQuery & { search?: string }) {
    const resource = this.resolveResource(key);
    const pagination = resolvePagination(query);
    const repo = this.dataSource.getRepository(resource.entity);
    const qb = repo.createQueryBuilder("e");

    for (const rel of resource.listRelations ?? []) {
      qb.leftJoinAndSelect(`e.${rel}`, rel);
    }
    for (const [field, dir] of Object.entries(resource.orderBy)) {
      qb.addOrderBy(`e.${field}`, dir);
    }
    if (query.search && resource.searchFields.length > 0) {
      const clauses = resource.searchFields.map((f, i) => `e.${f} ILIKE :s${i}`).join(" OR ");
      const params: Record<string, string> = {};
      resource.searchFields.forEach((_, i) => (params[`s${i}`] = `%${query.search}%`));
      qb.andWhere(`(${clauses})`, params);
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();
    return { data: rows, pagination: buildPagination(pagination.page, pagination.pageSize, total) };
  }

  async getById(key: string, id: string) {
    const resource = this.resolveResource(key);
    const relations = Object.fromEntries((resource.detailRelations ?? []).map((r) => [r, true]));
    const row = await this.dataSource.getRepository(resource.entity).findOne({
      where: { id } as never,
      relations,
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async create(key: string, body: Body, actorUserId: string) {
    const resource = this.resolveResource(key);

    return this.dataSource.transaction(async (m) => {
      const data = await this.buildWritableData(m, resource, body, "create");
      Object.assign(data, this.publicationDefaultsForCreate(resource));

      const repo = m.getRepository(resource.entity);
      const entity = repo.create(data as never);
      const relationsToAssign = await this.resolveRelationMany(m, resource, body);
      Object.assign(entity as object, relationsToAssign);

      const saved = (await repo.save(entity as never)) as unknown as { id: string };
      await this.replaceChildren(m, resource, saved.id, body);

      await this.audit.record(
        { userId: actorUserId, action: `cms.${key}.created`, entityType: key, entityId: saved.id },
        m,
      );
      return saved;
    });
  }

  async update(key: string, id: string, body: Body, actorUserId: string) {
    const resource = this.resolveResource(key);

    await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(resource.entity);
      const existing = await repo.findOne({ where: { id } as never });
      if (!existing) throw new NotFoundException();

      const data = await this.buildWritableData(m, resource, body, "update");
      // Publication is never touched here, even if sent — publish/unpublish is a separate endpoint.

      if (Object.keys(data).length > 0) {
        await repo.update(id, data as never);
      }
      const relationsToAssign = await this.resolveRelationMany(m, resource, body);
      const relationKeys = Object.keys(relationsToAssign);
      if (relationKeys.length > 0) {
        const relations = Object.fromEntries(relationKeys.map((k) => [k, true]));
        const full = await repo.findOne({ where: { id } as never, relations });
        Object.assign(full as object, relationsToAssign);
        await repo.save(full as never);
      }
      await this.replaceChildren(m, resource, id, body);

      await this.audit.record(
        { userId: actorUserId, action: `cms.${key}.updated`, entityType: key, entityId: id },
        m,
      );
    });
  }

  async publish(key: string, id: string, action: "publish" | "unpublish", actorUserId: string) {
    const resource = this.resolveResource(key);
    if (resource.publication === "none") {
      throw new BadRequestException(`${key} has no publication state.`);
    }

    await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(resource.entity);
      const existing = (await repo.findOne({ where: { id } as never })) as Record<string, unknown> | null;
      if (!existing) throw new NotFoundException();

      const patch: Record<string, unknown> = {};

      if (resource.publication === "active") {
        patch[resource.publicationField!] = action === "publish";
      } else {
        // "status" or "statusOnly"
        patch[resource.publicationField!] =
          action === "publish" ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT;
        if (resource.hasPublishedAt) {
          // Stamped on first publish, preserved through unpublish/republish.
          if (action === "publish" && !existing.publishedAt) {
            patch.publishedAt = new Date();
          }
        }
      }

      await repo.update(id, patch as never);
      await this.audit.record(
        {
          userId: actorUserId,
          action: `cms.${key}.${action === "publish" ? "published" : "unpublished"}`,
          entityType: key,
          entityId: id,
        },
        m,
      );
    });
  }

  // ---------------------------------------------------------------- helpers

  /** Never DRAFT-and-live at once: taxonomy defaults active, everything else drafts. */
  private publicationDefaultsForCreate(resource: CmsResource): Record<string, unknown> {
    if (resource.publication === "active") return { [resource.publicationField!]: true };
    if (resource.publication === "status" || resource.publication === "statusOnly") {
      return { [resource.publicationField!]: PublicationStatus.DRAFT, ...(resource.hasPublishedAt ? { publishedAt: null } : {}) };
    }
    return {};
  }

  /**
   * Picks only registry-declared scalar/relation(single) fields from the body,
   * verifies single-relation ids exist, and returns a plain patch object.
   * `mode "create"` also checks `required`.
   */
  private async buildWritableData(
    m: EntityManager,
    resource: CmsResource,
    body: Body,
    mode: "create" | "update",
  ): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {};

    for (const field of resource.fields) {
      if (field.kind === "relationMany") continue; // handled separately

      const present = Object.prototype.hasOwnProperty.call(body, field.name);
      if (!present) {
        if (mode === "create" && field.required) {
          throw new BadRequestException(`${field.name} is required.`);
        }
        continue;
      }

      const value = body[field.name];

      if (field.kind === "relation") {
        if (value === null || value === undefined || value === "") {
          data[field.name] = null;
          continue;
        }
        if (typeof value !== "string") throw new BadRequestException(`${field.name} must be an id.`);
        const target = this.resolveResource(field.target!);
        const exists = await m.getRepository(target.entity).exists({ where: { id: value } as never });
        if (!exists) throw new NotFoundException(`Unknown ${field.target}: ${value}`);
        data[field.name] = value;
        continue;
      }

      data[field.name] = this.coerce(field, value);
    }

    return data;
  }

  private coerce(field: CmsField, value: unknown): unknown {
    switch (field.kind) {
      case "number":
        if (value === null || value === "") return null;
        return Number(value);
      case "boolean":
        return Boolean(value);
      default:
        return value;
    }
  }

  /** Verifies every id in a relationMany array exists, returns `{ [prop]: Entity[] }` fragments. */
  private async resolveRelationMany(
    m: EntityManager,
    resource: CmsResource,
    body: Body,
  ): Promise<Record<string, unknown[]>> {
    const out: Record<string, unknown[]> = {};

    for (const field of resource.fields) {
      if (field.kind !== "relationMany") continue;
      if (!Object.prototype.hasOwnProperty.call(body, field.name)) continue;

      const ids = body[field.name];
      if (!Array.isArray(ids) || !ids.every((v) => typeof v === "string")) {
        throw new BadRequestException(`${field.name} must be an array of ids.`);
      }
      const target = this.resolveResource(field.target!);
      const rows = ids.length > 0 ? await m.getRepository(target.entity).findBy({ id: In(ids) } as never) : [];
      if (rows.length !== ids.length) {
        throw new NotFoundException(`One or more ${field.target} ids do not exist.`);
      }
      out[field.relationProperty ?? field.name] = rows;
    }

    return out;
  }

  /** Replaces a child collection transactionally when the body includes it. */
  private async replaceChildren(
    m: EntityManager,
    resource: CmsResource,
    parentId: string,
    body: Body,
  ): Promise<void> {
    for (const child of resource.children ?? []) {
      if (!Object.prototype.hasOwnProperty.call(body, child.key)) continue;
      const rows = body[child.key];
      if (!Array.isArray(rows)) throw new BadRequestException(`${child.key} must be an array.`);

      const repo = m.getRepository(child.entity);
      await repo.delete({ [child.parentField]: parentId } as never);

      for (const [index, raw] of rows.entries()) {
        if (typeof raw !== "object" || raw === null) {
          throw new BadRequestException(`${child.key}[${index}] must be an object.`);
        }
        const row = raw as Body;
        const data: Record<string, unknown> = { [child.parentField]: parentId };
        for (const field of child.fields) {
          if (field.required && !Object.prototype.hasOwnProperty.call(row, field.name)) {
            throw new BadRequestException(`${child.key}[${index}].${field.name} is required.`);
          }
          if (Object.prototype.hasOwnProperty.call(row, field.name)) {
            data[field.name] = this.coerce(field, row[field.name]);
          }
        }
        await repo.save(repo.create(data as never));
      }
    }
  }
}
