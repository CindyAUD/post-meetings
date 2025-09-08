// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import { db } from "@/models";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline", // required for refresh tokens
          prompt: "consent",      // always ask, enables multiple accounts
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.provider = token.provider;
      }
      return session;
    },

    // Persist OAuth accounts into Sequelize DB
    async signIn({ user, account }) {
      if (account) {
        try {
          await db.Account.upsert({
            id: `${account.provider}-${account.providerAccountId}`,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
            scope: account.scope,
            UserId: user.id || user.email, // depends on how you define user IDs
          });
        } catch (err) {
          console.error("❌ Failed to persist account", err);
        }
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);
