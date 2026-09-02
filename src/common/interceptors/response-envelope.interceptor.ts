import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

import type { ApiPagination, ApiSuccessResponse } from "../../contracts";

/**
 * Wraps every successful controller return in the standard success envelope:
 *
 *   { "success": true, "data": <return value> }
 *
 * A controller that returns `{ data, pagination }` (a paginated collection)
 * produces `{ success: true, data, pagination }` instead. A controller that has
 * already built an envelope (`{ success: ... }`) is passed through untouched, so
 * a handler can opt out when it needs to.
 *
 * Errors never reach here — the exception filter owns the failure envelope.
 */
interface MaybePaginated {
  data: unknown;
  pagination: ApiPagination;
}

function isPaginated(value: unknown): value is MaybePaginated {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "pagination" in value &&
    typeof (value as MaybePaginated).pagination === "object"
  );
}

function isEnveloped(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as { success: unknown }).success === "boolean"
  );
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<unknown>> {
    return next.handle().pipe(
      map((payload: unknown) => {
        if (isEnveloped(payload)) {
          return payload as ApiSuccessResponse<unknown>;
        }
        if (isPaginated(payload)) {
          return { success: true, data: payload.data, pagination: payload.pagination };
        }
        return { success: true, data: payload ?? null };
      }),
    );
  }
}
