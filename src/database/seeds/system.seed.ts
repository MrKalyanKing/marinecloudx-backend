import type { DataSource } from "typeorm";

import { LeadSourceEntity, PipelineStageEntity, RoleEntity } from "../../entities";

/**
 * System configuration seed — ported verbatim from the legacy `prisma/seed.ts`.
 *
 * Seeds ONLY what the CRM needs to function: roles, pipeline stages, lead
 * sources. Every row is `isSystem: true` so the admin UI protects it from
 * deletion. No business data — no users, contacts, leads, projects.
 *
 * Idempotent: upsert by `slug`, so re-running updates rather than duplicating.
 * The production database already contains these rows (seeded via Prisma); this
 * keeps them in sync and lets a fresh database be brought up with TypeORM alone.
 */

/** Lower level = more authority. */
const ROLES = [
  { name: "Super Admin", slug: "super-admin", level: 0, description: "Full access to every area of the system." },
  { name: "Admin", slug: "admin", level: 10, description: "Manages the CMS and the CRM." },
  { name: "Manager", slug: "manager", level: 20, description: "Oversees the sales pipeline and the team's workload." },
  { name: "Sales", slug: "sales", level: 30, description: "Works assigned leads, tasks and follow-ups." },
  { name: "Content Manager", slug: "content-manager", level: 30, description: "Manages website content only." },
];

const PIPELINE_STAGES = [
  { name: "New", slug: "new", order: 10 },
  { name: "Contacted", slug: "contacted", order: 20 },
  { name: "Qualified", slug: "qualified", order: 30 },
  { name: "Consultation", slug: "consultation", order: 40 },
  { name: "Proposal", slug: "proposal", order: 50 },
  { name: "Negotiation", slug: "negotiation", order: 60 },
  { name: "Won", slug: "won", order: 70, isWon: true },
  { name: "Lost", slug: "lost", order: 80, isLost: true },
];

const LEAD_SOURCES = [
  { name: "Website Form", slug: "website-form", order: 10 },
  { name: "Start a Project", slug: "start-project", order: 20 },
  { name: "AI Chatbot", slug: "ai-chatbot", order: 30 },
  { name: "WhatsApp", slug: "whatsapp", order: 40 },
  { name: "Referral", slug: "referral", order: 50 },
  { name: "Campaign", slug: "campaign", order: 60 },
  { name: "Service Page", slug: "service-page", order: 70 },
  { name: "Portfolio", slug: "portfolio", order: 80 },
  { name: "Other", slug: "other", order: 90 },
];

export async function seedSystem(dataSource: DataSource): Promise<void> {
  const roles = dataSource.getRepository(RoleEntity);
  for (const r of ROLES) {
    const existing = await roles.findOne({ where: { slug: r.slug } });
    if (existing) {
      await roles.update(existing.id, { name: r.name, level: r.level, description: r.description });
    } else {
      await roles.save(roles.create({ ...r, isSystem: true }));
    }
  }
  console.log(`seed: ${ROLES.length} system roles`);

  const stages = dataSource.getRepository(PipelineStageEntity);
  for (const s of PIPELINE_STAGES) {
    const existing = await stages.findOne({ where: { slug: s.slug } });
    if (existing) {
      await stages.update(existing.id, { name: s.name, order: s.order });
    } else {
      await stages.save(stages.create({ ...s, isSystem: true }));
    }
  }
  console.log(`seed: ${PIPELINE_STAGES.length} pipeline stages`);

  const sources = dataSource.getRepository(LeadSourceEntity);
  for (const src of LEAD_SOURCES) {
    const existing = await sources.findOne({ where: { slug: src.slug } });
    if (existing) {
      await sources.update(existing.id, { name: src.name, order: src.order });
    } else {
      await sources.save(sources.create({ ...src, isSystem: true }));
    }
  }
  console.log(`seed: ${LEAD_SOURCES.length} lead sources`);
}
