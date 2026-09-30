import "reflect-metadata";
import "dotenv/config";

import { configure as serverlessExpress } from "@codegenie/serverless-express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { Context } from "aws-lambda";
import express from "express";

import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { validateEnv } from "./config/env";
import { initSentry } from "./config/sentry.config";

let cachedServer: any = null;

/**
 * Bootstraps the NestJS application wrapped in Express for AWS Lambda.
 *
 * Runs once during Lambda cold start and reuses the instance across subsequent
 * warm invocations.
 */
async function bootstrapServer(): Promise<any> {
  validateEnv();
  initSentry();

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: false,
  });

  configureApp(app);
  await app.init();

  return serverlessExpress({
    app: expressApp,
    binarySettings: {
      contentTypes: [
        "image/*",
        "multipart/form-data",
        "application/octet-stream",
      ],
    },
  });
}

/**
 * AWS Lambda handler entry point for Node.js 24 and later.
 *
 * Node.js 24+ in AWS Lambda strictly requires the async handler signature
 * with exactly 2 parameters: (event, context). Callback handlers are deprecated
 * and forbidden.
 */
export const handler = async (event: any, context: Context): Promise<any> => {
  // Prevent open PostgreSQL connection pool sockets from holding Lambda execution open
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  try {
    if (!cachedServer) {
      cachedServer = await bootstrapServer();
    }

    return await cachedServer(event, context);
  } catch (error: any) {
    console.error("❌ Fatal Lambda Handler Error:", error);

    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-request-id": context?.awsRequestId ?? "unknown",
      },
      isBase64Encoded: false,
      body: JSON.stringify({
        success: false,
        statusCode: 500,
        error: "INTERNAL_SERVER_ERROR",
        message: error?.message || "Internal Server Error",
      }),
    };
  }
};
