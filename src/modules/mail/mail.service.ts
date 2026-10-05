import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

import type { AppConfig } from "../../config/configuration";

/** Payload for every lead email pair. */
export interface LeadEmailPayload {
  /** Visitor name from the form. */
  clientName: string;
  /** Visitor email — may be undefined if they didn't provide one. */
  clientEmail?: string;
  /** Visitor phone — optional. */
  clientPhone?: string;
  /** Company or business name — optional. */
  companyName?: string;
  /** Service they selected — optional. */
  serviceName?: string;
  /** Budget range text — optional. */
  budget?: string;
  /** Timeline text — optional. */
  timeline?: string;
  /** Full requirement message — optional. */
  requirement?: string;
  /** New lead ID for internal reference. */
  leadId: string;
}

/** Payload for Careers application confirmation (applicant-facing). */
export interface ApplicationConfirmationEmailPayload {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobCode: string;
  applicationCode: string;
}

/** Payload for candidate interview scheduling invitation link. */
export interface InterviewInvitationEmailPayload {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobCode: string;
  applicationCode: string;
  roundTitle: string;
  durationMinutes: number;
  schedulingUrl: string;
}

/** Payload for candidate interview booking confirmation. */
export interface InterviewConfirmationEmailPayload {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobCode: string;
  applicationCode: string;
  roundTitle: string;
  durationMinutes: number;
  formattedDate: string;
  formattedTime: string;
  timezone: string;
  meetingLink?: string | null;
  icsContent?: string;
}

/** Payload for admin alert when candidate books an interview. */
export interface InterviewAdminNotificationPayload {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  applicationCode: string;
  roundTitle: string;
  durationMinutes: number;
  formattedDate: string;
  formattedTime: string;
  timezone: string;
  meetingLink?: string | null;
  icsContent?: string;
}

