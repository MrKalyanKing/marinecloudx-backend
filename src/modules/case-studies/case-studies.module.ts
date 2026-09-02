import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CaseStudyEntity } from "../../entities";
import { CaseStudiesController } from "./case-studies.controller";
import { CaseStudiesService } from "./case-studies.service";

@Module({
  imports: [TypeOrmModule.forFeature([CaseStudyEntity])],
  controllers: [CaseStudiesController],
  providers: [CaseStudiesService],
})
export class CaseStudiesModule {}
