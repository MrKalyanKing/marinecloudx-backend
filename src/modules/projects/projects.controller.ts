import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { Public, resolvePagination } from "../../common";
import { ProjectsService, type ProjectDetailDto } from "./projects.service";
import { ProjectsQueryDto } from "./dto/projects-query.dto";

@ApiTags("Public — Projects")
@Public()
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "List published projects (paginated + filterable by category)" })
  @ApiResponse({ status: 200, description: "Paginated project list." })
  list(@Query() query: ProjectsQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    return this.projectsService.listPublished(pagination, query.category);
  }

  @Get("filter-categories")
  @ApiOperation({ summary: "Get available project categories for filtering" })
  @ApiResponse({ status: 200, description: "Array of category slugs/names." })
  filterCategories() {
    return this.projectsService.filterCategories();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get a published project by slug" })
  @ApiParam({ name: "slug", example: "smart-port-management" })
  @ApiResponse({ status: 200, description: "Project detail." })
  @ApiResponse({ status: 404, description: "Project not found or not published." })
  detail(@Param("slug") slug: string): Promise<ProjectDetailDto> {
    return this.projectsService.getPublishedBySlug(slug);
  }
}
