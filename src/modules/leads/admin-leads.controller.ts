import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { CurrentUser, RequireCapability, type AuthenticatedUser } from "../../common";
import { LeadsService } from "./leads.service";
import {
  AssignLeadDto,
  ChangeStageDto,
  CreateActivityDto,
  CreateAdminLeadDto,
  CreateNoteDto,
  LeadListQueryDto,
  UpdateAdminLeadDto,
} from "./dto/admin-lead.dto";

@ApiTags("Admin — Leads")
@ApiCookieAuth("mcx_session")
@Controller("admin/leads")
export class AdminLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "List all leads (paginated + filtered)" })
  @ApiResponse({ status: 200, description: "Paginated list of leads." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  list(@Query() query: LeadListQueryDto) {
    return this.leadsService.list(query);
  }

  @Post()
  @HttpCode(201)
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Create a lead manually (internal team use)" })
  @ApiBody({ type: CreateAdminLeadDto })
  @ApiResponse({ status: 201, description: "Lead created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 403, description: "Missing capability crm:write." })
  create(@Body() dto: CreateAdminLeadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.createAdmin(dto, user.id);
  }

  @Get(":id")
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "Get a single lead with full details" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiResponse({ status: 200, description: "Lead detail." })
  @ApiResponse({ status: 404, description: "Lead not found." })
  detail(@Param("id") id: string) {
    return this.leadsService.getById(id);
  }

  @Patch(":id")
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Update lead business fields" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiBody({ type: UpdateAdminLeadDto })
  @ApiResponse({ status: 200, description: "Lead updated." })
  @ApiResponse({ status: 404, description: "Lead not found." })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminLeadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.leadsService.update(id, dto, user.id);
    return { ok: true };
  }

  @Patch(":id/stage")
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Move lead to a different pipeline stage" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiBody({ type: ChangeStageDto })
  @ApiResponse({ status: 200, description: "Stage updated." })
  async stage(
    @Param("id") id: string,
    @Body() dto: ChangeStageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.leadsService.changeStage(id, dto, user.id);
    return { ok: true };
  }

  @Patch(":id/assign")
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Assign or unassign a lead to a team member" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiBody({ type: AssignLeadDto })
  @ApiResponse({ status: 200, description: "Assignment updated." })
  async assign(
    @Param("id") id: string,
    @Body() dto: AssignLeadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.leadsService.assign(id, dto, user.id);
    return { ok: true };
  }

  @Post(":id/notes")
  @HttpCode(201)
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Add a note to a lead" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 201, description: "Note added." })
  addNote(
    @Param("id") id: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leadsService.addNote(id, dto, user.id);
  }

  @Post(":id/activities")
  @HttpCode(201)
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Log a sales activity against a lead" })
  @ApiParam({ name: "id", description: "Lead UUID" })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: 201, description: "Activity logged." })
  addActivity(
    @Param("id") id: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leadsService.addActivity(id, dto, user.id);
  }
}
