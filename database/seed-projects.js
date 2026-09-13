const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'coudx',
});

const INDUSTRIES = [
  {
    name: "Interiors",
    slug: "interiors-section",
    description: "Architecture, residential interiors, commercial spaces, and turnkey studio solutions.",
    order: 1,
  },
  {
    name: "Education & EdTech",
    slug: "education-edtech",
    description: "Academic institutions, multi-branch school networks, e-learning platforms, and student CRMs.",
    order: 2,
  },
  {
    name: "Agritech & Fresh Produce",
    slug: "agritech-fresh-produce",
    description: "B2B agriculture supply chains, cold-chain logistics, mandi distribution, and farm-to-warehouse ERPs.",
    order: 3,
  },
];

const CATEGORIES = [
  {
    name: "Interiors",
    slug: "interiors",
    description: "Architectural and luxury interior digital platforms.",
    order: 1,
  },
  {
    name: "Enterprise SaaS & CRM",
    slug: "enterprise-saas-crm",
    description: "Institutional management systems, student/client relationship platforms, and workflow automation.",
    order: 2,
  },
  {
    name: "B2B Supply Chain & Logistics",
    slug: "b2b-supply-chain-logistics",
    description: "Wholesale procurement portals, fleet management, and cold storage telemetry.",
    order: 3,
  },
];

const SERVICES = [
  {
    name: "Strategy & Architecture",
    slug: "strategy-architecture",
    shortDescription: "Technical roadmap, system design, data modeling, and enterprise feasibility discovery.",
    order: 1,
  },
  {
    name: "Product & UX Design",
    slug: "product-ux-design",
    shortDescription: "High-density SaaS dashboards, interactive prototypes, and scalable component design systems.",
    order: 2,
  },
  {
    name: "Full-Stack Web & Mobile",
    slug: "web-mobile-engineering",
    shortDescription: "Modern reactive web apps, customer portals, and high-performance server-rendered frontends.",
    order: 3,
  },
  {
    name: "Cloud & Serverless Infrastructure",
    slug: "cloud-serverless-infra",
    shortDescription: "AWS Lambda, edge compute, serverless deployment pipelines, and zero-downtime scalability.",
    order: 4,
  },
  {
    name: "Applied AI & Automation",
    slug: "applied-ai-automation",
    shortDescription: "Predictive recommendations, WhatsApp workflow triggers, LLM orchestration, and AI voice agents.",
    order: 5,
  },
  {
    name: "CRM & Enterprise Platforms",
    slug: "crm-enterprise-platforms",
    shortDescription: "Bespoke administrative control centers, multi-role RBAC, and transactional operations hubs.",
    order: 6,
  },
  {
    name: "DevOps & Continuous Engineering",
    slug: "devops-continuous-engineering",
    shortDescription: "Automated CI/CD release gates, containerized microservices, and proactive production SLAs.",
    order: 7,
  },
];

const TECHNOLOGIES = [
  { name: "Next.js", slug: "nextjs", category: "FRONTEND" },
  { name: "React", slug: "react", category: "FRONTEND" },
  { name: "TypeScript", slug: "typescript", category: "FRONTEND" },
  { name: "Tailwind CSS", slug: "tailwind-css", category: "FRONTEND" },
  { name: "Node.js / NestJS", slug: "nodejs-nestjs", category: "BACKEND" },
  { name: "PostgreSQL", slug: "postgresql", category: "DATABASE" },
  { name: "AWS Lambda", slug: "aws-lambda", category: "CLOUD" },
  { name: "WhatsApp Automation API", slug: "whatsapp-automation", category: "AUTOMATION" },
  { name: "AI Agent Calling & Voice AI", slug: "ai-agent-calling", category: "AI" },
  { name: "LLM Recommendation Engine", slug: "llm-recommendation-engine", category: "AI" },
  { name: "Redis", slug: "redis", category: "DATABASE" },
  { name: "Docker", slug: "docker", category: "DEVOPS" },
];

