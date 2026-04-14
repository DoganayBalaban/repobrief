import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // Store stable GitHub numeric ID for rate limiting
      if (profile?.id) {
        token.githubId = String(profile.id);
      }
      return token;
    },
    session({ session, token }) {
      Object.assign(session, {
        accessToken: token.accessToken as string | undefined,
        githubId: token.githubId as string | undefined,
      });
      return session;
    },
  },
});
