import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";

import { CurrentUser, RequireCapability, type AuthenticatedUser } from "../../common";
import { CmsService } from "./cms.service";
import { CmsListQueryDto, PublishActionDto } from "./dto/cms-query.dto";

/**
 * Twelve content types, one route family. The `{resource}` segment is
 * validated against the registry before anything else runs — an unknown key
 * 404s rather than addressing an arbitrary entity.
 */
@ApiTags("Admin — CMS")
@ApiCookieAuth("mcx_session")
@Controller("admin/cms")
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get("summary")
  @RequireCapability("cms:read")
  @ApiOperation({ summary: "Get CMS content summary (counts per resource type)" })
  @ApiResponse({ status: 200, description: "Summary counts for all CMS resource types." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability cms:read." })
  summary() {
    return this.cmsService.summary();
  }

  @Get(":resource/options")
  @RequireCapability("cms:read")
  @ApiOperation({
    summary: "Get select-box options for a CMS resource type",
    description:
      "Returns a lightweight id+label list for use in form dropdowns. Resource must be one of the registered types (services, blog-posts, industries, projects, case-studies, testimonials, faqs, media, pipeline-stages, lead-sources, technologies, users).",
  })
  @ApiParam({
    name: "resource",
    example: "services",
    description: "CMS resource type slug",
  })
  @ApiResponse({ status: 200, description: "Options list." })
  @ApiResponse({ status: 404, description: "Unknown resource type." })
  options(@Param("resource") resource: string) {
    return this.cmsService.options(resource);
  }

  @Get(":resource")
  @RequireCapability("cms:read")
  @ApiOperation({ summary: "List items for a CMS resource type (paginated + searchable)" })
  @ApiParam({ name: "resource", example: "blog-posts", description: "CMS resource type slug" })
  @ApiResponse({ status: 200, description: "Paginated list of resource items." })
  @ApiResponse({ status: 404, description: "Unknown resource type." })
  list(@Param("resource") resource: string, @Query() query: CmsListQueryDto) {
    return this.cmsService.list(resource, query);
  }

  @Post(":resource")
  @HttpCode(201)
  @RequireCapability("cms:write")
  @ApiOperation({ summary: "Create a new CMS item" })
  @ApiParam({ name: "resource", example: "blog-posts", description: "CMS resource type slug" })
  @ApiBody({
    schema: { type: "object", additionalProperties: true, example: { title: "My Post", slug: "my-post" } },
    description: "Resource-specific fields — see the registry for valid keys per resource type.",
  })
  @ApiResponse({ status: 201, description: "Item created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Unknown resource type." })
  create(
    @Param("resource") resource: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cmsService.create(resource, body, user.id);
  }

  @Get(":resource/:id")
  @RequireCapability("cms:read")
  @ApiOperation({ summary: "Get a single CMS item by UUID" })
  @ApiParam({ name: "resource", example: "blog-posts", description: "CMS resource type slug" })
  @ApiParam({ name: "id", description: "Item UUID" })
  @ApiResponse({ status: 200, description: "Item detail." })
  @ApiResponse({ status: 404, description: "Item not found." })
  detail(@Param("resource") resource: string, @Param("id") id: string) {
    return this.cmsService.getById(resource, id);
  }

  @Patch(":resource/:id")
  @RequireCapability("cms:write")
  @ApiOperation({ summary: "Update a CMS item" })
  @ApiParam({ name: "resource", example: "blog-posts", description: "CMS resource type slug" })
  @ApiParam({ name: "id", description: "Item UUID" })
  @ApiBody({
    schema: { type: "object", additionalProperties: true },
    description: "Partial update — only provided keys are written.",
  })
  @ApiResponse({ status: 200, description: "Item updated." })
  @ApiResponse({ status: 404, description: "Item not found." })
  async update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.cmsService.update(resource, id, body, user.id);
    return { ok: true };
  }

  @Patch(":resource/:id/publish")
  @RequireCapability("cms:write")
  @ApiOperation({ summary: "Publish or unpublish a CMS item" })
  @ApiParam({ name: "resource", example: "blog-posts", description: "CMS resource type slug" })
  @ApiParam({ name: "id", description: "Item UUID" })
  @ApiBody({ type: PublishActionDto })
  @ApiResponse({ status: 200, description: "Publication status updated." })
  @ApiResponse({ status: 404, description: "Item not found." })
  async publish(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() dto: PublishActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.cmsService.publish(resource, id, dto.action, user.id);
    return { ok: true };
  }
}
