import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import https from "https";

// (optional) import your Sequelize models here
// import { User, Account } from "@/models";

const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        agent: insecureAgent
      },
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "r_liteprofile r_emailaddress w_member_social", // needed for posting
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // If you want to persist users/accounts, uncomment below and make sure User/Account are imported
      /*
      const existing = await User.findByPk(user.id);
      if (!existing) {
        await User.create({
          id: user.id,
          email: user.email,
          name: user.name,
        });
      }

      await Account.upsert({
        id: `${account.provider}-${account.providerAccountId}`,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        UserId: user.id,
      });
      */
      return true;
    },

    async jwt({ token, account, profile }) {
      // LinkedIn
      if (account?.provider === "linkedin") {
        token.linkedinAccessToken = account.access_token;
        token.linkedinId = profile.sub || profile.id;
      }

      // Facebook
      if (account?.provider === "facebook") {
        token.facebook = {
          accessToken: account.access_token,
        };
      }

      return token;
    },

    async session({ session, token }) {
      // LinkedIn
      if (token.linkedinAccessToken) {
        session.linkedin = {
          accessToken: token.linkedinAccessToken,
          id: token.linkedinId,
        };
      }

      // Facebook
      if (token.facebook) {
        session.facebook = token.facebook;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

console.log("Google client ID",process.env.GOOGLE_CLIENT_ID);