const MEDIA = [
  {
    filename: "sm-interiors.png",
    originalFilename: "sm-interiors.png",
    storageKey: "projects/sm-interiors.png",
    url: "/images/projects/sm-interiors.png",
    type: "IMAGE",
    mimeType: "image/png",
    altText: "SM Interiors Architectural Studio & Home Platform",
  },
  {
    filename: "edusmart-school-crm.jpg",
    originalFilename: "edusmart-school-crm.jpg",
    storageKey: "projects/edusmart-school-crm.jpg",
    url: "/images/projects/edusmart-school-crm.jpg",
    type: "IMAGE",
    mimeType: "image/jpeg",
    altText: "Apex School Management & AI Fee Recovery CRM Dashboard",
  },
  {
    filename: "vijaya-dry-fruits.jpg",
    originalFilename: "vijaya-dry-fruits.jpg",
    storageKey: "projects/vijaya-dry-fruits.jpg",
    url: "/images/projects/vijaya-dry-fruits.jpg",
    type: "IMAGE",
    mimeType: "image/jpeg",
    altText: "Vijaya Premium Dry Fruits & Wholesale Portal Homepage",
  },
];

const PROJECTS = [
  {
    title: "SM Interiors — High-End Studio & Architectural Platform",
    slug: "sm-interiors",
    shortDescription: "Full-stack architectural & interior design platform featuring AWS Lambda deployment, WhatsApp automation, interactive live maps, email templates, and AI growth recommendations.",
    fullDescription: `SM Interiors is an architectural and interior design studio delivering turnkey luxury living spaces and modern commercial environments. MarineCloudX engineered, deployed, and currently maintains the complete digital platform.

### Architecture & Cloud Deployment
- **AWS Lambda Serverless Infrastructure**: Scalable cloud deployment leveraging AWS Lambda and cloud edge networks for ultra-low latency, zero server maintenance overhead, and dynamic resource scaling.
- **Custom Admin Control Center**: Bespoke CMS and business administration panel enabling the studio team to curate portfolio projects, manage incoming client consultations, and control active inquiries.
- **Dynamic Business Recommendations**: Integrated AI recommendation engine in the admin panel analyzing visitor engagement patterns, lead momentum, and inquiry trends to provide actionable recommendations for growing the business.

### Client Experience & Automation
- **WhatsApp Business Automation**: End-to-end automated WhatsApp integration delivering instant inquiry confirmations, project status updates, and direct-to-designer chat triggers.
- **AI Agent Calling Integration (Scoping / In Discussion)**: Conversational voice AI agent under architectural alignment to handle after-hours client qualification, design preference intake, and consultation booking.
- **Interactive Live Maps & Geolocation**: Live studio location integration with interactive maps guiding visiting clients effortlessly to the Bhimavaram design hub.
- **Branded Transactional Email Templates**: High-fidelity, responsive HTML email automation for design estimates, consultation confirmations, and portfolio showcases.
- **Active System Maintenance**: Ongoing SLAs, security patching, cloud performance monitoring, and continuous product enhancements provided by MarineCloudX DevOps team.`,
    categorySlug: "interiors",
    industrySlugs: ["interiors-section"],
    serviceSlugs: ["web-mobile-engineering", "cloud-serverless-infra", "applied-ai-automation"],
    technologySlugs: ["nextjs", "react", "typescript", "aws-lambda", "whatsapp-automation", "ai-agent-calling", "nodejs-nestjs", "postgresql"],
    mediaFilename: "sm-interiors.png",
    status: "COMPLETED",
    featured: true,
    order: 1,
    liveUrl: "https://sminteriors47.in/",
    seoTitle: "SM Interiors — Architectural Studio & Custom Interior Platform",
    seoDescription: "Case study of SM Interiors: AWS Lambda cloud deployment, WhatsApp automation, custom admin panel, and AI business recommendations engineered by MarineCloudX.",
  },
  {
    title: "Apex School Management & AI Fee Recovery CRM",
    slug: "apex-school-management-crm",
    shortDescription: "Comprehensive educational CRM with standard-wise student categorization, annual fee lifecycle management, and predictive AI payment recommendations with automated WhatsApp & email alerts.",
    fullDescription: `Apex School Management CRM is an enterprise-grade academic administration platform built to modernize institution operations, student records, and annual fee lifecycles across multiple grades and branches.

### Academic & Student Segregation
- **Standard & Grade-Wise Classification**: Distinct hierarchy managing students from kindergarten through higher secondary, with automated section allocation, guardian contact mapping, and academic performance history.
- **Annual Fee Lifecycle Architecture**: Multi-tier fee structuring supporting annual tuition, transport fees, laboratory dues, and extracurriculars with fine-tuned installment schedules.

### AI Fee Recovery & Multi-Channel Communications
- **AI Payment Propensity Recommendations**: Predictive machine learning model analyzing past payment patterns, reminder interactions, and seasonal trends to highlight guardians most likely to need follow-ups.
- **Automated WhatsApp Reminders**: Direct-to-guardian WhatsApp notification workflows dispatching personalized due-date reminders, payment links, and digitally generated fee receipts.
- **Smart Email Follow-Ups**: Scheduled, automated email escalations with PDF invoice attachments, preventing administrative overhead for accounts staff.
- **Multi-Role Administrative Hierarchy**: Tailored dashboards for principals, accountants, teachers, and system administrators with fine-grained role-based access control.

### Current Milestone: UI & Experience Design
- The project is currently in the active **UI/UX Design & Prototyping Stage**, finalizing component libraries, design systems, and mobile-first parent communication workflows before full cloud provisioning.`,
    categorySlug: "enterprise-saas-crm",
    industrySlugs: ["education-edtech"],
    serviceSlugs: ["product-ux-design", "crm-enterprise-platforms", "applied-ai-automation"],
    technologySlugs: ["react", "typescript", "nextjs", "llm-recommendation-engine", "whatsapp-automation", "postgresql"],
    mediaFilename: "edusmart-school-crm.jpg",
    status: "IN_PROGRESS",
    featured: true,
    order: 2,
    liveUrl: null,
    seoTitle: "Apex School Management CRM with AI Fee Recovery Automation",
    seoDescription: "School administration CRM with standard-wise student segregation, annual fee tracking, and automated AI WhatsApp reminders to parents.",
  },
  {
    title: "Vijaya — Premium Dry Fruits & B2B Wholesale Portal",
    slug: "vijaya-dry-fruits",
    shortDescription: "Direct-from-orchard dry fruits e-commerce storefront and wholesale administrative portal committed for development with B2B bulk orders, gift box customization, and inventory controls.",
    fullDescription: `Vijaya Dry Fruits is a high-end gourmet dry fruits and nuts enterprise delivering nature's best almonds, walnuts, cashews, pistachios, and saffron across both direct-to-consumer (D2C) and wholesale distribution channels. MarineCloudX has been committed and contracted to engineer the complete consumer web storefront and backend administrative portal.

### Storefront & Consumer Commerce
- **Luxury D2C E-Commerce Experience**: Immersive digital shopping destination with curated collections, bespoke gift-box builders, vacuum-nitrogen sealed freshness badges, and instant checkout.
- **Dynamic B2B Wholesale Quoting**: Dedicated portal for bulk buyers, retailers, and corporate gifting clients to calculate volume-based tier pricing, generate pro-forma invoices, and schedule freight shipments.
- **Direct Orchard Provenance & Batch Traceability**: Customer-facing transparency showing harvest origin (Kashmir, California, Afghanistan, Iran) with batch testing certificates.

### Administration & Operations Portal
- **Warehouse & Cold-Storage Inventory Hub**: Real-time stock tracking across warehouse bays with automated alerts for reorder thresholds and packaging supplies.
- **Multi-Channel Order Fulfillment Pipeline**: Unified order management syncing web sales, wholesale contract dispatches, and courier tracking integrations.
- **Customer Relationship & Reorder CRM**: Segmented customer profiles enabling automated seasonal gifting reminders and personalized discount incentives for recurring B2B accounts.

### Engagement Status: Committed & Under Active Development
- Formal engagement has been **committed and scheduled for full development**, with MarineCloudX engineering teams currently building the responsive Next.js frontend, backend database schemas, and admin CRM panels.`,
    categorySlug: "b2b-supply-chain-logistics",
    industrySlugs: ["agritech-fresh-produce"],
    serviceSlugs: ["strategy-architecture", "web-mobile-engineering", "crm-enterprise-platforms"],
    technologySlugs: ["nextjs", "react", "typescript", "nodejs-nestjs", "postgresql", "tailwind-css"],
    mediaFilename: "vijaya-dry-fruits.jpg",
    status: "IN_PROGRESS",
    featured: true,
    order: 3,
    liveUrl: null,
    seoTitle: "Vijaya Dry Fruits — E-Commerce & Wholesale B2B Portal",
    seoDescription: "Luxury dry fruits storefront and admin CRM portal engineered for farm-direct retail and wholesale distribution.",
  },
];

