import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global;

// Create a singleton instance
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Only assign to global object in development to prevent memory leaks
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
