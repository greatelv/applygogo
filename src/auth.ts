import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

import { grantBetaWelcomeBenefit } from "@/lib/billing";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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
        const MASTER_KEY = process.env.AUTH_MASTER_KEY;

        // Session Impersonation via Master Key
        if (credentials?.password === MASTER_KEY && credentials?.email) {
          const email = credentials.email as string;
          console.log(`[Auth] Impersonating user: ${email}`);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            return user;
          }

          console.log(`[Auth] User not found for impersonation: ${email}`);
          // If user doesn't exist, we fallback to normal auth or fail
        }

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

        // Upsert user to ensure valid foreign keys for test account
        const user = await prisma.user.upsert({
          where: { email: TEST_ID },
          update: {},
          create: {
            email: TEST_ID,
            name: "Test User",
            image: "",
            plan_type: "FREE",
            id: crypto.randomUUID(),
            updated_at: new Date(),
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
    async jwt({ token, user, trigger }) {
      // 로그인(signIn) 또는 회원가입(signUp) 시점에 혜택 누락 확인 및 지급
      // (Fail-safe: createUser 이벤트가 실패했거나, 과거에 누락된 경우 자동 복구)
      if (user && (trigger === "signIn" || trigger === "signUp")) {
        // 백그라운드에서 실행 (await 안함 - 로그인 지연 방지)
        grantBetaWelcomeBenefit(user.id).catch((e) =>
          console.error("[Auth] Fail-safe benefit grant failed:", e),
        );
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        // 베타 런칭 프로모션 혜택 지급 (Primary Attempt)
        try {
          await grantBetaWelcomeBenefit(user.id);
        } catch (error) {
          console.error("[Auth] Failed to grant beta benefit:", error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
