import { bucketForCommodityName, isAllCropsSelected, selectableCrops } from "./commodityMapping";
import {
    CommodityBreakdownEntry,
    CountyMetrics,
    CountyPayload,
    CountyRecord,
    ProjectedCountyPayload,
    ProjectedCountyRecord
} from "./types";

export const SUMMABLE_METRICS = [
    "totalIndemnitiesInDollars",
    "totalPremiumInDollars",
    "totalPremiumSubsidyInDollars",
    "totalFarmerPaidPremiumInDollars",
    "totalNetFarmerBenefitInDollars",
    "totalPoliciesEarningPremium",
    "totalLiabilitiesInDollars",
    "totalInsuredAreaInAcres"
] as const;

export type SummableMetric = (typeof SUMMABLE_METRICS)[number];

function emptyMetrics(): CountyMetrics {
    return {
        totalIndemnitiesInDollars: 0,
        totalPremiumInDollars: 0,
        totalPremiumSubsidyInDollars: 0,
        totalFarmerPaidPremiumInDollars: 0,
        totalNetFarmerBenefitInDollars: 0,
        totalPoliciesEarningPremium: 0,
        totalLiabilitiesInDollars: 0,
        totalInsuredAreaInAcres: 0,
        averageLiabilitiesInDollars: 0,
        averageInsuredAreaInAcres: 0,
        lossRatio: 0
    };
}

function addInto(target: CountyMetrics, source: Partial<CountyMetrics>): void {
    for (let i = 0; i < SUMMABLE_METRICS.length; i += 1) {
        const metric = SUMMABLE_METRICS[i];
        target[metric] += Number(source[metric]) || 0;
    }
}

function applyDerivedMetrics(target: CountyMetrics, yearCount: number): void {
    const years = yearCount > 0 ? yearCount : 1;
    target.lossRatio =
        target.totalPremiumInDollars > 0
            ? Math.round((target.totalIndemnitiesInDollars / target.totalPremiumInDollars) * 1000) / 1000
            : 0;
    target.averageLiabilitiesInDollars = Math.round(target.totalLiabilitiesInDollars / years);
    target.averageInsuredAreaInAcres = Math.round(target.totalInsuredAreaInAcres / years);
}

function newProjectedRecord(record: CountyRecord): ProjectedCountyRecord {
    return {
        ...emptyMetrics(),
        countyFips: record.countyFips,
        stateFips: record.stateFips,
        state: record.state,
        countyName: record.countyName,
        yearBreakdown: {},
        commodityBreakdown: {}
    };
}

export function projectCountyByCommodity(
    raw: CountyPayload,
    yearKeys: string[],
    selectedCropIds: string[],
    yearCount: number
): ProjectedCountyPayload {
    if (!raw || yearKeys.length === 0) {
        return {};
    }
    const primaryKey = yearKeys[0];
    const allCrops = isAllCropsSelected(selectedCropIds);
    const cropsToTrack = allCrops ? selectableCrops() : selectedCropIds;
    const selected = new Set(cropsToTrack);
    const byFips = new Map<string, ProjectedCountyRecord>();
    yearKeys.forEach((yearKey) => {
        const records = raw[yearKey] ?? [];
        records.forEach((record) => {
            let projected = byFips.get(record.countyFips);
            if (!projected) {
                projected = newProjectedRecord(record);
                byFips.set(record.countyFips, projected);
            }
            const yearMetrics = emptyMetrics();
            const commodities = record.commodities ?? [];
            commodities.forEach((commodity) => {
                const bucket = bucketForCommodityName(commodity.commodityName);
                if (!selected.has(bucket)) {
                    return;
                }
                addInto(yearMetrics, commodity);
                const breakdown = projected as Required<ProjectedCountyRecord>;
                if (!breakdown.commodityBreakdown[bucket]) {
                    breakdown.commodityBreakdown[bucket] = { ...emptyMetrics(), yearBreakdown: {} };
                }
                const cropEntry = breakdown.commodityBreakdown[bucket];
                addInto(cropEntry, commodity);
                if (!cropEntry.yearBreakdown) {
                    cropEntry.yearBreakdown = {};
                }
                if (!cropEntry.yearBreakdown[yearKey]) {
                    cropEntry.yearBreakdown[yearKey] = emptyMetrics();
                }
                addInto(cropEntry.yearBreakdown[yearKey], commodity);
            });
            addInto(projected, yearMetrics);
            applyDerivedMetrics(yearMetrics, 1);
            (projected.yearBreakdown as Record<string, CountyMetrics>)[yearKey] = yearMetrics;
        });
    });
    const results: ProjectedCountyRecord[] = [];
    byFips.forEach((record) => {
        applyDerivedMetrics(record, yearCount);
        const crops = record.commodityBreakdown as Record<string, CommodityBreakdownEntry>;
        cropsToTrack.forEach((crop) => {
            if (!crops[crop]) {
                crops[crop] = { ...emptyMetrics(), yearBreakdown: {} };
            }
            const entry = crops[crop];
            applyDerivedMetrics(entry, yearCount);
            yearKeys.forEach((yearKey) => {
                if (!entry.yearBreakdown) {
                    entry.yearBreakdown = {};
                }
                if (!entry.yearBreakdown[yearKey]) {
                    entry.yearBreakdown[yearKey] = emptyMetrics();
                }
                applyDerivedMetrics(entry.yearBreakdown[yearKey], 1);
            });
        });
        yearKeys.forEach((yearKey) => {
            const years = record.yearBreakdown as Record<string, CountyMetrics>;
            if (!years[yearKey]) {
                years[yearKey] = emptyMetrics();
            }
        });
        results.push(record);
    });
    return { [primaryKey]: results };
}
