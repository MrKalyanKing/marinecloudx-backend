import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import type { AppConfig } from "./config/configuration";
import { setupSwagger } from "./config/swagger.config";
import { globalValidationPipe } from "./common";

/**
 * Applies all shared middleware, security headers, CORS, validation pipes,
 * and Swagger documentation to the Nest application instance.
 *
 * This guarantees identical behavior between the standalone server (main.ts)
 * and the AWS Lambda serverless handler (lambda.ts).
 */
export function configureApp(app: INestApplication): { port: number; env: string } {
  const config = app.get(ConfigService<AppConfig, true>);
  const appCfg = config.get("app", { infer: true });

  app.use(
    helmet({
      // Relax CSP so swagger-ui can load its scripts and styles
      contentSecurityPolicy: false,
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

  // Mount Swagger docs unless explicitly disabled for ultra-fast cold starts
  if (process.env.DISABLE_SWAGGER !== "true") {
    setupSwagger(app, appCfg.port);
  }

  return { port: appCfg.port, env: appCfg.env };
}
