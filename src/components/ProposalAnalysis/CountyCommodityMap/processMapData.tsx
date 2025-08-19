import { calculateThresholds } from "../../shared/ColorFunctions";
import { getCountyNameFromFips, isDataValid, calculateWeightedMeanRate, getTotalBaseAcres } from "../utils";
import { getMapPercentiles, PercentileMode } from "./percentileConfig";

const calculatePercentChange = (currentValue: number, proposedValue: number): number => {
    if (currentValue !== 0) {
        return ((proposedValue - currentValue) / currentValue) * 100;
    }

    if (proposedValue > 0) {
        return 100;
    }

    return 0;
};

const hasValidCountyData = (county: any): boolean => {
    if (!county || !county.commodities) return false;

    let hasValue = false;
    Object.values(county.commodities).forEach((commodity: any) => {
        if (parseFloat(commodity.value || 0) > 0) {
            hasValue = true;
        }
    });

    return hasValue;
};

export const processMapData = ({
    countyData,
    countyDataProposed,
    selectedYear,
    selectedYears = [],
    viewMode,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    stateCodesData,
    yearAggregation,
    aggregationEnabled = false,
    showMeanValues,
    percentileMode = PercentileMode.DEFAULT
}: {
    countyData: Record<string, any>;
    countyDataProposed: Record<string, any>;
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
    if (!countyData[selectedYear] && (!countyDataProposed || !countyDataProposed[selectedYear])) {
        return { counties: {}, thresholds: [], data: [], selectedCommodities, selectedPrograms };
    }

    const counties = {};
    const dataValues: number[] = [];
    let yearsToAggregate: string[] = [];
    if (aggregationEnabled) {
        if (selectedYears && selectedYears.length > 0) {
            yearsToAggregate = [...selectedYears];
        } else {
            const availableYears = Object.keys(countyData).sort();
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

    const processCountyData = (yearData, isProposed = false, year: string) => {
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
            state.counties.forEach((county) => {
                const countyFIPS =
                    county.countyFIPS && county.countyFIPS.length < 5
                        ? county.countyFIPS.padStart(5, "0")
                        : county.countyFIPS;

                if (!counties[countyFIPS]) {
                    counties[countyFIPS] = {
                        value: 0,
                        currentValue: 0,
                        proposedValue: 0,
                        percentChange: 0,
                        commodities: {},
                        programs: {},
                        name: county.countyName || getCountyNameFromFips(countyFIPS) || `County ${countyFIPS}`,
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

                county.scenarios.forEach((scenario) => {
                    scenario.commodities.forEach((commodity) => {
                        if (!counties[countyFIPS].commodities[commodity.commodityName]) {
                            counties[countyFIPS].commodities[commodity.commodityName] = {
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

                        counties[countyFIPS].hasData = true;

                        commodity.programs.forEach((program) => {
                            if (
                                !selectedPrograms.includes("All Programs") &&
                                !selectedPrograms.includes(program.programName)
                            ) {
                                return;
                            }

                            if (!counties[countyFIPS].programs[program.programName]) {
                                counties[countyFIPS].programs[program.programName] = {
                                    value: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    baseAcres: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0,
                                    currentMeanRate: 0,
                                    currentMedianRate: 0,
                                    proposedMeanRate: 0,
                                    proposedMedianRate: 0
                                };
                            }

                            const value = program.totalPaymentInDollars || 0;
                            const baseAcres = program.baseAcres || 0;

                            if (
                                !counties[countyFIPS].commodities[commodity.commodityName].programs[program.programName]
                            ) {
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ] = {
                                    value: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    baseAcres: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0
                                };
                            }

                            if (commodity.baseAcres !== undefined && commodity.baseAcres > 0) {
                                const commodityAcres = commodity.baseAcres;

                                if (isProposed) {
                                    counties[countyFIPS].commodities[commodity.commodityName].proposedBaseAcres =
                                        commodityAcres;
                                    counties[countyFIPS].commodities[commodity.commodityName].baseAcres =
                                        commodityAcres;
                                } else {
                                    counties[countyFIPS].commodities[commodity.commodityName].currentBaseAcres =
                                        commodityAcres;
                                    counties[countyFIPS].commodities[commodity.commodityName].baseAcres =
                                        commodityAcres;
                                }
                            }

                            if (!hasProcessedBaseAcres) {
                                const totalBaseAcres = getTotalBaseAcres(
                                    county,
                                    selectedCommodities,
                                    selectedPrograms,
                                    isProposed ? "Proposed" : "Current"
                                );

                                if (isProposed) {
                                    counties[countyFIPS].proposedBaseAcres = totalBaseAcres;
                                    counties[countyFIPS].baseAcres = totalBaseAcres;
                                } else {
                                    counties[countyFIPS].currentBaseAcres = totalBaseAcres;
                                    counties[countyFIPS].baseAcres = totalBaseAcres;
                                }
                                hasProcessedBaseAcres = true;

                                if (totalBaseAcres > 0) {
                                    counties[countyFIPS].hasValidBaseAcres = true;
                                }
                            }

                            if (isProposed) {
                                counties[countyFIPS].programs[program.programName].proposedBaseAcres += baseAcres;
                            } else {
                                counties[countyFIPS].programs[program.programName].currentBaseAcres += baseAcres;
                            }

                            if (isProposed) {
                                counties[countyFIPS].proposedValue += value;
                                counties[countyFIPS].value = counties[countyFIPS].proposedValue;
                                counties[countyFIPS].commodities[commodity.commodityName].proposedValue += value;
                                counties[countyFIPS].programs[program.programName].proposedValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ].proposedValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ].proposedBaseAcres += baseAcres;
                            } else {
                                counties[countyFIPS].currentValue += value;
                                counties[countyFIPS].value = counties[countyFIPS].currentValue;
                                counties[countyFIPS].commodities[commodity.commodityName].currentValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].value =
                                    counties[countyFIPS].commodities[commodity.commodityName].currentValue;
                                counties[countyFIPS].programs[program.programName].currentValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ].currentValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ].currentBaseAcres += baseAcres;
                                counties[countyFIPS].commodities[commodity.commodityName].programs[
                                    program.programName
                                ].value =
                                    counties[countyFIPS].commodities[commodity.commodityName].programs[
                                        program.programName
                                    ].currentValue;
                            }

                            if (!counties[countyFIPS].yearlyData[year]) {
                                counties[countyFIPS].yearlyData[year] = {
                                    value: 0,
                                    baseAcres: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0
                                };
                            }
                            if (isProposed) {
                                counties[countyFIPS].yearlyData[year].proposedValue += value;
                                counties[countyFIPS].yearlyData[year].proposedBaseAcres += baseAcres;
                            } else {
                                counties[countyFIPS].yearlyData[year].currentValue += value;
                                counties[countyFIPS].yearlyData[year].currentBaseAcres += baseAcres;
                            }
                            counties[countyFIPS].yearlyData[year].value += value;
                            counties[countyFIPS].yearlyData[year].baseAcres = Math.max(
                                counties[countyFIPS].yearlyData[year].currentBaseAcres,
                                counties[countyFIPS].yearlyData[year].proposedBaseAcres
                            );

                            if (!counties[countyFIPS].commodities[commodity.commodityName].yearlyData) {
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData = {};
                            }
                            if (!counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year]) {
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year] = {
                                    value: 0,
                                    baseAcres: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0
                                };
                            }
                            if (isProposed) {
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData[
                                    year
                                ].proposedValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData[
                                    year
                                ].proposedBaseAcres += baseAcres;
                            } else {
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData[
                                    year
                                ].currentValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].yearlyData[
                                    year
                                ].currentBaseAcres += baseAcres;
                            }
                            counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year].value += value;
                            counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year].baseAcres =
                                Math.max(
                                    counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year]
                                        .currentBaseAcres,
                                    counties[countyFIPS].commodities[commodity.commodityName].yearlyData[year]
                                        .proposedBaseAcres
                                );
                        });
                    });
                });
            });
        });
    };

    if (viewMode === "difference") {
        yearsToAggregate.forEach((year) => {
            const currentYearData = countyData[year] || [];
            const proposedYearData = countyDataProposed[year] || [];
            processCountyData(currentYearData, false, year);
            processCountyData(proposedYearData, true, year);
        });
    } else if (viewMode === "proposed") {
        yearsToAggregate.forEach((year) => {
            const proposedYearData = countyDataProposed[year] || [];
            processCountyData(proposedYearData, true, year);
        });
    } else {
        yearsToAggregate.forEach((year) => {
            const currentYearData = countyData[year] || [];
            processCountyData(currentYearData, false, year);
        });
    }

    Object.values(counties).forEach((county: any) => {
        if (viewMode === "difference") {
            county.value = county.proposedValue - county.currentValue;
        } else if (viewMode === "proposed") {
            county.value = county.proposedValue;
        } else {
            county.value = county.currentValue;
        }
        county.percentChange = calculatePercentChange(county.currentValue, county.proposedValue);
        Object.values(county.commodities).forEach((commodity: any) => {
            if (viewMode === "difference") {
                commodity.value = commodity.proposedValue - commodity.currentValue;
            } else if (viewMode === "proposed") {
                commodity.value = commodity.proposedValue;
            } else {
                commodity.value = commodity.currentValue;
            }
        });

        Object.values(county.programs).forEach((program: any) => {
            program.value = program.proposedValue - program.currentValue;
        });

        let totalBaseAcres = 0;
        let currentTotalBaseAcres = 0;
        let proposedTotalBaseAcres = 0;

        if (county.yearlyData && Object.keys(county.yearlyData).length > 0) {
            Object.values(county.yearlyData).forEach((yearData: any) => {
                totalBaseAcres += yearData.baseAcres || 0;
                currentTotalBaseAcres += yearData.currentBaseAcres || 0;
                proposedTotalBaseAcres += yearData.proposedBaseAcres || 0;
            });
        }

        county.baseAcres = totalBaseAcres;
        county.currentBaseAcres = currentTotalBaseAcres;
        county.proposedBaseAcres = proposedTotalBaseAcres;
        county.hasValidBaseAcres = county.baseAcres > 0;

        if (county.programs) {
            Object.entries(county.programs).forEach(([, programData]: [string, any]) => {
                if (programData.currentBaseAcres > 0) {
                    programData.currentMeanRate = programData.currentValue / programData.currentBaseAcres;
                    programData.currentMeanRate = Math.round(programData.currentMeanRate * 100) / 100;
                }

                if (programData.proposedBaseAcres > 0) {
                    programData.proposedMeanRate = programData.proposedValue / programData.proposedBaseAcres;
                    programData.proposedMeanRate = Math.round(programData.proposedMeanRate * 100) / 100;
                }
            });
        }

        if (county.commodities) {
            Object.entries(county.commodities).forEach(([, commodityData]: [string, any]) => {
                if (commodityData.currentBaseAcres > 0) {
                    commodityData.currentMeanRate = commodityData.currentValue / commodityData.currentBaseAcres;
                    commodityData.currentMeanRate = Math.round(commodityData.currentMeanRate * 100) / 100;
                    if (viewMode === "current") {
                        commodityData.meanPaymentRateInDollarsPerAcre = commodityData.currentMeanRate;
                    }
                }

                if (commodityData.proposedBaseAcres > 0) {
                    commodityData.proposedMeanRate = commodityData.proposedValue / commodityData.proposedBaseAcres;
                    commodityData.proposedMeanRate = Math.round(commodityData.proposedMeanRate * 100) / 100;
                    if (viewMode === "proposed") {
                        commodityData.meanPaymentRateInDollarsPerAcre = commodityData.proposedMeanRate;
                    }
                }

                if (
                    viewMode === "difference" &&
                    commodityData.currentBaseAcres > 0 &&
                    commodityData.proposedBaseAcres > 0
                ) {
                    commodityData.meanRateDifference = commodityData.proposedMeanRate - commodityData.currentMeanRate;
                    commodityData.meanPaymentRateInDollarsPerAcre = commodityData.meanRateDifference;
                }

                if (commodityData.programs) {
                    Object.entries(commodityData.programs).forEach(([, programData]: [string, any]) => {
                        if (programData.currentBaseAcres > 0) {
                            programData.currentMeanRate = programData.currentValue / programData.currentBaseAcres;
                            programData.currentMeanRate = Math.round(programData.currentMeanRate * 100) / 100;
                        }

                        if (programData.proposedBaseAcres > 0) {
                            programData.proposedMeanRate = programData.proposedValue / programData.proposedBaseAcres;
                            programData.proposedMeanRate = Math.round(programData.proposedMeanRate * 100) / 100;
                        }
                    });
                }
            });
        }

        if (county.hasData && county.hasValidBaseAcres) {
            const numberOfYears = yearsToAggregate.length;
            if (county.currentBaseAcres > 0) {
                const currentMeanRateResult = calculateWeightedMeanRate(
                    county.currentValue,
                    county.currentBaseAcres,
                    county.isMultiSelection,
                    numberOfYears
                );

                county.currentMeanRatePrecise = currentMeanRateResult.rate;

                county.currentMeanRate = Math.round(Math.min(currentMeanRateResult.rate, 1000) * 100) / 100;
                county.isCurrentMeanWeighted = currentMeanRateResult.isWeightedAverage;
            } else {
                county.currentMeanRatePrecise = 0;
                county.currentMeanRate = 0;
                county.isCurrentMeanWeighted = false;
            }

            if (county.proposedBaseAcres > 0) {
                const proposedMeanRateResult = calculateWeightedMeanRate(
                    county.proposedValue,
                    county.proposedBaseAcres,
                    county.isMultiSelection,
                    numberOfYears
                );

                county.proposedMeanRatePrecise = proposedMeanRateResult.rate;

                county.proposedMeanRate = Math.round(Math.min(proposedMeanRateResult.rate, 1000) * 100) / 100;
                county.isProposedMeanWeighted = proposedMeanRateResult.isWeightedAverage;
            } else {
                county.proposedMeanRatePrecise = 0;
                county.proposedMeanRate = 0;
                county.isProposedMeanWeighted = false;
            }

            if (viewMode === "proposed") {
                county.meanPaymentRateInDollarsPerAcre = county.proposedMeanRate;
                county.isMeanWeighted = county.isProposedMeanWeighted;
            } else {
                county.meanPaymentRateInDollarsPerAcre = county.currentMeanRate;
                county.isMeanWeighted = county.isCurrentMeanWeighted;
            }

            const preciseRateDifference = county.proposedMeanRatePrecise - county.currentMeanRatePrecise;
            county.meanRateDifference = Math.round(preciseRateDifference * 100) / 100;

            if (county.meanRateDifference > 500) {
                county.meanRateDifference = 500;
            } else if (county.meanRateDifference < -500) {
                county.meanRateDifference = -500;
            }
        }

        if (showMeanValues) {
            if (county.hasValidBaseAcres) {
                if (viewMode === "difference") {
                    if (Number.isFinite(county.meanRateDifference) && county.meanRateDifference !== 0) {
                        dataValues.push(county.meanRateDifference);
                    }
                } else if (
                    Number.isFinite(county.meanPaymentRateInDollarsPerAcre) &&
                    county.meanPaymentRateInDollarsPerAcre !== 0
                ) {
                    dataValues.push(county.meanPaymentRateInDollarsPerAcre);
                }
            }
        } else if (viewMode === "current") {
            if (county.currentValue !== 0) {
                dataValues.push(county.currentValue);
            }
        } else if (viewMode === "proposed") {
            if (county.proposedValue !== 0) {
                dataValues.push(county.proposedValue);
            }
        } else if (county.value !== 0) {
            dataValues.push(county.value);
        }

        county.hasData = isDataValid(county);

        if (!county.hasData) {
            county.hasData = hasValidCountyData(county);
        }

        if (!county.hasData) {
            county.value = 0;
            county.currentValue = 0;
            county.proposedValue = 0;
            county.baseAcres = 0;
            county.currentBaseAcres = 0;
            county.proposedBaseAcres = 0;
            county.meanPaymentRateInDollarsPerAcre = 0;
            county.hasValidBaseAcres = false;
            if (county.commodities) {
                Object.values(county.commodities).forEach((commodity: any) => {
                    commodity.value = 0;
                    commodity.currentValue = 0;
                    commodity.proposedValue = 0;
                    commodity.baseAcres = 0;
                    commodity.currentBaseAcres = 0;
                    commodity.proposedBaseAcres = 0;
                });
            }
            if (county.programs) {
                Object.values(county.programs).forEach((program: any) => {
                    program.value = 0;
                    program.currentValue = 0;
                    program.proposedValue = 0;
                    program.baseAcres = 0;
                    program.currentBaseAcres = 0;
                    program.proposedBaseAcres = 0;
                });
            }
        }
    });

    if (Object.keys(counties).length === 0) {
        if (selectedState !== "All States") {
            const availableYears = Object.keys(countyData);
            let foundCounties = false;
            const stateCodesForSelectedState: string[] = [];
            Object.entries(stateCodesData).forEach(([code, name]) => {
                if (name === selectedState) {
                    stateCodesForSelectedState.push(code);
                }
            });
            availableYears.forEach((year) => {
                const yearData = countyData[year] || [];
                yearData.forEach((state) => {
                    const stateCode = state.state;
                    if (
                        stateCodesData[stateCode] === selectedState ||
                        stateCodesForSelectedState.some((code) => code === stateCode)
                    ) {
                        state.counties.forEach((county) => {
                            if (!counties[county.countyFIPS]) {
                                const hasAnyData =
                                    county.scenarios &&
                                    county.scenarios.some(
                                        (scenario) =>
                                            scenario.commodities &&
                                            scenario.commodities.some(
                                                (commodity) =>
                                                    commodity.programs &&
                                                    commodity.programs.some(
                                                        (program) => program.totalPaymentInDollars > 0
                                                    )
                                            )
                                    );

                                if (hasAnyData) {
                                    if (viewMode === "difference") {
                                        counties[county.countyFIPS] = {
                                            value: 0,
                                            currentValue: 0,
                                            proposedValue: 0,
                                            percentChange: 0,
                                            commodities: {},
                                            programs: {},
                                            name:
                                                county.countyName ||
                                                getCountyNameFromFips(county.countyFIPS) ||
                                                `County ${county.countyFIPS}`,
                                            baseAcres: 0,
                                            currentBaseAcres: 0,
                                            proposedBaseAcres: 0,
                                            currentMeanRate: 0,
                                            proposedMeanRate: 0,
                                            meanRateDifference: 0,
                                            yearlyData: {},
                                            hasData: hasAnyData,
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
                                    } else {
                                        counties[county.countyFIPS] = {
                                            value: 0,
                                            commodities: {},
                                            programs: {},
                                            name:
                                                county.countyName ||
                                                getCountyNameFromFips(county.countyFIPS) ||
                                                `County ${county.countyFIPS}`,
                                            baseAcres: 0,
                                            meanPaymentRateInDollarsPerAcre: 0,
                                            yearlyData: {},
                                            hasData: hasAnyData,
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
                                    foundCounties = true;
                                }
                            }
                        });
                    }
                });
            });

            if (!foundCounties) {
                return { counties: {}, thresholds: [], data: [], selectedCommodities, selectedPrograms };
            }
        } else {
            return { counties: {}, thresholds: [], data: [], selectedCommodities, selectedPrograms };
        }
    }

    const validDataValues = dataValues.filter(
        (value) =>
            value !== undefined && value !== null && !Number.isNaN(value) && value !== 0 && Number.isFinite(value)
    );

    const percentiles = getMapPercentiles(percentileMode);

    const thresholds = calculateThresholds(validDataValues, percentiles);

    return {
        counties,
        thresholds,
        data: dataValues,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        viewMode,
        selectedYear,
        showMeanValues
    };
};
