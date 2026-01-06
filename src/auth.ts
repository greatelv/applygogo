import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      name: "Dev Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "dev" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === "development") {
          const user = await prisma.user.upsert({
            where: { email: "dev@example.com" },
            update: {},
            create: {
              email: "dev@example.com",
              name: "Developer",
              image: "https://github.com/shadcn.png",
            },
          });
          return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
