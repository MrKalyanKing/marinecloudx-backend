import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { ZipArchive } = require("archiver");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const buildStagingDir = path.join(rootDir, ".lambda-build");
const zipOutputFile = path.join(rootDir, "lambda-build-linux-x64.zip");

console.log("==================================================");
console.log("🚀 Packaging MarineCloudX for AWS Lambda (Linux x86_64)");
console.log("==================================================");

// 1. Build TypeScript dist
console.log("\n📦 Step 1: Compiling TypeScript to dist...");
execSync("npm run build", { cwd: rootDir, stdio: "inherit" });

// 2. Prepare staging directory
console.log("\n🧹 Step 2: Preparing staging directory...");
if (!fs.existsSync(buildStagingDir)) {
  fs.mkdirSync(buildStagingDir, { recursive: true });
}

// Copy package.json & package-lock.json into staging
fs.copyFileSync(path.join(rootDir, "package.json"), path.join(buildStagingDir, "package.json"));
if (fs.existsSync(path.join(rootDir, "package-lock.json"))) {
  fs.copyFileSync(path.join(rootDir, "package-lock.json"), path.join(buildStagingDir, "package-lock.json"));
}

// 3. Install production dependencies for Linux x86_64 if needed
const stagingNodeModules = path.join(buildStagingDir, "node_modules");
const forceClean = process.argv.includes("--clean");

if (!fs.existsSync(stagingNodeModules) || forceClean) {
  console.log("\n🐧 Step 3: Installing production dependencies for Linux x86_64 (glibc)...");
  console.log("   Fetching Linux x86_64 native binaries (including sharp for Linux)...");
  execSync(
    "npm install --omit=dev --os=linux --cpu=x64 --libc=glibc --ignore-scripts=false",
    {
      cwd: buildStagingDir,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    },
  );
} else {
  console.log("\n🐧 Step 3: Linux x86_64 production node_modules found in staging (reusing cache).");
  console.log("   (Pass --clean to force re-downloading dependencies)");
}

// 4. Copy compiled dist into staging
console.log("\n📁 Step 4: Copying dist/ into staging...");
fs.cpSync(distDir, path.join(buildStagingDir, "dist"), { recursive: true });

// 5. Create Zip package with explicit POSIX permissions
console.log(`\n🗜️  Step 5: Creating zip archive: ${path.basename(zipOutputFile)} with POSIX permissions...`);
if (fs.existsSync(zipOutputFile)) {
  fs.rmSync(zipOutputFile);
}

const output = fs.createWriteStream(zipOutputFile);
const archive = new ZipArchive({
  zlib: { level: 9 }, // Maximum compression
});

output.on("close", () => {
  const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log("\n==================================================");
  console.log(`✅ Success! Lambda deployment package created:`);
  console.log(`   File: ${zipOutputFile}`);
  console.log(`   Size: ${sizeMb} MB`);
  console.log(`   Target Architecture: Linux x86_64`);
  console.log(`   Lambda Handler: dist/lambda.handler`);
  console.log("==================================================");
  console.log("\nYou can now directly upload this file to AWS Lambda Console!");
});

archive.on("error", (err) => {
  console.error("Archive error:", err);
  process.exit(1);
});

archive.pipe(output);

// Append files from staging with standard Linux permissions (0o755 for exec/dir, 0o644 for files)
archive.directory(path.join(buildStagingDir, "dist"), "dist", (entry) => {
  entry.mode = 0o755;
  return entry;
});

archive.directory(path.join(buildStagingDir, "node_modules"), "node_modules", (entry) => {
  if (entry.name.endsWith(".so") || entry.name.endsWith(".node") || entry.name.includes("bin/")) {
    entry.mode = 0o755;
  } else {
    entry.mode = 0o644;
  }
  return entry;
});

archive.file(path.join(buildStagingDir, "package.json"), { name: "package.json", mode: 0o644 });

archive.finalize();
