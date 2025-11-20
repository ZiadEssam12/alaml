import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const { email, name } = user;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            name,
          },
        });
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      // On initial sign-in, set user id and role
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
        };
        // Don't add cart directly to session - it contains non-serializable objects
        // Fetch cart data from database when needed instead
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      return "/dashboard";
    },
  },
});
