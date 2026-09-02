import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from "@nestjs/swagger";

import { RequireCapability } from "../../common";
import { CrmService } from "./crm.service";
import { PipelineQueryDto } from "./dto/pipeline-query.dto";

@ApiTags("Admin — CRM")
@ApiCookieAuth("mcx_session")
@Controller()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get("admin/crm/config")
  @RequireCapability("crm:read")
  @ApiOperation({
    summary: "Get CRM configuration",
    description: "Returns pipeline stages, lead sources, and priority options used to build the CRM UI.",
  })
  @ApiResponse({ status: 200, description: "CRM config (stages, sources, priorities)." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  config() {
    return this.crmService.config();
  }

  @Get("admin/dashboard")
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "Get CRM dashboard summary (totals, recent activity)" })
  @ApiResponse({ status: 200, description: "Dashboard metrics." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  dashboard() {
    return this.crmService.dashboard();
  }

  @Get("admin/pipeline")
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "Get Kanban pipeline view (leads grouped by stage)" })
  @ApiResponse({ status: 200, description: "Pipeline board with leads grouped by stage." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  pipeline(@Query() query: PipelineQueryDto) {
    return this.crmService.pipeline(query);
  }
}
