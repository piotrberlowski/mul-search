'use server'

import { Failure, failure, Result } from "@/api/result";
import { ConstrainedList, MulUnit, toMulUnits } from "@/api/shareApi";
import { Save, totalPV } from "@/api/unitListApi";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";
import prisma from "@/../lib/prisma"
import { findCurrentUserId } from "./users";
import { prismaOrError } from "./utils";

function listFields(name: string, save: Save) {
    return {
        name,
        constraints: save.constraints,
        eraId: save.eraId,
        factionId: save.factionId,
        total: totalPV(save.units),
        content: toMulUnits(save.units),
    }
}

function ownedByCurrentUser(): Promise<{ userId: string } | Failure> {
    return findCurrentUserId().then(
        userId => userId ? { userId } : failure('403: Forbidden.'),
        error => {
            console.error(error)
            const message = error instanceof Error ? error.message : ''
            return failure(message.includes('403') ? '403: Forbidden.' : 'Could not check the current user.')
        },
    )
}

export async function getFormatsWithPublicLists() {
    if (!prisma) return []
    return prisma.format.findMany({
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

export async function findListByKey(key: string): Promise<Result<ConstrainedList>> {
    if (!prisma) return failure('Unable to access Database.')
    return prisma.list.findUnique({
        where: { key: key }
    }).then(list => {
        if (!list?.content) return failure('List not found.')
        const value: ConstrainedList = {
            constraints: list.constraints,
            name: list.name,
            total: list.total,
            eraId: list.eraId,
            factionId: list.factionId,
            units: (list.content as Prisma.JsonArray).map(o => o as MulUnit),
        }
        return { value }
    }).catch(error => {
        console.error(error)
        return failure('Error loading list.')
    })
}

export async function findListsByCurrentUser(): Promise<Result<{ key: string, name: string, constraints: string, total: number }[]>> {
    return ownedByCurrentUser().then(auth => {
        if ('error' in auth) return auth
        return prismaOrError().list.findMany({
            select: {
                key: true,
                name: true,
                constraints: true,
                total: true,
            },
            where: {
                ownerId: auth.userId,
            },
            orderBy: {
                name: "asc",
            }
        }).then(lists => ({ value: lists }))
    })
}

export async function saveList(name: string, save: Save): Promise<Result<string>> {
    return ownedByCurrentUser().then(auth => {
        if ('error' in auth) return auth
        const key = randomUUID()
        return prismaOrError().list.create({
            data: {
                ...listFields(name, save),
                key,
                ownerId: auth.userId,
            }
        }).then(
            () => ({ value: key }),
            error => {
                console.error(error)
                return failure('Could not save the list.')
            },
        )
    })
}

export async function updateList(key: string, name: string, save: Save): Promise<Result<true>> {
    return ownedByCurrentUser().then(auth => {
        if ('error' in auth) return auth
        const db = prismaOrError()
        return db.list.findFirst({
            where: { key, ownerId: auth.userId },
            select: { id: true },
        }).then(existing => {
            if (!existing) return failure('List not found.')
            return db.list.update({
                where: { id: existing.id },
                data: listFields(name, save),
            }).then(
                () => ({ value: true as const }),
                error => {
                    console.error(error)
                    return failure('Could not save the list.')
                },
            )
        })
    })
}

export async function deleteListByKey(key: string): Promise<Result<true>> {
    return ownedByCurrentUser().then(auth => {
        if ('error' in auth) return auth
        const db = prismaOrError()
        return db.list.findFirst({
            where: { key, ownerId: auth.userId },
            select: { id: true },
        }).then(existing => {
            if (!existing) return failure('List not found.')
            return db.list.delete({
                where: { id: existing.id },
            }).then(
                () => ({ value: true as const }),
                error => {
                    console.error(error)
                    return failure('Could not delete that list.')
                },
            )
        })
    })
}
