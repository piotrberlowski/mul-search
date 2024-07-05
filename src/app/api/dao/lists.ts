'use server'

import { ConstrainedList, MulUnit, toMulUnits } from "@/api/shareApi";
import { Save, totalPV } from "@/api/unitListApi";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import prisma, { prismaOrError } from "../../../../lib/prisma";
import { findCurrentUserId } from "./users";

export async function getFormatsWithPublicLists() {
    if (!prisma) return []
    return await prisma.format.findMany({
        include: {
            lists: {
                where: {
                    owner: {
                        is: null
                    }
                }
            }
        },
    })
}

export async function findListByKey(key: string): Promise<ConstrainedList> {
    if (!prisma) {
        return Promise.resolve({
            constraints: "Server Error!",
            name: "Unable to access Database.",
            total: 0,
            units: []
        })
    }

    return prisma.list.findUnique({
        where: { key: key }
    }).then(
        (list) => {
            if (list && list.content) {
                return {
                    constraints: list.constraints,
                    name: list.name,
                    total: list.total,
                    units: (list.content as Prisma.JsonArray).map(o => o as MulUnit),
                }
            }
            return {
                constraints: "List not found",
                name: "Empty",
                total: 0,
                units: [],
            }
        }
    ).catch(e => {
        console.error(e)
        return {
            constraints: e as string,
            name: "Error loading list!",
            total: 0,
            units: [],
        }
    })
}

export async function findListsByCurrentUser() {
    const prisma = prismaOrError()
    const userId = await findCurrentUserId()
    if (!userId) return "403: Forbidden."
    const lists = await prisma.list.findMany({
        select: {
            key: true,
            name: true,
            constraints: true,
            total: true,
        },
        where: {
            ownerId: userId,
        },
        orderBy: {
            name: "asc",
        }
    })
    return lists
}

export async function saveList(name: string, save: Save) {
    const prisma = prismaOrError()
    const userId = await findCurrentUserId()
    if (!userId) return "403: Forbidden."
    await prisma?.list.create({
        data: {
            name: name,
            key: randomUUID(),
            constraints: save.constraints,
            total: totalPV(save.units),
            content: toMulUnits(save.units),
            ownerId: userId
        }
    })
    return null
}

export async function deleteListByKey(key: string) {
    const prisma = prismaOrError()
    const userId = await findCurrentUserId()
    const result = await prisma.list.delete(
        {
            where: {
                ownerId: userId,
                key: key,
            }
        }
    )
    return result
}