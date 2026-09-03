import "reflect-metadata";
import "dotenv/config";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { DataSource } from "typeorm";

import { AppModule } from "./app.module";
import type { AppConfig } from "./config/configuration";
import { validateEnv } from "./config/env";
import { setupSwagger } from "./config/swagger.config";
import { initSentry } from "./config/sentry.config";
import { globalValidationPipe } from "./common";

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
  const config = app.get(ConfigService<AppConfig, true>);

  const appCfg = config.get("app", { infer: true });

  app.use(
    helmet({
      // Relax CSP so swagger-ui can load its scripts and styles in non-production
      contentSecurityPolicy: appCfg.env === "production" ? undefined : false,
    }),
  );
  app.use(cookieParser());

  app.enableCors({
    origin: appCfg.corsOrigins.length > 0 ? appCfg.corsOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-request-id", "cookie"],
    exposedHeaders: ["x-request-id"],
  });

  app.useGlobalPipes(globalValidationPipe);
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

  // Mount Swagger in non-production environments
  if (appCfg.env !== "production") {
    setupSwagger(app, appCfg.port);
  }

  await app.listen(appCfg.port);

  // Startup Console Output
  console.log("");
  console.log(`🗄️  DB connected: ${isDbConnected ? "yes" : "no"}`);
  if (appCfg.env !== "production") {
    console.log(`📄 Swagger doc available on http://localhost:${appCfg.port}/api/docs`);
  }
  console.log(`🚀 Backend listening on http://localhost:${appCfg.port} (env: ${appCfg.env})`);
  console.log("");
}

void bootstrap();
