import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { Public, resolvePagination } from "../../common";
import { BlogService, type PostCardDto, type PostDetailDto } from "./blog.service";
import { BlogQueryDto } from "./dto/blog-query.dto";

@ApiTags("Public — Blog")
@Public()
@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: "List published blog posts (paginated + filterable)" })
  @ApiResponse({ status: 200, description: "Paginated list of published blog post cards." })
  list(@Query() query: BlogQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    return this.blogService.listPublished(pagination, {
      category: query.category,
      tag: query.tag,
      search: query.search,
    });
  }

  @Get("filter-options")
  @ApiOperation({ summary: "Get blog filter options (categories and tags)" })
  @ApiResponse({ status: 200, description: "Available categories and tags for filtering." })
  filterOptions() {
    return this.blogService.filterOptions();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get a single published blog post by slug" })
  @ApiParam({ name: "slug", example: "vessel-tracking-iot-2026" })
  @ApiResponse({ status: 200, description: "Blog post detail." })
  @ApiResponse({ status: 404, description: "Post not found or not published." })
  detail(@Param("slug") slug: string): Promise<PostDetailDto> {
    return this.blogService.getPublishedBySlug(slug);
  }

  @Get(":slug/related")
  @ApiOperation({ summary: "Get related blog posts for a given post slug" })
  @ApiParam({ name: "slug", example: "vessel-tracking-iot-2026" })
  @ApiResponse({ status: 200, description: "Array of related post cards." })
  @ApiResponse({ status: 404, description: "Post not found." })
  related(@Param("slug") slug: string): Promise<PostCardDto[]> {
    return this.blogService.related(slug);
  }
}
