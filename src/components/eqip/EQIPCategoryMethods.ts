import legendConfig from "../../utils/legendConfig.json";
import { TITLE_II_MAP_COLOR } from "../shared/ColorFunctions";
import { TitleIICountyPracticeCategory, TitleIICountyRecord } from "../shared/titleii/Interface";

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

export const findCategoryRecord = (
    record: TitleIICountyRecord | null | undefined,
    category: string
): TitleIICountyPracticeCategory | null => {
    if (!record || !Array.isArray(record.statutes)) {
        return null;
    }
    let found: TitleIICountyPracticeCategory | null = null;
    record.statutes.forEach((statute) => {
        if (!Array.isArray(statute.practiceCategories)) {
            return;
        }
        const match = statute.practiceCategories.find((c) => c.practiceCategoryName === category);
        if (match) {
            found = match;
        }
    });
    return found;
};

export const getCategoryPayment = (record: TitleIICountyRecord | null | undefined, category: string): number => {
    if (isTotalCategory(category)) {
        return Number(record?.totalPaymentInDollars) || 0;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInDollars) || 0;
};

export const getCategoryPercentageNationwide = (
    record: TitleIICountyRecord | null | undefined,
    category: string
): number => {
    if (isTotalCategory(category)) {
        return Number(record?.totalPaymentInPercentageNationwide) || 0;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInPercentageNationwide) || 0;
};

export const getCategoryPercentageWithinState = (
    record: TitleIICountyRecord | null | undefined,
    category: string
): number => {
    if (isTotalCategory(category)) {
        return 100;
    }
    const categoryRecord = findCategoryRecord(record, category);
    return Number(categoryRecord?.totalPaymentInPercentageWithinState) || 0;
};
