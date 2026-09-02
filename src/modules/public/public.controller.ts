import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "../../common";
import { PublicService, type SitemapDto } from "./public.service";

/**
 * Small public utility endpoints that don't belong to one content type.
 * `POST /public/leads` (anonymous capture, rate-limited) is added in Phase 8.
 */
@ApiTags("Public — Utilities")
@Public()
@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get("sitemap-entries")
  @ApiOperation({
    summary: "Get sitemap entries for all published content",
    description: "Returns slug + updatedAt for all published content types, used to generate sitemap.xml.",
  })
  @ApiResponse({ status: 200, description: "Sitemap entries grouped by content type." })
  sitemap(): Promise<SitemapDto> {
    return this.publicService.sitemap();
  }
}
