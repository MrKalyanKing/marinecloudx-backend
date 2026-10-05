import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { CareersService } from "../src/modules/careers/careers.service";
import {
  JobApplicationEntity,
  JobEntity,
  InterviewSlotEntity,
  InterviewBookingEntity,
  UserEntity,
} from "../src/entities";
import { ApplicationSource, ApplicationStatus, JobStatus, EmploymentType, Role } from "../src/contracts";
import { newId } from "../src/common";
import { DataSource } from "typeorm";

async function run() {
  console.log("=== Starting Calendly-Style Candidate Interview Scheduling E2E Test ===");

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn"] });
  const careersService = app.get(CareersService);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(UserEntity);
  let adminUser = await userRepo.findOne({ where: {} });
  if (!adminUser) {
    adminUser = userRepo.create({
      id: newId(),
      email: "admin.test@marinecloudx.local",
      displayName: "Test Admin",
      role: Role.SUPER_ADMIN,
    });
    await userRepo.save(adminUser);
  }
  const adminUserId = adminUser.id;
  console.log(`✓ Using admin user ID for audit log: ${adminUserId} (${adminUser.email})`);

  const jobRepo = dataSource.getRepository(JobEntity);
  const appRepo = dataSource.getRepository(JobApplicationEntity);
  const slotRepo = dataSource.getRepository(InterviewSlotEntity);
  const bookingRepo = dataSource.getRepository(InterviewBookingEntity);

  // 1. Create or ensure test Job
  let testJob = await jobRepo.findOne({ where: { slug: "e2e-marketing-intern" } });
  if (!testJob) {
    testJob = jobRepo.create({
      id: newId(),
      jobCode: "MCX-2026-TEST",
      title: "Digital Marketing Intern",
      slug: "e2e-marketing-intern",
      description: "Test internship position for scheduling verification",
      employmentType: EmploymentType.INTERNSHIP,
      status: JobStatus.PUBLISHED,
      department: "Marketing",
      location: "Bengaluru, India (Remote)",
    });
    await jobRepo.save(testJob);
    console.log(`✓ Created test job: ${testJob.title} (${testJob.jobCode})`);
  } else {
    console.log(`✓ Found existing test job: ${testJob.title} (${testJob.jobCode})`);
  }

  // 2. Add Candidate via addCandidate (External / LinkedIn source)
  console.log("\n--- Step 1: Admin Adds External / LinkedIn Candidate Without Website Form ---");
  const linkedInEmail = `kalyan.linkedin.${Date.now()}@marinecloudx.local`;
  const createdCandidate = await careersService.addCandidate(
    {
      candidateName: "Kalyan Badhavath (LinkedIn)",
      email: linkedInEmail,
      phone: "+91 9455904201",
      jobId: testJob.id,
      applicationSource: ApplicationSource.LINKEDIN,
      status: ApplicationStatus.SHORTLISTED,
      notes: "Sourced from 26 LinkedIn applicants for Digital Marketing Intern role.",
    },
    adminUserId,
  );
  console.log(
    `✓ LinkedIn Candidate added: ID: ${createdCandidate.id}, Code: ${createdCandidate.applicationCode}, Source: ${createdCandidate.applicationSource}`,
  );
  if (createdCandidate.applicationSource !== ApplicationSource.LINKEDIN) {
    throw new Error("Candidate source should be LINKEDIN!");
  }

  const testApp = await appRepo.findOneOrFail({ where: { id: createdCandidate.id } });

  // 3. Admin creates Interview Round
  console.log("\n--- Step 2: Admin Creates Interview Round ---");
  const round = await careersService.createInterviewRound(
    testApp.id,
    {
      roundNumber: 1,
      title: "Round 1: Skills Assessment",
      durationMinutes: 30,
      notes: "Evaluate SEO, writing samples, and campaign management fundamentals.",
    },
    adminUserId,
  );
  console.log(`✓ Interview round created: ${round.title} (ID: ${round.id}, Status: ${round.status})`);

  // 4. Admin previews slots across a 7-day range with multiple daily windows
  console.log("\n--- Step 3: Date Range Availability & Slot Preview ---");
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split("T")[0];

  const startDateObj = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const endDateObj = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

  const preview = await careersService.previewSlots(round.id, {
    startDate: formatYMD(startDateObj),
    endDate: formatYMD(endDateObj),
    daysOfWeek: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    timeWindows: [
      { startTime: "10:00", endTime: "12:00" }, // 4 thirty-minute slots
      { startTime: "14:00", endTime: "16:00" }, // 4 thirty-minute slots
    ],
    durationMinutes: 30,
    bufferMinutes: 0,
    timezone: "Asia/Kolkata",
  });
  console.log(`✓ Slot preview generated: ${preview.totalSlots} total slots across ${preview.daysCount} active days.`);

  // 5. Admin generates slots (idempotent generation)
  console.log("\n--- Step 4: Slot Generation & Idempotency Check ---");
  const genResult = await careersService.generateSlots(
    round.id,
    {
      startDate: formatYMD(startDateObj),
      endDate: formatYMD(endDateObj),
      daysOfWeek: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      timeWindows: [
        { startTime: "10:00", endTime: "12:00" },
        { startTime: "14:00", endTime: "16:00" },
      ],
      durationMinutes: 30,
      bufferMinutes: 0,
      timezone: "Asia/Kolkata",
    },
    adminUserId,
  );
  console.log(`✓ Generated ${genResult.generatedCount} slots.`);

  // Verify slots in database
  const createdSlots = await slotRepo.find({
    where: { interviewRoundId: round.id },
    order: { startAt: "ASC" },
  });
  console.log(`✓ Verified in DB: ${createdSlots.length} slots present for round ${round.id}`);
  if (createdSlots.length === 0) throw new Error("Slots were not generated!");

  // 6. Test Blocking and Unblocking an individual slot
  console.log("\n--- Step 5: Individual Slot Management (Block / Unblock) ---");
  const slotToBlock = createdSlots[createdSlots.length - 1];
  await careersService.blockSlot(slotToBlock.id, adminUserId);
  let slotCheck = await slotRepo.findOne({ where: { id: slotToBlock.id } });
  console.log(`✓ Slot ${slotToBlock.id} status after block: ${slotCheck?.status}`);
  if (slotCheck?.status !== "BLOCKED") throw new Error("Slot failed to block!");

  await careersService.unblockSlot(slotToBlock.id, adminUserId);
  slotCheck = await slotRepo.findOne({ where: { id: slotToBlock.id } });
  console.log(`✓ Slot ${slotToBlock.id} status after unblock: ${slotCheck?.status}`);
  if (slotCheck?.status !== "AVAILABLE") throw new Error("Slot failed to unblock!");

  // 7. Generate secure candidate scheduling token
  console.log("\n--- Step 6: Generate Secure Scheduling Token & Test Revocation/Regeneration ---");
  const tokenRes = await careersService.generateSchedulingToken(round.id, adminUserId);
  console.log(`✓ Secure token generated: ${tokenRes.rawToken.slice(0, 16)}...`);
  console.log(`✓ Dedicated scheduling URL: ${tokenRes.schedulingUrl}`);

  // Test Revocation
  await careersService.revokeSchedulingToken(round.id, adminUserId);
  console.log("✓ Scheduling token revoked.");
  let revokedRejected = false;
  try {
    await careersService.getPublicScheduleDetails(tokenRes.rawToken);
  } catch (err: any) {
    revokedRejected = true;
    console.log(`✓ Revoked token rejected as expected: "${err.message}"`);
  }
  if (!revokedRejected) throw new Error("Revoked token should have been rejected!");

  // Test Regeneration
  const regenRes = await careersService.regenerateSchedulingToken(round.id, adminUserId);
  console.log(`✓ Regenerated token: ${regenRes.rawToken.slice(0, 16)}...`);
  console.log(`✓ Regenerated URL: ${regenRes.schedulingUrl}`);

  // 8. Candidate opens scheduling link
  console.log("\n--- Step 7: Candidate Opens Dedicated Link ---");
  const candidateDetails = await careersService.getPublicScheduleDetails(regenRes.rawToken);
  console.log(
    `✓ Candidate page resolved: Position: "${candidateDetails.job.title}", Candidate: "${candidateDetails.candidate.name}", Application: "${candidateDetails.candidate.applicationCode}"`,
  );
  console.log(`✓ Available dates shown to candidate: ${candidateDetails.availableDates.join(", ")}`);

  if (candidateDetails.availableDates.length === 0) throw new Error("No available dates returned to candidate!");

  // 9. Candidate selects a date and fetches available times
  console.log("\n--- Step 8: Candidate Selects Date and Views Times ---");
  const targetDate = candidateDetails.availableDates[0];
  const dateSlots = await careersService.getPublicAvailableSlots(regenRes.rawToken, targetDate);
  console.log(`✓ Available times on ${targetDate}: ${dateSlots.map((s) => s.formattedTime).join(", ")}`);
  if (dateSlots.length === 0) throw new Error("No slots found on available date!");

  // 10. Concurrency Protection / Race Condition Test & RFC 5545 Calendar Verification
  console.log("\n--- Step 9: Race Condition Test & RFC 5545 Calendar Integration ---");
  const targetSlot = dateSlots[0];
  console.log(`Simulating Candidate A and Candidate B confirming slot ${targetSlot.formattedTime} concurrently...`);

  const bookCandidateA = careersService.bookSlot(regenRes.rawToken, {
    slotId: targetSlot.id,
    notes: "Candidate A confirmed interview",
    timezone: "Asia/Kolkata",
  });

  let candidateBError: string | null = null;
  const bookCandidateB = (async () => {
    try {
      await careersService.bookSlot(regenRes.rawToken, {
        slotId: targetSlot.id,
        notes: "Candidate B confirmed interview",
        timezone: "Asia/Kolkata",
      });
    } catch (err: any) {
      candidateBError = err.message;
    }
  })();

  const [resultA] = await Promise.all([bookCandidateA, bookCandidateB]);
  console.log(`✓ Candidate A booking succeeded! Booking ID: ${resultA.bookingId}, Time: ${resultA.formattedTime}`);
  console.log(`✓ Candidate B booking correctly rejected with error: "${candidateBError}"`);

  if (!candidateBError?.includes("no longer available") && !candidateBError?.includes("already been used")) {
    throw new Error(`Double booking prevention failed! Error was: ${candidateBError}`);
  }

  // Verify RFC 5545 ICS content
  console.log("\n--- Step 10: Verify RFC 5545 ICS and Calendar Links ---");
  if (!resultA.icsContent) throw new Error("Missing icsContent in booking response!");
  if (!resultA.googleCalendarUrl) throw new Error("Missing googleCalendarUrl in booking response!");

  const expectedUid = `UID:booking-${resultA.bookingId}@marinecloudx.in`;
  console.log(`✓ Checking UID format in ICS: contains "${expectedUid}"`);
  if (!resultA.icsContent.includes(expectedUid)) {
    throw new Error(`ICS missing expected stable UID: ${expectedUid}`);
  }
  if (!resultA.icsContent.includes("STATUS:CONFIRMED")) {
    throw new Error("ICS missing STATUS:CONFIRMED");
  }
  if (!resultA.googleCalendarUrl.includes("calendar.google.com")) {
    throw new Error("Invalid Google Calendar URL");
  }
  console.log(`✓ Valid Google Calendar URL: ${resultA.googleCalendarUrl.slice(0, 60)}...`);

  // 11. Verify Database State
  console.log("\n--- Step 11: Verify Database State ---");
  const bookedSlotInDb = await slotRepo.findOne({ where: { id: targetSlot.id } });
  console.log(`✓ Slot status in DB: ${bookedSlotInDb?.status} (Expected: BOOKED)`);
  if (bookedSlotInDb?.status !== "BOOKED") throw new Error("Slot is not marked BOOKED in DB!");

  const bookingInDb = await bookingRepo.findOne({ where: { interviewSlotId: targetSlot.id } });
  console.log(`✓ Booking in DB: ID ${bookingInDb?.id}, Status: ${bookingInDb?.status}`);
  if (!bookingInDb || bookingInDb.status !== "SCHEDULED") throw new Error("Booking record missing or invalid!");

  const appInDb = await appRepo.findOne({ where: { id: testApp.id } });
  console.log(`✓ Application pipeline status in DB: ${appInDb?.status} (Expected: INTERVIEW)`);
  if (appInDb?.status !== ApplicationStatus.INTERVIEW) throw new Error("Application status not updated to INTERVIEW!");

  // 12. Candidate re-opens link after booking
  console.log("\n--- Step 12: Candidate Re-opens Link After Booking ---");
  const recheckDetails = await careersService.getPublicScheduleDetails(regenRes.rawToken);
  console.log(`✓ Already booked flag: ${recheckDetails.alreadyBooked}`);
  console.log(
    `✓ Existing booking displayed: Date: ${recheckDetails.booking?.date}, Time: ${recheckDetails.booking?.time}`,
  );
  if (!recheckDetails.alreadyBooked) throw new Error("Candidate re-open should show already booked!");

  // 13. Admin views booking in candidate detail
  console.log("\n--- Step 13: Admin Views Application Detail ---");
  const adminViewRounds = await careersService.getInterviewRoundsForApplication(testApp.id);
  const activeRound = adminViewRounds.find((r) => r.id === round.id);
  console.log(`✓ Admin view: Round status = ${activeRound?.status}`);
  console.log(
    `✓ Admin view: Total slots = ${activeRound?.stats.totalSlots}, Available = ${activeRound?.stats.availableSlots}, Booked = ${activeRound?.stats.bookedSlots}`,
  );
  console.log(`✓ Admin view: Latest booking ID = ${activeRound?.latestBooking?.id}`);

  // 14. Admin Reschedules Booking
  console.log("\n--- Step 14: Admin Reschedules Booking ---");
  const nextAvailableSlot = dateSlots[1];
  console.log(`Rescheduling to ${nextAvailableSlot.formattedTime}...`);
  const rescheduledBooking = await careersService.rescheduleBooking(
    bookingInDb.id,
    { newSlotId: nextAvailableSlot.id, reason: "Candidate requested afternoon slot" },
    adminUserId,
  );
  console.log(`✓ Reschedule successful! New Booking ID: ${rescheduledBooking.id}`);

  const oldSlotCheck = await slotRepo.findOne({ where: { id: targetSlot.id } });
  const newSlotCheck = await slotRepo.findOne({ where: { id: nextAvailableSlot.id } });
  console.log(`✓ Old slot status restored: ${oldSlotCheck?.status} (Expected: AVAILABLE)`);
  console.log(`✓ New slot status updated: ${newSlotCheck?.status} (Expected: BOOKED)`);
  if (oldSlotCheck?.status !== "AVAILABLE" || newSlotCheck?.status !== "BOOKED") {
    throw new Error("Rescheduling slot status updates failed!");
  }

  // 15. Admin Cancels Booking
  console.log("\n--- Step 15: Admin Cancels Booking ---");
  await careersService.cancelBooking(
    rescheduledBooking.id,
    { reason: "Candidate withdrew application" },
    adminUserId,
  );
  const cancelledBookingCheck = await bookingRepo.findOne({ where: { id: rescheduledBooking.id } });
  const cancelledSlotCheck = await slotRepo.findOne({ where: { id: nextAvailableSlot.id } });
  console.log(`✓ Booking status: ${cancelledBookingCheck?.status} (Expected: CANCELLED)`);
  console.log(`✓ Slot status: ${cancelledSlotCheck?.status} (Expected: AVAILABLE)`);
  if (cancelledBookingCheck?.status !== "CANCELLED" || cancelledSlotCheck?.status !== "AVAILABLE") {
    throw new Error("Cancellation failed!");
  }

  console.log("\n🎉 ALL 15 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n");

  await app.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("\n❌ Test Failed with Error:", err);
  process.exit(1);
});
