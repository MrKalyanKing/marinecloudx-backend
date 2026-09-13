const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

const PG_BIN_DIR = 'C:\\Program Files\\PostgreSQL\\18\\bin';
const PG_DUMP = path.join(PG_BIN_DIR, 'pg_dump.exe');
const PSQL = path.join(PG_BIN_DIR, 'psql.exe');
const DUMP_FILE = path.join(__dirname, '..', 'database', 'coudx_full_dump.sql');

function runProcess(cmd, args, envVars = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\nExecuting: ${path.basename(cmd)} ${args.join(' ')}`);
    const proc = spawn(cmd, args, {
      env: { ...process.env, ...envVars }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}.\nSTDERR: ${stderr}\nSTDOUT: ${stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function dumpLocalDatabase() {
  console.log('--- STEP 1: Dumping local database (coudx) ---');
  if (fs.existsSync(DUMP_FILE)) {
    fs.unlinkSync(DUMP_FILE);
  }

  // Dump schema and data from coudx
  // Flags: --no-owner --no-privileges --clean --if-exists
  await runProcess(
    PG_DUMP,
    [
      '-h', 'localhost',
      '-p', '5432',
      '-U', 'postgres',
      '-d', 'coudx',
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      '-f', DUMP_FILE
    ],
    { PGPASSWORD: 'postgres' }
  );

  const stats = fs.statSync(DUMP_FILE);
  console.log(`Dump completed successfully. File size: ${(stats.size / 1024).toFixed(2)} KB at ${DUMP_FILE}`);
}

async function restoreToDatabase(targetDb, targetUser, targetPass) {
  console.log(`\n--- Restoring to ${targetDb} as ${targetUser} ---`);
  
  await runProcess(
    PSQL,
    [
      '-h', 'localhost',
      '-p', '5432',
      '-U', targetUser,
      '-d', targetDb,
      '-f', DUMP_FILE,
      '-v', 'ON_ERROR_STOP=0' // don't abort if DROP IF EXISTS reports notices
    ],
    { PGPASSWORD: targetPass }
  );

  console.log(`Restore to ${targetDb} completed.`);

  // Fix table and sequence ownership/permissions
  const superClient = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${targetDb}` });
  await superClient.connect();
  
  await superClient.query(`
    DO $$ 
    DECLARE 
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public."' || r.tablename || '" OWNER TO "${targetUser}"';
      END LOOP;
      FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE public."' || r.sequencename || '" OWNER TO "${targetUser}"';
      END LOOP;
    END $$;
  `);
  await superClient.query(`GRANT ALL ON ALL TABLES IN SCHEMA public TO "${targetUser}"`);
  await superClient.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO "${targetUser}"`);
  await superClient.query(`GRANT ALL ON SCHEMA public TO "${targetUser}"`);
  
  await superClient.end();
  console.log(`Permissions and ownership for ${targetUser} on ${targetDb} ensured.`);
}

async function getStats(dbUrl, dbName) {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const results = {};
  for (const t of tables.rows) {
    const res = await client.query(`SELECT count(*) FROM "${t.table_name}"`);
    results[t.table_name] = parseInt(res.rows[0].count, 10);
  }
  await client.end();
  return results;
}

module.exports = {
  dumpLocalDatabase,
  restoreToDatabase,
  getStats,
  DUMP_FILE
};
