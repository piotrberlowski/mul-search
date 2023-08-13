export interface SearchFormPanelProps {
    children: React.ReactNode,
    title: string
}

export default function SearchInputPanel({
    children, title
}: SearchFormPanelProps) {
    return (
        <div className="p-2">
            <span className="text-slate-900 dark:text-slate-500">{title}</span>
            <br/>
            {children}
        </div>
    )
}
