export interface PracticeName {
    practiceName: string;
    practiceCode: string;
}

export interface Practice {
    practiceName: string;
    practiceCode: string;
    totalPaymentInDollars: number;
}

export interface PracticeCategory {
    practiceCategoryName: string;
    totalPaymentInDollars: number;
    practices: Practice[];
}

export interface StatePerformance {
    state: string;
    totalPaymentInDollars: number;
    statutes: Array<{
        statuteName: string;
        totalPaymentInDollars: number;
        practiceCategories: PracticeCategory[];
    }>;
}

export interface PracticeMapProps {
    programName: string;
    initialStatePerformance: Record<string, StatePerformance[]>;
    allStates: any;
    year: string;
    stateCodes: any;
    practiceNames: Array<{
        practiceName: string;
        practiceCode: string;
    }>;
    onPracticeChange?: (practices: string[]) => void;
}

export interface TitleIICountyPractice {
    practiceName: string;
    totalPaymentInDollars: number;
}

export interface TitleIICountyPaymentShare {
    totalPaymentInDollars: number;
    totalPaymentInPercentageNationwide: number;
    totalPaymentInPercentageWithinState: number;
}

export interface TitleIICountyPracticeCategory extends TitleIICountyPaymentShare {
    practiceCategoryName: string;
    practices: TitleIICountyPractice[];
}

export interface TitleIICountyStatute extends TitleIICountyPaymentShare {
    statuteName: string;
    practiceCategories: TitleIICountyPracticeCategory[];
}

export interface TitleIICountyRecord {
    countyFips: string;
    countyName: string;
    state: string;
    totalPaymentInDollars: number;
    totalPaymentInPercentageNationwide: number;
    totalRecipients: number | null;
    totalFarms: number | null;
    totalContracts: number | null;
    totalAreaInAcres: number | null;
    totalRecipientsInPercentageNationwide: number | null;
    totalFarmsInPercentageNationwide: number | null;
    totalContractsInPercentageNationwide: number | null;
    totalAreaInPercentageNationwide: number | null;
    statutes: TitleIICountyStatute[];
}

export type TitleIICountyDistribution = Record<string, TitleIICountyRecord[]>;
