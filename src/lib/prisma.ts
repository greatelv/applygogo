// Prisma Client Re-generation Trigger
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prismaKr: PrismaClient;
  prismaGlobal: PrismaClient;
};

// ============================================================================
// 1. KR Region (Seoul) - Default
// ============================================================================
const connectionStringKr = process.env.DIRECT_URL!;
const poolKr = new Pool({ connectionString: connectionStringKr });
const adapterKr = new PrismaPg(poolKr);

export const prismaKr =
  globalForPrisma.prismaKr ||
  new PrismaClient({
    adapter: adapterKr,
    log: ["query"],
  });

// ============================================================================
// 2. Global Region (Singapore)
// ============================================================================
// Fallback to KR if GLOBAL var is missing (e.g. in local dev without env setup)
const connectionStringGlobal =
  process.env.DIRECT_URL_GLOBAL || process.env.DIRECT_URL!;

const poolGlobal = new Pool({ connectionString: connectionStringGlobal });
const adapterGlobal = new PrismaPg(poolGlobal);

export const prismaGlobal =
  globalForPrisma.prismaGlobal ||
  new PrismaClient({
    adapter: adapterGlobal,
    log: ["query"],
  });

// Singleton preservation in Dev
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaKr = prismaKr;
  globalForPrisma.prismaGlobal = prismaGlobal;
}

// ============================================================================
// Factory & Helper
// ============================================================================

export type Region = "KR" | "GLOBAL";

/**
 * Returns the appropriate PrismaClient instance based on the region.
 * @param region "KR" (default) or "GLOBAL"
 */
export function getPrismaClient(region: Region = "KR") {
  return region === "GLOBAL" ? prismaGlobal : prismaKr;
}

// Default export for backward compatibility
export const prisma = prismaKr;