async function seed() {
  await client.connect();
  console.log("Connected to PostgreSQL coudx database.");

  try {
    // 1. Industries
    console.log("\n--- Seeding Industries ---");
    const industryMap = new Map();
    for (const ind of INDUSTRIES) {
      const existing = await client.query('SELECT id FROM "Industry" WHERE slug = $1', [ind.slug]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        await client.query(
          'UPDATE "Industry" SET name = $1, description = $2, "order" = $3, "updatedAt" = NOW() WHERE id = $4',
          [ind.name, ind.description, ind.order, id]
        );
      } else {
        id = crypto.randomUUID();
        await client.query(
          'INSERT INTO "Industry" (id, name, slug, description, "order", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())',
          [id, ind.name, ind.slug, ind.description, ind.order]
        );
      }
      industryMap.set(ind.slug, id);
      console.log(`✓ Industry: ${ind.name} (${id})`);
    }

    // 2. Project Categories
    console.log("\n--- Seeding Project Categories ---");
    const categoryMap = new Map();
    for (const cat of CATEGORIES) {
      const existing = await client.query('SELECT id FROM "ProjectCategory" WHERE slug = $1', [cat.slug]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        await client.query(
          'UPDATE "ProjectCategory" SET name = $1, description = $2, "order" = $3, "updatedAt" = NOW() WHERE id = $4',
          [cat.name, cat.description, cat.order, id]
        );
      } else {
        id = crypto.randomUUID();
        await client.query(
          'INSERT INTO "ProjectCategory" (id, name, slug, description, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [id, cat.name, cat.slug, cat.description, cat.order]
        );
      }
      categoryMap.set(cat.slug, id);
      console.log(`✓ Category: ${cat.name} (${id})`);
    }

    // 3. Services
    console.log("\n--- Seeding Services ---");
    const serviceMap = new Map();
    for (const s of SERVICES) {
      const existing = await client.query('SELECT id FROM "Service" WHERE slug = $1', [s.slug]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        await client.query(
          'UPDATE "Service" SET name = $1, "shortDescription" = $2, "order" = $3, "updatedAt" = NOW() WHERE id = $4',
          [s.name, s.shortDescription, s.order, id]
        );
      } else {
        id = crypto.randomUUID();
        await client.query(
          'INSERT INTO "Service" (id, name, slug, "shortDescription", "order", status, "publishedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, \'PUBLISHED\', NOW(), NOW(), NOW())',
          [id, s.name, s.slug, s.shortDescription, s.order]
        );
      }
      serviceMap.set(s.slug, id);
      console.log(`✓ Service: ${s.name} (${id})`);
    }

    // 4. Technologies
    console.log("\n--- Seeding Technologies ---");
    const technologyMap = new Map();
    for (const t of TECHNOLOGIES) {
      const existing = await client.query('SELECT id FROM "Technology" WHERE slug = $1', [t.slug]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        await client.query(
          'UPDATE "Technology" SET name = $1, category = $2, "updatedAt" = NOW() WHERE id = $3',
          [t.name, t.category, id]
        );
      } else {
        id = crypto.randomUUID();
        await client.query(
          'INSERT INTO "Technology" (id, name, slug, category, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, NOW(), NOW())',
          [id, t.name, t.slug, t.category]
        );
      }
      technologyMap.set(t.slug, id);
      console.log(`✓ Technology: ${t.name} (${id})`);
    }

    // 5. Media
    console.log("\n--- Seeding Media ---");
    const mediaMap = new Map();
    for (const m of MEDIA) {
      const existing = await client.query('SELECT id FROM "Media" WHERE "storageKey" = $1', [m.storageKey]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        await client.query(
          'UPDATE "Media" SET url = $1, "altText" = $2, "updatedAt" = NOW() WHERE id = $3',
          [m.url, m.altText, id]
        );
      } else {
        id = crypto.randomUUID();
        await client.query(
          'INSERT INTO "Media" (id, filename, "originalFilename", "storageKey", url, type, "mimeType", "altText", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
          [id, m.filename, m.originalFilename, m.storageKey, m.url, m.type, m.mimeType, m.altText]
        );
      }
      mediaMap.set(m.filename, id);
      console.log(`✓ Media: ${m.filename} (${id})`);
    }

    // 6. Projects
    console.log("\n--- Seeding Projects ---");
    await client.query('DELETE FROM "Project" WHERE slug IN ($1, $2)', ['agrifresh-fruits-supply-chain', 'royal-harvest-dry-fruits']);
    for (const p of PROJECTS) {
      const catId = categoryMap.get(p.categorySlug);
      const coverMediaId = mediaMap.get(p.mediaFilename);

      const existing = await client.query('SELECT id FROM "Project" WHERE slug = $1', [p.slug]);
      let projectId;
      if (existing.rows.length > 0) {
        projectId = existing.rows[0].id;
        await client.query(
          `UPDATE "Project" SET 
            title = $1, 
            "shortDescription" = $2, 
            "fullDescription" = $3, 
            "categoryId" = $4, 
            "publicationStatus" = 'PUBLISHED', 
            status = $5, 
            featured = $6, 
            "order" = $7, 
            "liveUrl" = $8, 
            "seoTitle" = $9, 
            "seoDescription" = $10, 
            "coverMediaId" = $11, 
            "updatedAt" = NOW() 
           WHERE id = $12`,
          [p.title, p.shortDescription, p.fullDescription, catId, p.status, p.featured, p.order, p.liveUrl, p.seoTitle, p.seoDescription, coverMediaId, projectId]
        );
        console.log(`✓ Updated Project: ${p.title}`);
      } else {
        projectId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "Project" 
           (id, title, slug, "shortDescription", "fullDescription", "categoryId", "publicationStatus", "publishedAt", status, featured, "order", "liveUrl", "seoTitle", "seoDescription", "coverMediaId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', NOW(), $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
          [projectId, p.title, p.slug, p.shortDescription, p.fullDescription, catId, p.status, p.featured, p.order, p.liveUrl, p.seoTitle, p.seoDescription, coverMediaId]
        );
        console.log(`✓ Inserted Project: ${p.title}`);
      }

      // Link Industries (_IndustryToProject: A = Industry, B = Project)
      await client.query('DELETE FROM "_IndustryToProject" WHERE "B" = $1', [projectId]);
      for (const indSlug of p.industrySlugs) {
        const indId = industryMap.get(indSlug);
        if (indId) {
          await client.query(
            'INSERT INTO "_IndustryToProject" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [indId, projectId]
          );
        }
      }

      // Link Services (_ProjectToService: A = Project, B = Service)
      await client.query('DELETE FROM "_ProjectToService" WHERE "A" = $1', [projectId]);
      for (const srvSlug of p.serviceSlugs) {
        const srvId = serviceMap.get(srvSlug);
        if (srvId) {
          await client.query(
            'INSERT INTO "_ProjectToService" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [projectId, srvId]
          );
        }
      }

      // Link Technologies (_ProjectToTechnology: A = Project, B = Technology)
      await client.query('DELETE FROM "_ProjectToTechnology" WHERE "A" = $1', [projectId]);
      for (const techSlug of p.technologySlugs) {
        const techId = technologyMap.get(techSlug);
        if (techId) {
          await client.query(
            'INSERT INTO "_ProjectToTechnology" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [projectId, techId]
          );
        }
      }
    }

    console.log("\nAll 3 Projects and their relations seeded successfully!");
  } catch (err) {
    console.error("Error seeding projects:", err);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
