export interface CountyMetrics {
    totalIndemnitiesInDollars: number;
    totalPremiumInDollars: number;
    totalPremiumSubsidyInDollars: number;
    totalFarmerPaidPremiumInDollars: number;
    totalNetFarmerBenefitInDollars: number;
    totalPoliciesEarningPremium: number;
    totalLiabilitiesInDollars: number;
    totalInsuredAreaInAcres: number;
    averageLiabilitiesInDollars: number;
    averageInsuredAreaInAcres: number;
    lossRatio: number;
}

export interface CountyCommodityRecord extends Omit<
    CountyMetrics,
    "averageLiabilitiesInDollars" | "averageInsuredAreaInAcres"
> {
    commodityName: string;
}

export interface CountyRecord extends CountyMetrics {
    countyFips: string;
    stateFips: string;
    state: string;
    countyName: string;
    commodities?: CountyCommodityRecord[] | null;
}

export type CountyPayload = Record<string, CountyRecord[]>;

export interface CommodityBreakdownEntry extends CountyMetrics {
    yearBreakdown?: Record<string, CountyMetrics>;
}

export interface ProjectedCountyRecord extends CountyMetrics {
    countyFips: string;
    stateFips: string;
    state: string;
    countyName: string;
    yearBreakdown?: Record<string, CountyMetrics>;
    commodityBreakdown?: Record<string, CommodityBreakdownEntry>;
}

export type ProjectedCountyPayload = Record<string, ProjectedCountyRecord[]>;
