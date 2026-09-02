import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { v7 as uuidv7 } from "uuid";
import { randomUUID } from "node:crypto";
import { Repository } from "typeorm";

import { ConversationStatus, MessageRole } from "../../contracts";
import { ConversationEntity, MessageEntity } from "../../entities";
import type {
  AppendMessageDto,
  ConversationDto,
  MessageDto,
  StartConversationDto,
} from "./dto/conversation.dto";

/**
 * Visitor chat.
 *
 * A conversation is NOT a lead — `leadId` stays null and nothing in this layer
 * ever sets it. `sessionId` is server-generated and is the only token the
 * browser holds. No AI provider is connected: appending a message stores it,
 * nothing generates a reply.
 */
@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversations: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
  ) {}

  async start(dto: StartConversationDto): Promise<{ sessionId: string }> {
    const conversation = await this.conversations.save(
      this.conversations.create({
        id: uuidv7(),
        sessionId: randomUUID(),
        status: ConversationStatus.ACTIVE,
        leadId: null,
        metadata: dto.metadata ?? null,
        startedAt: new Date(),
        endedAt: null,
      }),
    );
    // Only the sessionId leaves — never the internal id or leadId.
    return { sessionId: conversation.sessionId };
  }

  async getBySession(sessionId: string): Promise<ConversationDto> {
    const conversation = await this.conversations.findOne({ where: { sessionId } });
    if (!conversation) throw new NotFoundException();

    const messages = await this.messages.find({
      where: { conversationId: conversation.id },
      order: { createdAt: "ASC" },
    });

    return {
      sessionId: conversation.sessionId,
      status: conversation.status,
      startedAt: conversation.startedAt.toISOString(),
      endedAt: conversation.endedAt?.toISOString() ?? null,
      messages: messages.map((m) => this.toMessageDto(m)),
    };
  }

  async appendMessage(sessionId: string, dto: AppendMessageDto): Promise<MessageDto> {
    const conversation = await this.conversations.findOne({ where: { sessionId } });
    if (!conversation) throw new NotFoundException();

    const message = await this.messages.save(
      this.messages.create({
        id: uuidv7(),
        conversationId: conversation.id,
        role: MessageRole.USER, // never from the client
        content: dto.content,
        metadata: dto.metadata ?? null,
      }),
    );

    return this.toMessageDto(message);
  }

  private toMessageDto(m: MessageEntity): MessageDto {
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    };
  }
}
