import { Card, Counter } from "@/api/card";

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

    private processMoves<T>(consumer: (v: number, t?: string) => T): T[] {
        const originalParts = this.card.BFMove.split('/');
        const mpHits = this.value("cr_mp")

        return originalParts.map(part => {
            const endingCharMatch = part.match(/[a-zA-Z]$/);
            const hasEndingChar = endingCharMatch && endingCharMatch.length > 0;
            const endingChar = hasEndingChar ? endingCharMatch[0] : undefined;

            const numberMatch = part.match(/\d+/g);
            let numberValue = numberMatch ? parseInt(numberMatch[0]) : 0;

            // half MV for critical hits
            for (let i = 0; i < mpHits; i++) {
                numberValue = Math.round(numberValue / 2);
            }

            return consumer(numberValue, endingChar)
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

    public getNameFontSize() {
        const name = this.card.Name
        if (name.length > 46) {
            return 'text-xs'
        } else if (name.length > 38) {
            return 'text-sm';
        } else if (name.length > 32) {
            return 'text-base';
        } else if (name.length > 26) {
            return 'test-lg';
        } else if (name.length > 18) {
            return 'text-xl';
        } else {
            return 'text-2xl';  // default size
        }
    };


}