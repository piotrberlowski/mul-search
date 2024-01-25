import React, { useEffect } from "react";
import { useState } from "react";
import './Styles-CriticalHitsCircles.css'
import { UnitCardController } from "./MyUnitCardController";
import { Counter } from "@/api/card";

interface Props {
    count: number;
    controller: UnitCardController
    counter: Counter
}

function CriticalHitsCircles({ count, controller, counter }: Props) {
    const [hits, setHits] = useState(controller.value(counter));

    const handleCircleClick = (index: number) => {
        if (index < hits) {
            setHits(controller.dec(counter))
        } else {
            if (hits >= 4) return
            setHits(controller.inc(counter))
        }
    };

    return (
        <div>
            {Array(count).fill(false).map((_, idx) => (
                <button
                    key={idx}
                    className={`critical-hit-circle ${idx < hits ? 'clicked' : ''}`}
                    onClick={() => handleCircleClick(idx)}
                />
            ))}
        </div>
    );
};

export default CriticalHitsCircles;
