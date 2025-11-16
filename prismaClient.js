import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // <-- REAL DB
}).$extends(
  withAccelerate({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
  })
);

export default prisma;
