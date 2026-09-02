import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { Public } from "../../common";
import {
  CaseStudiesService,
  type CaseStudyCardDto,
  type CaseStudyDetailDto,
} from "./case-studies.service";

@ApiTags("Public — Case Studies")
@Public()
@Controller("case-studies")
export class CaseStudiesController {
  constructor(private readonly caseStudiesService: CaseStudiesService) {}

  @Get()
  @ApiOperation({ summary: "List all published case studies" })
  @ApiResponse({ status: 200, description: "Array of case study cards." })
  list(): Promise<CaseStudyCardDto[]> {
    return this.caseStudiesService.listPublished();
  }

  @Get(":slug")
  @ApiOperation({
    summary: "Get a case study by project slug",
    description: "Case studies are keyed by their associated project's slug, not their own.",
  })
  @ApiParam({ name: "slug", example: "smart-port-management" })
  @ApiResponse({ status: 200, description: "Case study detail." })
  @ApiResponse({ status: 404, description: "Case study not found." })
  detail(@Param("slug") slug: string): Promise<CaseStudyDetailDto> {
    return this.caseStudiesService.getByProjectSlug(slug);
  }
}
