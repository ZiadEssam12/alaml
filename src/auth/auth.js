import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const { email, name } = user;

      // Check if the user exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      // If the user does not exist, create a new user with a default role of 'user'
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            name,
            role: "admin", // Default role
          },
        });
      }

      return true; // Allow sign-in
    },
  },
});
