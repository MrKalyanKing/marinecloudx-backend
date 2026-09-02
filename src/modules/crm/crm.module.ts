import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  IndustryEntity,
  LeadEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  ServiceEntity,
  UserEntity,
} from "../../entities";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PipelineStageEntity,
      LeadSourceEntity,
      IndustryEntity,
      ServiceEntity,
      UserEntity,
      LeadEntity,
    ]),
  ],
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
