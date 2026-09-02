import { Body, Controller, Get, HttpCode, Param, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiBody } from "@nestjs/swagger";

import { RequireCapability } from "../../common";
import { ContactsService } from "./contacts.service";
import { ContactListQueryDto, CreateContactDto } from "./dto/contact.dto";

@ApiTags("Admin — Contacts")
@ApiCookieAuth("mcx_session")
@Controller("admin/contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "List contacts (paginated + searchable)" })
  @ApiResponse({ status: 200, description: "Paginated contact list." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability crm:read." })
  list(@Query() query: ContactListQueryDto) {
    return this.contactsService.list(query);
  }

  @Post()
  @HttpCode(201)
  @RequireCapability("crm:write")
  @ApiOperation({ summary: "Create a new contact" })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: "Contact created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 403, description: "Missing capability crm:write." })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get(":id")
  @RequireCapability("crm:read")
  @ApiOperation({ summary: "Get a single contact by UUID" })
  @ApiParam({ name: "id", description: "Contact UUID" })
  @ApiResponse({ status: 200, description: "Contact detail." })
  @ApiResponse({ status: 404, description: "Contact not found." })
  detail(@Param("id") id: string) {
    return this.contactsService.getById(id);
  }
}
