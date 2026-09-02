import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BlogCategoryEntity, BlogPostEntity, BlogTagEntity } from "../../entities";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";

@Module({
  imports: [TypeOrmModule.forFeature([BlogPostEntity, BlogCategoryEntity, BlogTagEntity])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
