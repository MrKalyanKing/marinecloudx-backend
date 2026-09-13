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

const CATEGORIES = [
  {
    name: "Architecture & Strategy",
    slug: "architecture-strategy",
    description: "Insights on technical planning, discovery methodology, and enterprise software architecture.",
    order: 1,
  },
  {
    name: "Product Design",
    slug: "product-design",
    description: "Deep dives into UX engineering, operational density, and scalable design systems.",
    order: 2,
  },
  {
    name: "Frontend Engineering",
    slug: "frontend-engineering",
    description: "Sub-second web performance, modern Next.js frameworks, and reactive client architecture.",
    order: 3,
  },
  {
    name: "Full-Stack Development",
    slug: "full-stack-development",
    description: "Building scalable custom applications, secure backend services, and relational architectures.",
    order: 4,
  },
  {
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description: "Infrastructure as code, containerization with Docker, and automated release pipelines.",
    order: 5,
  },
  {
    name: "AI & Intelligent Systems",
    slug: "ai-intelligent-systems",
    description: "Applied artificial intelligence, LLM orchestration, and low-latency automated workflows.",
    order: 6,
  },
  {
    name: "Data & Systems",
    slug: "data-systems",
    description: "Event-driven integrations, API contract design, and resilient third-party data synchronization.",
    order: 7,
  },
  {
    name: "Continuous Engineering",
    slug: "continuous-engineering",
    description: "Proactive telemetry, runtime observability, automated testing, and ongoing codebase evolution.",
    order: 8,
  },
];

