import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MailModule } from "../mail/mail.module";

import {
  ContactEntity,
  IndustryEntity,
  LeadActivityEntity,
  LeadEntity,
  LeadNoteEntity,
  LeadSourceEntity,
  PipelineStageEntity,
  ServiceEntity,
  UserEntity,
} from "../../entities";
import { PublicLeadsController } from "./leads.controller";
import { AdminLeadsController } from "./admin-leads.controller";
import { LeadsService } from "./leads.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeadEntity,
      LeadSourceEntity,
      PipelineStageEntity,
      ContactEntity,
      LeadActivityEntity,
      LeadNoteEntity,
      ServiceEntity,
      IndustryEntity,
      UserEntity,
    ]),
    MailModule,
  ],
  controllers: [PublicLeadsController, AdminLeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
