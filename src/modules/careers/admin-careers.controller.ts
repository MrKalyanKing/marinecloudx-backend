import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, RequireCapability, type AuthenticatedUser } from "../../common";
import { CAPABILITIES } from "../../contracts";
import { CareersService } from "./careers.service";
import {
  ApplicationListQueryDto,
  BulkChangeStatusDto,
  ChangeApplicationStatusDto,
  CreateJobDto,
  JobListQueryDto,
  ResumeUrlQueryDto,
  UpdateJobDto,
} from "./dto/careers.dto";

@ApiTags("Admin — Careers")
@ApiCookieAuth("mcx_session")
@Controller("admin/careers")
export class AdminCareersController {
  constructor(private readonly careers: CareersService) {}

  @Get("dashboard")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "Application status summary counts" })
  dashboard(@Query("jobId") jobId?: string) {
    return this.careers.dashboard(jobId);
  }

  /* ---- Jobs ---- */

  @Get("jobs")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "List jobs with application counts" })
  listJobs(@Query() query: JobListQueryDto) {
    return this.careers.listJobs(query);
  }

  @Post("jobs")
  @HttpCode(201)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Create a job posting" })
  @ApiBody({ type: CreateJobDto })
  createJob(@Body() dto: CreateJobDto, @CurrentUser() user: AuthenticatedUser) {
    return this.careers.createJob(dto, user.id);
  }

  @Get("jobs/:id")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiParam({ name: "id" })
  getJob(@Param("id") id: string) {
    return this.careers.getJobById(id);
  }

  @Patch("jobs/:id")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiParam({ name: "id" })
  @ApiBody({ type: UpdateJobDto })
  updateJob(
    @Param("id") id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.updateJob(id, dto, user.id);
  }

  @Delete("jobs/:id")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiParam({ name: "id" })
  async deleteJob(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.careers.deleteJob(id, user.id);
  }

  /* ---- Applications ---- */

  @Get("applications")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "List applications (paginated + filtered)" })
  listApplications(@Query() query: ApplicationListQueryDto) {
    return this.careers.listApplications(query);
  }

  @Post("applications/bulk-status")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Bulk change application status" })
  @ApiBody({ type: BulkChangeStatusDto })
  bulkStatus(@Body() dto: BulkChangeStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.careers.bulkChangeStatus(dto, user.id);
  }

  @Get("applications/:id")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiParam({ name: "id" })
  getApplication(@Param("id") id: string) {
    return this.careers.getApplicationById(id);
  }

  @Patch("applications/:id/status")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiParam({ name: "id" })
  @ApiBody({ type: ChangeApplicationStatusDto })
  changeStatus(
    @Param("id") id: string,
    @Body() dto: ChangeApplicationStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.changeStatus(id, dto.status, user.id);
  }

  @Get("applications/:id/resume-url")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "Get a short-lived pre-signed resume URL" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Signed URL + metadata." })
  resumeUrl(@Param("id") id: string, @Query() query: ResumeUrlQueryDto) {
    return this.careers.getResumeUrl(id, query.disposition ?? "preview");
  }
}
