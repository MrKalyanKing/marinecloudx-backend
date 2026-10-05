import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  ApplicationActivityEntity,
  InterviewAvailabilityEntity,
  InterviewBookingEntity,
  InterviewRoundEntity,
  InterviewSlotEntity,
  JobApplicationEntity,
  JobEntity,
  SchedulingTokenEntity,
} from "../../entities";
import { CareersIdSequenceEntity } from "../../entities/careers-id-sequence.entity";
import { AuditModule } from "../audit/audit.module";
import { MailModule } from "../mail/mail.module";
import { StorageService } from "../media/storage.service";
import { NullAiResumeExtractor } from "./ai-resume-extractor";
import { AdminCareersController } from "./admin-careers.controller";
import { CareersIdService } from "./careers-id.service";
import { CareersService } from "./careers.service";
import { PublicCareersController } from "./public-careers.controller";
import { AI_RESUME_EXTRACTOR, ResumeExtractionService } from "./resume-extraction.service";
import { ResumeParserService } from "./resume-parser.service";
import { IcsService } from "./ics.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobEntity,
      JobApplicationEntity,
      ApplicationActivityEntity,
      CareersIdSequenceEntity,
      InterviewRoundEntity,
      InterviewAvailabilityEntity,
      InterviewSlotEntity,
      InterviewBookingEntity,
      SchedulingTokenEntity,
    ]),
    AuditModule,
    MailModule,
  ],
  controllers: [PublicCareersController, AdminCareersController],
  providers: [
    CareersService,
    CareersIdService,
    ResumeParserService,
    ResumeExtractionService,
    StorageService,
    IcsService,
    { provide: AI_RESUME_EXTRACTOR, useClass: NullAiResumeExtractor },
  ],
  exports: [CareersService, IcsService],
})
export class CareersModule {}
