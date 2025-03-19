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
    let stateFilterActive = selectedState !== "All States";
    let processedAnyCounties = false;

    const processCountyData = (yearData, isProposed = false, year: string) => {
        yearData.forEach((state) => {
            if (stateFilterActive && stateCodesData[state.state] !== selectedState) {
                return;
            }
            state.counties.forEach((county) => {
                processedAnyCounties = true;
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
                            const programIncluded = selectedPrograms.includes("All Programs") || 
                                                    selectedPrograms.includes(program.programName);
                            const commodityIncluded = selectedCommodities.includes("All Commodities") || 
                                                    selectedCommodities.includes(commodity.commodityName);
                            
                            if (!programIncluded || !commodityIncluded) {
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

                            const value = program.totalPaymentInDollars;
                            const baseAcres = program.baseAcres || 0;

                            if (isProposed) {
                                counties[county.countyFIPS].proposedValue += value;
                                counties[county.countyFIPS].proposedBaseAcres += baseAcres;
                                counties[county.countyFIPS].value = counties[county.countyFIPS].proposedValue;
                                counties[county.countyFIPS].baseAcres = counties[county.countyFIPS].proposedBaseAcres;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedValue += value;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedBaseAcres += baseAcres;
                                counties[county.countyFIPS].programs[program.programName].proposedValue += value;
                                counties[county.countyFIPS].programs[program.programName].proposedBaseAcres += baseAcres;
                                counties[county.countyFIPS].programs[program.programName].proposedMeanRate = program.meanPaymentRateInDollarsPerAcre || 0;
                                counties[county.countyFIPS].programs[program.programName].proposedMedianRate = program.medianPaymentRateInDollarsPerAcre || 0;
                            } else {
                                counties[county.countyFIPS].currentValue += value;
                                counties[county.countyFIPS].currentBaseAcres += baseAcres;
                                counties[county.countyFIPS].value = counties[county.countyFIPS].currentValue;
                                counties[county.countyFIPS].baseAcres = counties[county.countyFIPS].currentBaseAcres;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentValue += value;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentBaseAcres += baseAcres;
                                counties[county.countyFIPS].programs[program.programName].currentValue += value;
                                counties[county.countyFIPS].programs[program.programName].currentBaseAcres += baseAcres;
                            }

                            if (baseAcres > 0) {
                                if (isProposed) {
                                    counties[county.countyFIPS].proposedTotalWeightedMean +=
                                        program.meanPaymentRateInDollarsPerAcre * baseAcres;
                                    counties[county.countyFIPS].proposedTotalWeightedMedian +=
                                        program.medianPaymentRateInDollarsPerAcre * baseAcres;
                                } else {
                                    counties[county.countyFIPS].currentTotalWeightedMean +=
                                        program.meanPaymentRateInDollarsPerAcre * baseAcres;
                                    counties[county.countyFIPS].currentTotalWeightedMedian +=
                                        program.medianPaymentRateInDollarsPerAcre * baseAcres;
                                }
                            }

                            if (yearAggregation > 0 && !showMeanValues) {
                                if (!counties[county.countyFIPS].yearlyData[year]) {
                                    counties[county.countyFIPS].yearlyData[year] = {
                                        value: 0,
                                        baseAcres: 0
                                    };
                                }
                                counties[county.countyFIPS].yearlyData[year].value += value;
                                counties[county.countyFIPS].yearlyData[year].baseAcres += baseAcres;
                            }
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
            Object.values(counties).forEach((county: any) => {
                county.value = county.proposedValue - county.currentValue;
                county.baseAcres = county.currentBaseAcres;
            });
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
        
        if (viewMode === "difference") {
            county.value = county.proposedValue - county.currentValue;
            county.percentChange = county.currentValue !== 0 ? (county.value / county.currentValue) * 100 : 0;
        }
        
        Object.values(county.commodities).forEach((commodity: any) => {
            commodity.value = commodity.proposedValue - commodity.currentValue;
        });
        Object.values(county.programs).forEach((program: any) => {
            program.value = program.proposedValue - program.currentValue;
        });

        if (showMeanValues) {
            dataValues.push(county.meanRateDifference);
        } else {
            if (viewMode === "current") {
                dataValues.push(county.currentValue);
            } else if (viewMode === "proposed") {
                dataValues.push(county.proposedValue);
            } else {
                dataValues.push(county.value);
            }
        }
    });

    if (Object.keys(counties).length === 0) {
        if (selectedState !== "All States") {
            const availableYears = Object.keys(countyData);
            let foundCounties = false;
            
            for (const year of availableYears) {
                const yearData = countyData[year] || [];
                
                yearData.forEach(state => {
                    const stateCode = state.state;
                    const stateName = stateCodesData[stateCode];
                    
                    if (stateName === selectedState) {
                        state.counties.forEach(county => {
                            if (!counties[county.countyFIPS]) {
                                if (viewMode === "difference") {
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
                                } else {
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
                                foundCounties = true;
                            }
                        });
                    }
                });
            }
            
            if (!foundCounties) {
                return { counties: {}, thresholds: [], data: [], selectedCommodities };
            }
        } else {
            return { counties: {}, thresholds: [], data: [], selectedCommodities };
        }
    }
    
    const thresholds = calculateThresholds(dataValues);
    return {
        counties,
        thresholds,
        data: dataValues,
        selectedCommodities
    };
};
