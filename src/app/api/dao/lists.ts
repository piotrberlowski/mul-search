'use server'

import { ConstrainedList, MulUnit, toMulUnits } from "@/api/shareApi";
import { Save, totalPV } from "@/api/unitListApi";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";
import prisma from "@/../lib/prisma"
import { findCurrentUserId } from "./users";
import { prismaOrError } from "./utils";

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
                    eraId: list.eraId,
                    factionId: list.factionId,
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

export async function findListsByCurrentUser(): Promise<{ key: string, name: string, constraints: string, total: number }[] | string> {
    const db = prismaOrError()
    return findCurrentUserId().then((userId): Promise<{ key: string, name: string, constraints: string, total: number }[] | string> => {
        if (!userId) return Promise.resolve("403: Forbidden.")
        return db.list.findMany({
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
            },
        }).then(lists => lists)
    })
}

export type ListWriteResult = { key: string } | { error: string }

export async function saveList(name: string, save: Save): Promise<ListWriteResult> {
    const db = prismaOrError()
    return findCurrentUserId().then((userId): Promise<ListWriteResult> => {
        if (!userId) return Promise.resolve({ error: "403: Forbidden." })
        const key = randomUUID()
        return db.list.create({
            data: {
                name: name,
                key: key,
                constraints: save.constraints,
                eraId: save.eraId,
                factionId: save.factionId,
                total: totalPV(save.units),
                content: toMulUnits(save.units),
                ownerId: userId,
            },
        }).then(() => ({ key }))
    })
}

export async function updateList(key: string, name: string, save: Save): Promise<string | null> {
    const db = prismaOrError()
    return findCurrentUserId().then((userId): Promise<string | null> => {
        if (!userId) return Promise.resolve("403: Forbidden.")
        return db.list.findFirst({
            where: { key, ownerId: userId },
            select: { id: true },
        }).then(existing => {
            if (!existing) return "List not found."
            return db.list.update({
                where: { id: existing.id },
                data: {
                    name,
                    constraints: save.constraints,
                    eraId: save.eraId,
                    factionId: save.factionId,
                    total: totalPV(save.units),
                    content: toMulUnits(save.units),
                },
            }).then(() => null)
        })
    })
}

export async function deleteListByKey(key: string) {
    const db = prismaOrError()
    return findCurrentUserId().then(userId => db.list.delete({
        where: {
            ownerId: userId,
            key: key,
        },
    }))
}