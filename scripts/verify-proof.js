const { Client } = require('pg');

const DEV_URL = 'postgresql://marinecloudx_dev_user:marine%40123dev@localhost:5432/marinecloudx_dev';
const PROD_URL = 'postgresql://marinecloudx_prod_user:marine%40123prod@localhost:5432/marinecloudx_prod';

async function verifyDetailed(label, url) {
  console.log('========================================================');
  console.log(`VERIFYING: ${label}`);
  console.log('========================================================');
  const client = new Client({ connectionString: url });
  await client.connect();

  const tables = ['User', 'BlogPost', 'Project', 'Service', 'Technology', 'BlogCategory', 'BlogTag'];

  for (const t of tables) {
    const res = await client.query(`SELECT * FROM "${t}" LIMIT 2`);
    console.log(`\n--- Table: ${t} (${res.rows.length} preview rows shown) ---`);
    if (res.rows.length > 0) {
      // Pick first few fields for display
      const preview = res.rows.map(row => {
        const keys = Object.keys(row).slice(0, 5);
        const obj = {};
        for (const k of keys) {
          obj[k] = typeof row[k] === 'string' && row[k].length > 30 ? row[k].substring(0, 30) + '...' : row[k];
        }
        return obj;
      });
      console.table(preview);
    }
  }

  await client.end();
}

(async () => {
  await verifyDetailed('DEVELOPMENT DATABASE (marinecloudx_dev)', DEV_URL);
  await verifyDetailed('PRODUCTION DATABASE (marinecloudx_prod)', PROD_URL);
})().catch(console.error);
