import {
  BadRequestException,
  ValidationPipe,
  type ValidationError,
  type ValidationPipeOptions,
} from "@nestjs/common";

/**
 * The global validation configuration.
 *
 * - `whitelist` strips properties the DTO does not declare, so a client cannot
 *   write a column just by naming it in the body — this is how "fields clients
 *   may never set" is enforced (the DTO simply omits them), matching the
 *   legacy Zod behaviour.
 * - `forbidNonWhitelisted: false` — extra keys are dropped silently rather than
 *   rejected, so an over-eager client is tolerated.
 * - `transform` turns plain payloads into DTO class instances and coerces
 *   primitive types (query strings → numbers/booleans) via implicit conversion.
 *
 * The thrown `BadRequestException` carries `message: string[]`, which
 * `AllExceptionsFilter` turns into `VALIDATION_ERROR` + `details[]`.
 */
/** Recursively flattens nested validation errors into `field.path: message`. */
function flatten(errors: ValidationError[], parent = ""): string[] {
  const out: string[] = [];
  for (const err of errors) {
    const path = parent ? `${parent}.${err.property}` : err.property;
    if (err.constraints) {
      for (const message of Object.values(err.constraints)) {
        out.push(`${path}: ${message}`);
      }
    }
    if (err.children && err.children.length > 0) {
      out.push(...flatten(err.children, path));
    }
  }
  return out.length > 0 ? out : ["request: validation failed"];
}

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
  transform: true,
  transformOptions: { enableImplicitConversion: false },
  stopAtFirstError: false,
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException({ statusCode: 400, message: flatten(errors) }),
};

export const globalValidationPipe = new ValidationPipe(validationPipeOptions);
