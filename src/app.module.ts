import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { configuration } from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { ServicesModule } from "./modules/services/services.module";
import { IndustriesModule } from "./modules/industries/industries.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { CaseStudiesModule } from "./modules/case-studies/case-studies.module";
import { BlogModule } from "./modules/blog/blog.module";
import { TestimonialsModule } from "./modules/testimonials/testimonials.module";
import { FaqsModule } from "./modules/faqs/faqs.module";
import { PublicModule } from "./modules/public/public.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuthGuard } from "./modules/auth/auth.guard";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { CrmModule } from "./modules/crm/crm.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CmsModule } from "./modules/cms/cms.module";
import { MediaModule } from "./modules/media/media.module";
import {
  AllExceptionsFilter,
  CapabilitiesGuard,
  RateLimitGuard,
  RequestIdInterceptor,
  ResponseEnvelopeInterceptor,
} from "./common";

/**
 * Root module.
 *
 * Cross-cutting behaviour is registered here so it applies to every route:
 *   - request-id + response-envelope interceptors
 *   - the all-exceptions filter (the only place an error becomes a response)
 *   - the capabilities guard (deny by default; `@Public()` opts out)
 *
 * The global `ValidationPipe` is set in `main.ts`.
 *
 * Feature modules (auth, leads, contacts, tasks, crm, cms, media, conversations,
 * reports) and the database module are added in Phases 5–9.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    DatabaseModule.forRoot(),
    AuthModule,
    AuditModule,
    ServicesModule,
    IndustriesModule,
    ProjectsModule,
    CaseStudiesModule,
    BlogModule,
    TestimonialsModule,
    FaqsModule,
    PublicModule,
    LeadsModule,
    ConversationsModule,
    ContactsModule,
    TasksModule,
    CrmModule,
    MediaModule,
    CmsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Order matters: rate limit → resolve identity → enforce capabilities.
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useExisting: AuthGuard },
    { provide: APP_GUARD, useClass: CapabilitiesGuard },
  ],
})
export class AppModule {}
