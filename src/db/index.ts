import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: NodePgDatabase<typeof schema>;
};

function createDb(): NodePgDatabase<typeof schema> {
  if (!databaseUrl) {
    // Return a proxy that throws when accessed - allows build to pass
    // but fails fast at runtime if DATABASE_URL is missing
    return new Proxy({} as NodePgDatabase<typeof schema>, {
      get(_target, prop) {
        if (prop === "then") return undefined; // not a promise
        throw new Error(
          `DATABASE_URL is not configured. Cannot access db.${String(prop)}`
        );
      },
    });
  }

  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    const pool = new Pool({ connectionString: databaseUrl });
    globalForDb.__arenaNextJsPostgresqlPool = pool;
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(pool, { schema });
  }

  return globalForDb.__arenaNextJsPostgresqlDb;
}

export const db: NodePgDatabase<typeof schema> = createDb();
export { databaseUrl };
