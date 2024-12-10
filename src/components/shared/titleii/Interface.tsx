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
