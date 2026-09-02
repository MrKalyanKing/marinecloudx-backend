import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "../../common";
import { FaqsService, type FaqDto } from "./faqs.service";

@ApiTags("Public — FAQs")
@Public()
@Controller("faqs")
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: "List all published FAQs" })
  @ApiResponse({ status: 200, description: "Array of FAQ items." })
  list(): Promise<FaqDto[]> {
    return this.faqsService.listPublished();
  }
}
