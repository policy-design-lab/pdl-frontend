import countyFipsMapping from "../../files/maps/fips_county_mapping.json";
import { formatCurrency, formatPaymentRate } from "../shared/ConvertionFormats";

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

interface Program {
    programName: string;
    totalPaymentInDollars?: number;
    baseAcres?: number;
}

interface Commodity {
    commodityName: string;
    programs: Program[];
    value?: number;
}

interface Scenario {
    scenarioName: string;
    commodities: Commodity[];
}

interface CountyData {
    scenarios: Scenario[];
    commodities?: { [key: string]: { value?: number } };
}

interface TableCell {
    value: string | number;
    render: (type: string) => string | number;
}

export const getCountyNameFromFips = (countyFIPS: string): string => {
    return countyFipsMapping[countyFIPS] || "";
};

export const calculateTotals = (
    county: CountyData,
    selectedCommodities: string[],
    selectedPrograms: string[]
): { currentTotal: number; proposedTotal: number } => {
    let currentTotal = 0;
    const proposedTotal = 0;
    county.scenarios.forEach((scenario) => {
        scenario.commodities.forEach((commodity) => {
            if (
                !selectedCommodities.includes("All Program Crops") &&
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
    proposedCounty: CountyData,
    scenarioName: string,
    commodityName: string,
    programName: string
): {
    proposedScenario: Scenario | undefined;
    proposedCommodity: Commodity | undefined;
    proposedProgram: Program | undefined;
} => {
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
    for (let year = startYear; year <= endYear; year += 1) {
        years.push(year.toString());
    }
    return years;
};

export const compareWithDollarSign = (a: string | number, b: string | number): number => {
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
    isAggregatedYear: boolean,
    showMeanValues = false
): string => {
    const isMultiYearSelection = Array.isArray(selectedYear) && selectedYear.length > 1;
    let yearDisplay = "";
    if (isMultiYearSelection) {
        const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

        const areConsecutive = (years) => {
            for (let i = 1; i < years.length; i += 1) {
                if (parseInt(years[i], 10) - parseInt(years[i - 1], 10) !== 1) {
                    return false;
                }
            }
            return true;
        };

        if (sortedYears.length === 2) {
            yearDisplay = `${sortedYears[0]}-${sortedYears[1]}`;
        } else if (areConsecutive(sortedYears)) {
            yearDisplay = `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`;
        } else if (sortedYears.length <= 4) {
            yearDisplay = sortedYears.join(", ");
        } else {
            yearDisplay = `${sortedYears.length} Selected Years (${sortedYears[0]}-${
                sortedYears[sortedYears.length - 1]
            })`;
        }
    } else {
        yearDisplay = Array.isArray(selectedYear) ? selectedYear[0] : selectedYear;
    }

    let title = "";
    let policyMode = "";
    let metrics = "";
    let commodityPart = "";

    if (viewMode === "difference") {
        policyMode = "Policy Differences";
        metrics = showMeanValues ? "Mean Rate" : "Payment";
        title = `${metrics} Differences Between Current and Proposed Policy`;
    } else {
        policyMode = viewMode === "current" ? "Current Policy" : "Proposed Policy";
        metrics = showMeanValues ? "Payment Rate" : "Total Payments";
        title = `${policyMode}: ${metrics}`;
    }

    const hasSpecificCommodities =
        selectedCommodities &&
        selectedCommodities.length > 0 &&
        !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops"));

    if (hasSpecificCommodities) {
        if (selectedCommodities.length === 1) {
            commodityPart = ` for ${selectedCommodities[0]}`;
        } else if (selectedCommodities.length <= 3) {
            commodityPart = ` for ${selectedCommodities.join(", ")}`;
        } else {
            commodityPart = ` for ${selectedCommodities.length} Selected Commodities`;
        }
        title += commodityPart;
    }

    title += ` (${yearDisplay})`;

    if (isMultiYearSelection || isAggregatedYear) {
        title += " - Aggregated";
    }

    return title;
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
    const commodityStr = selectedCommodities.includes("All Program Crops")
        ? "all-commodities"
        : selectedCommodities.join("-").toLowerCase().replace(/\s+/g, "-");
    const programStr = selectedPrograms.includes("All Programs")
        ? "all-programs"
        : selectedPrograms.join("-").toLowerCase().replace(/\s+/g, "-");
    return `arc-plc-payments-${yearStr}-${commodityStr}-${programStr}-${viewMode}-${dateStr}.csv`;
};

export const calculateMeanRates = (county: CountyData, baseAcres: number, weightedMean: number): number => {
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
            isWeightedAverage: isMultiSelection || numberOfYears > 1
        };
    }
    return { rate: 0, isWeightedAverage: false };
};

export const getTotalBaseAcres = (
    county: CountyData,
    selectedCommodities: string[] = ["All Program Crops"],
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
                    !selectedCommodities.includes("All Program Crops") &&
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
                !selectedCommodities.includes("All Program Crops") &&
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

export const isDataValid = (county: CountyData): boolean => {
    let hasAnyRealData = false;
    let totalRealPayment = 0;
    if (county.commodities) {
        Object.values(county.commodities).forEach((commodity) => {
            const commodityValue = parseFloat(commodity.value?.toString() || "0");
            if (commodityValue > 0) {
                hasAnyRealData = true;
                totalRealPayment += commodityValue;
            }
        });
    }
    return hasAnyRealData && totalRealPayment > 0;
};

export const formatCellValue = (
    cell: TableCell,
    includesDot: boolean,
    includesPaymentRate: boolean,
    headerIncludesRate: boolean,
    headerIncludesBaseAcres: boolean,
    headerIncludesPayment: boolean,
    accessor: string
): string | number => {
    if (includesPaymentRate || headerIncludesRate) {
        if (cell.value && Number(cell.value) > 0) {
            const isForDifference = accessor === "difference" || accessor.includes("difference");
            const formattedRate = formatPaymentRate(Number(cell.value), isForDifference);
            return formattedRate ? `$${formattedRate}` : "";
        }
        return "";
    }
    if (headerIncludesBaseAcres) {
        return typeof cell.value === "number" && cell.value > 0
            ? Math.round(cell.value).toLocaleString("en-US")
            : cell.value;
    }
    if (includesDot) {
        if (typeof cell.value === "number" && cell.value !== 0) {
            if (accessor === "difference" || accessor.includes("difference")) {
                return `$${Math.round(cell.value).toLocaleString()}`;
            }
            return cell.value > 0 ? `$${Math.round(cell.value).toLocaleString()}` : "";
        }
        return "";
    }
    if (
        headerIncludesPayment ||
        accessor === "current" ||
        accessor === "proposed" ||
        accessor === "difference" ||
        accessor === "aggregatedPayment"
    ) {
        if (typeof cell.value === "number" && cell.value !== 0) {
            if (accessor === "difference" || accessor.includes("difference")) {
                return `$${Math.round(cell.value).toLocaleString()}`;
            }
            return cell.value > 0 ? `$${Math.round(cell.value).toLocaleString()}` : "";
        }
        return "";
    }

    return cell.render("Cell");
};

export const transformYearDataForward = (data: Record<string, unknown>): Record<string, unknown> => {
    const years = Object.keys(data).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const transformedData: Record<string, unknown> = {};
    const yearsToProcess = years.slice(0, 10); // Take first 10 years
    yearsToProcess.forEach((year) => {
        const newYear = (parseInt(year, 10) + 2).toString();
        transformedData[newYear] = data[year];
    });
    return transformedData;
};
