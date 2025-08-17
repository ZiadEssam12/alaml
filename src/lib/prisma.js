// import { PrismaClient } from "@/generated/prisma";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

// Create a singleton instance
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
