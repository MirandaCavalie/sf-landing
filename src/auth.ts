import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";

// Env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_LINKEDIN_ID, AUTH_LINKEDIN_SECRET
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    // LinkedIn's OpenID Connect only exposes name, photo and email.
    // Searching people or sending DMs is not available to third-party apps.
    LinkedIn,
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleExpiresAt = account.expires_at;
      }
      if (account?.provider === "linkedin") token.linkedin = true;
      return token;
    },
    async session({ session, token }) {
      session.connected = {
        google: Boolean(token.googleAccessToken) && Date.now() / 1000 < Number(token.googleExpiresAt ?? 0),
        linkedin: Boolean(token.linkedin),
      };
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    connected: { google: boolean; linkedin: boolean };
  }
}

// Server-only: read the Google token from the encrypted JWT (never sent to the browser).
export { getToken } from "next-auth/jwt";
