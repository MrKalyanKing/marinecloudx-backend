import { BadRequestException } from "@nestjs/common";

import type { ApiPagination } from "../../contracts";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PageQuery {
  page?: number | string;
  pageSize?: number | string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Offset pagination, matching the legacy contract: `?page=1&pageSize=20`,
 * default size 20, **maximum 100**. Out-of-range values are a 400, not a
 * silent clamp — a client asking for 5000 rows should know it was refused.
 */
export function resolvePagination(query: PageQuery): Pagination {
  const page = intOr(query.page, 1, "page");
  const pageSize = intOr(query.pageSize, DEFAULT_PAGE_SIZE, "pageSize");

  if (page < 1) throw new BadRequestException("page must be 1 or greater");
  if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new BadRequestException(`pageSize must be between 1 and ${MAX_PAGE_SIZE}`);
  }

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPagination(page: number, pageSize: number, total: number): ApiPagination {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function intOr(value: number | string | undefined, fallback: number, name: string): number {
  if (value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n)) throw new BadRequestException(`${name} must be an integer`);
  return n;
}
