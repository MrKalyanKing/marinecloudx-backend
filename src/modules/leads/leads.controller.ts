import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

import { Public, RateLimit } from "../../common";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { LeadsService } from "./leads.service";

/**
 * Public lead capture. Write-only, anonymous, rate-limited to 5 requests per
 * 10 minutes per client — the check runs in the guard, before the body is
 * parsed, so a rejected request creates no Contact, Lead or activity.
 */
@ApiTags("Public — Leads")
@Public()
@Controller("public/leads")
export class PublicLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(201)
  @RateLimit({ limit: 5, windowMs: 10 * 60_000 })
  @ApiOperation({
    summary: "Submit a public lead (website form / chatbot)",
    description:
      "Anonymous, write-only lead capture. Rate-limited to 5 requests per 10 minutes per IP. Creates a Contact + Lead record and places the lead at the earliest active pipeline stage.",
  })
  @ApiBody({ type: CreatePublicLeadDto })
  @ApiResponse({ status: 201, description: "Lead created — returns the new lead UUID.", schema: { example: { success: true, data: { id: "lead_01hx..." } } } })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 429, description: "Rate limit exceeded." })
  create(@Body() dto: CreatePublicLeadDto): Promise<{ id: string }> {
    return this.leadsService.createFromPublic(dto);
  }
}
