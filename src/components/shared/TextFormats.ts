const POSSESSIVE_PATTERN = /([a-z])'S\b/g;

export function normalizePossessiveCasing(value: string): string {
    return value.replace(POSSESSIVE_PATTERN, (_match, precedingCharacter: string) => `${precedingCharacter}'s`);
}

export function cleanRegionName(value: string): string {
    if (!value) {
        return value;
    }
    return normalizePossessiveCasing(value).trim();
}
