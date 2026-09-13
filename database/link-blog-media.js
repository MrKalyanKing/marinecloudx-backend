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

const IMAGES = [
  { slug: 'architecting-real-world-software-discovery-vs-delivery', file: 'strategy-discovery.jpg', alt: 'Strategy & Discovery Software Architecture' },
  { slug: 'designing-for-operational-density-high-stakes-ux', file: 'product-ux-design.jpg', alt: 'Product & UX Design Systems' },
  { slug: 'zero-jank-web-engineering-nextjs-core-web-vitals', file: 'web-digital-experiences.jpg', alt: 'Web & Digital Experiences Engineering' },
  { slug: 'engineering-resilient-enterprise-portals-rbac-relational-data', file: 'application-development.jpg', alt: 'Custom Application Development & Portals' },
  { slug: 'infrastructure-as-discipline-containers-cicd-production-reliability', file: 'cloud-infrastructure.jpg', alt: 'Cloud & Infrastructure DevOps' },
  { slug: 'practical-ai-enterprise-systems-resilient-llm-pipelines', file: 'ai-intelligent-automation.jpg', alt: 'AI & Intelligent Automation Systems' },
  { slug: 'event-driven-system-integration-webhooks-resilient-apis', file: 'data-integrations-systems.jpg', alt: 'Data Pipelines & System Integrations' },
  { slug: 'beyond-day-one-continuous-observability-codebase-evolution', file: 'deployment-support-continuous-engineering.jpg', alt: 'Deployment & Continuous Engineering' }
];

async function run() {
  await client.connect();
  for (const item of IMAGES) {
    const mediaUrl = '/images/blog/' + item.file;
    const storageKey = 'blog/' + item.file;
    
    // Upsert media
    const existingMedia = await client.query('SELECT id FROM "Media" WHERE "storageKey" = $1', [storageKey]);
    let mediaId;
    if (existingMedia.rows.length > 0) {
      mediaId = existingMedia.rows[0].id;
      await client.query('UPDATE "Media" SET url = $1, "altText" = $2, "updatedAt" = NOW() WHERE id = $3', [mediaUrl, item.alt, mediaId]);
    } else {
      mediaId = crypto.randomUUID();
      await client.query(
        'INSERT INTO "Media" (id, filename, "originalFilename", "storageKey", url, type, "mimeType", "altText", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
        [mediaId, item.file, item.file, storageKey, mediaUrl, 'IMAGE', 'image/jpeg', item.alt]
      );
    }
    
    // Update post coverMediaId
    await client.query('UPDATE "BlogPost" SET "coverMediaId" = $1 WHERE slug = $2', [mediaId, item.slug]);
    console.log('Linked post', item.slug, '->', mediaUrl);
  }
  await client.end();
  console.log('All posts updated with cover media successfully!');
}

run().catch(console.error);
