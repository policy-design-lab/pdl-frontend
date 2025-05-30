import countyFipsMapping from "../../files/maps/fips_county_mapping.json";

export interface YearBreakdownData {
    current?: string | number;
    proposed?: string | number;
    difference?: string | number;
    total?: string | number;
    baseAcres?: number;
}

export interface CountyObject {
    state: string;
    county: string;
    fips: string;
    yearBreakdown?: { [year: string]: YearBreakdownData };
    baseAcres?: number;
    [key: string]: string | number | { [year: string]: YearBreakdownData } | undefined;
}

export const formatCurrency = (value: number, options = { minimumFractionDigits: 2 }): string => {
    const roundedValue = Math.round(value * 100) / 100;
    return `$${roundedValue.toLocaleString(undefined, options)}`;
};

export const formatNumericValue = (value: number): number => {
    return Math.round(value * 100) / 100;
};

export const getCountyNameFromFips = (countyFIPS: string): string => {
    return countyFipsMapping[countyFIPS] || "";
};

export const calculateTotals = (
    county: any,
    selectedCommodities: string[],
    selectedPrograms: string[]
): { currentTotal: number; proposedTotal: number } => {
    let currentTotal = 0;
    const proposedTotal = 0;
    county.scenarios.forEach((scenario) => {
        scenario.commodities.forEach((commodity) => {
            if (
                !selectedCommodities.includes("All Commodities") &&
                !selectedCommodities.includes(commodity.commodityName)
            ) {
                return;
            }
            commodity.programs.forEach((program) => {
                if (!selectedPrograms.includes("All Programs") && !selectedPrograms.includes(program.programName)) {
                    return;
                }
                currentTotal += program.totalPaymentInDollars || 0;
            });
        });
    });
    return { currentTotal, proposedTotal };
};

export const findProposedCommodityAndProgram = (
    proposedCounty: any,
    scenarioName: string,
    commodityName: string,
    programName: string
): { proposedScenario: any; proposedCommodity: any; proposedProgram: any } => {
    const proposedScenario = proposedCounty?.scenarios.find((s) => s.scenarioName === scenarioName);
    const proposedCommodity = proposedScenario?.commodities.find((c) => c.commodityName === commodityName);
    const proposedProgram = proposedCommodity?.programs.find((p) => p.programName === programName);
    return { proposedScenario, proposedCommodity, proposedProgram };
};
export const calculateYearRange = (selectedYear: string | string[]): string[] => {
    if (Array.isArray(selectedYear)) {
        return selectedYear;
    }
    const isAggregatedYear = typeof selectedYear === "string" && selectedYear.includes("-");
    if (!isAggregatedYear) return [selectedYear];
    const [startYear, endYear] = selectedYear.split("-").map((y) => parseInt(y.trim(), 10));
    const years: string[] = [];
    for (let year = startYear; year <= endYear; year++) {
        years.push(year.toString());
    }
    return years;
};

