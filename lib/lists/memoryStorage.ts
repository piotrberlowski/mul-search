export function installMemoryStorage(): Map<string, string> {
    const memory = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
            getItem: (key: string) => memory.get(key) ?? null,
            setItem: (key: string, value: string) => { memory.set(key, String(value)) },
            removeItem: (key: string) => { memory.delete(key) },
            clear: () => { memory.clear() },
            key: (index: number) => [...memory.keys()][index] ?? null,
            get length() { return memory.size },
        },
    })
    return memory
}
