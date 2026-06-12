import React from "react";
import { config } from "../../app.config";
import { getJsonDataFromUrl } from "../../utils/apiutil";
import { formatNumericValue, ShortFormat } from "../shared/ConvertionFormats";

export const SOYBEAN_STORYBOARD_PREFERRED_YEAR = "2024";
export const SOYBEAN_STORYBOARD_NEED_DATA_LABEL = "Need Data";

export type SoybeanQuantityUnit = "bushels" | "mt" | "mmt";

export type SoybeanYearRecord<T> = Record<string, T>;

export type SoybeanPlantedAcresRecord = {
    id: string;
    idType: string;
    level: string;
    name: string;
    totalAcres: number | null;
};

export type SoybeanPlantedAcresCountryRecord = {
    code: string;
    commodity: string;
    country: string;
    plantedAcres: SoybeanPlantedAcresRecord[];
};

export type SoybeanPlantedAcresSummaryStateRecord = {
    state: string;
    totalAcres: number | null;
};

export type SoybeanPlantedAcresSummaryRecord = {
    national_total: number | null;
    states: SoybeanPlantedAcresSummaryStateRecord[];
};

export type ChinaSocioeconomicRecord = {
    gdp_per_capita: number | null;
    total_population: number | null;
    urban_population: number | null;
};

export type ChinaCommodityDemandRecord = {
    pork_demand: number | null;
    poultry_demand: number | null;
};

export type SoybeanMarketBalanceMetric = {
    commidityName?: string;
    productionMT: number | null;
    productionBushels: number | null;
    exportsMT: number | null;
    exportsBushels: number | null;
    importsMT: number | null;
    importsBushels: number | null;
    consumptionMT: number | null;
    consumptionBushels: number | null;
    importPercentageWorldwide: number | null;
    endingStockMT: number | null;
    endingStockBushels: number | null;
};

export type SoybeanMarketBalanceCountry = {
    country: string;
    code: string;
    commodity: SoybeanMarketBalanceMetric[];
};

export type SoybeanPlantedAcresCountryCode = "br" | "us";

export type SoybeanExportsTopDestination = {
    country: string;
    amount: number;
};

export type SoybeanExportsRecord = {
    country: string;
    code: string;
    commodity: string;
    top_destinations: SoybeanExportsTopDestination[];
    china: number | null;
    rest_of_world: number | null;
};

