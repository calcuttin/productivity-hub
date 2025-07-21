import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // Your Prisma client instance

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('Missing GITHUB_ID or GITHUB_SECRET environment variables');
}

// Patch the PrismaAdapter to filter out refresh_token_expires_in
function PatchedPrismaAdapter(prisma: any) {
  const adapter = PrismaAdapter(prisma);
  const originalLinkAccount = adapter.linkAccount;
  adapter.linkAccount = (account) => {
    // Remove the problematic field
    const { refresh_token_expires_in, ...rest } = account;
    if (typeof originalLinkAccount === 'function') {
      return originalLinkAccount(rest);
    }
    // fallback: do nothing if not defined
    return Promise.resolve(null);
  };
  return adapter;
}

export const authOptions: AuthOptions = {
  adapter: PatchedPrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Add other providers here if needed
  ],
  secret: process.env.NEXTAUTH_SECRET, // Should be set in .env
  session: {
    strategy: 'jwt', // Using JWT for session strategy
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // The user parameter is only passed on first JWT creation (i.e. after sign in)
      // In subsequent calls, only token is available
      if (user) {
        token.sub = user.id; // user.id is from your Prisma User model
      }
      return token;
    },
  },
  // You can add custom pages for sign-in, sign-out, error, etc.
  // pages: {
  //   signIn: '/auth/signin',
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 