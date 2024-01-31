import { Card, Counter, processMoves } from "@/api/card";

function moveToTMM(moveDistance: number): number {
    switch (true) {
        case moveDistance <= 4: return 0;
        case moveDistance <= 8: return 1;
        case moveDistance <= 12: return 2;
        case moveDistance <= 18: return 3;
        case moveDistance <= 34: return 4;
        case moveDistance <= 48: return 5;
        default: return 6;
    }
};

export type UpdateCallback = (card: Card) => void

export class UnitCardController {
    private card: Card;
    private updateCallback: UpdateCallback;

    constructor(
        card: Card,
        updateCallback: UpdateCallback,
    ) {
        this.card = card
        this.updateCallback = updateCallback
    }

    public getCard() {
        return this.card;
    }

    public inc(counter: Counter) {
        return this.updateCounter(counter, 1)
    }

    public dec(counter: Counter) {
        return this.updateCounter(counter, -1)
    }

    public set(counter: Counter, value: number) {
        if (!this.card.counters) {
            this.card.counters = {}
        }
        this.card.counters[counter] = value
        this.updateCallback(this.card)
        return value
    }

    private updateCounter(counter: Counter, adj: number) {
        const current = this.value(counter)
        return this.set(counter, current + adj)
    }

    public value(counter: Counter): number {        
        return this.card.counters?.[counter] ?? 0
    }

    public update(editedName: string, editedBorderColor: string) {
        this.card = {...this.card, Name: editedName, MyBorderColor: editedBorderColor}
        this.updateCallback(this.card)
    }
    
    private processMoves<T>(consumer: (v: number, t?: string) => T): T[] {
        const mpHits = this.value("cr_mp")
        return processMoves(this.card.BFMove, consumer, (v:number)=>{
            let numberValue = v
            for (let i = 0; i < mpHits; i++) {
                numberValue = Math.round(numberValue / 2);
            }
            return numberValue
        })
    };

    public getTmmString() {
        return this.processMoves((n, _) => { return n; }).map(moveToTMM).join('/');
    };

    public getMvString(hexes: boolean) {
        return this.processMoves((n, t) => {
            let adjustedMove = (t == 'j') ? n : Math.max(n - this.value("heat") * 2, 0)
            if (hexes) {
                adjustedMove = Math.floor(adjustedMove / 2)
            }
            return `${adjustedMove}${t || ''}`
        }).join('/')
    }

}