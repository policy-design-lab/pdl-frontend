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
                processedAnyCounties = true;

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
                        name: county.countyName || `County ${countyFIPS}`,
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
                        state: selectedState,
                        stateFIPS: stateCode
                    };
                }

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

                            counties[countyFIPS].hasData = true;

                            if (!counties[countyFIPS].programs[program.programName]) {
                                counties[countyFIPS].programs[program.programName] = {
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
                                counties[countyFIPS].commodities[
                                    commodity.commodityName
                                ].meanPaymentRateInDollarsPerAcre = meanRate;
                                counties[countyFIPS].commodities[
                                    commodity.commodityName
                                ].medianPaymentRateInDollarsPerAcre = medianRate;
                            }

                            if (isProposed) {
                                counties[countyFIPS].proposedValue += value;
                                counties[countyFIPS].proposedBaseAcres += baseAcres;
                                counties[countyFIPS].value = counties[countyFIPS].proposedValue;
                                counties[countyFIPS].baseAcres = counties[countyFIPS].proposedBaseAcres;
                                counties[countyFIPS].commodities[commodity.commodityName].proposedValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].proposedBaseAcres +=
                                    baseAcres;
                                counties[countyFIPS].programs[program.programName].proposedValue += value;
                                counties[countyFIPS].programs[program.programName].proposedBaseAcres += baseAcres;
                                counties[countyFIPS].programs[program.programName].proposedMeanRate = meanRate;
                                counties[countyFIPS].programs[program.programName].proposedMedianRate = medianRate;

                                if (baseAcres > 0) {
                                    counties[countyFIPS].commodities[
                                        commodity.commodityName
                                    ].meanPaymentRateInDollarsPerAcre = meanRate;
                                    counties[countyFIPS].commodities[
                                        commodity.commodityName
                                    ].medianPaymentRateInDollarsPerAcre = medianRate;
                                }
                            } else {
                                counties[countyFIPS].currentValue += value;
                                counties[countyFIPS].currentBaseAcres += baseAcres;
                                counties[countyFIPS].value = counties[countyFIPS].currentValue;
                                counties[countyFIPS].baseAcres = counties[countyFIPS].currentBaseAcres;
                                counties[countyFIPS].commodities[commodity.commodityName].currentValue += value;
                                counties[countyFIPS].commodities[commodity.commodityName].currentBaseAcres += baseAcres;

                                counties[countyFIPS].commodities[commodity.commodityName].value =
                                    counties[countyFIPS].commodities[commodity.commodityName].currentValue;
                                counties[countyFIPS].commodities[commodity.commodityName].baseAcres =
                                    counties[countyFIPS].commodities[commodity.commodityName].currentBaseAcres;

                                if (baseAcres > 0) {
                                    counties[countyFIPS].commodities[
                                        commodity.commodityName
                                    ].meanPaymentRateInDollarsPerAcre = meanRate;
                                    counties[countyFIPS].commodities[
                                        commodity.commodityName
                                    ].medianPaymentRateInDollarsPerAcre = medianRate;
                                }

                                counties[countyFIPS].programs[program.programName].currentValue += value;
                                counties[countyFIPS].programs[program.programName].currentBaseAcres += baseAcres;
                            }

                            if (baseAcres > 0) {
                                if (isProposed) {
                                    counties[countyFIPS].proposedTotalWeightedMean += meanRate * baseAcres;
                                    counties[countyFIPS].proposedTotalWeightedMedian += medianRate * baseAcres;
                                } else {
                                    counties[countyFIPS].currentTotalWeightedMean += meanRate * baseAcres;
                                    counties[countyFIPS].currentTotalWeightedMedian += medianRate * baseAcres;
                                }
                            }

                            if (yearAggregation > 0 && !showMeanValues) {
                                if (!counties[countyFIPS].yearlyData[year]) {
                                    counties[countyFIPS].yearlyData[year] = {
                                        value: 0,
                                        baseAcres: 0
                                    };
                                }
                                counties[countyFIPS].yearlyData[year].value += value;
                                counties[countyFIPS].yearlyData[year].baseAcres += baseAcres;
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
        let currentTotal = 0;
        let proposedTotal = 0;
        let currentBaseAcres = 0;
        let proposedBaseAcres = 0;

        Object.values(county.commodities).forEach((commodity: any) => {
            currentTotal += commodity.currentValue || 0;
            proposedTotal += commodity.proposedValue || 0;
            currentBaseAcres += commodity.currentBaseAcres || 0;
            proposedBaseAcres += commodity.proposedBaseAcres || 0;
        });

        county.currentValue = currentTotal;
        county.proposedValue = proposedTotal;
        county.currentBaseAcres = currentBaseAcres;
        county.proposedBaseAcres = proposedBaseAcres;

        if (viewMode === "difference") {
            county.value = county.proposedValue - county.currentValue;
        } else if (viewMode === "proposed") {
            county.value = county.proposedValue;
            county.baseAcres = county.proposedBaseAcres;
        } else {
            county.value = county.currentValue;
            county.baseAcres = county.currentBaseAcres;
        }

        county.percentChange = county.currentValue !== 0 ? (county.value / county.currentValue) * 100 : 0;

        Object.values(county.commodities).forEach((commodity: any) => {
            commodity.value =
                viewMode === "difference"
                    ? commodity.proposedValue - commodity.currentValue
                    : viewMode === "proposed"
                    ? commodity.proposedValue
                    : commodity.currentValue;

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

        if (showMeanValues) {
            if (viewMode === "difference") {
                dataValues.push(county.meanRateDifference);
            } else if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                const programName = selectedPrograms[0];
                const programData = county.programs[programName];
                if (programData) {
                    const programMeanRate =
                        viewMode === "proposed" ? programData.proposedMeanRate : programData.currentMeanRate;

                    if (programMeanRate !== undefined) {
                        dataValues.push(programMeanRate);
                    }
                }
            } else {
                dataValues.push(county.meanPaymentRateInDollarsPerAcre || 0);
            }
        } else if (viewMode === "current") {
            dataValues.push(county.currentValue);
        } else if (viewMode === "proposed") {
            dataValues.push(county.proposedValue);
        } else {
            dataValues.push(county.value);
        }
        let hasAnyRealData = false;
        let totalRealPayment = 0;
        let totalRealBaseAcres = 0;
        if (county.commodities) {
            Object.values(county.commodities).forEach((commodity: any) => {
                const commodityValue = parseFloat(commodity.value || 0);
                const commodityBaseAcres = parseFloat(commodity.baseAcres || 0);

                if (commodityValue > 0) {
                    hasAnyRealData = true;
                    totalRealPayment += commodityValue;
                }

                if (commodityBaseAcres > 0) {
                    totalRealBaseAcres += commodityBaseAcres;
                }
            });
        }
        county.hasData = hasAnyRealData && totalRealPayment > 0;
        if (!county.hasData) {
            county.value = 0;
            county.currentValue = 0;
            county.proposedValue = 0;
            county.baseAcres = 0;
            county.currentBaseAcres = 0;
            county.proposedBaseAcres = 0;
            county.meanPaymentRateInDollarsPerAcre = 0;
            county.medianPaymentRateInDollarsPerAcre = 0;
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
            for (const year of availableYears) {
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
                                            yearlyData: {},
                                            hasData: hasAnyData,
                                            state: selectedState,
                                            stateFIPS: stateCode
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
                                            yearlyData: {},
                                            hasData: hasAnyData,
                                            state: selectedState,
                                            stateFIPS: stateCode
                                        };
                                    }
                                    foundCounties = true;
                                }
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
    const validDataValues = dataValues.filter(
        (value) => value !== undefined && value !== null && !isNaN(value) && value !== 0 && isFinite(value)
    );
    const thresholds = validDataValues.length > 0 ? calculateThresholds(validDataValues) : [0, 0.25, 0.5, 0.75, 1];

    Object.entries(counties).forEach(([fips, county]: [string, any]) => {
        let recalculatedTotal = 0;
        Object.values(county.commodities).forEach((commodity: any) => {
            recalculatedTotal += commodity.value;
        });
    });

    Object.entries(counties).forEach(([fips, county]: [string, any]) => {
        let hasRealData = false;
        let totalRealValue = 0;
        if (county.commodities && Object.keys(county.commodities).length > 0) {
            Object.values(county.commodities).forEach((commodity: any) => {
                if (commodity.value > 0) {
                    if (parseFloat(commodity.value) >= 0.1) {
                        hasRealData = true;
                        totalRealValue += parseFloat(commodity.value);
                    }
                }
            });
        }

        county.hasData = hasRealData && totalRealValue > 0;

        if (!county.hasData) {
            county.value = 0;
            county.currentValue = 0;
            county.proposedValue = 0;
            county.baseAcres = 0;
            county.currentBaseAcres = 0;
            county.proposedBaseAcres = 0;
            if (county.commodities) {
                Object.values(county.commodities).forEach((commodity: any) => {
                    commodity.value = 0;
                    commodity.currentValue = 0;
                    commodity.proposedValue = 0;
                    commodity.baseAcres = 0;
                });
            }
            if (county.programs) {
                Object.values(county.programs).forEach((program: any) => {
                    program.value = 0;
                    program.currentValue = 0;
                    program.proposedValue = 0;
                });
            }
        }
    });

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
