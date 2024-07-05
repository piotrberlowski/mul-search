import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export function prismaOrError() {
    if (!prisma) throw new Error("500: No DB!")
    return prisma
}

export default prisma;