import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MediaEntity } from "../../entities";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { StorageService } from "./storage.service";

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
})
export class MediaModule {}
