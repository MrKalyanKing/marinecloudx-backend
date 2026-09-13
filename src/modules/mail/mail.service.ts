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
