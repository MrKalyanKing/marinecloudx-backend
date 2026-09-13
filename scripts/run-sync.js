const { dumpLocalDatabase, restoreToDatabase, getStats } = require('./db-sync-helper');

const LOCAL_URL = 'postgresql://postgres:postgres@localhost:5432/coudx';
const DEV_URL = 'postgresql://marinecloudx_dev_user:marine%40123dev@localhost:5432/marinecloudx_dev';
const PROD_URL = 'postgresql://marinecloudx_prod_user:marine%40123prod@localhost:5432/marinecloudx_prod';

async function main() {
  console.log('=====================================================');
  console.log('STEP 1: INSPECT LOCAL DATABASE (coudx)');
  console.log('=====================================================');
  const localStats = await getStats(LOCAL_URL, 'coudx');
  console.log(`Local database has ${Object.keys(localStats).length} tables.`);

  console.log('\n=====================================================');
  console.log('STEP 2: DUMP LOCAL DATABASE (coudx)');
  console.log('=====================================================');
  await dumpLocalDatabase();

  console.log('\n=====================================================');
  console.log('STEP 3: RESTORE TO DEVELOPMENT DB (marinecloudx_dev)');
  console.log('=====================================================');
  await restoreToDatabase('marinecloudx_dev', 'marinecloudx_dev_user', 'marine@123dev');
  
  const devStats = await getStats(DEV_URL, 'marinecloudx_dev');
  console.log(`Development database now has ${Object.keys(devStats).length} tables.`);

  // Verify dev matches local
  let devMismatch = 0;
  for (const table of Object.keys(localStats)) {
    const localCount = localStats[table];
    const devCount = devStats[table] !== undefined ? devStats[table] : 'MISSING';
    if (localCount !== devCount) {
      console.error(`MISMATCH on table ${table}: local=${localCount}, dev=${devCount}`);
      devMismatch++;
    }
  }

  if (devMismatch > 0) {
    throw new Error(`Development database verification failed with ${devMismatch} mismatches! Aborting production dump.`);
  }
  console.log('>>> Development database verification PASSED with 100% table and row match! <<<');

  console.log('\n=====================================================');
  console.log('STEP 4: RESTORE TO PRODUCTION DB (marinecloudx_prod)');
  console.log('=====================================================');
  await restoreToDatabase('marinecloudx_prod', 'marinecloudx_prod_user', 'marine@123prod');

  const prodStats = await getStats(PROD_URL, 'marinecloudx_prod');
  console.log(`Production database now has ${Object.keys(prodStats).length} tables.`);

  // Verify prod matches local
  let prodMismatch = 0;
  for (const table of Object.keys(localStats)) {
    const localCount = localStats[table];
    const prodCount = prodStats[table] !== undefined ? prodStats[table] : 'MISSING';
    if (localCount !== prodCount) {
      console.error(`MISMATCH on table ${table}: local=${localCount}, prod=${prodCount}`);
      prodMismatch++;
    }
  }

  if (prodMismatch > 0) {
    throw new Error(`Production database verification failed with ${prodMismatch} mismatches!`);
  }
  console.log('>>> Production database verification PASSED with 100% table and row match! <<<');

  console.log('\n=====================================================');
  console.log('FINAL VERIFICATION TABLE');
  console.log('=====================================================');
  console.log(
    'Table Name'.padEnd(30) + 
    'Local (coudx)'.padStart(15) + 
    'Dev'.padStart(10) + 
    'Prod'.padStart(10) + 
    'Status'.padStart(10)
  );
  console.log('-'.repeat(65));

  for (const table of Object.keys(localStats)) {
    const l = localStats[table];
    const d = devStats[table];
    const p = prodStats[table];
    const status = (l === d && d === p) ? 'MATCH' : 'MISMATCH';
    console.log(
      table.padEnd(30) + 
      String(l).padStart(15) + 
      String(d).padStart(10) + 
      String(p).padStart(10) + 
      status.padStart(10)
    );
  }
  console.log('-'.repeat(65));
  console.log('SUCCESS: All data successfully dumped to dev and production databases!');
}

main().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