const POSTS = [
  {
    title: "Architecting for the Real World: Why Software Initiatives Fail at Discovery, Not Delivery",
    slug: "architecting-real-world-software-discovery-vs-delivery",
    categorySlug: "architecture-strategy",
    tagNames: ["Strategy", "System Architecture", "Discovery", "Product Engineering"],
    excerpt: "Why the most catastrophic software failures stem from misunderstood business workflows rather than engineering execution, and how structured discovery bridges the divide.",
    seoTitle: "Architecting for the Real World: Technical Discovery vs Delivery",
    seoDescription: "An in-depth guide on why software projects fail at discovery, and how disciplined requirements engineering prevents costly technical debt.",
    content: `Most software failures do not happen in the IDE. They happen weeks before the first repository is initialized, inside conference rooms and slide decks where assumptions are mistaken for technical requirements.

When an engineering team builds the wrong architecture brilliantly, the outcome is still a failed product. A microservices topology cannot save an unvalidated business process. A distributed database cannot compensate for conflicting domain models. The fundamental discipline of software development is not writing code as quickly as possible — it is ensuring every line of code addresses an operational reality.

The Anatomy of Discovery
At MarineCloudX, our Strategy & Discovery capability is designed to de-risk investments before technical execution begins. We treat discovery as an investigative engineering phase, not a speculative marketing exercise.

1. Operational Workflow Mapping
Every business operates on implicit knowledge — undocumented workarounds, manual spreadsheets, and ad-hoc communication channels that keep operations moving. When migrating to custom software, failing to identify these hidden workflows creates resistance and system rejection. We shadow operational teams, interview multi-role stakeholders, and map every data handoff to document actual business constraints.

2. Defining Strict Data Boundaries
Software fragmentation occurs when entity boundaries are poorly defined. Is a customer record shared across admissions, billing, and support? Who owns the state transitions? By formalizing domain-driven entity boundaries early, we prevent relational integrity corruption and avoid monolithic schema sprawl.

3. Technical Feasibility & Constraint Scoping
Not every problem requires a custom distributed system. We evaluate existing infrastructure, regulatory compliance demands (such as data residency and role-based privacy), and integration latency tolerances. This yields a deterministic technical blueprint rather than an open-ended wish list.

The Deliverable: A Decision Matrix, Not a Wish List
The output of structured discovery is a Technical Architecture Blueprint and Staged Milestone Roadmap. This documents exact API contracts, schema structures, third-party dependencies, and an incremental delivery schedule. By confronting architectural trade-offs upfront, engineering teams build with velocity and clarity, ensuring capital is invested where it produces measurable operational leverage.`
  },
  {
    title: "Designing for Operational Density: UX Principles for High-Stakes Business Systems",
    slug: "designing-for-operational-density-high-stakes-ux",
    categorySlug: "product-design",
    tagNames: ["UX Design", "Design Systems", "Prototyping", "Information Architecture"],
    excerpt: "Consumer design paradigms collapse in dense operational environments. Here is how we engineer task-centered UX and design systems that scale across enterprise workflows.",
    seoTitle: "Designing for Operational Density: Enterprise UX & Design Systems",
    seoDescription: "Explore task-centered UX principles, information hierarchy, and scalable design token architecture engineered for dense operational workflows.",
    content: `A common mistake in enterprise software design is treating complex operational tools like consumer lifestyle applications. Oversized hero cards, excessive whitespace, and hidden navigation patterns look clean in portfolio mockups, but they cripple daily operators who process hundreds of complex records every hour.

In high-stakes business environments — whether hospital management, school admissions, or manufacturing logistics — interface efficiency is directly tied to business throughput and error reduction.

The Principles of Operational Density

1. Information Hierarchy Over Emptiness
Operators do not want endless scrolling; they need relevant contextual data accessible within single-click workflows. Dense interfaces must balance scanning speed with visual calm. We achieve this through typographic precision, micro-contrast hairlines, and structured tabular views with inline action triggers.

2. Predictable State and Ergonomic Feedback
Every interactive element must provide instant visual confirmation. When an administrator approves an inquiry, updates a ledger, or triggers a batch notification, ambiguity leads to duplicated submissions or panic. We enforce strict state conventions: loading skeletons that preserve scroll position, non-disruptive optimistic updates, and persistent status indicators.

3. Tokenized Design Systems for Rapid Scale
Building custom software without a unified design system guarantees UI fragmentation within six months. At MarineCloudX, we architect modular design token libraries across spacing, color luminances, type scales, and interaction states. Developers consume reusable, battle-tested UI components that ensure consistency across hundreds of views.

Validation Through Interactive Prototyping
Static mockups hide edge cases. A design that looks pristine with 4-letter names breaks catastrophically when populated with 45-character strings, missing profile images, and edge-case pagination. We prototype real data flows early, validating keyboard navigation and workflow speed with actual users before backend integration starts.`
  },
  {
    title: "Zero-Jank Web Engineering: Sub-Second Latency, Modern Next.js, and Core Web Vitals",
    slug: "zero-jank-web-engineering-nextjs-core-web-vitals",
    categorySlug: "frontend-engineering",
    tagNames: ["Next.js", "React", "TypeScript", "Performance", "Web Standards"],
    excerpt: "Building web platforms that feel native: achieving sub-second first contentful paint, eliminating layout shifts, and caching strategies that keep pages instant.",
    seoTitle: "Zero-Jank Web Engineering: Next.js Performance & Core Web Vitals",
    seoDescription: "Learn how we engineer sub-second web experiences with Next.js App Router, asset optimization, and zero layout shift architectures.",
    content: `Modern web visitors expect instant responses. When a page stutters, shifts during load, or takes three seconds to display its primary heading, potential clients abandon the journey. Speed is not a cosmetic feature — it directly dictates search engine authority, user conversion, and brand credibility.

Engineering a truly high-performance web platform requires eliminating the common anti-patterns that bloat modern JavaScript applications.

The Core Foundations of Sub-Second Web Performance

1. Server-First Architecture with Next.js App Router
Client-side rendering (CSR) forces the user's device to download megabytes of JavaScript before anything legible renders on screen. By leveraging React Server Components (RSC) within Next.js, we render semantic HTML on the server edge. The client receives pristine, pre-computed markup instantly, while interactive client bundles are deferred and code-split.

2. Eliminating Cumulative Layout Shift (CLS)
Nothing degrades perceived quality faster than buttons jumping under a user's cursor as images or fonts load. We eliminate layout shift by enforcing strict aspect ratios on media containers, using font fallback metric overrides, and provisioning static layout scaffolding for dynamic feeds.

3. GPU-Accelerated Visuals and Zero-Overhead Animation
Complex ambient backgrounds, dynamic ribbons, and canvas effects often introduce severe frame drops when implemented naively. In MarineCloudX platforms, background visualizations are isolated onto dedicated composited layers or WebGL instances. By removing DOM mutations from the 60fps render loop, animations remain buttery smooth without degrading main-thread responsiveness.

4. Intelligent Cache Invalidation via Webhooks
A fast site that serves stale data is broken; a site that recalculates every request from scratch is sluggish. We utilize tagged fetch caching backed by instant revalidation webhooks. When an editor publishes an update in the admin CMS, an automated webhook purges the specific route cache across CDN edge nodes in milliseconds, delivering both instant performance and real-time freshness.`
  },
  {
    title: "Engineering Resilient Enterprise Portals: Relational Integrity, RBAC, and Clean Architecture",
    slug: "engineering-resilient-enterprise-portals-rbac-relational-data",
    categorySlug: "full-stack-development",
    tagNames: ["Full-Stack", "PostgreSQL", "REST APIs", "Authentication", "Dashboards"],
    excerpt: "How we structure custom web applications and business portals with strict relational schemas, role-based authorization, and decoupled system boundaries.",
    seoTitle: "Engineering Resilient Enterprise Portals: Relational Data & RBAC",
    seoDescription: "A technical guide to building secure custom business portals, PostgreSQL relational integrity, and robust role-based access control.",
    content: `When building core operational portals — whether customer self-service portals, administrative hubs, or multi-tenant SaaS platforms — engineering decisions made in the first month echo for years. Shortcuts in data integrity or ad-hoc authorization models inevitably culminate in security vulnerabilities and costly rewrites.

At MarineCloudX, our custom application development capability treats predictability, transactional safety, and clean decoupling as non-negotiable requirements.

Architectural Tenets for Mission-Critical Portals

1. Relational Integrity Over Document Store Chaos
While NoSQL databases offer tempting schema-free velocity during week one, business operations are fundamentally relational. Invoices link to clients, permissions map to roles, and status changes require audit trails. We anchor our enterprise applications in PostgreSQL, utilizing foreign key constraints, transactional isolation levels, and partial indexes to ensure that invalid business states can never exist in the database.

2. Defense-in-Depth Authorization (RBAC)
Application security cannot rely on hidden frontend buttons. We implement multi-layered Role-Based Access Control (RBAC) where every API endpoint and database query validates identity, tenant boundaries, and specific permissions. Cryptographically signed, HTTP-only session cookies prevent token theft while protecting against Cross-Site Scripting (XSS) and CSRF attacks.

3. Modular Decoupling and Clean Contracts
Tightly coupling frontend UI components directly to raw database columns creates brittle systems. We build clean RESTful and contract-driven API surfaces using TypeScript. Shared contract definitions guarantee that breaking changes are caught at compile time before code ever reaches a production deployment.

4. Real-Time Operational Telemetry
Administrative dashboards are only valuable if they represent live reality. We design dashboard services with optimized aggregation queries, indexing strategies, and event hooks that stream critical updates without exhausting database connection pools.`
  },
  {
    title: "Infrastructure as Discipline: Reproducible Containers, Automated CI/CD, and Production Reliability",
    slug: "infrastructure-as-discipline-containers-cicd-production-reliability",
    categorySlug: "cloud-devops",
    tagNames: ["Cloud", "Docker", "CI/CD", "Security", "Infrastructure"],
    excerpt: "Eliminating 'works on my machine' forever. A practical blueprint for zero-downtime containerized deployments, automated CI/CD checks, and production hardening.",
    seoTitle: "Infrastructure as Discipline: Docker, CI/CD & Production Reliability",
    seoDescription: "Best practices for containerized cloud architecture, automated CI/CD deployment pipelines, and zero-downtime production reliability.",
    content: `The days of manually copying files to a server via FTP or executing unrecorded terminal commands in production are long gone. In modern engineering, infrastructure is software. If an environment cannot be torn down and rebuilt identically from declarative scripts within minutes, it is not production-ready.

Our Cloud & Infrastructure practice focuses on stability, automation, and deterministic release cycles.

The Pillars of Cloud Engineering Discipline

1. Standardized Multi-Stage Containerization
We containerize services using Docker multi-stage builds. Development dependencies, linters, and compilers are stripped from final runtime images, drastically reducing attack surfaces and container footprints. The resulting lightweight image runs identically on an engineer's laptop, a staging server, and a production Kubernetes cluster.

2. Automated CI/CD Verification Gates
No code reaches production without surviving an automated gauntlet. Every pull request triggers a continuous integration pipeline that runs static type checking, unit and integration suites, security dependency audits, and linting standards. Builds that fail any gate are rejected automatically, safeguarding production stability.

3. Zero-Downtime Deployment Strategies
Deploying new code should never require taking systems offline. Through rolling container updates, health check probes, and reverse proxy connection draining, newly spawned instances must pass health checks before receiving production traffic. If an error is detected post-deployment, automated rollbacks revert to the previous verified build in seconds.

4. Infrastructure Security & TLS Hardening
From automated Let's Encrypt TLS renewal and strict Content Security Policies (CSP) to rate-limiting and DDoS mitigation, security is built into the network topology. Secrets are injected via encrypted environment stores rather than checked into repositories, ensuring complete compliance with international data standards.`
  },
  {
    title: "Practical AI in Enterprise Systems: Moving Beyond Toys to Resilient LLM Pipelines",
    slug: "practical-ai-enterprise-systems-resilient-llm-pipelines",
    categorySlug: "ai-intelligent-systems",
    tagNames: ["Artificial Intelligence", "LLM APIs", "Streaming", "Automation"],
    excerpt: "How to integrate foundation models into real-world business workflows with streaming responses, automated validation, and provider-agnostic failover.",
    seoTitle: "Practical AI in Enterprise Systems: Resilient LLM Pipelines",
    seoDescription: "How MarineCloudX engineers production AI: streaming LLM responses, schema-enforced JSON validation, and automated operational workflows.",
    content: `Generative AI has created immense excitement, but also a surplus of fragile prototypes. In a corporate environment, a chat interface that hallucinates financial figures or times out during high concurrency is worse than useless — it is a liability.

Moving artificial intelligence from an interesting novelty to an enterprise asset requires rigorous software engineering around non-deterministic model outputs.

How We Engineer Production-Grade AI Systems

1. Provider-Agnostic Integration Gateways
Locking an entire product into a single proprietary AI model leaves the business vulnerable to rate-limiting, sudden API deprecations, or pricing shifts. We architect abstracted AI gateways that interface with leading foundation models (OpenAI, Anthropic, Gemini, or open-weight models). If one provider encounters elevated latency, requests automatically failover to secondary endpoints without disrupting end users.

2. Low-Latency Response Streaming
Waiting 15 seconds for a complete model generation destroys user trust. We build reactive user experiences powered by Server-Sent Events (SSE) and WebSockets, streaming tokens directly into the client interface with sub-500ms Time-to-First-Token (TTFT). Users read responses naturally as they generate, maintaining conversational engagement.

3. Schema Enforcement and Structured JSON Outputs
Free-form text generation is difficult to integrate into relational databases. We enforce strict schema validation on model outputs using structured function calling and runtime validation libraries (such as Zod). When extracting customer requirements or categorizing support tickets, the model must return strictly typed JSON that passes automated validation before touching database records.

4. Guardrails, Auditing, and Data Privacy
Enterprise data must remain confidential. We configure zero-retention API agreements and implement automated sanitization filters that scrub Personally Identifiable Information (PII) before model ingestion. Every automated decision is logged with token consumption metrics, latency benchmarks, and full auditability.`
  },
  {
    title: "Event-Driven System Integration: Handling Webhooks, Retries, and Third-Party API Fragility",
    slug: "event-driven-system-integration-webhooks-resilient-apis",
    categorySlug: "data-systems",
    tagNames: ["API Integrations", "Webhooks", "Data Synchronization", "Architecture"],
    excerpt: "Third-party APIs will fail, rate-limit, and timeout. Here is how we architect asynchronous queues, idempotent webhook handlers, and verified data sync.",
    seoTitle: "Event-Driven System Integration: Webhooks & Resilient APIs",
    seoDescription: "Architecting reliable system integrations: handling webhooks idempotently, managing distributed retries, and preventing data corruption.",
    content: `Modern business operations depend on an ecosystem of specialized external tools: payment gateways (Stripe, Razorpay), CRM platforms (HubSpot, Salesforce), shipping APIs, and ERP systems. However, relying on external services introduces distributed systems complexity: third-party servers go down, network sockets drop, and rate limits are hit without warning.

If your application relies on synchronous HTTP calls in the main request cycle, your system's uptime will never exceed the uptime of your least reliable integration.

Architecting for Resilient Interoperability

1. Asynchronous Event Queuing
When an external event occurs — such as an incoming payment or customer onboarding trigger — the primary application must never perform heavy external API synchronization during the active user request. Instead, we persist incoming payloads immediately to an internal event log, acknowledge receipt within 50ms, and offload processing to background worker queues.

2. Idempotent Webhook Processing
Network instability means third-party platforms will inevitably retry webhooks multiple times. If your webhook handler is not idempotent, a network retry can charge a customer twice or issue duplicate inventory orders. We implement deterministic idempotency keys and state checks, guaranteeing that an event processed ten times produces the exact same outcome as an event processed once.

3. Exponential Backoff and Dead-Letter Queues
When communicating with external APIs, transient network failures must be met with exponential backoff and jitter. If an external service is completely unresponsive after predetermined retry attempts, failed events are quarantined into a Dead-Letter Queue (DLQ). Engineering teams receive instant alerts with complete execution payloads, allowing one-click replay once the external vendor recovers.

4. Reconciled Data Synchronization
Data drift between disparate systems is inevitable over time. We engineer automated reconciliation cron jobs that audit record states across internal databases and external platforms nightly, identifying and repairing discrepancies before business stakeholders notice.`
  },
  {
    title: "Beyond Day One: Continuous Observability, Proactive Telemetry, and Codebase Evolution",
    slug: "beyond-day-one-continuous-observability-codebase-evolution",
    categorySlug: "continuous-engineering",
    tagNames: ["DevOps", "Monitoring", "Maintenance", "Software Engineering"],
    excerpt: "Shipping v1.0 is only the starting line. Why proactive telemetry, automated error logging, and planned refactoring preserve long-term software health.",
    seoTitle: "Beyond Day One: Continuous Observability & Codebase Evolution",
    seoDescription: "Discover how continuous engineering, real-time telemetry, error tracking, and disciplined codebase maintenance protect your software investment.",
    content: `A pervasive myth in technology procurement is that software is a 'project' with a defined finish line. You design it, build it, launch it, and walk away. In reality, software is a living asset. The operating environment constantly shifts: browsers update, cloud platforms deprecate runtimes, security attack vectors evolve, and business models adapt.

Software that is not continuously engineered begins accumulating technical debt the moment it launches, steadily degrading in speed, stability, and security until a painful rewrite becomes unavoidable.

The Discipline of Continuous Engineering

1. Proactive Telemetry Over User Complaint Monitoring
If a customer has to email your support desk to inform you that your checkout page threw a 500 error, your observability has failed. We instrument applications with real-time error tracking (Sentry) and infrastructure telemetry. Unhandled exceptions, abnormal database query durations, and memory leak warnings trigger automated developer alerts within seconds of occurrence, allowing fixes before widespread user impact.

2. Dependency Auditing and Security Patching
Open-source frameworks and libraries undergo continuous security scrutiny. Known vulnerabilities (CVEs) are published daily. Through automated dependency scans and scheduled engineering review cycles, we keep frameworks, runtime dependencies, and cryptographic packages up to date, eliminating security attack surfaces proactively.

3. Performance Budgets and Continuous Optimization
As databases expand from 10,000 rows to 10 million rows, queries that took 5 milliseconds during launch can degrade into multi-second table scans. We monitor database slow query logs and API latency percentiles (p95, p99), proactively tuning database indexes, query shapes, and caching tiers before traffic spikes expose bottlenecks.

4. Structured Evolution and Technical Alignment
Continuous engineering is not just fixing bugs; it is aligning software capabilities with expanding business ambitions. Through structured sprint cycles, we work alongside our partners to iteratively release new features, refine existing user journeys, and scale infrastructure in lockstep with business growth.`
  }
];

