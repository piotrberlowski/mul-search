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