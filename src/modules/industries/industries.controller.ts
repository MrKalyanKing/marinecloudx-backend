import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { Public } from "../../common";
import {
  IndustriesService,
  type IndustryDetailDto,
  type IndustryListItemDto,
} from "./industries.service";

@ApiTags("Public — Industries")
@Public()
@Controller("industries")
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Get()
  @ApiOperation({ summary: "List all active industries" })
  @ApiResponse({ status: 200, description: "Array of industry list items." })
  list(): Promise<IndustryListItemDto[]> {
    return this.industriesService.listActive();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get an industry by slug" })
  @ApiParam({ name: "slug", example: "offshore-oil-gas" })
  @ApiResponse({ status: 200, description: "Industry detail." })
  @ApiResponse({ status: 404, description: "Industry not found or not active." })
  detail(@Param("slug") slug: string): Promise<IndustryDetailDto> {
    return this.industriesService.getActiveBySlug(slug);
  }
}
