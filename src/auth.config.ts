import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isAppRole, isCatalogWritePath } from "@/lib/permissions";

function isPanelPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/import") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/users")
  );
}

function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const loggedIn = Boolean(auth?.user);

      if (isPanelPath(pathname) && !loggedIn) {
        return false;
      }

      if (isAuthPath(pathname) && loggedIn) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      }

      const role = isAppRole(auth?.user?.role) ? auth.user.role : undefined;
      if (role === "VIEWER" && isCatalogWritePath(pathname)) {
        return NextResponse.redirect(new URL("/products", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        const role = token.role;
        session.user.role =
          role === "ADMIN" || role === "EDITOR" || role === "VIEWER"
            ? role
            : "EDITOR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
