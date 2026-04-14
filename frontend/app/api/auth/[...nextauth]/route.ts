import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

type OAuthProfile = {
  email?: string;
  name?: string;
  picture?: string;     // Google
  avatar_url?: string;  // GitHub
};

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
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: unknown;
      profile?: OAuthProfile;
    }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.image = profile.picture || profile.avatar_url;
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };