import { auth } from "@/app/auth"
import { prismaOrError } from "./utils"

export async function findCurrentUserId() {
    const db = prismaOrError()
    const session = await auth()
    if (!session?.externalAccount) {
        console.log("No session found!")
        throw new Error("403: Forbidden!")
    }
    const userId = await db.account.findFirst({
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