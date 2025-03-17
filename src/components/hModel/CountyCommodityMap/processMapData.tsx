import { calculateThresholds } from "../../shared/ColorFunctions";

export const processMapData = ({
    countyData,
    countyDataProposed,
    selectedYear,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    stateCodesData,
    yearAggregation,
    showMeanValues
}: {
    countyData: Record<string, any>;
    countyDataProposed: Record<string, any>;
    selectedYear: string;
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    selectedState: string;
    stateCodesData: Record<string, string>;
    yearAggregation: number;
    showMeanValues: boolean;
}) => {
    const counties = {};
    const dataValues: number[] = [];
    if (!countyData[selectedYear] && !countyDataProposed[selectedYear]) {
        return { counties: {}, thresholds: [], data: [], selectedCommodities };
    }
    const yearsToAggregate: string[] = [];
    if (yearAggregation > 0 && !showMeanValues) {
        const availableYears = Object.keys(countyData).sort();
        const currentIndex = availableYears.indexOf(selectedYear);
        yearsToAggregate.push(selectedYear);
        for (let i = 1; i <= yearAggregation; i++) {
            const prevIndex = currentIndex - i;
            if (prevIndex >= 0) {
                yearsToAggregate.push(availableYears[prevIndex]);
            }
        }
    } else {
        yearsToAggregate.push(selectedYear);
    }
    if (viewMode === "difference") {
        yearsToAggregate.forEach((year) => {
            const currentYearData = countyData[year] || [];
            const proposedYearData = countyDataProposed[year] || [];
            currentYearData.forEach((state) => {
                if (selectedState !== "All States" && stateCodesData[state.stateCode] !== selectedState) {
                    return;
                }
                state.counties.forEach((county) => {
                    counties[county.countyFIPS] = {
                        value: 0,
                        currentValue: 0,
                        proposedValue: 0,
                        percentChange: 0,
                        commodities: {},
                        programs: {},
                        name: county.countyName || `County ${county.countyFIPS}`,
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
                        yearlyData: {}
                    };
                    county.scenarios.forEach((scenario) => {
                        scenario.commodities.forEach((commodity) => {
                            if (!counties[county.countyFIPS].commodities[commodity.commodityName]) {
                                counties[county.countyFIPS].commodities[commodity.commodityName] = {
                                    value: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    baseAcres: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0
                                };
                            }
                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }
                                if (
                                    !selectedCommodities.includes("All Commodities") &&
                                    !selectedCommodities.includes(commodity.commodityName)
                                ) {
                                    return;
                                }
                                
                                if (!counties[county.countyFIPS].programs[program.programName]) {
                                    counties[county.countyFIPS].programs[program.programName] = {
                                        value: 0,
                                        currentValue: 0,
                                        proposedValue: 0,
                                        baseAcres: 0,
                                        currentBaseAcres: 0,
                                        proposedBaseAcres: 0,
                                        currentMeanRate: program.meanPaymentRateInDollarsPerAcre || 0,
                                        currentMedianRate: program.medianPaymentRateInDollarsPerAcre || 0,
                                        proposedMeanRate: 0,
                                        proposedMedianRate: 0
                                    };
                                }
                                counties[county.countyFIPS].currentValue += program.totalPaymentInDollars;
                                counties[county.countyFIPS].currentBaseAcres += program.baseAcres || 0;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentValue +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentBaseAcres +=
                                    program.baseAcres || 0;
                                counties[county.countyFIPS].programs[program.programName].currentValue +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].programs[program.programName].currentBaseAcres +=
                                    program.baseAcres || 0;
                                if (program.baseAcres && program.baseAcres > 0) {
                                    counties[county.countyFIPS].currentTotalWeightedMean +=
                                        program.meanPaymentRateInDollarsPerAcre * program.baseAcres;
                                    counties[county.countyFIPS].currentTotalWeightedMedian +=
                                        program.medianPaymentRateInDollarsPerAcre * program.baseAcres;
                                }
                                if (yearAggregation > 0 && !showMeanValues) {
                                    if (!counties[county.countyFIPS].yearlyData[year]) {
                                        counties[county.countyFIPS].yearlyData[year] = {
                                            value: 0,
                                            baseAcres: 0
                                        };
                                    }
                                    counties[county.countyFIPS].yearlyData[year].value += program.totalPaymentInDollars;
                                    counties[county.countyFIPS].yearlyData[year].baseAcres += program.baseAcres || 0;
                                }
                            });
                        });
                    });
                });
            });
            proposedYearData.forEach((state) => {
                if (selectedState !== "All States" && stateCodesData[state.stateCode] !== selectedState) {
                    return;
                }
                state.counties.forEach((county) => {
                    if (!counties[county.countyFIPS]) {
                        counties[county.countyFIPS] = {
                            value: 0,
                            currentValue: 0,
                            proposedValue: 0,
                            percentChange: 0,
                            commodities: {},
                            programs: {},
                            name: county.countyName || `County ${county.countyFIPS}`,
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
                            yearlyData: {}
                        };
                    }
                    if (yearAggregation > 0 && !showMeanValues) {
                        if (!counties[county.countyFIPS].yearlyData[year]) {
                            counties[county.countyFIPS].yearlyData[year] = {
                                value: 0,
                                baseAcres: 0
                            };
                        }
                    }
                    county.scenarios.forEach((scenario) => {
                        scenario.commodities.forEach((commodity) => {
                            if (!counties[county.countyFIPS].commodities[commodity.commodityName]) {
                                counties[county.countyFIPS].commodities[commodity.commodityName] = {
                                    value: 0,
                                    currentValue: 0,
                                    proposedValue: 0,
                                    baseAcres: 0,
                                    currentBaseAcres: 0,
                                    proposedBaseAcres: 0
                                };
                            }
                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }
                                if (
                                    !selectedCommodities.includes("All Commodities") &&
                                    !selectedCommodities.includes(commodity.commodityName)
                                ) {
                                    return;
                                }
                                if (!counties[county.countyFIPS].programs[program.programName]) {
                                    counties[county.countyFIPS].programs[program.programName] = {
                                        value: 0,
                                        currentValue: 0,
                                        proposedValue: 0,
                                        baseAcres: 0,
                                        currentBaseAcres: 0,
                                        proposedBaseAcres: 0,
                                        currentMeanRate: 0,
                                        currentMedianRate: 0,
                                        proposedMeanRate: program.meanPaymentRateInDollarsPerAcre || 0,
                                        proposedMedianRate: program.medianPaymentRateInDollarsPerAcre || 0
                                    };
                                }
                                counties[county.countyFIPS].proposedValue += program.totalPaymentInDollars;
                                counties[county.countyFIPS].proposedBaseAcres += program.baseAcres || 0;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedValue +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedBaseAcres +=
                                    program.baseAcres || 0;
                                counties[county.countyFIPS].programs[program.programName].proposedValue +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].programs[program.programName].proposedBaseAcres +=
                                    program.baseAcres || 0;
                                if (program.baseAcres && program.baseAcres > 0) {
                                    counties[county.countyFIPS].proposedTotalWeightedMean +=
                                        program.meanPaymentRateInDollarsPerAcre * program.baseAcres;
                                    counties[county.countyFIPS].proposedTotalWeightedMedian +=
                                        program.medianPaymentRateInDollarsPerAcre * program.baseAcres;
                                }
                                if (yearAggregation > 0 && !showMeanValues) {
                                    counties[county.countyFIPS].yearlyData[year].value += program.totalPaymentInDollars;
                                    counties[county.countyFIPS].yearlyData[year].baseAcres += program.baseAcres || 0;
                                }
                            });
                        });
                    });
                });
            });
        });
        Object.values(counties).forEach((county: any) => {
            if (county.currentBaseAcres > 0) {
                county.currentMeanRate = county.currentTotalWeightedMean / county.currentBaseAcres;
                county.currentMedianRate = county.currentTotalWeightedMedian / county.currentBaseAcres;
            }
            if (county.proposedBaseAcres > 0) {
                county.proposedMeanRate = county.proposedTotalWeightedMean / county.proposedBaseAcres;
                county.proposedMedianRate = county.proposedTotalWeightedMedian / county.proposedBaseAcres;
            }
            county.meanRateDifference = county.proposedMeanRate - county.currentMeanRate;
            county.medianRateDifference = county.proposedMedianRate - county.currentMedianRate;
            county.value = county.proposedValue - county.currentValue;
            county.percentChange = (county.value / county.currentValue) * 100;
            Object.values(county.commodities).forEach((commodity: any) => {
                commodity.value = commodity.proposedValue - commodity.currentValue;
            });
            Object.values(county.programs).forEach((program: any) => {
                program.value = program.proposedValue - program.currentValue;
            });
            if (showMeanValues) {
                dataValues.push(county.meanRateDifference);
            } else {
                dataValues.push(county.value);
            }
        });
    } else {
        yearsToAggregate.forEach((year) => {
            const yearData = countyData[year] || [];
            yearData.forEach((state) => {
                if (selectedState !== "All States" && stateCodesData[state.stateCode] !== selectedState) {
                    return;
                }
                state.counties.forEach((county) => {
                    if (!counties[county.countyFIPS]) {
                        counties[county.countyFIPS] = {
                            value: 0,
                            commodities: {},
                            programs: {},
                            name: county.countyName || `County ${county.countyFIPS}`,
                            baseAcres: 0,
                            meanPaymentRateInDollarsPerAcre: 0,
                            medianPaymentRateInDollarsPerAcre: 0,
                            yearlyData: {}
                        };
                    }
                    if (yearAggregation > 0 && !showMeanValues) {
                        if (!counties[county.countyFIPS].yearlyData[year]) {
                            counties[county.countyFIPS].yearlyData[year] = {
                                value: 0,
                                baseAcres: 0
                            };
                        }
                    }
                    county.scenarios.forEach((scenario) => {
                        scenario.commodities.forEach((commodity) => {
                            if (!counties[county.countyFIPS].commodities[commodity.commodityName]) {
                                counties[county.countyFIPS].commodities[commodity.commodityName] = {
                                    value: 0,
                                    baseAcres: 0
                                };
                            }
                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }

                                if (
                                    !selectedCommodities.includes("All Commodities") &&
                                    !selectedCommodities.includes(commodity.commodityName)
                                ) {
                                    return;
                                }
                                if (!counties[county.countyFIPS].programs[program.programName]) {
                                    counties[county.countyFIPS].programs[program.programName] = {
                                        value: 0,
                                        baseAcres: 0,
                                        meanPaymentRateInDollarsPerAcre: program.meanPaymentRateInDollarsPerAcre || 0,
                                        medianPaymentRateInDollarsPerAcre: program.medianPaymentRateInDollarsPerAcre || 0
                                    };
                                }
                                counties[county.countyFIPS].value += program.totalPaymentInDollars;
                                counties[county.countyFIPS].baseAcres += program.baseAcres || 0;
                                if (yearAggregation > 0 && !showMeanValues) {
                                    counties[county.countyFIPS].yearlyData[year].value += program.totalPaymentInDollars;
                                    counties[county.countyFIPS].yearlyData[year].baseAcres += program.baseAcres || 0;
                                }
                                counties[county.countyFIPS].commodities[commodity.commodityName].value +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].commodities[commodity.commodityName].baseAcres +=
                                    program.baseAcres || 0;
                                counties[county.countyFIPS].programs[program.programName].value +=
                                    program.totalPaymentInDollars;
                                counties[county.countyFIPS].programs[program.programName].baseAcres +=
                                    program.baseAcres || 0;
                                counties[county.countyFIPS].programs[program.programName].meanPaymentRateInDollarsPerAcre += program.meanPaymentRateInDollarsPerAcre || 0;
                                counties[county.countyFIPS].programs[program.programName].medianPaymentRateInDollarsPerAcre += program.medianPaymentRateInDollarsPerAcre || 0;
                            });
                        });
                    });
                });
            });
        });
        Object.values(counties).forEach((county: any) => {
            if (showMeanValues) {
                let totalWeightedMean = 0;
                let totalWeightedMedian = 0;
                let totalBaseAcres = 0;
                if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                    const programName = selectedPrograms[0];
                    if (county.programs[programName]) {
                        county.meanPaymentRateInDollarsPerAcre = county.programs[programName].meanPaymentRateInDollarsPerAcre;
                        county.medianPaymentRateInDollarsPerAcre = county.programs[programName].medianPaymentRateInDollarsPerAcre;
                    }
                } else {
                    Object.values(county.programs).forEach((program: any) => {
                        if (program.baseAcres > 0) {
                            totalWeightedMean += program.meanPaymentRateInDollarsPerAcre * program.baseAcres;
                            totalWeightedMedian += program.medianPaymentRateInDollarsPerAcre * program.baseAcres;
                            totalBaseAcres += program.baseAcres;
                        }
                    });
                    if (totalBaseAcres > 0) {
                        county.meanPaymentRateInDollarsPerAcre = totalWeightedMean / totalBaseAcres;
                        county.medianPaymentRateInDollarsPerAcre = totalWeightedMedian / totalBaseAcres;
                    }
                }
                
                dataValues.push(county.meanPaymentRateInDollarsPerAcre);
            } else {
                dataValues.push(county.value);
            }
        });
    }
    const thresholds = calculateThresholds(dataValues);
    return {
        counties,
        thresholds,
        data: dataValues,
        selectedCommodities
    };
};

