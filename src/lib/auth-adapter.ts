import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import { headers } from "next/headers";
import { getPrismaClient, Region } from "./prisma";

/**
 * Dynamic Prisma Adapter that switches DB based on "x-application-region" header.
 */
export function DynamicPrismaAdapter(): Adapter {
  return {
    ...PrismaAdapter(getPrismaClient("KR")), // Default to KR for methods we don't override? No, we must proxy all.
    // Actually, we can just return a Proxy that delegates all calls
    // because Adapter interface is simply a collection of functions.

    createUser: async (user) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).createUser!(user) as any;
    },
    getUser: async (id) => {
      // NOTE: getUser is tricky because ID doesn't tell us the region.
      // But usually this is called with context.
      // IF we are in a request context, we use the header.
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).getUser!(id) as any;
    },
    getUserByEmail: async (email) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).getUserByEmail!(email) as any;
    },
    getUserByAccount: async (provider_providerAccountId) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).getUserByAccount!(
        provider_providerAccountId
      ) as any;
    },
    updateUser: async (user) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).updateUser!(user) as any;
    },
    deleteUser: async (userId) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).deleteUser!(userId) as any;
    },
    linkAccount: async (account) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).linkAccount!(account) as any;
    },
    unlinkAccount: async (provider_providerAccountId) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).unlinkAccount!(
        provider_providerAccountId
      ) as any;
    },
    createSession: async (session) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).createSession!(session) as any;
    },
    getSessionAndUser: async (sessionToken) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).getSessionAndUser!(sessionToken) as any;
    },
    updateSession: async (session) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).updateSession!(session) as any;
    },
    deleteSession: async (sessionToken) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).deleteSession!(sessionToken) as any;
    },
    createVerificationToken: async (verificationToken) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).createVerificationToken!(
        verificationToken
      ) as any;
    },
    useVerificationToken: async (identifier_token) => {
      const region = await getRegion();
      const client = getPrismaClient(region);
      return PrismaAdapter(client).useVerificationToken!(
        identifier_token
      ) as any;
    },
  };
}

// Helper to get region from headers
async function getRegion(): Promise<Region> {
  try {
    const headersList = await headers();
    const regionHeader = headersList.get("x-application-region");
    if (regionHeader === "GLOBAL") return "GLOBAL";
    return "KR";
  } catch (e) {
    // If called outside of request context (e.g. build time), default to KR
    return "KR";
  }
}
