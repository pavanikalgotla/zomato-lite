// db/neon.ts — the one place in the app that knows how to talk to Neon.
// Both API endpoints import this, so we configure the connection once.

import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL as string);
