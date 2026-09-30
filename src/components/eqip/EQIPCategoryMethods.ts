import legendConfig from "../../utils/legendConfig.json";
import fipsToState from "../../files/maps/fipsToStateMap";
import { COUNTY_TOPOJSON_URL, loadTopoJson, normalizeCountyFips } from "../../utils/countyGeo";
import { TITLE_II_MAP_COLOR } from "../shared/ColorFunctions";

let countyNamesByFips: Record<string, string> | null = null;

export const loadCountyNames = async (): Promise<Record<string, string>> => {
    if (countyNamesByFips) {
        return countyNamesByFips;
    }
    const topo = (await loadTopoJson(COUNTY_TOPOJSON_URL)) as any;
    const geometries = topo?.objects?.counties?.geometries ?? [];
    const names: Record<string, string> = {};
    geometries.forEach((geometry: any) => {
        const fips = normalizeCountyFips(geometry?.id);
        if (fips && geometry?.properties?.name) {
            names[fips] = geometry.properties.name;
        }
    });
    countyNamesByFips = names;
    return names;
};

export const enrichCountyRecords = (
    payload: Record<string, any>,
    countyNames: Record<string, string>
): Record<string, any> => {
    const enriched: Record<string, any> = {};
    Object.entries(payload || {}).forEach(([yearKey, records]) => {
        if (!Array.isArray(records)) {
            enriched[yearKey] = records;
            return;
        }
        enriched[yearKey] = records.map((record: any) => {
            if (record?.state && record?.countyName) {
                return record;
            }
            const fips = normalizeCountyFips(record?.countyFips);
            const stateFips = fips ? fips.slice(0, 2) : "";
            return {
                ...record,
                stateFips: record?.stateFips ?? stateFips,
                state: record?.state ?? fipsToState[stateFips] ?? "",
                countyName: record?.countyName ?? (fips ? countyNames[fips] : "") ?? ""
            };
        });
    });
    return enriched;
};

export const EQIP_TOTAL_CATEGORY = "Total EQIP Benefits";

export const EQIP_MAP_COLOR = TITLE_II_MAP_COLOR;

export const EQIP_CATEGORIES = [
    EQIP_TOTAL_CATEGORY,
    "Land management",
    "Forest management",
    "Structural",
    "Soil remediation",
    "Vegetative",
    "Other improvements",
    "Soil testing",
    "Other planning",
    "Conservation planning assessment",
    "Resource-conserving crop rotation",
    "Soil health",
    "Comprehensive Nutrient Mgt."
];

export const isTotalCategory = (category: string): boolean => category === EQIP_TOTAL_CATEGORY;

export const formatPracticeSelection = (selectedPractices: string[]): string => {
    if (!selectedPractices || selectedPractices.length === 0 || selectedPractices.includes("All Practices")) {
        return "";
    }
    if (selectedPractices.length <= 2) {
        return selectedPractices.join(", ");
    }
    return `${selectedPractices.length} Selected Practices`;
};

export const getLegendConfigKey = (category: string): string => (isTotalCategory(category) ? "Total EQIP" : category);

export const getCategoryThresholds = (category: string): number[] =>
    legendConfig[getLegendConfigKey(category)] || legendConfig["Total EQIP"];

export const findCategoryRecord = (record: any, category: string): any => {
    if (!record || !Array.isArray(record.statutes)) {
        return null;
    }
    let found = null;
    record.statutes.forEach((statute: any) => {
        if (!Array.isArray(statute.practiceCategories)) {
            return;
        }
        const match = statute.practiceCategories.find((c: any) => c.practiceCategoryName === category);
        if (match) {
            found = match;
        }
    });
    return found;
};

export const getCategoryPayment = (record: any, category: string): number => {
    if (isTotalCategory(category)) {
        return Number(record?.totalPaymentInDollars) || 0;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInDollars) || 0;
};

export const getCategoryPercentageNationwide = (record: any, category: string): number => {
    if (isTotalCategory(category)) {
        return Number(record?.totalPaymentInPercentageNationwide) || 0;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInPercentageNationwide) || 0;
};

export const getCategoryPercentageWithinState = (record: any, category: string): number => {
    if (isTotalCategory(category)) {
        return 100;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInPercentageWithinState) || 0;
};
