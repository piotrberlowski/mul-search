export interface SearchFormPanelProps {
    children: React.ReactNode,
    title: string,
    className?: string,
}

export default function SearchInputPanel({
    children, title, className
}: SearchFormPanelProps) {
    return (
        <div className={`py-2 ${className}`}>
            <span className="text-slate-900 dark:text-slate-500">{title}</span>
            <br/>
            {children}
        </div>
    )
}
