import { calculateThresholds } from "../../shared/ColorFunctions";
import { getMapPercentiles, PercentileMode } from "../CountyCommodityMap/percentileConfig";

const calculatePercentChange = (currentValue: number, proposedValue: number): number => {
    if (currentValue !== 0) {
        return ((proposedValue - currentValue) / currentValue) * 100;
    }

    if (proposedValue > 0) {
        return 100;
    }

    return 0;
};

const getDistrictNameFromId = (districtId: string): string => {
    const districtNumber = districtId.substring(2);
    if (districtNumber === "00" || districtNumber === "98") {
        return "At-Large";
    }
    return `Congressional District ${parseInt(districtNumber, 10)}`;
};

export const processCongressionalDistrictMapData = ({
    districtData,
    districtDataProposed,
    selectedYear,
    selectedYears = [],
    viewMode,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    stateCodesData,
    yearAggregation,
    aggregationEnabled = false,
    percentileMode = PercentileMode.DEFAULT
}: {
    districtData: Record<string, any>;
    districtDataProposed: Record<string, any>;
    selectedYear: string;
    selectedYears?: string[];
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    selectedState: string;
    stateCodesData: Record<string, string>;
    yearAggregation: number;
    aggregationEnabled?: boolean;
    showMeanValues: boolean;
    percentileMode?: PercentileMode;
}) => {
    if (!districtData[selectedYear] && !districtDataProposed[selectedYear]) {
        return { districts: {}, thresholds: [], data: [], selectedCommodities, selectedPrograms };
    }

    const districts = {};
    const dataValues: number[] = [];
    let yearsToAggregate: string[] = [];
    if (aggregationEnabled) {
        if (selectedYears && selectedYears.length > 0) {
            yearsToAggregate = [...selectedYears];
        } else {
            const availableYears = Object.keys(districtData).sort();
            const currentIndex = availableYears.indexOf(selectedYear);
            yearsToAggregate.push(selectedYear);
            for (let i = 1; i <= yearAggregation; i += 1) {
                const prevIndex = currentIndex - i;
                if (prevIndex >= 0) {
                    yearsToAggregate.push(availableYears[prevIndex]);
                }
            }
        }
    } else {
        yearsToAggregate.push(selectedYear);
    }

    const stateFilterActive = selectedState !== "All States";
    if (stateFilterActive) {
        const stateCodeMapping = {};
        Object.entries(stateCodesData).forEach(([code, name]) => {
            if (name === selectedState) {
                stateCodeMapping[code] = true;
            }
        });
    }

    const processDistrictData = (yearData, isProposed = false, year: string) => {
        yearData.forEach((state) => {
            const stateCode = state.state;
            const stateName = stateCodesData[stateCode];

            if (stateFilterActive) {
                if (stateName !== selectedState) {
                    let foundMatch = false;
                    Object.entries(stateCodesData).forEach(([code, name]) => {
                        if (
                            name === selectedState &&
                            (code === stateCode || (code.length === 2 && stateCode.length === 2 && code === stateCode))
                        ) {
                            foundMatch = true;
                        }
                    });

                    if (!foundMatch) {
                        return;
                    }
                }
            }
            state.districts.forEach((district) => {
                const districtId =
                    district.districtId || `${stateCode}${district.districtNumber?.toString().padStart(2, "0")}`;

                if (!districts[districtId]) {
                    districts[districtId] = {
                        value: 0,
                        currentValue: 0,
                        proposedValue: 0,
                        percentChange: 0,
                        commodities: {},
                        programs: {},
                        name: district.districtName || getDistrictNameFromId(districtId),
                        baseAcres: 0,
                        currentBaseAcres: 0,
                        proposedBaseAcres: 0,
                        currentTotalWeightedMean: 0,
                        currentTotalWeightedMedian: 0,
                        proposedTotalWeightedMean: 0,
                        proposedTotalWeightedMedian: 0,
                        currentMeanRate: 0,
                        currentMedianRate: 0,
                        proposedMeanRate: 0,
                        proposedMedianRate: 0,
                        meanRateDifference: 0,
                        medianRateDifference: 0,
                        yearlyData: {},
                        hasData: false,
                        hasValidBaseAcres: false,
                        state: selectedState,
                        stateFIPS: stateCode,
                        isMultiSelection:
                            selectedCommodities.length > 1 ||
                            selectedPrograms.length > 1 ||
                            yearAggregation > 0 ||
                            selectedCommodities.includes("All Program Crops") ||
                            selectedPrograms.includes("All Programs")
                    };
                }

                let hasProcessedBaseAcres = false;

                district.scenarios.forEach((scenario) => {
                    scenario.commodities.forEach((commodity) => {
                        if (!districts[districtId].commodities[commodity.commodityName]) {
                            districts[districtId].commodities[commodity.commodityName] = {
                                value: 0,
                                currentValue: 0,
                                proposedValue: 0,
                                baseAcres: 0,
                                currentBaseAcres: 0,
                                proposedBaseAcres: 0,
                                meanPaymentRateInDollarsPerAcre: 0,
                                medianPaymentRateInDollarsPerAcre: 0,
                                yearlyData: {},
                                programs: {}
                            };
                        }

                        const programIncluded =
                            selectedPrograms.includes("All Programs") ||
                            commodity.programs.some((program) => selectedPrograms.includes(program.programName));
                        const commodityIncluded =
                            selectedCommodities.includes("All Program Crops") ||
                            selectedCommodities.includes(commodity.commodityName);

                        if (!programIncluded || !commodityIncluded) {
                            return;
                        }

                        districts[districtId].hasData = true;

                        commodity.programs.forEach((program) => {
                            if (
                                !selectedPrograms.includes("All Programs") &&
                                !selectedPrograms.includes(program.programName)
                            ) {
                                return;
                            }

                            if (!districts[districtId].programs[program.programName]) {
                                districts[districtId].programs[program.programName] = {
                                    value: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    baseAcres: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0,
                                    meanPaymentRateInDollarsPerAcre: 0,
                                    medianPaymentRateInDollarsPerAcre: 0,
                                    yearlyData: {}
                                };
                            }

                            const totalPayment = program.totalPaymentInDollars || 0;
                            const baseAcres = program.baseAcres || 0;
                            const meanRate = program.meanPaymentRateInDollarsPerAcre || 0;
                            const medianRate = program.medianPaymentRateInDollarsPerAcre || 0;

                            if (isProposed) {
                                districts[districtId].proposedValue += totalPayment;
                                districts[districtId].commodities[commodity.commodityName].proposedValue +=
                                    totalPayment;
                                districts[districtId].programs[program.programName].proposedValue += totalPayment;
                                districts[districtId].proposedBaseAcres += baseAcres;
                                districts[districtId].commodities[commodity.commodityName].proposedBaseAcres +=
                                    baseAcres;
                                districts[districtId].programs[program.programName].proposedBaseAcres += baseAcres;
                            } else {
                                districts[districtId].currentValue += totalPayment;
                                districts[districtId].commodities[commodity.commodityName].currentValue += totalPayment;
                                districts[districtId].programs[program.programName].currentValue += totalPayment;
                                districts[districtId].currentBaseAcres += baseAcres;
                                districts[districtId].commodities[commodity.commodityName].currentBaseAcres +=
                                    baseAcres;
                                districts[districtId].programs[program.programName].currentBaseAcres += baseAcres;
                            }

                            if (!hasProcessedBaseAcres) {
                                districts[districtId].baseAcres += baseAcres;
                                districts[districtId].commodities[commodity.commodityName].baseAcres += baseAcres;
                                districts[districtId].programs[program.programName].baseAcres += baseAcres;
                            }

                            if (isProposed) {
                                districts[districtId].proposedTotalWeightedMean += meanRate * baseAcres;
                                districts[districtId].proposedTotalWeightedMedian += medianRate * baseAcres;
                            } else {
                                districts[districtId].currentTotalWeightedMean += meanRate * baseAcres;
                                districts[districtId].currentTotalWeightedMedian += medianRate * baseAcres;
                            }

                            districts[districtId].yearlyData[year] = districts[districtId].yearlyData[year] || {
                                totalPayment: 0,
                                baseAcres: 0,
                                meanRate: 0,
                                medianRate: 0,
                                commodities: {},
                                programs: {}
                            };

                            districts[districtId].yearlyData[year].totalPayment += totalPayment;
                            districts[districtId].yearlyData[year].baseAcres += baseAcres;
                        });

                        hasProcessedBaseAcres = true;
                    });
                });
            });
        });
    };

    yearsToAggregate.forEach((year) => {
        if (districtData[year]) {
            processDistrictData(districtData[year], false, year);
        }
        if (districtDataProposed[year] && (viewMode === "difference" || viewMode === "proposed")) {
            processDistrictData(districtDataProposed[year], true, year);
        }
    });

    Object.keys(districts).forEach((districtId) => {
        const district = districts[districtId];

        if (district.currentBaseAcres > 0) {
            district.currentMeanRate = district.currentTotalWeightedMean / district.currentBaseAcres;
            district.currentMedianRate = district.currentTotalWeightedMedian / district.currentBaseAcres;
        }
        if (district.proposedBaseAcres > 0) {
            district.proposedMeanRate = district.proposedTotalWeightedMean / district.proposedBaseAcres;
            district.proposedMedianRate = district.proposedTotalWeightedMedian / district.proposedBaseAcres;
        }

        district.meanRateDifference = district.proposedMeanRate - district.currentMeanRate;
        district.medianRateDifference = district.proposedMedianRate - district.currentMedianRate;

        if (viewMode === "difference") {
            district.difference = district.proposedValue - district.currentValue;
            district.percentChange = calculatePercentChange(district.currentValue, district.proposedValue);
            district.value = district.difference;
        } else if (viewMode === "proposed") {
            district.value = district.proposedValue;
        } else {
            district.value = district.currentValue;
        }

        if (district.value && typeof district.value === "number" && district.value > 0) {
            dataValues.push(district.value);
        }

        district.hasValidBaseAcres = district.baseAcres > 0;
    });

    const percentiles = getMapPercentiles(percentileMode);
    const thresholds = calculateThresholds(dataValues, percentiles);

    return {
        districts,
        thresholds,
        data: dataValues,
        selectedCommodities,
        selectedPrograms
    };
};