export const compareWithDollarSign = (a: any, b: any) => {
    if (typeof a === "string" && typeof b === "string") {
        const numA = parseFloat(a.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(b.replace(/[^0-9.-]+/g, ""));
        return numA - numB;
    }
    return 0;
};

export const generateTableTitle = (
    selectedYear: string | string[],
    selectedCommodities: string[],
    selectedPrograms: string[],
    viewMode: string,
    isAggregatedYear: boolean
): string => {
    let yearPart = "";
    if (Array.isArray(selectedYear)) {
        // Handle multiple selected years
        if (selectedYear.length === 1) {
            yearPart = `Year ${selectedYear[0]}`;
        } else {
            // Sort years numerically for consistent display
            const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            yearPart = `Years ${sortedYears.join(", ")} (Aggregated)`;
        }
    } else {
        // Handle single year or traditional aggregated year
        yearPart = isAggregatedYear ? `Years ${selectedYear} (Aggregated)` : `Year ${selectedYear}`;
    }
    let commodityPart = "";
    if (selectedCommodities.includes("All Commodities")) {
        commodityPart = "All Commodities";
    } else if (selectedCommodities.length === 1) {
        commodityPart = selectedCommodities[0];
    } else if (selectedCommodities.length > 1) {
        commodityPart = `${selectedCommodities.length} Selected Commodities`;
    }
    let programPart = "";
    if (selectedPrograms.includes("All Programs")) {
        programPart = "All Programs";
    } else if (selectedPrograms.length === 1) {
        programPart = selectedPrograms[0];
    } else if (selectedPrograms.length > 1) {
        programPart = `${selectedPrograms.length} Selected Programs`;
    }
    let viewPart = "";
    if (viewMode === "current") {
        viewPart = "Current Policy";
    } else if (viewMode === "proposed") {
        viewPart = "Proposed Policy";
    } else if (viewMode === "difference") {
        viewPart = "Policy Difference Analysis";
    }
    return `ARC-PLC County Payments - ${yearPart}, ${commodityPart}, ${programPart}, ${viewPart}`;
};

export const generateCsvFilename = (
    selectedYear: string | string[],
    selectedCommodities: string[],
    selectedPrograms: string[],
    viewMode: string,
    isAggregatedYear: boolean
): string => {
    const dateStr = new Date().toISOString().split("T")[0];
    let yearStr = "";
    if (Array.isArray(selectedYear)) {
        if (selectedYear.length === 1) {
            yearStr = selectedYear[0];
        } else {
            const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            yearStr = `${sortedYears[0]}to${sortedYears[sortedYears.length - 1]}`;
        }
    } else {
        yearStr = isAggregatedYear ? selectedYear.replace("-", "to") : selectedYear;
    }
    const commodityStr = selectedCommodities.includes("All Commodities")
        ? "all-commodities"
        : selectedCommodities.join("-").toLowerCase().replace(/\s+/g, "-");
    const programStr = selectedPrograms.includes("All Programs")
        ? "all-programs"
        : selectedPrograms.join("-").toLowerCase().replace(/\s+/g, "-");
    return `arc-plc-payments-${yearStr}-${commodityStr}-${programStr}-${viewMode}-${dateStr}.csv`;
};

export const calculateMeanRates = (county: any, baseAcres: number, weightedMean: number): number => {
    if (baseAcres > 0) {
        return weightedMean / baseAcres;
    }
    return 0;
};

export const calculateWeightedMeanRate = (
    totalPayments: number,
    totalBaseAcres: number,
    isMultiSelection = false,
    numberOfYears = 1
): { rate: number; isWeightedAverage: boolean } => {
    if (totalBaseAcres > 0) {
        const preciseRate = totalPayments / totalBaseAcres;
        return {
            rate: preciseRate,
            isWeightedAverage: isMultiSelection
        };
    }
    return { rate: 0, isWeightedAverage: false };
};

export const getTotalBaseAcres = (
    county: any,
    selectedCommodities: string[] = ["All Commodities"],
    selectedPrograms: string[] = ["All Programs"],
    scenarioType = "Current"
): number => {
    if (!county || !county.scenarios) return 0;
    let totalBaseAcres = 0;
    const processedProgramCommodityPairs = new Set<string>();
    const targetScenario = county.scenarios.find((s) => s.scenarioName === scenarioType);
    if (!targetScenario || !targetScenario.commodities) {
        if (county.scenarios[0] && county.scenarios[0].commodities) {
            county.scenarios[0].commodities.forEach((commodity) => {
                if (
                    !selectedCommodities.includes("All Commodities") &&
                    !selectedCommodities.includes(commodity.commodityName)
                ) {
                    return;
                }
                commodity.programs.forEach((program) => {
                    if (!selectedPrograms.includes("All Programs") && !selectedPrograms.includes(program.programName)) {
                        return;
                    }
                    const pairKey = `${commodity.commodityName}-${program.programName}`;
                    if (!processedProgramCommodityPairs.has(pairKey)) {
                        totalBaseAcres += program.baseAcres || 0;
                        processedProgramCommodityPairs.add(pairKey);
                    }
                });
            });
        }
    } else {
        targetScenario.commodities.forEach((commodity) => {
            if (
                !selectedCommodities.includes("All Commodities") &&
                !selectedCommodities.includes(commodity.commodityName)
            ) {
                return;
            }
            commodity.programs.forEach((program) => {
                if (!selectedPrograms.includes("All Programs") && !selectedPrograms.includes(program.programName)) {
                    return;
                }
                const pairKey = `${commodity.commodityName}-${program.programName}`;
                if (!processedProgramCommodityPairs.has(pairKey)) {
                    totalBaseAcres += program.baseAcres || 0;
                    processedProgramCommodityPairs.add(pairKey);
                }
            });
        });
    }
    totalBaseAcres = Math.round(totalBaseAcres * 100) / 100;
    return totalBaseAcres;
};

export const getPaymentRateForTooltip = (rate: number, isWeightedAverage: boolean): string => {
    const rateFormatted = formatCurrency(rate);
    return isWeightedAverage ? `${rateFormatted}/acre (weighted avg)` : `${rateFormatted}/acre`;
};

export const isDataValid = (county: any): boolean => {
    let hasAnyRealData = false;
    let totalRealPayment = 0;
    if (county.commodities) {
        Object.values(county.commodities).forEach((commodity: any) => {
            const commodityValue = parseFloat(commodity.value || 0);
            if (commodityValue > 0) {
                hasAnyRealData = true;
                totalRealPayment += commodityValue;
            }
        });
    }
    return hasAnyRealData && totalRealPayment > 0;
};

export const formatCellValue = (
    cell: any,
    includesDot: boolean,
    includesPaymentRate: boolean,
    headerIncludesRate: boolean,
    headerIncludesBaseAcres: boolean,
    headerIncludesPayment: boolean,
    accessor: string
): string | number => {
    if (includesPaymentRate || headerIncludesRate) {
        return cell.value && cell.value > 0 ? `$${Number(cell.value).toFixed(2)}/acre` : "";
    }
    if (headerIncludesBaseAcres) {
        return typeof cell.value === "number" && cell.value > 0 ?
            formatNumericValue(cell.value).toFixed(2) :
            cell.value;
    }
    if (includesDot) {
        return typeof cell.value === "number" && cell.value > 0 ? formatCurrency(cell.value) : "";
    }
    if (
        headerIncludesPayment ||
        accessor === "current" ||
        accessor === "proposed" ||
        accessor === "difference" ||
        accessor === "aggregatedPayment"
    ) {
        return typeof cell.value === "number" && cell.value > 0 ? formatCurrency(cell.value) : "";
    }

    return cell.render("Cell");
};
