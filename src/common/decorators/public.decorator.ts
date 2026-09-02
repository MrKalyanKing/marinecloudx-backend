import { SetMetadata } from "@nestjs/common";

/** Marks a route (or a whole controller) as reachable without authentication. */
export const IS_PUBLIC_KEY = "mcx:isPublic";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
