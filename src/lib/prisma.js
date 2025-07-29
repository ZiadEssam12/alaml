import { PrismaClient } from "@prisma/client";

// Properly define the global type to avoid TypeScript errors
// Note: If using JavaScript (not TypeScript), you can simplify this
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
