import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";

import { Public, RateLimit } from "../../common";
import { ConversationsService } from "./conversations.service";
import {
  AppendMessageDto,
  type ConversationDto,
  type MessageDto,
  StartConversationDto,
} from "./dto/conversation.dto";

/**
 * Public visitor chat. Protected only by the unguessability of the session
 * UUID — a known limitation carried over from the legacy app (documented).
 */
@ApiTags("Public — Conversations")
@Public()
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @HttpCode(201)
  @RateLimit({ limit: 10, windowMs: 10 * 60_000 })
  @ApiOperation({
    summary: "Start a new visitor chat conversation",
    description: "Creates a new chat session with a random UUID. Rate-limited to 10 sessions per 10 minutes per IP.",
  })
  @ApiBody({ type: StartConversationDto })
  @ApiResponse({ status: 201, description: "Session created — returns the sessionId UUID." })
  @ApiResponse({ status: 429, description: "Rate limit exceeded." })
  start(@Body() dto: StartConversationDto): Promise<{ sessionId: string }> {
    return this.conversationsService.start(dto);
  }

  @Get(":sessionId")
  @ApiOperation({ summary: "Get a conversation and its messages by session UUID" })
  @ApiParam({ name: "sessionId", description: "Session UUID returned by POST /conversations", example: "01920abc-..." })
  @ApiResponse({ status: 200, description: "Conversation with messages array." })
  @ApiResponse({ status: 404, description: "Session not found." })
  get(@Param("sessionId") sessionId: string): Promise<ConversationDto> {
    return this.conversationsService.getBySession(sessionId);
  }

  @Post(":sessionId/messages")
  @HttpCode(201)
  @RateLimit({ limit: 60, windowMs: 10 * 60_000 })
  @ApiOperation({
    summary: "Append a visitor message to a conversation",
    description:
      "Appends a USER-role message to the transcript. Role cannot be forged — only USER turns are accepted. Rate-limited to 60 messages per 10 minutes.",
  })
  @ApiParam({ name: "sessionId", description: "Session UUID", example: "01920abc-..." })
  @ApiBody({ type: AppendMessageDto })
  @ApiResponse({ status: 201, description: "Message appended." })
  @ApiResponse({ status: 404, description: "Session not found." })
  @ApiResponse({ status: 429, description: "Rate limit exceeded." })
  append(
    @Param("sessionId") sessionId: string,
    @Body() dto: AppendMessageDto,
  ): Promise<MessageDto> {
    return this.conversationsService.appendMessage(sessionId, dto);
  }
}
