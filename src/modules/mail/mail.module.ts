import { Module } from "@nestjs/common";

import { MailService } from "./mail.service";

/**
 * Transactional email via Resend.
 *
 * Exported so it can be injected into any feature module (e.g. LeadsModule).
 * The underlying Resend client is initialised once on boot.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
