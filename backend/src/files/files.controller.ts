import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { PresignUploadDto } from "./dto/presign-upload.dto";
import { FilesService } from "./files.service";

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post("presign")
  async presign(
    @Body() dto: PresignUploadDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.files.createPresignedUpload(dto, user.id)
    };
  }
}
