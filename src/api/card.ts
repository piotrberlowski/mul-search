import { IUnit } from "@/api/unitListApi";

export interface Counters {
    heat?: number;
    dmg?: number;
    cr_eng?: number;
    cr_fc?: number;
    cr_wp?: number;
    cr_mp?: number; 
}

export type Counter = keyof Counters

export interface Card extends IUnit {
    MyId?: number;
    MySkill?: number;
    MyCalculatedPointValue?: number;
    MyBorderColor?: string;
    counters?: Counters;
}

export function processMoves<T>(move: string, consumer: (num: number, typ?: string) => T, modifier?: (v:number) => number): T[] {
    const originalParts = move.split('/');

    return originalParts.map(part => {
        const endingCharMatch = part.match(/[a-zA-Z]$/);
        const hasEndingChar = endingCharMatch && endingCharMatch.length > 0;
        const endingChar = hasEndingChar ? endingCharMatch[0] : undefined;

        const numberMatch = part.match(/\d+/g);
        let numberValue = numberMatch ? parseInt(numberMatch[0]) : 0;

        if (modifier) {
            numberValue = modifier(numberValue)
        }

        return consumer(numberValue, endingChar)
    })
}