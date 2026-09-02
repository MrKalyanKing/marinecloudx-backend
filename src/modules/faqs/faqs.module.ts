import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FaqEntity } from "../../entities";
import { FaqsController } from "./faqs.controller";
import { FaqsService } from "./faqs.service";

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity])],
  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}
