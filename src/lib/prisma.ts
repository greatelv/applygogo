import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Ensure we append ?pgbouncer=true to the connection string for Supabase Transaction Mode
  // This prevents "prepared statement does not exist" errors
  const url = process.env.DATABASE_URL;

  if (url && !url.includes("pgbouncer=true") && !url.includes("pool_timeout")) {
    // Basic check to see if we should append it.
    // Ideally we only do this if we know we are in transaction mode.
    // But for Supabase users continuously hitting this, it's safer to add it or configure via `datasourceUrl`.
    // However, Prisma 5+ might handle this differently.
    // Let's just pass `datasources` config.
  }

  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL?.includes("pgbouncer=true")
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL?.includes("?")
      ? `${process.env.DATABASE_URL}&pgbouncer=true`
      : `${process.env.DATABASE_URL}?pgbouncer=true`,
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
