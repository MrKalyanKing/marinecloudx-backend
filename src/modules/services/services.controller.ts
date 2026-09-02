import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { Public } from "../../common";
import { ServicesService } from "./services.service";
import type {
  ServiceDetailDto,
  ServiceListItemDto,
} from "./dto/service-response.dto";

/**
 * Public services API. No auth — published content only.
 *
 * Controllers do one thing: receive the request, call the service, return the
 * value. The response interceptor wraps it in `{ success: true, data }`; the
 * exception filter turns a `NotFoundException` into the 404 error envelope.
 */
@ApiTags("Public — Services")
@Public()
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: "List all published services" })
  @ApiResponse({ status: 200, description: "Array of service list items." })
  list(): Promise<ServiceListItemDto[]> {
    return this.servicesService.listPublished();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get a published service by slug" })
  @ApiParam({ name: "slug", example: "vessel-tracking" })
  @ApiResponse({ status: 200, description: "Service detail with features, industries, and related projects." })
  @ApiResponse({ status: 404, description: "Service not found or not published." })
  detail(@Param("slug") slug: string): Promise<ServiceDetailDto> {
    return this.servicesService.getPublishedBySlug(slug);
  }
}