/**
 * Thin wrapper around Resend.
 *
 * Both methods are **fire-and-forget** — a transient Resend error must never
 * propagate back to the visitor's form submission. Failures are logged and
 * swallowed; they do not roll back the lead transaction.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly companyEmail: string;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM ?? "no-reply@marinecloudx.in";
    const companyEmail = process.env.COMPANY_NOTIFICATION_EMAIL ?? "srikanth@marinecloudx.in";

    this.from = from;
    this.companyEmail = companyEmail;

    if (!apiKey || apiKey === "YOUR_RESEND_API_KEY_HERE") {
      this.logger.warn(
        "RESEND_API_KEY is not configured. Emails will be skipped. Set RESEND_API_KEY in .env to enable transactional email.",
      );
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log(`MailService initialised. from=${this.from}, company=${this.companyEmail}`);
    }
  }

  /**
   * Sends the client acknowledgement and the company alert for a new lead.
   *
   * Fire-and-forget: never throws. Returns as soon as both API calls are
   * dispatched (they run in parallel).
   */
  async sendLeadEmails(payload: LeadEmailPayload): Promise<void> {
    if (!this.resend) {
      this.logger.debug("Mail skipped — RESEND_API_KEY not set.");
      return;
    }

    const tasks: Promise<void>[] = [this.sendCompanyNotification(payload)];

    if (payload.clientEmail) {
      tasks.push(this.sendClientConfirmation(payload));
    }

    // Both mails fire concurrently; we don't await — fire and forget.
    Promise.all(tasks).catch((err: unknown) => {
      this.logger.error("Unexpected error in mail dispatch", err);
    });
  }

  /**
   * Applicant confirmation after a Careers application is saved.
   * Clearly marked as a no-reply message. Fire-and-forget — never throws.
   */
  async sendApplicationConfirmation(payload: ApplicationConfirmationEmailPayload): Promise<void> {
    if (!this.resend) {
      this.logger.debug("Application confirmation skipped — RESEND_API_KEY not set.");
      return;
    }

    try {
      await this.resend.emails.send({
        from: `MarineCloudX Careers <${this.from}>`,
        to: [payload.candidateEmail],
        replyTo: this.from,
        subject: `We received your application for ${payload.jobTitle}`,
        html: buildApplicationConfirmationHtml(payload),
      });
      this.logger.log(
        `Application confirmation sent to ${payload.candidateEmail} (${payload.applicationCode})`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send application confirmation to ${payload.candidateEmail}`,
        err,
      );
    }
  }

  /**
   * Interview invitation email with dedicated secure scheduling link.
   */
  async sendInterviewInvitation(payload: InterviewInvitationEmailPayload): Promise<void> {
    if (!this.resend) {
      this.logger.debug("Interview invitation skipped — RESEND_API_KEY not set.");
      return;
    }

    try {
      await this.resend.emails.send({
        from: `MarineCloudX Careers <${this.from}>`,
        to: [payload.candidateEmail],
        replyTo: this.from,
        subject: `You’ve Been Shortlisted | ${payload.jobTitle} | MarineCloudX`,
        html: buildInterviewInvitationHtml(payload),
      });
      this.logger.log(
        `Interview invitation sent to ${payload.candidateEmail} for ${payload.applicationCode}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send interview invitation to ${payload.candidateEmail}`,
        err,
      );
    }
  }

  /**
   * Interview confirmation email after candidate books a slot.
   */
  async sendInterviewConfirmation(payload: InterviewConfirmationEmailPayload): Promise<void> {
    if (!this.resend) {
      this.logger.debug("Interview confirmation skipped — RESEND_API_KEY not set.");
      return;
    }

    try {
      const attachments = payload.icsContent
        ? [
            {
              filename: "interview.ics",
              content: Buffer.from(payload.icsContent, "utf-8"),
              contentType: "text/calendar; charset=utf-8; method=REQUEST",
            },
          ]
        : undefined;

      await this.resend.emails.send({
        from: `MarineCloudX Careers <${this.from}>`,
        to: [payload.candidateEmail],
        replyTo: this.from,
        subject: `Interview Scheduled | ${payload.jobTitle} | MarineCloudX`,
        html: buildInterviewConfirmationHtml(payload),
        attachments,
      });
      this.logger.log(
        `Interview confirmation sent to ${payload.candidateEmail} (${payload.applicationCode})`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send interview confirmation to ${payload.candidateEmail}`,
        err,
      );
    }
  }

  /**
   * Hiring team notification when a candidate confirms an interview.
   */
  async sendInterviewAdminAlert(payload: InterviewAdminNotificationPayload): Promise<void> {
    if (!this.resend) {
      this.logger.debug("Interview admin alert skipped — RESEND_API_KEY not set.");
      return;
    }

    try {
      const attachments = payload.icsContent
        ? [
            {
              filename: "interview.ics",
              content: Buffer.from(payload.icsContent, "utf-8"),
              contentType: "text/calendar; charset=utf-8; method=REQUEST",
            },
          ]
        : undefined;

      await this.resend.emails.send({
        from: `MarineCloudX Careers <${this.from}>`,
        to: [this.companyEmail],
        subject: `Interview Booked: ${payload.candidateName} — ${payload.jobTitle} (${payload.roundTitle})`,
        html: buildInterviewAdminAlertHtml(payload),
        attachments,
      });
      this.logger.log(
        `Interview booking alert sent to ${this.companyEmail} for candidate ${payload.candidateName}`,
      );
    } catch (err) {
      this.logger.error("Failed to send interview admin alert", err);
    }
  }

  // ─────────────────────────────────────────── private helpers

  private async sendClientConfirmation(payload: LeadEmailPayload): Promise<void> {
    try {
      await this.resend!.emails.send({
        from: `MarineCloudX <${this.from}>`,
        to: [payload.clientEmail!],
        subject: "We've received your project enquiry — MarineCloudX",
        html: buildClientConfirmationHtml(payload),
      });
      this.logger.log(`Client confirmation sent to ${payload.clientEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send client confirmation to ${payload.clientEmail}`, err);
    }
  }

  private async sendCompanyNotification(payload: LeadEmailPayload): Promise<void> {
    const serviceLabel = payload.serviceName ?? "General Enquiry";
    try {
      await this.resend!.emails.send({
        from: `MarineCloudX CRM <${this.from}>`,
        to: [this.companyEmail],
        subject: `New Project Enquiry: ${payload.clientName} — ${serviceLabel}`,
        html: buildCompanyNotificationHtml(payload),
      });
      this.logger.log(`Company notification sent to ${this.companyEmail} for lead ${payload.leadId}`);
    } catch (err) {
      this.logger.error(`Failed to send company notification for lead ${payload.leadId}`, err);
    }
  }
}

// ═══════════════════════════════════════════════════════════════ HTML templates

