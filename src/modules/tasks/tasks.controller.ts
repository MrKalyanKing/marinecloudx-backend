import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiBody } from "@nestjs/swagger";

import { CurrentUser, RequireCapability, type AuthenticatedUser } from "../../common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, TaskListQueryDto, UpdateTaskDto } from "./dto/task.dto";

@ApiTags("Admin — Tasks")
@ApiCookieAuth("mcx_session")
@Controller("admin/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "List tasks (paginated + filtered)" })
  @ApiResponse({ status: 200, description: "Paginated task list." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  list(@Query() query: TaskListQueryDto) {
    return this.tasksService.list(query);
  }

  @Post()
  @HttpCode(201)
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Create a new task" })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: "Task created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 403, description: "Missing capability crm:write." })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create(dto, user.id);
  }

  @Patch(":id")
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Update a task (status, assignee, due date, etc.)" })
  @ApiParam({ name: "id", description: "Task UUID" })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: "Task updated." })
  @ApiResponse({ status: 404, description: "Task not found." })
  async update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    await this.tasksService.update(id, dto);
    return { ok: true };
  }
}
