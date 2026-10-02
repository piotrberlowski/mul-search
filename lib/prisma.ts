import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.MUL_USE_DIRECT === '1'
    ? process.env.DB_URL_NON_POOLING
    : process.env.DB_PRISMA_URL
  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5000,
  })
  return new PrismaClient({ adapter })
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
