'use client'

import { ISelectedUnit } from "@/api/unitListApi"
import { BuilderValidation, EMPTY_VALIDATION, validateAgainstAvailability, validateLocal } from "@/app/(utilities)/validate/result/builderValidation"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function useListValidation(units: ISelectedUnit[]): BuilderValidation {
    const params = useSearchParams()
    const era = params.get("era")
    const specific = params.get("specific")
    const unitKey = units.map(unit => `${unit.ordinal}:${unit.Id}:${unit.skill}:${unit.Name}`).join(";")
    const unitsRef = useRef(units)
    unitsRef.current = units
    const [validation, setValidation] = useState<BuilderValidation>(EMPTY_VALIDATION)

    useEffect(() => {
        const current = unitsRef.current
        setValidation(validateLocal(current, era, specific))
        const controller = new AbortController()
        validateAgainstAvailability(current, era, specific, controller.signal)
            .then(result => {
                if (!controller.signal.aborted) setValidation(result)
            })
            .catch(error => {
                if (controller.signal.aborted) return
                console.log(error)
            })
        return () => controller.abort()
    }, [unitKey, era, specific])

    return validation
}
