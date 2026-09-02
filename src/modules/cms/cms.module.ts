import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  BlogCategoryEntity,
  BlogPostEntity,
  BlogTagEntity,
  CaseStudyEntity,
  FaqEntity,
  IndustryEntity,
  MediaEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectMediaEntity,
  ServiceEntity,
  ServiceFeatureEntity,
  TechnologyEntity,
  TestimonialEntity,
} from "../../entities";
import { CmsController } from "./cms.controller";
import { CmsService } from "./cms.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      ServiceFeatureEntity,
      IndustryEntity,
      TechnologyEntity,
      ProjectEntity,
      ProjectCategoryEntity,
      ProjectMediaEntity,
      CaseStudyEntity,
      TestimonialEntity,
      FaqEntity,
      BlogPostEntity,
      BlogCategoryEntity,
      BlogTagEntity,
      MediaEntity,
    ]),
  ],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
