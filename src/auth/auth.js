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
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            cart: {
              include: {
                items: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                        price: true,
                        slug: true,
                        imageUrls: true,
                      },
                    },
                    variant: {
                      select: {
                        id: true,
                        price: true,
                        imageUrls: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.cart = dbUser.cart || { id: "", userId: "", items: [] };
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
        // Add cart to session
        session.cart = token.cart || { id: "", userId: "", items: [] };
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      return "/dashboard";
    },
  },
});
