import prisma from "../../../../lib/prisma"

export function prismaOrError() {
    if (!prisma) {
      console.log("No prisma client was available!")
      throw new Error("500: No DB!")
    }
    return prisma
}