export type SoybeanStoryboardApiData = {
    commodities: SoybeanYearRecord<ChinaCommodityDemandRecord>;
    exports: SoybeanYearRecord<SoybeanExportsRecord[]>;
    isLoading: boolean;
    loadPlantedAcresRange: (
        country: SoybeanPlantedAcresCountryCode,
        startYear: string,
        endYear: string
    ) => Promise<void>;
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
    plantedAcres: {
        br: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>;
        us: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>;
    };
    plantedAcresLoading: {
        br: boolean;
        us: boolean;
    };
    plantedAcresSummary: {
        br: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>;
        us: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>;
    };
    socioeconomic: SoybeanYearRecord<ChinaSocioeconomicRecord>;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeYearRecord<T>(value: unknown): SoybeanYearRecord<T> {
    return isObjectRecord(value) ? (value as SoybeanYearRecord<T>) : {};
}

export function useSoybeanStoryboardData(): SoybeanStoryboardApiData {
    const isMountedRef = React.useRef(true);
    const [data, setData] = React.useState<Omit<SoybeanStoryboardApiData, "loadPlantedAcresRange">>({
        commodities: {},
        exports: {},
        isLoading: true,
        marketBalance: {},
        plantedAcres: {
            br: {},
            us: {}
        },
        plantedAcresLoading: {
            br: true,
            us: true
        },
        plantedAcresSummary: {
            br: {},
            us: {}
        },
        socioeconomic: {}
    });
    const loadPlantedAcresRange = React.useCallback(
        async (country: SoybeanPlantedAcresCountryCode, startYear: string, endYear: string) => {
            if (!startYear || !endYear) {
                return;
            }
            setData((currentData) => ({
                ...currentData,
                plantedAcresLoading: {
                    ...currentData.plantedAcresLoading,
                    [country]: true
                }
            }));
            try {
                const response = await getJsonDataFromUrl(
                    `${config.apiUrl}/countries/${country}/plantedacres?start_year=${startYear}&end_year=${endYear}`
                );
                if (!isMountedRef.current) {
                    return;
                }

                setData((currentData) => ({
                    ...currentData,
                    plantedAcres: {
                        ...currentData.plantedAcres,
                        [country]: {
                            ...currentData.plantedAcres[country],
                            ...normalizeYearRecord<SoybeanPlantedAcresCountryRecord>(response)
                        }
                    },
                    plantedAcresLoading: {
                        ...currentData.plantedAcresLoading,
                        [country]: false
                    }
                }));
            } catch (error) {
                console.error(`Error fetching ${country.toUpperCase()} planted acres:`, error);
                if (isMountedRef.current) {
                    setData((currentData) => ({
                        ...currentData,
                        plantedAcresLoading: {
                            ...currentData.plantedAcresLoading,
                            [country]: false
                        }
                    }));
                }
            }
        },
        []
    );

    React.useEffect(() => {
        isMountedRef.current = true;
        const fetchData = async () => {
            try {
                const [
                    socioeconomicResponse,
                    commoditiesResponse,
                    marketBalanceResponse,
                    exportsResponse,
                    brazilPlantedAcresSummaryResponse,
                    usPlantedAcresSummaryResponse
                ] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/countries/CN/socioeconomic`),
                    getJsonDataFromUrl(`${config.apiUrl}/countries/CN/commodities`),
                    getJsonDataFromUrl(`${config.apiUrl}/countries/marketbalance`),
                    getJsonDataFromUrl(`${config.apiUrl}/countries/exports`),
                    getJsonDataFromUrl(`${config.apiUrl}/countries/br/plantedacres/summary`),
                    getJsonDataFromUrl(`${config.apiUrl}/countries/us/plantedacres/summary`)
                ]);
                if (!isMountedRef.current) {
                    return;
                }
                const brazilPlantedAcresSummary = normalizeYearRecord<SoybeanPlantedAcresSummaryRecord>(
                    brazilPlantedAcresSummaryResponse
                );
                const usPlantedAcresSummary =
                    normalizeYearRecord<SoybeanPlantedAcresSummaryRecord>(usPlantedAcresSummaryResponse);
                const brazilLatestYear = getLatestYear(brazilPlantedAcresSummary);
                const brazilSummaryYears = getSortedYears(brazilPlantedAcresSummary);
                const usLatestYear = getLatestYear(usPlantedAcresSummary);
                setData((currentData) => ({
                    ...currentData,
                    commodities: normalizeYearRecord<ChinaCommodityDemandRecord>(commoditiesResponse),
                    exports: normalizeYearRecord<SoybeanExportsRecord[]>(exportsResponse),
                    isLoading: false,
                    marketBalance: normalizeYearRecord<SoybeanMarketBalanceCountry[]>(marketBalanceResponse),
                    plantedAcresSummary: {
                        br: brazilPlantedAcresSummary,
                        us: usPlantedAcresSummary
                    },
                    socioeconomic: normalizeYearRecord<ChinaSocioeconomicRecord>(socioeconomicResponse)
                }));
                await Promise.all([
                    loadPlantedAcresRange("br", brazilSummaryYears[0] || brazilLatestYear, brazilLatestYear),
                    loadPlantedAcresRange("us", usLatestYear, usLatestYear)
                ]);
            } catch (error) {
                console.error("Error fetching soybean storyboard data:", error);
                if (isMountedRef.current) {
                    setData((currentData) => ({
                        ...currentData,
                        isLoading: false,
                        plantedAcresLoading: {
                            br: false,
                            us: false
                        }
                    }));
                }
            }
        };
        fetchData();
        return () => {
            isMountedRef.current = false;
        };
    }, [loadPlantedAcresRange]);
    return {
        ...data,
        loadPlantedAcresRange
    };
}

export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export function getSortedYears<T>(records: SoybeanYearRecord<T>): string[] {
    return Object.keys(records)
        .filter((year) => !Number.isNaN(Number(year)))
        .sort((yearA, yearB) => Number(yearA) - Number(yearB));
}

export function getLatestYear<T>(
    records: SoybeanYearRecord<T>,
    fallbackYear = SOYBEAN_STORYBOARD_PREFERRED_YEAR
): string {
    const years = getSortedYears(records);
    return years[years.length - 1] || fallbackYear;
}

export function getPreferredYear<T>(
    records: SoybeanYearRecord<T>,
    preferredYear = SOYBEAN_STORYBOARD_PREFERRED_YEAR
): string {
    if (records[preferredYear]) {
        return preferredYear;
    }
    const years = getSortedYears(records);
    return years[years.length - 1] || preferredYear;
}

export function getRecentYears<T>(records: SoybeanYearRecord<T>, endYear: string, count: number): string[] {
    const endYearNumber = Number(endYear);
    const years = getSortedYears(records).filter((year) => Number(year) <= endYearNumber);
    return years.slice(Math.max(0, years.length - count));
}

export function getMarketBalanceForCountry(
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>,
    year: string,
    countryCode: string
): SoybeanMarketBalanceMetric | null {
    const countries = marketBalance[year];
    if (!Array.isArray(countries)) {
        return null;
    }
    const countryBalance = countries.find((country) => country.code === countryCode);
    if (!countryBalance || !Array.isArray(countryBalance.commodity)) {
        return null;
    }
    return (
        countryBalance.commodity.find(
            (commodity) => commodity.commidityName && commodity.commidityName.toLowerCase() === "soybeans"
        ) ||
        countryBalance.commodity[0] ||
        null
    );
}

export function getSoybeanBalanceValue(
    balance: SoybeanMarketBalanceMetric | null,
    metric: "production" | "exports" | "imports" | "consumption" | "endingStock",
    unit: SoybeanQuantityUnit
): number | null {
    if (!balance) {
        return null;
    }
    if (unit === "mt" || unit === "mmt") {
        switch (metric) {
            case "production":
                return balance.productionMT;
            case "exports":
                return balance.exportsMT;
            case "imports":
                return balance.importsMT;
            case "consumption":
                return balance.consumptionMT;
            case "endingStock":
                return balance.endingStockMT;
            default:
                return null;
        }
    }
    switch (metric) {
        case "production":
            return balance.productionBushels;
        case "exports":
            return balance.exportsBushels;
        case "imports":
            return balance.importsBushels;
        case "consumption":
            return balance.consumptionBushels;
        case "endingStock":
            return balance.endingStockBushels;
        default:
            return null;
    }
}

function calculateSoybeanBeginningStock(
    balance: SoybeanMarketBalanceMetric | null,
    unit: SoybeanQuantityUnit
): number | null {
    const endingStock = getSoybeanBalanceValue(balance, "endingStock", unit);
    const production = getSoybeanBalanceValue(balance, "production", unit);
    const imports = getSoybeanBalanceValue(balance, "imports", unit);
    const exports = getSoybeanBalanceValue(balance, "exports", unit);
    const consumption = getSoybeanBalanceValue(balance, "consumption", unit);
    if (
        !isFiniteNumber(endingStock) ||
        !isFiniteNumber(production) ||
        !isFiniteNumber(imports) ||
        !isFiniteNumber(exports) ||
        !isFiniteNumber(consumption)
    ) {
        return null;
    }
    return endingStock - production - imports + exports + consumption;
}

export function getSoybeanTotalSupplyValue(
    balance: SoybeanMarketBalanceMetric | null,
    unit: SoybeanQuantityUnit
): number | null {
    const beginningStock = calculateSoybeanBeginningStock(balance, unit);
    const production = getSoybeanBalanceValue(balance, "production", unit);
    const imports = getSoybeanBalanceValue(balance, "imports", unit);
    if (isFiniteNumber(beginningStock) && isFiniteNumber(production) && isFiniteNumber(imports)) {
        return beginningStock + production + imports;
    }
    return production;
}

export function formatPercentage(value: number | null | undefined, fractionDigits: 0 | 1 | 2 = 0): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatNumericValue(value, fractionDigits)}%`;
}

export function formatSignedPercentage(value: number | null | undefined, fractionDigits: 0 | 1 | 2 = 0): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${value > 0 ? "+" : ""}${formatPercentage(value, fractionDigits)}`;
}

export function formatBrazilMunicipalityName(name: string): string {
    return name
        .replace(/\s+-\s+[^-]+$/, "")
        .replace(/\s+\([^)]+\)$/, "")
        .trim();
}

export function formatUsCountyName(name: string): string {
    return name.replace(/\s+County$/i, "").trim();
}

export function getPlantedAcresForYear(
    records: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    year: string
): SoybeanPlantedAcresRecord[] {
    const yearRecord = records[year];
    return yearRecord && Array.isArray(yearRecord.plantedAcres) ? yearRecord.plantedAcres : [];
}

export function getPlantedAcresValues(
    records: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    year: string
): number[] {
    return getPlantedAcresForYear(records, year)
        .map((record) => record.totalAcres)
        .filter(isFiniteNumber);
}

export function getPlantedAcresByRegionId(
    records: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    year: string
): Record<string, number> {
    return getPlantedAcresForYear(records, year).reduce<Record<string, number>>((regionValues, record) => {
        if (record.id && isFiniteNumber(record.totalAcres)) {
            regionValues[record.id] = (regionValues[record.id] || 0) + record.totalAcres;
        }
        return regionValues;
    }, {});
}

export function getPlantedAcresTotal(
    records: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    year: string
): number | null {
    const values = getPlantedAcresValues(records, year);
    if (values.length === 0) {
        return null;
    }
    return values.reduce((total, value) => total + value, 0);
}

export function getPlantedAcresLegendValues(values: number[], segmentCount = 5): number[] {
    const sortedValues = values.filter(isFiniteNumber).sort((valueA, valueB) => valueA - valueB);
    if (sortedValues.length === 0) {
        return [];
    }
    return Array.from({ length: segmentCount + 1 }, (_, percentileIndex) => percentileIndex / segmentCount).map(
        (percentile) => {
            const index = Math.min(sortedValues.length - 1, Math.floor((sortedValues.length - 1) * percentile));
            return sortedValues[index];
        }
    );
}

export function formatCompactAcres(value: number | null | undefined, fractionDigits = 1): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return ShortFormat(value, fractionDigits === 0 ? 0 : undefined, fractionDigits);
}

export function formatAcresValue(value: number | null | undefined): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return formatNumericValue(value, 0);
}

export function formatRatioAsPercentage(
    value: number | null | undefined,
    total: number | null | undefined,
    fractionDigits: 0 | 1 | 2 = 0
): string {
    if (!isFiniteNumber(value) || !isFiniteNumber(total) || total === 0) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return formatPercentage((value / total) * 100, fractionDigits);
}

export function formatMillionMetricTons(value: number | null | undefined): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${ShortFormat(value, undefined, 1)} MT`;
}

export function formatSoybeanQuantity(
    value: number | null | undefined,
    unit: SoybeanQuantityUnit,
    includeUnit = true
): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    if (unit === "mmt") {
        const mmtValue = value / 1_000_000;
        return `${formatNumericValue(mmtValue, 2)}${includeUnit ? " MMT" : ""}`;
    }
    return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
}

export function formatThousandMetricTonsAsMmt(value: number | null | undefined, label: string): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatNumericValue(value / 1000, 1)} MMT ${label}`;
}

export function createNormalizedTrendValues(
    values: number[],
    floor = 8,
    ceiling = 118,
    domainValues = values
): number[] {
    const validValues = domainValues.filter(isFiniteNumber);
    if (validValues.length === 0) {
        return [];
    }
    const minValue = Math.min(...validValues);
    const maxValue = Math.max(...validValues);
    if (maxValue === minValue) {
        return values.map(() => (floor + ceiling) / 2);
    }
    const valueRange = maxValue - minValue;
    const outputRange = ceiling - floor;
    return values.map((value) => {
        const ratio = (value - minValue) / valueRange;
        const normalizedValue = ratio * outputRange;
        return floor + normalizedValue;
    });
}

export type ProductionDetailRow = {
    area: number | null;
    county?: string;
    id: string;
    idType: string;
    municipality?: string;
    name: string;
    regionType: string;
    state?: string;
};

export type ProductionDetailFrame = {
    plantedAcresByRegionId: Record<string, number>;
    plantedAcresValues: number[];
    regionLevel: "county" | "municipality" | "state";
    rows: ProductionDetailRow[];
    totalAcres: number | null;
    year: string;
};

export type ProductionRankingRow = {
    area: string;
    areaValue: number | null;
    growth: string;
    key: string;
    label: string;
};

export type ProductionSegmentTab = {
    active?: boolean;
    id: string;
    label: string;
};

export const PRODUCTION_SEGMENT_TABS: ProductionSegmentTab[] = [
    { id: "area-planted", label: "Area Planted", active: true },
    { id: "yields", label: "Yields (coming soon)", active: false },
    { id: "future-project", label: "Future Project", active: false }
];

export function getProductionTrendPoints(
    plantedAcresSummary: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>,
    latestYear: string
): { trendPoints: { totalAcres: number | null; year: string }[]; trendYears: string[] } {
    const trendYears = getSortedYears(plantedAcresSummary).filter((year) => Number(year) <= Number(latestYear));
    const trendPoints = trendYears.map((year) => ({
        totalAcres: plantedAcresSummary[year]?.national_total ?? null,
        year
    }));
    return { trendPoints, trendYears };
}

export function getProductionGrowthLabel(trendYears: string[]): string {
    if (trendYears.length > 1) {
        return `AREA GROWTH (${Number(trendYears[trendYears.length - 1]) - Number(trendYears[0])}Y)`;
    }
    return "AREA GROWTH";
}

export function getCanLoadHistoricalFrames(
    summaryYears: string[],
    plantedAcres: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>
): boolean {
    return summaryYears.length > 1 && summaryYears.some((year) => !plantedAcres[year]);
}

export function getHistoricalFrameRange(summaryYears: string[], fallbackYear: string): [string, string] {
    return [summaryYears[0] || fallbackYear, summaryYears[summaryYears.length - 1] || fallbackYear];
}

export function buildProductionFrames(
    plantedAcres: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    regionLevel: ProductionDetailFrame["regionLevel"],
    mapRecord: (record: SoybeanPlantedAcresRecord) => ProductionDetailRow
): ProductionDetailFrame[] {
    return getSortedYears(plantedAcres).map((year) => {
        const rows = getPlantedAcresForYear(plantedAcres, year)
            .map(mapRecord)
            .sort((rowA, rowB) => (rowB.area || 0) - (rowA.area || 0));
        return {
            plantedAcresByRegionId: getPlantedAcresByRegionId(plantedAcres, year),
            plantedAcresValues: getPlantedAcresValues(plantedAcres, year),
            regionLevel,
            rows,
            totalAcres: getPlantedAcresTotal(plantedAcres, year),
            year
        };
    });
}

export function buildTopRankingRows(
    records: { id: string; name: string; totalAcres: number | null }[],
    baselineRecords: { id: string; totalAcres: number | null }[],
    hasBaseline: boolean,
    formatLabel: (name: string) => string
): ProductionRankingRow[] {
    return records
        .map((record) => {
            const baselineRecord = hasBaseline ? baselineRecords.find((b) => b.id === record.id) : null;
            const growth = hasBaseline
                ? calculateGrowthPercentage([baselineRecord?.totalAcres, record.totalAcres].filter(isFiniteNumber))
                : null;
            return {
                area: formatCompactAcres(record.totalAcres),
                areaValue: record.totalAcres,
                growth: formatPercentage(growth, 0),
                key: record.id,
                label: formatLabel(record.name),
                totalAcres: record.totalAcres
            };
        })
        .sort((rowA, rowB) => (rowB.totalAcres || 0) - (rowA.totalAcres || 0))
        .slice(0, 5)
        .map(({ area, areaValue, growth, key, label }) => ({ area, areaValue, growth, key, label }));
}

export function getExportsForCountry(
    exports: SoybeanYearRecord<SoybeanExportsRecord[]>,
    year: string,
    countryCode: string
): SoybeanExportsRecord | null {
    const records = exports[year];
    if (!Array.isArray(records)) {
        return null;
    }
    return records.find((r) => r.code.toUpperCase() === countryCode.toUpperCase()) ?? null;
}

export function formatPlainMetricTons(value: number | null | undefined): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${ShortFormat(value, undefined, 1)} MT`;
}

export function calculateGrowthPercentage(values: number[]): number | null {
    const validValues = values.filter(isFiniteNumber);
    if (validValues.length < 2 || validValues[0] === 0) {
        return null;
    }
    return ((validValues[validValues.length - 1] - validValues[0]) / validValues[0]) * 100;
}
