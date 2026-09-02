import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "../../common";
import { TestimonialsService, type TestimonialDto } from "./testimonials.service";

@ApiTags("Public — Testimonials")
@Public()
@Controller("testimonials")
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: "List all published testimonials" })
  @ApiResponse({ status: 200, description: "Array of testimonials." })
  list(): Promise<TestimonialDto[]> {
    return this.testimonialsService.listPublished();
  }
}
