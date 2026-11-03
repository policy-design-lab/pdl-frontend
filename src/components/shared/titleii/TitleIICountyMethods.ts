import { ALL_PRACTICES } from "./PracticeSelector";
import { TitleIICountyPracticeCategory, TitleIICountyRecord, TitleIICountyStatute } from "./Interface";

export interface TitleIICountyProgram {
    name: string;
    totalCategory: string;
    totalLabel: string;
    countyDistributionUrl: string;
}

export const getActivePractices = (selectedPractices: string[]): string[] =>
    selectedPractices.filter((practice) => practice && practice !== ALL_PRACTICES);

export const stripPracticeCode = (practice: string): string => practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "");

export const formatPracticeSelection = (selectedPractices: string[]): string => {
    if (!selectedPractices || selectedPractices.length === 0 || selectedPractices.includes(ALL_PRACTICES)) {
        return "";
    }
    if (selectedPractices.length <= 2) {
        return selectedPractices.join(", ");
    }
    return `${selectedPractices.length} Selected Practices`;
};

export const isTotalCategory = (program: TitleIICountyProgram, category: string): boolean =>
    category === program.totalCategory;

export const getCategoryLabel = (program: TitleIICountyProgram, category: string): string =>
    isTotalCategory(program, category) ? program.totalLabel : category;

export const getCountyTableTitle = (
    program: TitleIICountyProgram,
    category: string,
    year: string,
    selectedPractices: string[]
): string => {
    const practiceSummary = isTotalCategory(program, category) ? formatPracticeSelection(selectedPractices) : "";
    return `${getCategoryLabel(program, category)} Benefits by County (${year})${
        practiceSummary ? ` - ${practiceSummary}` : ""
    }`;
};

type CountyRecordInput = TitleIICountyRecord | null | undefined;

export const findCategoryRecord = (
    record: CountyRecordInput,
    category: string
): TitleIICountyStatute | TitleIICountyPracticeCategory | null => {
    if (!record || !Array.isArray(record.statutes)) {
        return null;
    }
    const statuteMatch = record.statutes.find((statute) => statute.statuteName === category);
    if (statuteMatch) {
        return statuteMatch;
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

export const getCategoryPayment = (
    program: TitleIICountyProgram,
    record: CountyRecordInput,
    category: string
): number => {
    if (isTotalCategory(program, category)) {
        return Number(record?.totalPaymentInDollars) || 0;
    }
    return Number(findCategoryRecord(record, category)?.totalPaymentInDollars) || 0;
};

export const getCategoryPercentageNationwide = (
    program: TitleIICountyProgram,
    record: CountyRecordInput,
    category: string
): number => {
    if (isTotalCategory(program, category)) {
        return Number(record?.totalPaymentInPercentageNationwide) || 0;
    }
    return Number(findCategoryRecord(record, category)?.totalPaymentInPercentageNationwide) || 0;
};

export const getCategoryPercentageWithinState = (
    program: TitleIICountyProgram,
    record: CountyRecordInput,
    category: string
): number => {
    if (isTotalCategory(program, category)) {
        return 100;
    }
    return Number(findCategoryRecord(record, category)?.totalPaymentInPercentageWithinState) || 0;
};
