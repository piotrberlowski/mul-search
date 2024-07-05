import { auth } from "@/app/auth"

export async function findCurrentUserId() {
    if (!prisma) throw new Error("500: No DB!")
    const session = await auth()
    if (!session?.externalAccount) throw new Error("403: Forbidden!")
    const userId = await prisma.account.findFirst({
        where: {
            providerAccountId: session.externalAccount
        },
        include: {
            user: true
        }
    }
    ).then((accAndUser) => accAndUser?.userId)
    return userId
}