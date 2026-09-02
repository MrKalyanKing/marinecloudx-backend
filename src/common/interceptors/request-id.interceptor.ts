import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { v7 as uuidv7 } from "uuid";

/**
 * Ensures every request carries a stable `x-request-id`.
 *
 * Uses the caller's value when present (the shared API client sends one), else
 * generates a UUIDv7. Echoed on the response so a client can correlate, and
 * attached to `request.requestId` for structured logs.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<{ headers: Record<string, string | string[] | undefined>; requestId?: string }>();
    const res = http.getResponse<{ setHeader(name: string, value: string): void }>();

    const incoming = req.headers["x-request-id"];
    const id = (Array.isArray(incoming) ? incoming[0] : incoming) || uuidv7();

    req.requestId = id;
    res.setHeader("x-request-id", id);

    return next.handle();
  }
}
