import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";

import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { validateEnv } from "./config/env";
import { initSentry } from "./config/sentry.config";

/**
 * Bootstrap.
 *
 * Order matters: env is validated before anything is constructed, then the
 * security middleware, then the global pipe. The response envelope, exception
 * filter and capabilities guard are registered in `AppModule`.
 */
async function bootstrap(): Promise<void> {
  validateEnv();
  initSentry();

  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const { port, env } = configureApp(app);
  app.enableShutdownHooks();

  let isDbConnected = false;
  try {
    const dataSource = app.get(DataSource, { strict: false });
    if (dataSource?.isInitialized) {
      isDbConnected = true;
    }
  } catch {
    isDbConnected = false;
  }

  await app.listen(port);

  // Startup Console Output
  console.log("");
  console.log(`🗄️  DB connected: ${isDbConnected ? "yes" : "no"}`);
  console.log(`📄 Swagger doc available on http://localhost:${port}/api/docs`);
  console.log(`🚀 Backend listening on http://localhost:${port} (env: ${env})`);
  console.log("");
}

void bootstrap();
