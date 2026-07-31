// a front-end fix for the "O&#39;Brien County" issue that Ryan found. We won't need this anymore after backend fixes the issue.
const NAMED_HTML_ENTITIES: Record<string, string> = {
    "&amp;": "&",
    "&apos;": "'",
    "&gt;": ">",
    "&lt;": "<",
    "&nbsp;": " ",
    "&quot;": '"'
};

const NAMED_ENTITY_PATTERN = /&(?:amp|apos|gt|lt|nbsp|quot);/g;
const NUMERIC_ENTITY_PATTERN = /&#(x[0-9a-f]+|[0-9]+);/gi;
const POSSESSIVE_PATTERN = /([a-z])'S\b/g;

export function decodeHtmlEntities(value: string): string {
    if (!value || value.indexOf("&") === -1) {
        return value;
    }
    return value
        .replace(NUMERIC_ENTITY_PATTERN, (match, code: string) => {
            const codePoint =
                code[0].toLowerCase() === "x" ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10);
            if (!Number.isFinite(codePoint) || codePoint < 1 || codePoint > 0x10ffff) {
                return match;
            }
            try {
                return String.fromCodePoint(codePoint);
            } catch {
                return match;
            }
        })
        .replace(NAMED_ENTITY_PATTERN, (match) => NAMED_HTML_ENTITIES[match.toLowerCase()] || match);
}

export function normalizePossessiveCasing(value: string): string {
    return value.replace(POSSESSIVE_PATTERN, (_match, precedingCharacter: string) => `${precedingCharacter}'s`);
}

export function cleanRegionName(value: string): string {
    if (!value) {
        return value;
    }
    return normalizePossessiveCasing(decodeHtmlEntities(value)).trim();
}
