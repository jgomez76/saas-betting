import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/* ===================== */
/* 🔒 TIPOS PRO (SIN ANY) */
/* ===================== */

type GoogleProfile = {
  email: string;
  name: string;
  picture: string;
};

type GitHubProfile = {
  email: string;
  name: string;
  avatar_url: string;
};

/* ===================== */
/* 🔧 HELPER LIMPIO */
/* ===================== */

function mapProfileToToken(profile: unknown, provider: string) {
  if (provider === "google") {
    const p = profile as GoogleProfile;

    return {
      email: p.email,
      name: p.name,
      image: p.picture,
    };
  }

  if (provider === "github") {
    const p = profile as GitHubProfile;

    return {
      email: p.email,
      name: p.name,
      image: p.avatar_url,
    };
  }

  return {
    email: "",
    name: "",
    image: "",
  };
}

/* ===================== */
/* 🚀 NEXTAUTH CONFIG */
/* ===================== */

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    /* 🔐 LOGIN BACKEND */
    async signIn({ user, account }) {
      try {
        const res = await fetch("http://localhost:8000/oauth-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            avatar: user.image,
            provider: account?.provider,
          }),
        });

        // const data = await res.json();

        if (!res.ok) {
          // if (data.detail === "ACCOUNT_DISABLED") {
          //   return false;
          // }
          return true;
        }

        return true;
      } catch (err) {
        console.error("OAuth login error:", err);
        return false;
      }
    },

    /* 🧠 TOKEN */
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: { provider?: string } | null;
      profile?: unknown;
    }) {
      if (account && profile && account.provider) {
        const mapped = mapProfileToToken(profile, account.provider);

        token.email = mapped.email;
        token.name = mapped.name;
        token.image = mapped.image;
      }

      return token;
    },

    /* 👤 SESSION */
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;

      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/", // 👈 evita /api/auth/error
  },
});

export { handler as GET, handler as POST };