import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IndustryEntity } from "../../entities";
import { IndustriesController } from "./industries.controller";
import { IndustriesService } from "./industries.service";

@Module({
  imports: [TypeOrmModule.forFeature([IndustryEntity])],
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