async function seed() {
  await client.connect();
  console.log("Connected to PostgreSQL database");

  try {
    // 1. Get an author ID from existing users
    const userRes = await client.query('SELECT id FROM "User" LIMIT 1');
    if (userRes.rows.length === 0) {
      throw new Error("No user found in User table to assign as author");
    }
    const authorId = userRes.rows[0].id;
    console.log(`Using author ID: ${authorId}`);

    // 2. Upsert categories
    const categoryMap = new Map();
    for (const cat of CATEGORIES) {
      const existing = await client.query('SELECT id FROM "BlogCategory" WHERE slug = $1', [cat.slug]);
      let catId;
      if (existing.rows.length > 0) {
        catId = existing.rows[0].id;
        await client.query(
          'UPDATE "BlogCategory" SET name = $1, description = $2, "order" = $3, "updatedAt" = NOW() WHERE id = $4',
          [cat.name, cat.description, cat.order, catId]
        );
      } else {
        catId = crypto.randomUUID();
        await client.query(
          'INSERT INTO "BlogCategory" (id, name, slug, description, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [catId, cat.name, cat.slug, cat.description, cat.order]
        );
      }
      categoryMap.set(cat.slug, catId);
      console.log(`Category ready: ${cat.name} (${catId})`);
    }

    // 3. Upsert tags
    const tagMap = new Map();
    const allTagNames = [...new Set(POSTS.flatMap(p => p.tagNames))];
    for (const tagName of allTagNames) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await client.query('SELECT id FROM "BlogTag" WHERE slug = $1', [tagSlug]);
      let tagId;
      if (existing.rows.length > 0) {
        tagId = existing.rows[0].id;
      } else {
        tagId = crypto.randomUUID();
        await client.query(
          'INSERT INTO "BlogTag" (id, name, slug, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [tagId, tagName, tagSlug]
        );
      }
      tagMap.set(tagName, tagId);
    }
    console.log(`Tags ready: ${tagMap.size} tags`);

    // 4. Upsert blog posts
    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < POSTS.length; i++) {
      const p = POSTS[i];
      const catId = categoryMap.get(p.categorySlug) || null;
      // Stagger publishedAt slightly so they have distinct, realistic timestamps
      const publishedAt = new Date(Date.now() - (POSTS.length - i) * 86400000);

      const existingPost = await client.query('SELECT id FROM "BlogPost" WHERE slug = $1', [p.slug]);
      let postId;

      if (existingPost.rows.length > 0) {
        postId = existingPost.rows[0].id;
        await client.query(
          `UPDATE "BlogPost" 
           SET title = $1, excerpt = $2, content = $3, "authorId" = $4, "categoryId" = $5,
               status = 'PUBLISHED', "publishedAt" = $6, "seoTitle" = $7, "seoDescription" = $8, "updatedAt" = NOW()
           WHERE id = $9`,
          [p.title, p.excerpt, p.content, authorId, catId, publishedAt, p.seoTitle, p.seoDescription, postId]
        );
        updatedCount++;
      } else {
        postId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "BlogPost" 
           (id, title, slug, excerpt, content, "authorId", "categoryId", status, "publishedAt", "seoTitle", "seoDescription", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PUBLISHED', $8, $9, $10, NOW(), NOW())`,
          [postId, p.title, p.slug, p.excerpt, p.content, authorId, catId, publishedAt, p.seoTitle, p.seoDescription]
        );
        insertedCount++;
      }

      // Link tags in _BlogPostToBlogTag
      // Clear existing tag links for this post
      await client.query('DELETE FROM "_BlogPostToBlogTag" WHERE "A" = $1', [postId]);
      for (const tagName of p.tagNames) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          await client.query(
            'INSERT INTO "_BlogPostToBlogTag" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [postId, tagId]
          );
        }
      }

      console.log(`✓ Post ${i + 1}/${POSTS.length} ready: "${p.title}"`);
    }

    console.log("\n=========================================");
    console.log(`Successfully processed 8 service blog posts!`);
    console.log(`New posts inserted: ${insertedCount}`);
    console.log(`Existing posts updated: ${updatedCount}`);
    console.log("=========================================\n");

  } catch (err) {
    console.error("Error seeding blog posts:", err);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
