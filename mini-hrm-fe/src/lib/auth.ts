import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NEXTAUTH_SECRET should be set in production environment
// Generate with: openssl rand -base64 32
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// Warn in development if secret is not set (NextAuth handles this in production)
if (!NEXTAUTH_SECRET && process.env.NODE_ENV === "development") {
  console.warn(
    "NEXTAUTH_SECRET is not set. NextAuth will use a default secret for development only.",
  );
  console.warn(
    "Generate a secure secret for production: openssl rand -base64 32",
  );
}

import { routes } from "@/constants/routes";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

        try {
          const res = await fetch(`${backendUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.user && data.access_token) {
            return {
              id:
                data.user.id?.toString() ||
                data.user.empCode ||
                Math.random().toString(),
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              empCode: data.user.empCode,
              avatar: data.user.avatar_url,
              accessToken: data.access_token,
            };
          }

          throw new Error(data?.message || data?.error || "Login failed");
        } catch (error) {
          console.error("Login authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.empCode = user.empCode;
        token.avatar = user.avatar;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.avatar) token.avatar = session.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.role = token.role;
          session.user.empCode = token.empCode;
          session.user.id = token.sub as string;
          session.user.avatar = (token.avatar as string) || undefined;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: routes.auth.login,
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - extends session with activity
  },
  secret: NEXTAUTH_SECRET,
};
