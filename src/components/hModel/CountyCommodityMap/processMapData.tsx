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
    if (!countyData[selectedYear] && !countyDataProposed[selectedYear]) {
        return { counties: {}, thresholds: [], data: [], selectedCommodities };
    }

    const counties = {};
    const dataValues: number[] = [];
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

    const stateFilterActive = selectedState !== "All States";
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
                                proposedBaseAcres: 0,
                                meanPaymentRateInDollarsPerAcre: 0,
                                medianPaymentRateInDollarsPerAcre: 0
                            };
                        }

                        commodity.programs.forEach((program) => {
                            const programIncluded =
                                selectedPrograms.includes("All Programs") ||
                                selectedPrograms.includes(program.programName);
                            const commodityIncluded =
                                selectedCommodities.includes("All Commodities") ||
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
                            const meanRate = program.meanPaymentRateInDollarsPerAcre || 0;
                            const medianRate = program.medianPaymentRateInDollarsPerAcre || 0;
                            if (selectedPrograms.length === 1 && selectedPrograms[0] === program.programName) {
                                counties[county.countyFIPS].commodities[commodity.commodityName].meanPaymentRateInDollarsPerAcre = meanRate;
                                counties[county.countyFIPS].commodities[commodity.commodityName].medianPaymentRateInDollarsPerAcre = medianRate;
                            }

                            if (isProposed) {
                                counties[county.countyFIPS].proposedValue += value;
                                counties[county.countyFIPS].proposedBaseAcres += baseAcres;
                                counties[county.countyFIPS].value = counties[county.countyFIPS].proposedValue;
                                counties[county.countyFIPS].baseAcres = counties[county.countyFIPS].proposedBaseAcres;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedValue += value;
                                counties[county.countyFIPS].commodities[commodity.commodityName].proposedBaseAcres +=
                                    baseAcres;
                                counties[county.countyFIPS].programs[program.programName].proposedValue += value;
                                counties[county.countyFIPS].programs[program.programName].proposedBaseAcres +=
                                    baseAcres;
                                counties[county.countyFIPS].programs[program.programName].proposedMeanRate =
                                    meanRate;
                                counties[county.countyFIPS].programs[program.programName].proposedMedianRate =
                                    medianRate;
                                    
                                if (baseAcres > 0) {
                                    counties[county.countyFIPS].commodities[commodity.commodityName].meanPaymentRateInDollarsPerAcre = meanRate;
                                    counties[county.countyFIPS].commodities[commodity.commodityName].medianPaymentRateInDollarsPerAcre = medianRate;
                                }
                                
                            } else {
                                counties[county.countyFIPS].currentValue += value;
                                counties[county.countyFIPS].currentBaseAcres += baseAcres;
                                counties[county.countyFIPS].value = counties[county.countyFIPS].currentValue;
                                counties[county.countyFIPS].baseAcres = counties[county.countyFIPS].currentBaseAcres;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentValue += value;
                                counties[county.countyFIPS].commodities[commodity.commodityName].currentBaseAcres +=
                                    baseAcres;

                                counties[county.countyFIPS].commodities[commodity.commodityName].value = 
                                    counties[county.countyFIPS].commodities[commodity.commodityName].currentValue;
                                counties[county.countyFIPS].commodities[commodity.commodityName].baseAcres = 
                                    counties[county.countyFIPS].commodities[commodity.commodityName].currentBaseAcres;

                                if (baseAcres > 0) {
                                    counties[county.countyFIPS].commodities[commodity.commodityName].meanPaymentRateInDollarsPerAcre = meanRate;
                                    counties[county.countyFIPS].commodities[commodity.commodityName].medianPaymentRateInDollarsPerAcre = medianRate;
                                }
                                
                                counties[county.countyFIPS].programs[program.programName].currentValue += value;
                                counties[county.countyFIPS].programs[program.programName].currentBaseAcres += baseAcres;
                            }

                            if (baseAcres > 0) {
                                if (isProposed) {
                                    counties[county.countyFIPS].proposedTotalWeightedMean +=
                                        meanRate * baseAcres;
                                    counties[county.countyFIPS].proposedTotalWeightedMedian +=
                                        medianRate * baseAcres;
                                } else {
                                    counties[county.countyFIPS].currentTotalWeightedMean +=
                                        meanRate * baseAcres;
                                    counties[county.countyFIPS].currentTotalWeightedMedian +=
                                        medianRate * baseAcres;
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

            county.meanPaymentRateInDollarsPerAcre = county.currentMeanRate;
            county.medianPaymentRateInDollarsPerAcre = county.currentMedianRate;
            
            if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                const programName = selectedPrograms[0];
                const programData = county.programs[programName];
                if (programData && programData.currentBaseAcres > 0) {
                    county.meanPaymentRateInDollarsPerAcre = programData.currentMeanRate;
                    county.medianPaymentRateInDollarsPerAcre = programData.currentMedianRate;
                }
            }
        }
        if (county.proposedBaseAcres > 0) {
            county.proposedMeanRate = county.proposedTotalWeightedMean / county.proposedBaseAcres;
            county.proposedMedianRate = county.proposedTotalWeightedMedian / county.proposedBaseAcres;
            
            if (viewMode === "proposed") {
                county.meanPaymentRateInDollarsPerAcre = county.proposedMeanRate;
                county.medianPaymentRateInDollarsPerAcre = county.proposedMedianRate;
                
                if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                    const programName = selectedPrograms[0];
                    const programData = county.programs[programName];
                    if (programData && programData.proposedBaseAcres > 0) {
                        county.meanPaymentRateInDollarsPerAcre = programData.proposedMeanRate;
                        county.medianPaymentRateInDollarsPerAcre = programData.proposedMedianRate;
                    }
                }
            }
        }
        county.meanRateDifference = county.proposedMeanRate - county.currentMeanRate;
        county.medianRateDifference = county.proposedMedianRate - county.currentMedianRate;

        if (viewMode === "difference") {
            county.value = county.proposedValue - county.currentValue;
            county.percentChange = county.currentValue !== 0 ? (county.value / county.currentValue) * 100 : 0;
        }

        Object.values(county.commodities).forEach((commodity: any) => {
            commodity.value = viewMode === "difference" 
                ? commodity.proposedValue - commodity.currentValue 
                : (viewMode === "proposed" ? commodity.proposedValue : commodity.currentValue);
            if (commodity.currentBaseAcres > 0) {
                commodity.meanPaymentRateInDollarsPerAcre = commodity.currentValue / commodity.currentBaseAcres;
            }
            if (viewMode === "proposed" && commodity.proposedBaseAcres > 0) {
                commodity.meanPaymentRateInDollarsPerAcre = commodity.proposedValue / commodity.proposedBaseAcres;
            }
        });
        
        Object.values(county.programs).forEach((program: any) => {
            program.value = program.proposedValue - program.currentValue;
        });

        if (showMeanValues) {
            if (viewMode === "difference") {
                dataValues.push(county.meanRateDifference);
            } else {
                if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                    const programName = selectedPrograms[0];
                    const programData = county.programs[programName];
                    if (programData) {
                        const programMeanRate = viewMode === "proposed" 
                            ? programData.proposedMeanRate 
                            : programData.currentMeanRate;
                        
                        if (programMeanRate !== undefined) {
                            dataValues.push(programMeanRate);
                        }
                    }
                } else {
                    dataValues.push(county.meanPaymentRateInDollarsPerAcre || 0);
                }
            }
        } else if (viewMode === "current") {
            dataValues.push(county.currentValue);
        } else if (viewMode === "proposed") {
            dataValues.push(county.proposedValue);
        } else {
            dataValues.push(county.value);
        }
    });

    if (Object.keys(counties).length === 0) {
        if (selectedState !== "All States") {
            const availableYears = Object.keys(countyData);
            let foundCounties = false;

            for (const year of availableYears) {
                const yearData = countyData[year] || [];

                yearData.forEach((state) => {
                    const stateCode = state.state;
                    const stateName = stateCodesData[stateCode];

                    if (stateName === selectedState) {
                        state.counties.forEach((county) => {
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
    const validDataValues = dataValues.filter(value => 
        value !== undefined && 
        value !== null && 
        !isNaN(value) && 
        value !== 0 && 
        isFinite(value)
    );
    const thresholds = validDataValues.length > 0 
        ? calculateThresholds(validDataValues) 
        : [0, 0.25, 0.5, 0.75, 1];

    return {
        counties,
        thresholds,
        data: dataValues,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        viewMode,
        selectedYear
    };
};
