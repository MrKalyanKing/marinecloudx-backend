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
import {
  CancelBookingDto,
  ConfigureAvailabilityDto,
  CreateCandidateDto,
  CreateInterviewRoundDto,
  RescheduleBookingDto,
  UpdateMeetingLinkDto,
} from "./dto/interview-scheduling.dto";

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

  @Post("candidates")
  @HttpCode(201)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Add an external or manual candidate (e.g. LinkedIn, Referral)" })
  @ApiBody({ type: CreateCandidateDto })
  addCandidate(
    @Body() dto: CreateCandidateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.addCandidate(dto, user.id);
  }

  /* ---- Interview Scheduling ---- */

  @Post("applications/:id/interview-rounds")
  @HttpCode(201)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Create an interview round for candidate" })
  @ApiParam({ name: "id" })
  @ApiBody({ type: CreateInterviewRoundDto })
  createInterviewRound(
    @Param("id") id: string,
    @Body() dto: CreateInterviewRoundDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.createInterviewRound(id, dto, user.id);
  }

  @Get("applications/:id/interview-rounds")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "Get interview rounds for an application" })
  @ApiParam({ name: "id" })
  getInterviewRounds(@Param("id") id: string) {
    return this.careers.getInterviewRoundsForApplication(id);
  }

  @Get("interview-rounds/:roundId")
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "Get interview round details" })
  @ApiParam({ name: "roundId" })
  getInterviewRound(@Param("roundId") roundId: string) {
    return this.careers.getInterviewRoundById(roundId);
  }

  @Post("interview-rounds/:roundId/preview-slots")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_READ)
  @ApiOperation({ summary: "Preview slot counts for date range and time windows" })
  @ApiParam({ name: "roundId" })
  @ApiBody({ type: ConfigureAvailabilityDto })
  previewSlots(
    @Param("roundId") roundId: string,
    @Body() dto: ConfigureAvailabilityDto,
  ) {
    return this.careers.previewSlots(roundId, dto);
  }

  @Post("interview-rounds/:roundId/generate-slots")
  @HttpCode(201)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Save availability and generate slots" })
  @ApiParam({ name: "roundId" })
  @ApiBody({ type: ConfigureAvailabilityDto })
  generateSlots(
    @Param("roundId") roundId: string,
    @Body() dto: ConfigureAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.generateSlots(roundId, dto, user.id);
  }

  @Patch("interview-slots/:slotId/block")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Block an available interview slot" })
  @ApiParam({ name: "slotId" })
  blockSlot(
    @Param("slotId") slotId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.blockSlot(slotId, user.id);
  }

  @Patch("interview-slots/:slotId/unblock")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Unblock a blocked interview slot" })
  @ApiParam({ name: "slotId" })
  unblockSlot(
    @Param("slotId") slotId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.unblockSlot(slotId, user.id);
  }

  @Post("interview-rounds/:roundId/token")
  @HttpCode(201)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Generate candidate secure scheduling link" })
  @ApiParam({ name: "roundId" })
  generateToken(
    @Param("roundId") roundId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.generateSchedulingToken(roundId, user.id);
  }

  @Post("interview-rounds/:roundId/token/revoke")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Revoke active candidate scheduling link" })
  @ApiParam({ name: "roundId" })
  revokeToken(
    @Param("roundId") roundId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.revokeSchedulingToken(roundId, user.id);
  }

  @Post("interview-rounds/:roundId/token/regenerate")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Regenerate candidate scheduling link (revoking any existing)" })
  @ApiParam({ name: "roundId" })
  regenerateToken(
    @Param("roundId") roundId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.regenerateSchedulingToken(roundId, user.id);
  }

  @Post("interview-rounds/:roundId/send-invite")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Send candidate interview invitation email with link" })
  @ApiParam({ name: "roundId" })
  sendInvite(
    @Param("roundId") roundId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.sendShortlistInvite(roundId, user.id);
  }

  @Post("interview-bookings/:bookingId/cancel")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Cancel scheduled interview booking" })
  @ApiParam({ name: "bookingId" })
  @ApiBody({ type: CancelBookingDto })
  cancelBooking(
    @Param("bookingId") bookingId: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.cancelBooking(bookingId, dto, user.id);
  }

  @Post("interview-bookings/:bookingId/reschedule")
  @HttpCode(200)
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Reschedule interview booking to another slot" })
  @ApiParam({ name: "bookingId" })
  @ApiBody({ type: RescheduleBookingDto })
  rescheduleBooking(
    @Param("bookingId") bookingId: string,
    @Body() dto: RescheduleBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.rescheduleBooking(bookingId, dto, user.id);
  }

  @Patch("interview-rounds/:roundId/meeting-link")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Update meeting link for an interview round" })
  @ApiParam({ name: "roundId" })
  @ApiBody({ type: UpdateMeetingLinkDto })
  updateRoundMeetingLink(
    @Param("roundId") roundId: string,
    @Body() dto: UpdateMeetingLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.updateRoundMeetingLink(roundId, dto.meetingLink, user.id);
  }

  @Patch("interview-bookings/:bookingId/meeting-link")
  @RequireCapability(CAPABILITIES.CAREERS_WRITE)
  @ApiOperation({ summary: "Update meeting link for an interview booking" })
  @ApiParam({ name: "bookingId" })
  @ApiBody({ type: UpdateMeetingLinkDto })
  updateBookingMeetingLink(
    @Param("bookingId") bookingId: string,
    @Body() dto: UpdateMeetingLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careers.updateBookingMeetingLink(bookingId, dto.meetingLink, user.id);
  }
}
