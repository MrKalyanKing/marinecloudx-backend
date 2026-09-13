const { Client } = require('pg');
require('dotenv').config();
const c = new Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME });
async function main() {
  await c.connect();
  const cats = await c.query('SELECT id, name FROM "ProjectCategory"');
  const inds = await c.query('SELECT id, name FROM "Industry"');
  const servs = await c.query('SELECT id, name FROM "Service"');
  const techs = await c.query('SELECT id, name FROM "Technology"');
  const projs = await c.query('SELECT id, title FROM "Project"');
  console.log("CMS DB COUNTS:", {
    categories: cats.rows.length,
    industries: inds.rows.length,
    services: servs.rows.length,
    technologies: techs.rows.length,
    projects: projs.rows.length
  });
  console.log("INDUSTRIES:", inds.rows);
  console.log("CATEGORIES:", cats.rows);
  console.log("SERVICES:", servs.rows);
  console.log("TECHNOLOGIES:", techs.rows);
  await c.end();
}
main().catch(console.error);
