import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

import { CurrentUser, RequireCapability, type AuthenticatedUser } from "../../common";
import { MediaService } from "./media.service";

/**
 * Media upload + delete. Metadata list/detail/update go through the generic CMS
 * routes (`/admin/cms/media`); upload is separate because it is multipart.
 */
@ApiTags("Admin — Media")
@ApiCookieAuth("mcx_session")
@Controller("admin/cms/media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get("upload/config")
  @RequireCapability("cms:read")
  @ApiOperation({ summary: "Get media upload configuration (storage provider, limits)" })
  @ApiResponse({ status: 200, description: "Storage status and upload constraints." })
  @ApiResponse({ status: 401, description: "Not authenticated." })
  @ApiResponse({ status: 403, description: "Missing capability cms:read." })
  status() {
    return this.mediaService.storageStatus();
  }

  @Post("upload")
  @RequireCapability("cms:write")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({
    summary: "Upload a media file (image, video, document)",
    description: "Multipart upload. Max file size: 10 MB. Accepted MIME types: image/*, video/*, application/pdf.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "File to upload (max 10 MB)",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "File uploaded — returns Media record." })
  @ApiResponse({ status: 400, description: "No file provided or file too large." })
  @ApiResponse({ status: 403, description: "Missing capability cms:write." })
  upload(
    @UploadedFile()
    file:
      | { originalname: string; mimetype: string; size: number; buffer: Buffer }
      | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.upload(file, user.id);
  }

  @Delete(":id")
  @RequireCapability("cms:write")
  @ApiOperation({ summary: "Delete a media file by UUID" })
  @ApiParam({ name: "id", description: "Media item UUID" })
  @ApiResponse({ status: 200, description: "File deleted." })
  @ApiResponse({ status: 404, description: "Media item not found." })
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.remove(id, user.id);
  }
}
