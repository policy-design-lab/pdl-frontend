export function reconcileAllSentinel(nextValue: string[], currentValue: string[], sentinel: string): string[] {
    if (nextValue.includes(sentinel) && !currentValue.includes(sentinel)) {
        return [sentinel];
    }
    if (nextValue.length === 0) {
        return [sentinel];
    }
    return nextValue.filter((item) => item !== sentinel);
}

export function removeWithSentinelFallback(current: string[], toRemove: string, sentinel: string): string[] {
    if (current.length > 1) {
        return current.filter((item) => item !== toRemove);
    }
    return [sentinel];
}

export function toggleIndexNeverEmpty(current: number[], index: number): number[] {
    if (current.includes(index)) {
        if (current.length > 1) {
            return current.filter((item) => item !== index);
        }
        return current;
    }
    return [...current, index];
}
