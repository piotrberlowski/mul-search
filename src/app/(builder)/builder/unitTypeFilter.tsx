'use client'

import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { SHORT_LABEL, type UnitTypeOption } from './unitTypes'

function labelFor(type: UnitTypeOption, expanded: boolean) {
    if (!expanded) {
        const short = SHORT_LABEL[type.slug as keyof typeof SHORT_LABEL]
        if (short) return short
    }
    return type.name
}

function TypeButton({
    label,
    selected,
    onClick,
}: {
    label: string
    selected: boolean
    onClick: () => void
}) {
    const Mark = selected ? CheckIcon : XMarkIcon
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`btn btn-xs !h-6 !min-h-6 sm:!h-7 sm:!min-h-7 !w-auto !mx-0 !px-1 sm:!px-2 gap-0.5 sm:gap-1 shrink-0 normal-case font-normal !text-[10px] !leading-none sm:!text-xs border ${
                selected
                    ? '!bg-red-100 !text-red-950 !border-red-700 shadow-sm dark:!bg-red-800 dark:!text-white dark:!border-red-400'
                    : '!bg-gray-200 !text-gray-400 !border-gray-300 dark:!bg-neutral-900 dark:!text-neutral-500 dark:!border-neutral-700'
            }`}
        >
            <Mark className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden />
            {label}
        </button>
    )
}

export default function UnitTypeFilter({
    folded,
    all,
    selected,
    expanded,
    onToggle,
    onClear,
    onExpanded,
}: {
    folded: UnitTypeOption[]
    all: UnitTypeOption[]
    selected: ReadonlySet<number>
    expanded: boolean
    onToggle: (id: number) => void
    onClear: () => void
    onExpanded: (expanded: boolean) => void
}) {
    const foldedIds = new Set(folded.map((type) => type.id))
    const extras = all.filter((type) => !foldedIds.has(type.id) && selected.has(type.id))
    const shown = expanded ? all : [...folded, ...extras]
    return (
        <div className="flex flex-nowrap items-start gap-0.5 sm:gap-1 p-0.5 sm:p-1">
            <div className={`flex min-w-0 flex-1 gap-0.5 sm:gap-1 ${expanded ? 'flex-wrap' : 'flex-nowrap overflow-x-auto'}`}>
                {shown.map((type) => (
                    <TypeButton
                        key={type.id}
                        label={labelFor(type, expanded)}
                        selected={selected.has(type.id)}
                        onClick={() => onToggle(type.id)}
                    />
                ))}
            </div>
            <div className="flex shrink-0 gap-0.5 sm:gap-1">
                <button
                    type="button"
                    title="Clear unit types"
                    aria-label="Clear unit types"
                    onClick={onClear}
                    className="btn btn-xs btn-square !h-6 !min-h-6 !w-6 sm:!h-7 sm:!min-h-7 sm:!w-7 !mx-0 !text-[10px] sm:!text-xs !border-gray-400 !bg-transparent !text-current"
                >
                    <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Show fewer unit types' : 'Show all unit types'}
                    title={expanded ? 'Show fewer unit types' : 'Show all unit types'}
                    onClick={() => onExpanded(!expanded)}
                    className="btn btn-xs btn-square !h-6 !min-h-6 !w-6 sm:!h-7 sm:!min-h-7 sm:!w-7 !mx-0 !text-[10px] sm:!text-xs !border-gray-400 !bg-transparent !text-current"
                >
                    {expanded
                        ? <ChevronUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        : <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                </button>
            </div>
        </div>
    )
}
