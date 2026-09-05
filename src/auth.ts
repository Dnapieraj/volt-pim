import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const matches = await compare(password, user.passwordHash);
        if (!matches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      const id = String(token.id ?? "");
      if (!id) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id },
        select: { name: true, email: true, role: true },
      });
      if (!dbUser) {
        token.id = "";
        token.role = undefined;
        return token;
      }

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.role = dbUser.role;
      return token;
    },
  },
});

export const { GET, POST } = handlers;
