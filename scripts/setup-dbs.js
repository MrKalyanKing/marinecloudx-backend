const { Client } = require('pg');

async function setupRolesAndDbs() {
  const superClient = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres' });
  await superClient.connect();

  async function ensureRole(username, password) {
    const check = await superClient.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [username]);
    if (check.rows.length === 0) {
      console.log(`Creating role ${username}...`);
      await superClient.query(`CREATE ROLE "${username}" WITH LOGIN PASSWORD '${password}' CREATEDB`);
    } else {
      console.log(`Role ${username} exists, ensuring password and login...`);
      await superClient.query(`ALTER ROLE "${username}" WITH LOGIN PASSWORD '${password}' CREATEDB`);
    }
  }

  async function ensureDb(dbname, owner) {
    const check = await superClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbname]);
    if (check.rows.length === 0) {
      console.log(`Creating database ${dbname} owned by ${owner}...`);
      await superClient.query(`CREATE DATABASE "${dbname}" OWNER "${owner}"`);
    } else {
      console.log(`Database ${dbname} already exists.`);
    }
  }

  await ensureRole('marinecloudx_dev_user', 'marine@123dev');
  await ensureDb('marinecloudx_dev', 'marinecloudx_dev_user');

  await ensureRole('marinecloudx_prod_user', 'marine@123prod');
  await ensureDb('marinecloudx_prod', 'marinecloudx_prod_user');

  await superClient.end();

  // Grant schema permissions on each DB
  for (const item of [
    { db: 'marinecloudx_dev', user: 'marinecloudx_dev_user' },
    { db: 'marinecloudx_prod', user: 'marinecloudx_prod_user' }
  ]) {
    const dbClient = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${item.db}` });
    await dbClient.connect();
    await dbClient.query(`GRANT ALL ON SCHEMA public TO "${item.user}"`);
    await dbClient.query(`ALTER SCHEMA public OWNER TO "${item.user}"`);
    await dbClient.end();
  }

  console.log('Roles and databases are verified and ready.');
}

setupRolesAndDbs().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
