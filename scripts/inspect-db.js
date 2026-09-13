const { Client } = require('pg');

async function inspect(url, label) {
  console.log(`\n=== Inspecting ${label} ===`);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`Found ${tablesRes.rows.length} tables:`);
    for (const row of tablesRes.rows) {
      try {
        const countRes = await client.query(`SELECT count(*) FROM "${row.table_name}"`);
        console.log(` - ${row.table_name}: ${countRes.rows[0].count} rows`);
      } catch (err) {
        console.log(` - ${row.table_name}: error counting rows (${err.message})`);
      }
    }
  } catch (err) {
    console.error(`Error connecting to ${label}:`, err.message);
  } finally {
    await client.end();
  }
}

inspect('postgresql://postgres:postgres@localhost:5432/coudx', 'LOCAL coudx');
