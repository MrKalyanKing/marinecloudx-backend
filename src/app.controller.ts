import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "./common";
import { AppService, type HealthPayload } from "./app.service";

/**
 * Health / liveness. Public — no auth, no capability. Every other route is
 * denied by the global guard until it opts in with `@Public()` or the caller
 * is authenticated (Phase 9).
 *
 * The raw payload is returned; `ResponseEnvelopeInterceptor` wraps it as
 * `{ success: true, data: ... }`.
 */
@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService = new AppService()) {
    this.appService = appService ?? new AppService();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Root health check", description: "Returns service name, version, and uptime." })
  @ApiResponse({ status: 200, description: "Service is healthy." })
  root(): HealthPayload {
    return this.appService.health();
  }

  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint", description: "Used by load balancers and monitoring tools." })
  @ApiResponse({ status: 200, description: "Service is healthy." })
  health(): HealthPayload {
    return this.appService.health();
  }
}
