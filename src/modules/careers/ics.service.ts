import { Injectable } from "@nestjs/common";

export interface CalendarEventPayload {
  bookingId: string;
  roundTitle: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  jobCode?: string;
  applicationCode?: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  meetingLink?: string | null;
  notes?: string | null;
  sequence?: number;
  status?: "CONFIRMED" | "CANCELLED";
}

@Injectable()
export class IcsService {
  /**
   * Generates a stable unique UID for the interview booking event.
   * RFC 5545 calendar clients use this UID to link updates, reschedules, and cancellations.
   */
  getEventUid(bookingId: string): string {
    return `booking-${bookingId}@marinecloudx.in`;
  }

  /**
   * Formats a Date object to RFC 5545 UTC compact format: YYYYMMDDTHHMMSSZ.
   * UTC timestamps ensure absolute time preservation across all calendar clients (Google, Apple, Outlook).
   */
  formatUtcIso(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = date.getUTCFullYear();
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const h = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const s = pad(date.getUTCSeconds());
    return `${y}${m}${d}T${h}${min}${s}Z`;
  }

  /**
   * Generates an RFC 5545 compliant .ics string for confirmed or rescheduled interview bookings.
   */
  generateICS(payload: CalendarEventPayload): string {
    const uid = this.getEventUid(payload.bookingId);
    const dtstamp = this.formatUtcIso(new Date());
    const dtstart = this.formatUtcIso(new Date(payload.startAt));
    const dtend = this.formatUtcIso(new Date(payload.endAt));
    const sequence = payload.sequence ?? 0;
    const isCancelled = payload.status === "CANCELLED";
    const status = isCancelled ? "CANCELLED" : "CONFIRMED";
    const method = isCancelled ? "CANCEL" : "REQUEST";

    const summary = `${payload.roundTitle} - ${payload.candidateName} (${payload.jobTitle})`;

    const descriptionLines = [
      `MarineCloudX Interview Assessment`,
      `Position: ${payload.jobTitle}${payload.jobCode ? ` (${payload.jobCode})` : ""}`,
      `Candidate: ${payload.candidateName}`,
      payload.applicationCode ? `Application Code: ${payload.applicationCode}` : "",
      `Round: ${payload.roundTitle}`,
      payload.meetingLink ? `Meeting Link: ${payload.meetingLink}` : "Meeting link will be shared via email prior to the interview.",
      payload.notes ? `Candidate Notes: ${payload.notes}` : "",
      `Timezone: ${payload.timezone}`,
    ]
      .filter(Boolean)
      .join("\\n");

    const location = payload.meetingLink || "Online Interview (MarineCloudX)";

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MarineCloudX//Careers Interview Scheduling//EN",
      "CALSCALE:GREGORIAN",
      `METHOD:${method}`,
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `SEQUENCE:${sequence}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${descriptionLines}`,
      `LOCATION:${location}`,
      payload.meetingLink ? `URL:${payload.meetingLink}` : "",
      `STATUS:${status}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean);

    return icsLines.join("\r\n");
  }

  /**
   * Generates a cancellation .ics event using the same stable UID.
   * Calendar clients (Google, Apple, Outlook) will automatically mark the existing event as cancelled.
   */
  generateCancellationICS(payload: CalendarEventPayload): string {
    return this.generateICS({
      ...payload,
      sequence: (payload.sequence ?? 0) + 1,
      status: "CANCELLED",
    });
  }

  /**
   * Generates a pre-filled Google Calendar web event URL for one-click browser integration.
   */
  generateGoogleCalendarUrl(payload: CalendarEventPayload): string {
    const text = encodeURIComponent(`${payload.roundTitle} - ${payload.candidateName} (${payload.jobTitle})`);
    const dtstart = this.formatUtcIso(new Date(payload.startAt));
    const dtend = this.formatUtcIso(new Date(payload.endAt));
    const dates = `${dtstart}/${dtend}`;

    const details = encodeURIComponent(
      [
        `MarineCloudX Interview Assessment`,
        `Position: ${payload.jobTitle}`,
        `Candidate: ${payload.candidateName}`,
        payload.applicationCode ? `Application: ${payload.applicationCode}` : "",
        `Round: ${payload.roundTitle}`,
        payload.meetingLink ? `Meeting Link: ${payload.meetingLink}` : "",
        `Scheduled Timezone: ${payload.timezone}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    const location = encodeURIComponent(payload.meetingLink || "Online Interview");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  }
}
