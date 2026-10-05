import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { Public, RateLimit } from "../../common";
import { CareersService } from "./careers.service";
import { CreatePublicApplicationDto, JobListQueryDto } from "./dto/careers.dto";
import { BookSlotDto } from "./dto/interview-scheduling.dto";

type UploadedResume = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags("Public — Careers")
@Public()
@Controller("public/careers")
export class PublicCareersController {
  constructor(private readonly careers: CareersService) {}

  @Get("jobs")
  @ApiOperation({ summary: "List published open positions" })
  listJobs(@Query() query: JobListQueryDto) {
    return this.careers.listJobs(query, { publicOnly: true });
  }

  @Get("jobs/:slug")
  @ApiOperation({ summary: "Get a published job by slug" })
  @ApiParam({ name: "slug" })
  @ApiResponse({ status: 404, description: "Job not available." })
  getJob(@Param("slug") slug: string) {
    return this.careers.getPublishedJobBySlug(slug);
  }

  @Post("parse-resume")
  @HttpCode(200)
  @RateLimit({ limit: 10, windowMs: 10 * 60_000 })
  @UseInterceptors(
    FileInterceptor("resume", { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Parse a resume for autofill (does not store the file)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: { resume: { type: "string", format: "binary" } },
      required: ["resume"],
    },
  })
  parseResume(@UploadedFile() file: UploadedResume | undefined) {
    if (!file) throw new BadRequestException("Please choose a resume file to upload.");
    return this.careers.parseResume(file);
  }

  @Post("jobs/:jobId/applications")
  @HttpCode(201)
  @RateLimit({ limit: 5, windowMs: 10 * 60_000 })
  @UseInterceptors(
    FileInterceptor("resume", { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Submit a job application (optional resume)" })
  @ApiParam({ name: "jobId" })
  @ApiResponse({ status: 201, description: "Application created." })
  async apply(
    @Param("jobId") jobId: string,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: UploadedResume,
  ) {
    const dto = await this.coerceAndValidate(body);
    return this.careers.submitApplication(jobId, dto, file);
  }

  /* ---- Candidate Interview Scheduling ---- */

  @Get("interview-scheduling/:token")
  @ApiOperation({ summary: "Get candidate interview scheduling details by secure token" })
  @ApiParam({ name: "token" })
  getInterviewScheduleDetails(@Param("token") token: string) {
    return this.careers.getPublicScheduleDetails(token);
  }

  @Get("interview-scheduling/:token/available-slots")
  @ApiOperation({ summary: "Get available interview slots for a specific date" })
  @ApiParam({ name: "token" })
  getAvailableSlots(
    @Param("token") token: string,
    @Query("date") date: string,
  ) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("A valid date parameter in YYYY-MM-DD format is required.");
    }
    return this.careers.getPublicAvailableSlots(token, date);
  }

  @Post("interview-scheduling/:token/book")
  @HttpCode(201)
  @RateLimit({ limit: 10, windowMs: 10 * 60_000 })
  @ApiOperation({ summary: "Atomically book an interview slot" })
  @ApiParam({ name: "token" })
  @ApiBody({ type: BookSlotDto })
  bookInterviewSlot(
    @Param("token") token: string,
    @Body() dto: BookSlotDto,
  ) {
    return this.careers.bookSlot(token, dto);
  }

  @Get("interview-scheduling/:token/calendar.ics")
  @ApiOperation({ summary: "Download confirmed interview calendar .ics event" })
  @ApiParam({ name: "token" })
  async downloadCalendarIcs(
    @Param("token") token: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const icsContent = await this.careers.downloadBookingIcs(token);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="interview.ics"');
    return icsContent;
  }

  private async coerceAndValidate(
    body: Record<string, string>,
  ): Promise<CreatePublicApplicationDto> {
    const parseJson = <T>(raw: string | undefined): T | undefined => {
      if (!raw?.trim()) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        throw new BadRequestException("Please check the highlighted fields and try again.");
      }
    };

    const yearsRaw = body.yearsOfExperience?.trim();
    const years =
      yearsRaw !== undefined && yearsRaw !== "" ? Number(yearsRaw) : undefined;

    const plain = {
      candidateName: body.candidateName ?? "",
      email: body.email ?? "",
      phone: body.phone || undefined,
      location: body.location || undefined,
      linkedinUrl: body.linkedinUrl || undefined,
      githubUrl: body.githubUrl || undefined,
      portfolioUrl: body.portfolioUrl || undefined,
      currentJobTitle: body.currentJobTitle || undefined,
      yearsOfExperience: Number.isFinite(years) ? years : undefined,
      summary: body.summary || undefined,
      skills: parseJson<string[]>(body.skills),
      education: parseJson(body.education),
      workExperience: parseJson(body.workExperience),
      coverLetter: body.coverLetter || undefined,
      noticePeriod: body.noticePeriod || undefined,
      currentCtc: body.currentCtc || undefined,
      expectedCtc: body.expectedCtc || undefined,
      applicationSource: body.applicationSource || undefined,
    };

    const dto = plainToInstance(CreatePublicApplicationDto, plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const details = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}).map((message) => ({
          path: e.property,
          message,
        })),
      );
      throw new BadRequestException({
        message: "Please check the highlighted fields and try again.",
        details,
      });
    }
    return dto;
  }
}
