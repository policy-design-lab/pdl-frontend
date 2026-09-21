export const CROP_INSURANCE_START_YEAR = 2014;
export const CROP_INSURANCE_END_YEAR = 2024;
export const CROP_INSURANCE_YEARS: string[] = Array.from(
    { length: CROP_INSURANCE_END_YEAR - CROP_INSURANCE_START_YEAR + 1 },
    (_, index) => String(CROP_INSURANCE_START_YEAR + index)
);
export const DEFAULT_SELECTED_YEARS: string[] = [String(CROP_INSURANCE_END_YEAR)];
export type YearResolution =
    | { status: "ok"; keys: string[]; yearCount: number }
    | { status: "unavailable"; reason: string; selected: string[] };

const NO_YEARS_SELECTED = "Select at least one crop year to view county data.";

const NO_DATA_FOR_YEARS = "County data for the selected crop years is not available yet.";

export function resolveYearKeys(selectedYears: string[], payloadKeys: string[]): YearResolution {
    const unique = Array.from(new Set(selectedYears)).sort();
    if (unique.length === 0) {
        return { status: "unavailable", reason: NO_YEARS_SELECTED, selected: [] };
    }
    const keys = unique.filter((year) => payloadKeys.includes(year));
    if (keys.length === 0) {
        return { status: "unavailable", reason: NO_DATA_FOR_YEARS, selected: unique };
    }
    return { status: "ok", keys, yearCount: keys.length };
}
