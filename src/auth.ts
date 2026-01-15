import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import { DynamicPrismaAdapter } from "@/lib/auth-adapter";
import { getPrismaClient, Region } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DynamicPrismaAdapter(),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Naver({
      clientId: process.env.AUTH_NAVER_ID,
      clientSecret: process.env.AUTH_NAVER_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Only allow specific test account
        const TEST_ID = process.env.TEST_ID;
        const TEST_PASSWORD = process.env.TEST_PASSWORD;

        if (
          !TEST_ID ||
          !TEST_PASSWORD ||
          credentials?.email !== TEST_ID ||
          credentials?.password !== TEST_PASSWORD
        ) {
          console.log("[AuthDebug] Credentials Login Failed", {
            envTestId: TEST_ID,
            inputEmail: credentials?.email,
            match:
              credentials?.email === TEST_ID &&
              credentials?.password === TEST_PASSWORD,
          });
          return null;
        }

        // Determine Region Dynamic
        let region: Region = "KR";
        try {
          const headersList = await headers();
          if (headersList.get("x-application-region") === "GLOBAL") {
            region = "GLOBAL";
          }
        } catch (e) {}

        const prisma = getPrismaClient(region);

        // Upsert user to ensure valid foreign keys for test account
        const user = await prisma.user.upsert({
          where: { email: TEST_ID },
          update: {},
          create: {
            email: TEST_ID,
            name: "Test User",
            image: "",
            planType: "FREE",
          },
        });

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        // 베타 런칭 프로모션 혜택 지급
        const { grantBetaWelcomeBenefit } = await import("@/lib/billing");
        await grantBetaWelcomeBenefit(user.id);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