/** Applicant-facing Careers confirmation — product-company style, quiet no-reply footer. */
function buildApplicationConfirmationHtml(p: ApplicationConfirmationEmailPayload): string {
  const year = new Date().getFullYear();
  const firstName = p.candidateName.trim().split(/\s+/)[0] || p.candidateName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application received — MarineCloudX</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f6f7f9;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table role="presentation" width="560" style="max-width:560px;width:100%;" cellspacing="0" cellpadding="0" border="0">

          <!-- Brand -->
          <tr>
            <td style="padding:0 8px 28px;">
              <p style="margin:0;font-size:15px;font-weight:650;letter-spacing:-0.2px;color:#0f172a;">MarineCloudX</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Careers</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e8eaee;border-radius:16px;overflow:hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

                <tr>
                  <td style="padding:36px 40px 8px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:500;color:#64748b;">Application received</p>
                    <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:650;letter-spacing:-0.4px;color:#0f172a;">
                      Thanks for applying, ${esc(firstName)}.
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 40px 8px;">
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
                      We&rsquo;ve received your application for <strong style="color:#0f172a;">${esc(p.jobTitle)}</strong>.
                      Our hiring team will review it carefully. If there&rsquo;s a fit, we&rsquo;ll be in touch.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 40px 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #eef0f3;border-radius:12px;background:#fafbfc;">
                      <tr>
                        <td style="padding:18px 20px;border-bottom:1px solid #eef0f3;">
                          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Position</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${esc(p.jobTitle)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 20px;border-bottom:1px solid #eef0f3;">
                          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Job ID</p>
                          <p style="margin:0;font-size:14px;font-weight:500;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${esc(p.jobCode)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Application ID</p>
                          <p style="margin:0;font-size:14px;font-weight:500;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${esc(p.applicationCode)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 40px 36px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
                      Please keep your Application ID for your records. You don&rsquo;t need to take any further action right now.
                    </p>
                    <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#334155;">
                      Best regards,<br/>
                      <span style="font-weight:600;color:#0f172a;">MarineCloudX Careers</span>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Quiet footer -->
          <tr>
            <td style="padding:28px 8px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#94a3b8;">
                This is an automated message from a no-reply address.<br/>
                Replies to this email are not monitored.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                <a href="https://marinecloudx.in/careers" style="color:#64748b;text-decoration:none;">Careers</a>
                &nbsp;&middot;&nbsp;
                <a href="https://marinecloudx.in" style="color:#64748b;text-decoration:none;">marinecloudx.in</a>
                &nbsp;&middot;&nbsp;
                &copy; ${year} MarineCloudX
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Client-facing acknowledgement — polished, on-brand. */
function buildClientConfirmationHtml(p: LeadEmailPayload): string {
  const year = new Date().getFullYear();
  const serviceRow = p.serviceName
    ? `<tr><td style="${tdLabel}">Service</td><td style="${tdValue}">${esc(p.serviceName)}</td></tr>`
    : "";
  const timelineRow = p.timeline
    ? `<tr><td style="${tdLabel}">Timeline</td><td style="${tdValue}">${esc(p.timeline)}</td></tr>`
    : "";
  const budgetRow = p.budget
    ? `<tr><td style="${tdLabel}">Budget</td><td style="${tdValue}">${esc(p.budget)}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We've received your enquiry — MarineCloudX</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08);" cellspacing="0" cellpadding="0" border="0">

          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 70%,#533483 100%);padding:48px 48px 40px;text-align:center;">
              <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85;">MarineCloudX</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">We&rsquo;ve got your message.</h1>
              <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.72);line-height:1.6;">Thank you for reaching out to MarineCloudX. We&rsquo;ll review your requirement and get back to you shortly.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Hello, ${esc(p.clientName)}</p>
              <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7;">
                We have received your project enquiry and a member of our team will review it within <strong>1 business day</strong>. In the meantime, here&rsquo;s a summary of what you shared with us:
              </p>

              <!-- Summary card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:32px;">
                <tr><td style="padding:24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${serviceRow}
                    ${timelineRow}
                    ${budgetRow}
                    ${
                      p.requirement
                        ? `<tr>
                            <td colspan="2" style="padding:14px 0 6px 0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;${serviceRow || timelineRow || budgetRow ? "border-top:1px solid #e5e7eb;" : ""}">
                              Requirement
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding:2px 0 6px 0;font-size:13.5px;line-height:1.65;color:#111827;white-space:pre-wrap;word-break:break-word;">
                              ${esc(p.requirement)}
                            </td>
                          </tr>`
                        : ""
                    }
                  </table>
                </td></tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">What happens next</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:36px;">
                ${buildStep("01", "Discovery Call", "We&rsquo;ll schedule a short call to understand your problem and goals in depth.")}
                ${buildStep("02", "Proposal", "We&rsquo;ll outline an approach, rough timeline, and cost range tailored to your situation.")}
                ${buildStep("03", "Kick-off", "Once aligned, we begin with a clear scope, milestones, and a dedicated engineering team.")}
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://marinecloudx.in" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#533483,#0f3460);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;letter-spacing:0.2px;">Visit our website →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                If you have any questions in the meantime, simply reply to this email.<br/>
                <strong style="color:#374151;">— The MarineCloudX Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                MarineCloudX Technologies &bull; <a href="https://marinecloudx.in" style="color:#9ca3af;text-decoration:underline;">marinecloudx.in</a><br/>
                This is an automated confirmation. You are receiving this because you submitted an enquiry on our website.<br/>
                &copy; ${year} MarineCloudX. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Internal company notification — dense, actionable. */
function buildCompanyNotificationHtml(p: LeadEmailPayload): string {
  const year = new Date().getFullYear();
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });
  const serviceLabel = p.serviceName ?? "—";

  const row = (label: string, value?: string) =>
    value
      ? `<tr>
          <td style="${tdLabel}">${label}</td>
          <td style="${tdValue}">${esc(value)}</td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead: ${esc(p.clientName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08);" cellspacing="0" cellpadding="0" border="0">

          <!-- Alert Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1117 0%,#161b22 100%);padding:32px 48px;border-bottom:3px solid #533483;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:#533483;color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:12px;">New Lead</span>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${esc(p.clientName)}</h1>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">${esc(serviceLabel)} &bull; ${now}</p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;background:rgba(83,52,131,0.25);color:#a78bfa;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;border:1px solid rgba(83,52,131,0.5);">OPEN</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding:32px 48px 24px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
                <tr><td style="padding:20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${row("Name", p.clientName)}
                    ${row("Email", p.clientEmail)}
                    ${row("Phone", p.clientPhone)}
                    ${row("Company", p.companyName)}
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Enquiry Details -->
          <tr>
            <td style="padding:0 48px 24px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Enquiry Details</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
                <tr><td style="padding:20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${row("Service", p.serviceName)}
                    ${row("Budget", p.budget)}
                    ${row("Timeline", p.timeline)}
                    ${row("Lead ID", p.leadId)}
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>

          ${
            p.requirement
              ? `<!-- Requirement -->
          <tr>
            <td style="padding:0 48px 32px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Requirement</p>
              <div style="background:#f0f4ff;border-radius:12px;border:1px solid #c7d2fe;padding:20px;">
                <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.75;white-space:pre-wrap;">${esc(p.requirement)}</p>
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- CTA row -->
          <tr>
            <td style="padding:0 48px 40px;text-align:center;">
              <a href="https://admin.marinecloudx.in" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#533483,#0f3460);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:50px;">Open Admin CRM →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                MarineCloudX CRM &bull; Automated lead notification<br/>
                &copy; ${year} MarineCloudX Technologies. Internal use only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────── template utilities

/** Reusable table cell styles. */
const tdLabel = `padding:7px 12px 7px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;vertical-align:top;width:130px;`;
const tdValue = `padding:7px 0;font-size:13px;color:#111827;vertical-align:top;word-break:break-word;`;

/** Escape HTML entities to prevent injection in email content. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Single numbered "What happens next" step row. */
function buildStep(num: string, title: string, desc: string): string {
  return `<tr>
    <td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="width:40px;vertical-align:top;padding-top:2px;">
            <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#533483,#0f3460);color:#fff;font-size:11px;font-weight:700;line-height:28px;text-align:center;">${num}</span>
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p>
            <p style="margin:3px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/** Applicant-facing Interview Invitation with dedicated Calendly-style link. */
function buildInterviewInvitationHtml(p: InterviewInvitationEmailPayload): string {
  const firstName = p.candidateName.trim().split(/\s+/)[0] || p.candidateName;
  const year = new Date().getFullYear();
  // Ensure no raw localhost URL is visible in candidate emails
  const displayUrl = p.schedulingUrl.replace(/^https?:\/\/localhost(:\d+)?/, "https://marinecloudx.in");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>You’ve Been Shortlisted | ${esc(p.jobTitle)} | MarineCloudX</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px !important;
      }
      .email-card {
        padding: 24px 20px !important;
        border-radius: 12px !important;
      }
      .btn-container {
        width: 100% !important;
      }
      .btn-action {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      .details-row td {
        display: block !important;
        width: 100% !important;
        padding-right: 0 !important;
      }
      .details-row td.label {
        padding-bottom: 2px !important;
      }
      .details-row td.value {
        padding-top: 0 !important;
        padding-bottom: 12px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a;line-height:1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" class="email-wrapper" style="padding:40px 16px;">
        <table role="presentation" width="580" style="max-width:580px;width:100%;text-align:left;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Top Brand & Application Update Header -->
          <tr>
            <td style="padding:0 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:750;letter-spacing:-0.4px;color:#0f172a;">
                      MarineCloud<span style="color:#0284c7;">X</span>
                    </span>
                    <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#475569;background-color:#f1f5f9;border-radius:4px;vertical-align:middle;">
                      Careers
                    </span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:0.3px;color:#0369a1;background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:9999px;">
                      Application Update
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Container -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
              
              <!-- Greeting / Headline -->
              <h1 style="margin:0 0 16px;font-size:23px;font-weight:700;line-height:1.3;letter-spacing:-0.4px;color:#0f172a;">
                Congratulations, ${esc(firstName)}!
              </h1>

              <!-- Message -->
              <p style="margin:0 0 12px;font-size:14.5px;line-height:1.65;color:#334155;">
                Thank you for your interest in joining MarineCloudX.
              </p>
              <p style="margin:0 0 12px;font-size:14.5px;line-height:1.65;color:#334155;">
                We are pleased to inform you that your application for the <strong style="color:#0f172a;">${esc(p.jobTitle)}</strong> position has been shortlisted for the next stage of our selection process.
              </p>
              <p style="margin:0 0 24px;font-size:14.5px;line-height:1.65;color:#334155;">
                Your application has successfully progressed to the next round, and we would like to invite you to schedule your interview.
              </p>

              <!-- Interview Details Box -->
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin:0 0 28px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">
                  Interview Details
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13.5px;">
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;width:130px;vertical-align:top;">Position</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:600;vertical-align:top;">${esc(p.jobTitle)}</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Selection Round</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:600;vertical-align:top;">${esc(p.roundTitle)}</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Interview Format</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:500;vertical-align:top;">Online</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Duration</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:500;vertical-align:top;">${p.durationMinutes} Minutes</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#94a3b8;font-weight:500;vertical-align:top;">Application ID</td>
                    <td class="value" style="padding:6px 0;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;vertical-align:top;">${esc(p.applicationCode)}</td>
                  </tr>
                </table>
              </div>

              <!-- Schedule Your Interview Section -->
              <p style="margin:0 0 4px;font-size:15px;font-weight:650;color:#0f172a;">
                Schedule Your Interview
              </p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
                Please use the button below to select a convenient interview slot:
              </p>

              <!-- One strong Schedule Interview button -->
              <table role="presentation" class="btn-container" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#0f172a;">
                    <a href="${esc(p.schedulingUrl)}" target="_blank" rel="noopener noreferrer" class="btn-action" style="display:inline-block;padding:13px 32px;font-size:14.5px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;background-color:#0f172a;">
                      Schedule Interview &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link without raw localhost -->
              <div style="margin:0 0 24px;">
                <p style="margin:0 0 6px;font-size:12.5px;color:#64748b;line-height:1.5;">
                  If the button doesn&#39;t work, you can use the following link:
                </p>
                <p style="margin:0;font-size:12.5px;line-height:1.5;word-break:break-all;">
                  <a href="${esc(p.schedulingUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0284c7;text-decoration:underline;font-weight:500;">
                    ${esc(displayUrl)}
                  </a>
                </p>
              </div>

              <!-- Availability & Closing Note -->
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#475569;">
                Please select your preferred slot at your earliest convenience. Interview slots are subject to availability.
              </p>
              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#475569;">
                We look forward to speaking with you and learning more about your skills, experience, and interest in MarineCloudX.
              </p>

              <!-- Professional Sign-off -->
              <div style="border-top:1px solid #f1f5f9;padding-top:20px;margin-top:8px;">
                <p style="margin:0 0 4px;font-size:14px;color:#475569;">Best regards,</p>
                <p style="margin:0 0 2px;font-size:14.5px;font-weight:650;color:#0f172a;">MarineCloudX Hiring Team</p>
                <p style="margin:0 0 8px;font-size:12.5px;color:#64748b;">Technology Solutions &amp; Engineering Partner</p>
                <p style="margin:0;font-size:12.5px;color:#64748b;">
                  <a href="mailto:careers@marinecloudx.in" style="color:#0284c7;text-decoration:none;">careers@marinecloudx.in</a> &bull; <a href="https://marinecloudx.in" style="color:#0284c7;text-decoration:none;">marinecloudx.in</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Subtle Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.6;">
                This recruitment communication was sent to ${esc(p.candidateEmail)} regarding application ${esc(p.applicationCode)}.<br/>
                MarineCloudX Technologies &bull; &copy; ${year} MarineCloudX. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Applicant-facing Interview Confirmation. */
function buildInterviewConfirmationHtml(p: InterviewConfirmationEmailPayload): string {
  const firstName = p.candidateName.trim().split(/\s+/)[0] || p.candidateName;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Interview Confirmed | ${esc(p.jobTitle)} | MarineCloudX</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px !important;
      }
      .email-card {
        padding: 24px 20px !important;
        border-radius: 12px !important;
      }
      .btn-container {
        width: 100% !important;
      }
      .btn-action {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      .details-row td {
        display: block !important;
        width: 100% !important;
        padding-right: 0 !important;
      }
      .details-row td.label {
        padding-bottom: 2px !important;
      }
      .details-row td.value {
        padding-top: 0 !important;
        padding-bottom: 12px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a;line-height:1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" class="email-wrapper" style="padding:40px 16px;">
        <table role="presentation" width="580" style="max-width:580px;width:100%;text-align:left;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Top Brand Header -->
          <tr>
            <td style="padding:0 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:750;letter-spacing:-0.4px;color:#0f172a;">
                      MarineCloud<span style="color:#0284c7;">X</span>
                    </span>
                    <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#475569;background-color:#f1f5f9;border-radius:4px;vertical-align:middle;">
                      Careers
                    </span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:0.3px;color:#047857;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:9999px;">
                      &#10003; Interview Scheduled
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Container -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
              
              <h1 style="margin:0 0 16px;font-size:23px;font-weight:700;line-height:1.3;letter-spacing:-0.4px;color:#0f172a;">
                Interview Confirmed, ${esc(firstName)}!
              </h1>

              <p style="margin:0 0 24px;font-size:14.5px;line-height:1.65;color:#334155;">
                Your interview for <strong style="color:#0f172a;">${esc(p.jobTitle)}</strong> has been confirmed. Below are your scheduled appointment details:
              </p>

              <!-- Interview Details Box -->
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin:0 0 28px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">
                  Appointment Details
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13.5px;">
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;width:130px;vertical-align:top;">Position</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:600;vertical-align:top;">${esc(p.jobTitle)}</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Selection Round</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:600;vertical-align:top;">${esc(p.roundTitle)}</td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Date &amp; Time</td>
                    <td class="value" style="padding:6px 0;color:#0284c7;font-weight:650;vertical-align:top;">
                      ${esc(p.formattedDate)} &bull; ${esc(p.formattedTime)}
                      <span style="font-size:12px;color:#64748b;font-weight:normal;">(${esc(p.timezone)})</span>
                    </td>
                  </tr>
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Duration &amp; Mode</td>
                    <td class="value" style="padding:6px 0;color:#0f172a;font-weight:500;vertical-align:top;">${p.durationMinutes} Minutes &bull; Online Video Call</td>
                  </tr>
                  ${
                    p.meetingLink
                      ? `<tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#64748b;font-weight:500;vertical-align:top;">Google Meet</td>
                    <td class="value" style="padding:6px 0;vertical-align:top;">
                      <a href="${esc(p.meetingLink)}" target="_blank" rel="noopener noreferrer" style="color:#0284c7;text-decoration:underline;font-weight:500;word-break:break-all;">${esc(p.meetingLink)}</a>
                    </td>
                  </tr>`
                      : ""
                  }
                  <tr class="details-row">
                    <td class="label" style="padding:6px 12px 6px 0;color:#94a3b8;font-weight:500;vertical-align:top;">Application ID</td>
                    <td class="value" style="padding:6px 0;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;vertical-align:top;">${esc(p.applicationCode)}</td>
                  </tr>
                </table>
              </div>

              ${
                p.meetingLink
                  ? `<!-- Join Google Meet CTA -->
              <table role="presentation" class="btn-container" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#0f172a;">
                    <a href="${esc(p.meetingLink)}" target="_blank" rel="noopener noreferrer" class="btn-action" style="display:inline-block;padding:13px 32px;font-size:14.5px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;background-color:#0f172a;">
                      &#127916; Join Google Meet &rarr;
                    </a>
                  </td>
                </tr>
              </table>`
                  : ""
              }

              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                A calendar invitation (.ics) is attached to this email. Please ensure you are in a quiet environment with a reliable internet connection at the scheduled time.
              </p>

              <!-- Professional Sign-off -->
              <div style="border-top:1px solid #f1f5f9;padding-top:20px;margin-top:8px;">
                <p style="margin:0 0 4px;font-size:14px;color:#475569;">Best regards,</p>
                <p style="margin:0 0 2px;font-size:14.5px;font-weight:650;color:#0f172a;">MarineCloudX Hiring Team</p>
                <p style="margin:0 0 8px;font-size:12.5px;color:#64748b;">Technology Solutions &amp; Engineering Partner</p>
                <p style="margin:0;font-size:12.5px;color:#64748b;">
                  <a href="mailto:careers@marinecloudx.in" style="color:#0284c7;text-decoration:none;">careers@marinecloudx.in</a> &bull; <a href="https://marinecloudx.in" style="color:#0284c7;text-decoration:none;">marinecloudx.in</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Subtle Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.6;">
                This recruitment notification was sent to ${esc(p.candidateEmail)} regarding application ${esc(p.applicationCode)}.<br/>
                MarineCloudX Technologies &bull; &copy; ${year} MarineCloudX. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Hiring team alert email when a candidate schedules an interview. */
function buildInterviewAdminAlertHtml(p: InterviewAdminNotificationPayload): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Candidate Interview Booked</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f6f7f9;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="560" style="max-width:560px;width:100%;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding:0 8px 24px;">
              <p style="margin:0;font-size:15px;font-weight:650;letter-spacing:-0.2px;color:#0f172a;">MarineCloudX Hiring Alert</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e8eaee;border-radius:16px;padding:32px 36px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:650;color:#0f172a;">
                Candidate Booked an Interview
              </h2>
              <p style="margin:0 0 20px;font-size:14px;color:#475569;">
                <strong>${esc(p.candidateName)}</strong> has scheduled their <strong>${esc(p.roundTitle)}</strong> for <strong>${esc(p.jobTitle)}</strong>.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #eef0f3;border-radius:12px;background:#fafbfc;margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;color:#64748b;width:140px;">Candidate</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;font-weight:600;color:#0f172a;">${esc(p.candidateName)} (${esc(p.candidateEmail)})</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;color:#64748b;">Scheduled Time</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;font-weight:600;color:#0d9488;">${esc(p.formattedDate)} at ${esc(p.formattedTime)} (${esc(p.timezone)})</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;color:#64748b;">Round</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;font-weight:500;color:#0f172a;">${esc(p.roundTitle)} (${p.durationMinutes} min)</td>
                </tr>
                ${
                  p.meetingLink
                    ? `<tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;color:#64748b;">Google Meet</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef0f3;font-size:13px;font-weight:600;"><a href="${esc(p.meetingLink)}" target="_blank" style="color:#0d9488;text-decoration:none;">${esc(p.meetingLink)}</a></td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;">Application ID</td>
                  <td style="padding:12px 16px;font-size:13px;font-family:monospace;color:#0f172a;">${esc(p.applicationCode)}</td>
                </tr>
              </table>
              <div style="text-align:center;">
                <a href="https://admin.marinecloudx.in/careers/applications" style="display:inline-block;padding:12px 28px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">
                  Open Admin Dashboard &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

