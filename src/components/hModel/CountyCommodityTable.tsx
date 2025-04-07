import React, { useMemo, useState, useEffect } from "react";
import { Box, Typography, Grid, TableContainer, Button } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import getCSVData from "../shared/getCSVData";
import {
    YearBreakdownData,
    CountyObject,
    formatCurrency,
    getCountyNameFromFips,
    findProposedCommodityAndProgram,
    calculateYearRange,
    compareWithDollarSign,
    generateTableTitle,
    generateCsvFilename,
    isDataValid,
    calculateWeightedMeanRate,
    getTotalBaseAcres
} from "./utils";

interface ColumnDef {
    Header: string;
    accessor: string;
    sortType?: (a: any, b: any) => number;
    disableSortBy: boolean;
}

const Styles = styled.div`
    width: 100%;

    .tableWrap {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
    }

    table {
        width: 100%;
        border-spacing: 0;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid #ddd;

            :last-child {
                border-right: 0;
            }
        }
    }

    .pagination {
        padding: 0.5rem;
    }

    .downloadbtn {
        background-color: rgba(47, 113, 100, 1);
        padding: 8px 16px;
        border-radius: 4px;
        color: #fff;
        text-decoration: none;
        display: block;
        cursor: pointer;
        margin-bottom: 1em;
        text-align: center;
    }
`;

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
                Search by county, state, or value:
            </Typography>
            <input
                value={globalFilter || ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Type to search..."
                style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minWidth: "200px"
                }}
            />
        </Box>
    );
};

const CountyCommodityTable = ({
    countyData,
    countyDataProposed,
    selectedYear,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    stateCodesData
}) => {
    const isAggregatedYear = useMemo(() => {
        return typeof selectedYear === "string" && selectedYear.includes("-");
    }, [selectedYear]);

    const yearRange = useMemo(() => {
        return calculateYearRange(selectedYear);
    }, [selectedYear]);

    const getTableTitle = useMemo(() => {
        return generateTableTitle(selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear);
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getCsvFilename = useMemo(() => {
        return generateCsvFilename(selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear);
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getTableData = React.useCallback(() => {
        if (isAggregatedYear) {
            const result: CountyObject[] = [];
            const stateCountyMap = new Map();

            yearRange.forEach((year) => {
                if (!countyData[year]) return;

                const currentYearData = viewMode === "proposed" ? countyDataProposed[year] : countyData[year];

                if (viewMode === "difference") {
                    const currentData = countyData[year] || [];
                    const proposedData = countyDataProposed[year] || [];

                    currentData.forEach((state) => {
                        if (selectedState !== "All States" && stateCodesData[state.state] !== selectedState) {
                            return;
                        }

                        const stateCode = state.state;
                        const stateName = stateCodesData[stateCode] || stateCode;

                        state.counties.forEach((county) => {
                            const countyName = getCountyNameFromFips(county.countyFIPS);
                            const stateCountyKey = `${stateCode}-${county.countyFIPS}`;

                            const proposedState = proposedData.find((s) => s.state === stateCode);
                            const proposedCounty = proposedState?.counties.find(
                                (c) => c.countyFIPS === county.countyFIPS
                            );

                            let countyObject: CountyObject;
                            if (stateCountyMap.has(stateCountyKey)) {
                                countyObject = stateCountyMap.get(stateCountyKey);
                            } else {
                                countyObject = {
                                    state: stateName,
                                    county: countyName,
                                    fips: county.countyFIPS,
                                    yearBreakdown: {},
                                    baseAcres: 0
                                };
                                stateCountyMap.set(stateCountyKey, countyObject);
                                result.push(countyObject);
                            }

                            if (!countyObject.yearBreakdown) {
                                countyObject.yearBreakdown = {};
                            }

                            if (!countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year] = {
                                    current: 0,
                                    proposed: 0,
                                    difference: 0,
                                    baseAcres: 0
                                };
                            }

                            if (!countyObject.baseAcres || countyObject.baseAcres === 0) {
                                const baseAcres = getTotalBaseAcres(
                                    county,
                                    selectedCommodities,
                                    selectedPrograms,
                                    "Current"
                                );
                                countyObject.baseAcres = Math.round(baseAcres * 100) / 100;

                                if (countyObject.yearBreakdown) {
                                    Object.keys(countyObject.yearBreakdown).forEach((yearKey) => {
                                        if (countyObject.yearBreakdown) {
                                            countyObject.yearBreakdown[yearKey].baseAcres = countyObject.baseAcres;
                                        }
                                    });
                                }
                            }

                            county.scenarios.forEach((scenario) => {
                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Commodities") &&
                                        !selectedCommodities.includes(commodity.commodityName)
                                    ) {
                                        return;
                                    }

                                    let commodityCurrentTotal = 0;
                                    let commodityProposedTotal = 0;

                                    commodity.programs.forEach((program) => {
                                        if (
                                            !selectedPrograms.includes("All Programs") &&
                                            !selectedPrograms.includes(program.programName)
                                        ) {
                                            return;
                                        }

                                        commodityCurrentTotal += program.totalPaymentInDollars || 0;

                                        if (proposedCounty) {
                                            const { proposedProgram } = findProposedCommodityAndProgram(
                                                proposedCounty,
                                                scenario.scenarioName,
                                                commodity.commodityName,
                                                program.programName
                                            );

                                            if (proposedProgram) {
                                                commodityProposedTotal += proposedProgram.totalPaymentInDollars || 0;
                                            }
                                        }
                                    });

                                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                        (countyObject.yearBreakdown[year].current as number) += commodityCurrentTotal;
                                        (countyObject.yearBreakdown[year].proposed as number) += commodityProposedTotal;
                                        (countyObject.yearBreakdown[year].difference as number) +=
                                            commodityProposedTotal - commodityCurrentTotal;
                                    }

                                    const commodityKey = `${commodity.commodityName}`;
                                    if (!countyObject[`${commodityKey} Current`]) {
                                        countyObject[`${commodityKey} Current`] = 0;
                                        countyObject[`${commodityKey} Proposed`] = 0;
                                        countyObject[`${commodityKey} Difference`] = 0;
                                    }

                                    (countyObject[`${commodityKey} Current`] as number) += commodityCurrentTotal;
                                    (countyObject[`${commodityKey} Proposed`] as number) += commodityProposedTotal;
                                    (countyObject[`${commodityKey} Difference`] as number) +=
                                        commodityProposedTotal - commodityCurrentTotal;

                                    if (commodity.baseAcres && commodity.baseAcres > 0) {
                                        if (!countyObject[`${commodity.commodityName} Base Acres`]) {
                                            countyObject[`${commodity.commodityName} Base Acres`] = commodity.baseAcres;
                                        }
                                    }
                                });
                            });
                        });
                    });
                } else {
                    currentYearData.forEach((state) => {
                        if (selectedState !== "All States" && stateCodesData[state.state] !== selectedState) {
                            return;
                        }

                        const stateCode = state.state;
                        const stateName = stateCodesData[stateCode] || stateCode;

                        state.counties.forEach((county) => {
                            const countyName = getCountyNameFromFips(county.countyFIPS);
                            const stateCountyKey = `${stateCode}-${county.countyFIPS}`;

                            let countyObject: CountyObject;
                            if (stateCountyMap.has(stateCountyKey)) {
                                countyObject = stateCountyMap.get(stateCountyKey);
                            } else {
                                countyObject = {
                                    state: stateName,
                                    county: countyName,
                                    fips: county.countyFIPS,
                                    yearBreakdown: {},
                                    baseAcres: 0
                                };
                                stateCountyMap.set(stateCountyKey, countyObject);
                                result.push(countyObject);
                            }

                            if (!countyObject.yearBreakdown) {
                                countyObject.yearBreakdown = {};
                            }

                            if (!countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year] = {
                                    total: 0,
                                    baseAcres: 0
                                };
                            }

                            if (!countyObject.baseAcres || countyObject.baseAcres === 0) {
                                const baseAcres = getTotalBaseAcres(
                                    county,
                                    selectedCommodities,
                                    selectedPrograms,
                                    "Current"
                                );
                                countyObject.baseAcres = Math.round(baseAcres * 100) / 100;

                                if (countyObject.yearBreakdown) {
                                    Object.keys(countyObject.yearBreakdown).forEach((yearKey) => {
                                        if (countyObject.yearBreakdown) {
                                            countyObject.yearBreakdown[yearKey].baseAcres = countyObject.baseAcres;
                                        }
                                    });
                                }
                            }

                            let yearTotal = 0;

                            county.scenarios.forEach((scenario) => {
                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Commodities") &&
                                        !selectedCommodities.includes(commodity.commodityName)
                                    ) {
                                        return;
                                    }

                                    let commodityTotal = 0;

                                    commodity.programs.forEach((program) => {
                                        if (
                                            !selectedPrograms.includes("All Programs") &&
                                            !selectedPrograms.includes(program.programName)
                                        ) {
                                            return;
                                        }

                                        commodityTotal += program.totalPaymentInDollars || 0;
                                        yearTotal += program.totalPaymentInDollars || 0;
                                    });

                                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                        (countyObject.yearBreakdown[year].total as number) += commodityTotal;
                                    }

                                    const commodityKey = `${commodity.commodityName}`;
                                    if (!countyObject[commodityKey]) {
                                        countyObject[commodityKey] = 0;
                                    }

                                    (countyObject[commodityKey] as number) += commodityTotal;

                                    if (commodity.baseAcres && commodity.baseAcres > 0) {
                                        if (!countyObject[`${commodity.commodityName} Base Acres`]) {
                                            countyObject[`${commodity.commodityName} Base Acres`] = commodity.baseAcres;
                                        }
                                    }
                                });
                            });
                        });
                    });
                }
            });

            result.forEach((county) => {
                if (county.yearBreakdown) {
                    Object.keys(county.yearBreakdown).forEach((year) => {
                        if (viewMode === "difference") {
                            if (county.yearBreakdown && county.yearBreakdown[year]) {
                                county.yearBreakdown[year].current = formatCurrency(
                                    county.yearBreakdown[year].current as number
                                );
                                county.yearBreakdown[year].proposed = formatCurrency(
                                    county.yearBreakdown[year].proposed as number
                                );
                                county.yearBreakdown[year].difference = formatCurrency(
                                    county.yearBreakdown[year].difference as number
                                );
                            }
                        } else {
                            if (county.yearBreakdown && county.yearBreakdown[year]) {
                                county.yearBreakdown[year].total = formatCurrency(
                                    county.yearBreakdown[year].total as number
                                );
                            }
                        }
                    });
                }

                Object.keys(county).forEach((key) => {
                    if (
                        key !== "state" &&
                        key !== "county" &&
                        key !== "fips" &&
                        key !== "yearBreakdown" &&
                        key !== "baseAcres"
                    ) {
                        if (typeof county[key] === "number") {
                            const roundedValue = Math.round((county[key] as number) * 100) / 100;
                            county[key] = formatCurrency(roundedValue);
                        }
                    }
                });

                if (viewMode === "difference" && county.yearBreakdown) {
                    const totalCurrentPayments = Object.values(county.yearBreakdown).reduce((sum, yearData) => {
                        const current =
                            typeof yearData.current === "string"
                                ? parseFloat(yearData.current.replace(/[^0-9.-]+/g, ""))
                                : yearData.current || 0;
                        return sum + current;
                    }, 0);

                    const totalProposedPayments = Object.values(county.yearBreakdown).reduce((sum, yearData) => {
                        const proposed =
                            typeof yearData.proposed === "string"
                                ? parseFloat(yearData.proposed.replace(/[^0-9.-]+/g, ""))
                                : yearData.proposed || 0;
                        return sum + proposed;
                    }, 0);

                    const totalDifference = totalProposedPayments - totalCurrentPayments;

                    county["Total Current"] = formatCurrency(totalCurrentPayments);
                    county["Total Proposed"] = formatCurrency(totalProposedPayments);
                    county["Total Difference"] = formatCurrency(totalDifference);

                    if (county.baseAcres && county.baseAcres > 0) {
                        const isMultiSelection =
                            selectedCommodities.length > 1 ||
                            selectedCommodities.includes("All Commodities") ||
                            selectedPrograms.length > 1 ||
                            selectedPrograms.includes("All Programs");

                        const currentRate = calculateWeightedMeanRate(
                            totalCurrentPayments,
                            county.baseAcres,
                            isMultiSelection
                        );

                        const proposedRate = calculateWeightedMeanRate(
                            totalProposedPayments,
                            county.baseAcres,
                            isMultiSelection
                        );

                        county["Mean Current Rate"] = formatCurrency(currentRate.rate, { minimumFractionDigits: 2 });
                        county["Mean Proposed Rate"] = formatCurrency(proposedRate.rate, { minimumFractionDigits: 2 });
                    } else {
                        county["Mean Current Rate"] = "$0.00";
                        county["Mean Proposed Rate"] = "$0.00";
                    }
                } else if (county.yearBreakdown) {
                    const totalPayments = Object.values(county.yearBreakdown).reduce((sum, yearData) => {
                        const total =
                            typeof yearData.total === "string"
                                ? parseFloat(yearData.total.replace(/[^0-9.-]+/g, ""))
                                : yearData.total || 0;
                        return sum + total;
                    }, 0);

                    county.Total = formatCurrency(totalPayments);

                    if (county.baseAcres && county.baseAcres > 0) {
                        const isMultiSelection =
                            selectedCommodities.length > 1 ||
                            selectedCommodities.includes("All Commodities") ||
                            selectedPrograms.length > 1 ||
                            selectedPrograms.includes("All Programs");

                        const rate = calculateWeightedMeanRate(totalPayments, county.baseAcres, isMultiSelection);

                        county["Mean Rate"] = formatCurrency(rate.rate, { minimumFractionDigits: 2 });
                    } else {
                        county["Mean Rate"] = "$0.00";
                    }
                }

                if (!selectedCommodities.includes("All Commodities")) {
                    selectedCommodities.forEach((commodity) => {
                        const baseAcresKey = `${commodity} Base Acres`;
                        const currentKey = `${commodity} Current`;
                        const proposedKey = `${commodity} Proposed`;
                        const meanRateKey = `${commodity} Mean Rate`;

                        const baseAcres =
                            typeof county[baseAcresKey] === "string"
                                ? parseFloat(county[baseAcresKey].replace(/[^0-9.-]+/g, ""))
                                : Number(county[baseAcresKey]) || 0;

                        if (baseAcres > 0) {
                            if (viewMode === "difference") {
                                const currentValue =
                                    typeof county[currentKey] === "string"
                                        ? parseFloat(county[currentKey].replace(/[^0-9.-]+/g, ""))
                                        : Number(county[currentKey]) || 0;

                                const proposedValue =
                                    typeof county[proposedKey] === "string"
                                        ? parseFloat(county[proposedKey].replace(/[^0-9.-]+/g, ""))
                                        : Number(county[proposedKey]) || 0;

                                const currentMeanRate = currentValue / baseAcres;
                                const proposedMeanRate = proposedValue / baseAcres;

                                county[meanRateKey] = formatCurrency(proposedMeanRate - currentMeanRate, {
                                    minimumFractionDigits: 2
                                });
                            }
                        }
                    });
                }
            });

            const processedData = result.filter((county) => county.county !== "");

            return processedData;
        }
        if (!countyData[selectedYear]) return [];

        const result: CountyObject[] = [];
        const yearData = viewMode === "proposed" ? countyDataProposed[selectedYear] : countyData[selectedYear];

        if (viewMode === "difference") {
            const currentData = countyData[selectedYear] || [];
            const proposedData = countyDataProposed[selectedYear] || [];

            currentData.forEach((state) => {
                if (selectedState !== "All States" && stateCodesData[state.state] !== selectedState) {
                    return;
                }

                const stateCode = state.state;
                const stateName = stateCodesData[stateCode] || stateCode;

                state.counties.forEach((county) => {
                    const proposedState = proposedData.find((s) => s.state === stateCode);
                    const proposedCounty = proposedState?.counties.find((c) => c.countyFIPS === county.countyFIPS);
                    const countyName = getCountyNameFromFips(county.countyFIPS);

                    const countyObject: CountyObject = {
                        state: stateName,
                        county: countyName,
                        fips: county.countyFIPS,
                        baseAcres: 0
                    };

                    if (!countyObject.baseAcres || countyObject.baseAcres === 0) {
                        const baseAcres = getTotalBaseAcres(county, selectedCommodities, selectedPrograms, "Current");
                        countyObject.baseAcres = Math.round(baseAcres * 100) / 100;

                        if (countyObject.yearBreakdown) {
                            Object.keys(countyObject.yearBreakdown).forEach((yearKey) => {
                                if (countyObject.yearBreakdown) {
                                    countyObject.yearBreakdown[yearKey].baseAcres = countyObject.baseAcres;
                                }
                            });
                        }
                    }

                    let currentTotal = 0;
                    let proposedTotal = 0;

                    county.scenarios.forEach((scenario) => {
                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Commodities") &&
                                !selectedCommodities.includes(commodity.commodityName)
                            ) {
                                return;
                            }

                            let commodityCurrentTotal = 0;
                            let commodityProposedTotal = 0;

                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }

                                commodityCurrentTotal += program.totalPaymentInDollars || 0;
                                currentTotal += program.totalPaymentInDollars || 0;

                                if (proposedCounty) {
                                    const { proposedProgram } = findProposedCommodityAndProgram(
                                        proposedCounty,
                                        scenario.scenarioName,
                                        commodity.commodityName,
                                        program.programName
                                    );

                                    if (proposedProgram) {
                                        commodityProposedTotal += proposedProgram.totalPaymentInDollars || 0;
                                        proposedTotal += proposedProgram.totalPaymentInDollars || 0;
                                    }
                                }
                            });

                            countyObject[`${commodity.commodityName} Current`] = formatCurrency(commodityCurrentTotal);
                            countyObject[`${commodity.commodityName} Proposed`] =
                                formatCurrency(commodityProposedTotal);
                            countyObject[`${commodity.commodityName} Difference`] = formatCurrency(
                                commodityProposedTotal - commodityCurrentTotal
                            );

                            if (commodity.baseAcres && commodity.baseAcres > 0) {
                                countyObject[`${commodity.commodityName} Base Acres`] = commodity.baseAcres;

                                if (commodity.baseAcres > 0) {
                                    const currentMeanRate = commodityCurrentTotal / commodity.baseAcres;
                                    const proposedMeanRate = commodityProposedTotal / commodity.baseAcres;
                                    const meanRateDiff = proposedMeanRate - currentMeanRate;

                                    countyObject[`${commodity.commodityName} Mean Rate`] = formatCurrency(
                                        meanRateDiff,
                                        { minimumFractionDigits: 2 }
                                    );
                                } else {
                                    countyObject[`${commodity.commodityName} Mean Rate`] = "$0.00";
                                }
                            } else {
                                countyObject[`${commodity.commodityName} Mean Rate`] = "$0.00";
                            }
                        });
                    });

                    countyObject["Total Current"] = formatCurrency(currentTotal);
                    countyObject["Total Proposed"] = formatCurrency(proposedTotal);
                    countyObject["Total Difference"] = formatCurrency(proposedTotal - currentTotal);

                    if (countyObject.baseAcres && countyObject.baseAcres > 0) {
                        const isMultiSelection =
                            selectedCommodities.length > 1 ||
                            selectedCommodities.includes("All Commodities") ||
                            selectedPrograms.length > 1 ||
                            selectedPrograms.includes("All Programs");

                        const currentRate = calculateWeightedMeanRate(
                            currentTotal,
                            countyObject.baseAcres,
                            isMultiSelection
                        );

                        const proposedRate = calculateWeightedMeanRate(
                            proposedTotal,
                            countyObject.baseAcres,
                            isMultiSelection
                        );

                        countyObject["Mean Current Rate"] = formatCurrency(currentRate.rate, {
                            minimumFractionDigits: 2
                        });
                        countyObject["Mean Proposed Rate"] = formatCurrency(proposedRate.rate, {
                            minimumFractionDigits: 2
                        });
                    } else {
                        countyObject["Mean Current Rate"] = "$0.00";
                        countyObject["Mean Proposed Rate"] = "$0.00";
                    }

                    result.push(countyObject);
                });
            });
        } else {
            yearData.forEach((state) => {
                if (selectedState !== "All States" && stateCodesData[state.state] !== selectedState) {
                    return;
                }

                const stateCode = state.state;
                const stateName = stateCodesData[stateCode] || stateCode;

                state.counties.forEach((county) => {
                    const countyName = getCountyNameFromFips(county.countyFIPS);
                    const countyObject: CountyObject = {
                        state: stateName,
                        county: countyName,
                        fips: county.countyFIPS,
                        baseAcres: 0
                    };

                    if (!countyObject.baseAcres || countyObject.baseAcres === 0) {
                        const baseAcres = getTotalBaseAcres(county, selectedCommodities, selectedPrograms, "Current");
                        countyObject.baseAcres = Math.round(baseAcres * 100) / 100;

                        if (countyObject.yearBreakdown) {
                            Object.keys(countyObject.yearBreakdown).forEach((yearKey) => {
                                if (countyObject.yearBreakdown) {
                                    countyObject.yearBreakdown[yearKey].baseAcres = countyObject.baseAcres;
                                }
                            });
                        }
                    }

                    let total = 0;

                    county.scenarios.forEach((scenario) => {
                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Commodities") &&
                                !selectedCommodities.includes(commodity.commodityName)
                            ) {
                                return;
                            }

                            let commodityTotal = 0;

                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }

                                commodityTotal += program.totalPaymentInDollars || 0;
                                total += program.totalPaymentInDollars || 0;
                            });

                            if (viewMode === "current") {
                                countyObject[`${commodity.commodityName}`] = formatCurrency(commodityTotal);
                            }

                            if (viewMode === "proposed") {
                                countyObject[`${commodity.commodityName}`] = formatCurrency(commodityTotal);
                                countyObject[`${commodity.commodityName} Proposed`] = formatCurrency(commodityTotal);
                            }

                            if (commodity.baseAcres && commodity.baseAcres > 0) {
                                countyObject[`${commodity.commodityName} Base Acres`] = commodity.baseAcres;

                                if (commodityTotal > 0 && commodity.baseAcres > 0) {
                                    const meanRate = commodityTotal / commodity.baseAcres;
                                    countyObject[`${commodity.commodityName} Mean Rate`] = formatCurrency(meanRate, {
                                        minimumFractionDigits: 2
                                    });
                                } else {
                                    countyObject[`${commodity.commodityName} Mean Rate`] = "$0.00";
                                }
                            } else {
                                countyObject[`${commodity.commodityName} Mean Rate`] = "$0.00";
                            }
                        });
                    });

                    countyObject.Total = formatCurrency(total);

                    if (countyObject.baseAcres && countyObject.baseAcres > 0) {
                        const isMultiSelection =
                            selectedCommodities.length > 1 ||
                            selectedCommodities.includes("All Commodities") ||
                            selectedPrograms.length > 1 ||
                            selectedPrograms.includes("All Programs");

                        const rate = calculateWeightedMeanRate(total, countyObject.baseAcres, isMultiSelection);

                        countyObject["Mean Rate"] = formatCurrency(rate.rate, { minimumFractionDigits: 2 });
                    } else {
                        countyObject["Mean Rate"] = "$0.00";
                    }

                    result.push(countyObject);
                });
            });
        }

        return result.filter((county) => county.county !== "");
    }, [
        countyData,
        countyDataProposed,
        selectedYear,
        viewMode,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        stateCodesData,
        isAggregatedYear,
        yearRange
    ]);

    const hasAnyData = (county) => {
        const dataFields = Object.keys(county).filter(
            (key) => !["state", "county", "fips", "baseAcres", "yearBreakdown"].includes(key)
        );

        return dataFields.some((field) => {
            const value = county[field];

            if (typeof value === "string" && value.startsWith("$")) {
                return parseFloat(value.replace(/[^0-9.-]+/g, "")) !== 0;
            }
            return value !== 0 && value !== "$0.00" && value !== "";
        });
    };

    const getColumns = React.useCallback(() => {
        const tableColumns: ColumnDef[] = [
            {
                Header: "STATE",
                accessor: "state",
                disableSortBy: false
            },
            {
                Header: "COUNTY",
                accessor: "county",
                disableSortBy: false
            },
            {
                Header: "FIPS",
                accessor: "fips",
                disableSortBy: false
            },
            {
                Header: "BASE ACRES",
                accessor: "baseAcres",

                sortType: (a, b) => {
                    const aVal = parseFloat(a.values.baseAcres) || 0;
                    const bVal = parseFloat(b.values.baseAcres) || 0;

                    return bVal - aVal;
                },
                disableSortBy: false
            }
        ];

        const isWeightedAvg =
            selectedCommodities.length > 1 ||
            selectedCommodities.includes("All Commodities") ||
            selectedPrograms.length > 1 ||
            selectedPrograms.includes("All Programs");

        const weightedLabel = isWeightedAvg ? " (weighted avg)" : "";

        if (isAggregatedYear) {
            if (viewMode === "difference") {
                yearRange.forEach((year) => {
                    tableColumns.push(
                        {
                            Header: `${year}: Current`,
                            accessor: `yearBreakdown.${year}.current`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${year}: Proposed`,
                            accessor: `yearBreakdown.${year}.proposed`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${year}: Difference`,
                            accessor: `yearBreakdown.${year}.difference`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        }
                    );
                });

                tableColumns.push(
                    {
                        Header: "Total Current: Payments",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Proposed: Payments",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Difference: Payments",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    }
                );
            } else {
                yearRange.forEach((year) => {
                    tableColumns.push({
                        Header: `${year}: Payments`,
                        accessor: `yearBreakdown.${year}.total`,
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    });
                });

                tableColumns.push({
                    Header: "Total: Payments",
                    accessor: "Total",
                    sortType: compareWithDollarSign,
                    disableSortBy: false
                });
            }
        } else if (viewMode === "difference") {
            if (selectedCommodities.includes("All Commodities")) {
                tableColumns.push(
                    {
                        Header: "Total Current: Payments",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Proposed: Payments",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Difference: Payments",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: `Mean Current Rate${weightedLabel}`,
                        accessor: "Mean Current Rate",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: `Mean Proposed Rate${weightedLabel}`,
                        accessor: "Mean Proposed Rate",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    }
                );
            } else {
                tableColumns.push(
                    {
                        Header: "Total Current",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Proposed",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: "Total Difference",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: `Mean Current Rate${weightedLabel}`,
                        accessor: "Mean Current Rate",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    },
                    {
                        Header: `Mean Proposed Rate${weightedLabel}`,
                        accessor: "Mean Proposed Rate",
                        sortType: compareWithDollarSign,
                        disableSortBy: false
                    }
                );

                selectedCommodities.forEach((commodity) => {
                    tableColumns.push(
                        {
                            Header: `${commodity}: Current`,
                            accessor: `${commodity} Current`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: Proposed`,
                            accessor: `${commodity} Proposed`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: Difference`,
                            accessor: `${commodity} Difference`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: Base Acres`,
                            accessor: `${commodity} Base Acres`,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: Mean Rate`,
                            accessor: `${commodity} Mean Rate`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        }
                    );
                });
            }
        } else {
            const paymentsLabel = viewMode === "current" ? "Current Payments" : "Proposed Payments";
            const rateLabel = viewMode === "current" ? "Current Rate" : "Proposed Rate";

            if (selectedCommodities.includes("All Commodities")) {
                tableColumns.push(
                    {
                        Header: `Total: ${paymentsLabel}`,
                        accessor: "Total",
                        sortType: (a, b) => {
                            const aStr = a.values["Total"];
                            const bStr = b.values["Total"];

                            if (!aStr || aStr === "$0.00") return 1;
                            if (!bStr || bStr === "$0.00") return -1;

                            const aVal = parseFloat(aStr.replace(/[^0-9.-]+/g, "")) || 0;
                            const bVal = parseFloat(bStr.replace(/[^0-9.-]+/g, "")) || 0;

                            return bVal - aVal;
                        },
                        disableSortBy: false
                    },
                    {
                        Header: `Mean: ${rateLabel}${weightedLabel}`,
                        accessor: "Mean Rate",
                        sortType: (a, b) => {
                            const aStr = a.values["Mean Rate"];
                            const bStr = b.values["Mean Rate"];

                            if (!aStr || aStr === "$0.00") return 1;
                            if (!bStr || bStr === "$0.00") return -1;

                            const aVal = parseFloat(aStr.replace(/[^0-9.-]+/g, "")) || 0;
                            const bVal = parseFloat(bStr.replace(/[^0-9.-]+/g, "")) || 0;

                            return bVal - aVal;
                        },
                        disableSortBy: false
                    }
                );
            } else {
                tableColumns.push(
                    {
                        Header: `Total: ${paymentsLabel}`,
                        accessor: "Total",
                        sortType: (a, b) => {
                            const aStr = a.values["Total"];
                            const bStr = b.values["Total"];

                            if (!aStr || aStr === "$0.00") return 1;
                            if (!bStr || bStr === "$0.00") return -1;

                            const aVal = parseFloat(aStr.replace(/[^0-9.-]+/g, "")) || 0;
                            const bVal = parseFloat(bStr.replace(/[^0-9.-]+/g, "")) || 0;

                            return bVal - aVal;
                        },
                        disableSortBy: false
                    },
                    {
                        Header: `Mean: ${rateLabel}${weightedLabel}`,
                        accessor: "Mean Rate",
                        sortType: (a, b) => {
                            const aStr = a.values["Mean Rate"];
                            const bStr = b.values["Mean Rate"];

                            if (!aStr || aStr === "$0.00") return 1;
                            if (!bStr || bStr === "$0.00") return -1;

                            const aVal = parseFloat(aStr.replace(/[^0-9.-]+/g, "")) || 0;
                            const bVal = parseFloat(bStr.replace(/[^0-9.-]+/g, "")) || 0;

                            return bVal - aVal;
                        },
                        disableSortBy: false
                    }
                );

                selectedCommodities.forEach((commodity) => {
                    const commodityColumns = [
                        {
                            Header: `${commodity}: ${paymentsLabel}`,
                            accessor: commodity,
                            sortType: (a, b) => {
                                const aStr = a.values[commodity];
                                const bStr = b.values[commodity];

                                if (!aStr || aStr === "$0.00") return 1;
                                if (!bStr || bStr === "$0.00") return -1;

                                const aVal = parseFloat(aStr?.replace(/[^0-9.-]+/g, "") || "0") || 0;
                                const bVal = parseFloat(bStr?.replace(/[^0-9.-]+/g, "") || "0") || 0;

                                return bVal - aVal;
                            },
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: Base Acres`,
                            accessor: `${commodity} Base Acres`,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity}: ${rateLabel}`,
                            accessor: `${commodity} Mean Rate`,
                            sortType: (a, b) => {
                                const aStr = a.values[`${commodity} Mean Rate`];
                                const bStr = b.values[`${commodity} Mean Rate`];

                                if (!aStr || aStr === "$0.00") return 1;
                                if (!bStr || bStr === "$0.00") return -1;

                                const aVal = parseFloat(aStr?.replace(/[^0-9.-]+/g, "") || "0") || 0;
                                const bVal = parseFloat(bStr?.replace(/[^0-9.-]+/g, "") || "0") || 0;

                                return bVal - aVal;
                            },
                            disableSortBy: false
                        }
                    ];

                    tableColumns.push(...commodityColumns);
                });
            }
        }

        return tableColumns;
    }, [viewMode, selectedCommodities, selectedPrograms, isAggregatedYear, yearRange]);

    const columns = React.useMemo(() => getColumns(), [getColumns]);
    const allData = React.useMemo(() => getTableData(), [getTableData]);

    const [data, emptyCounties] = React.useMemo(() => {
        const withData: CountyObject[] = [];
        const withoutData: CountyObject[] = [];

        allData.forEach((county) => {
            if (hasAnyData(county)) {
                withData.push(county);
            } else {
                withoutData.push(county);
            }
        });

        return [withData, withoutData];
    }, [allData]);

    const tableTitle = getTableTitle;
    const csvFilename = getCsvFilename;

    const [showAllEmptyCounties, setShowAllEmptyCounties] = useState(false);

    const [columnPage, setColumnPage] = useState(0);
    const columnsPerPage = 6;
    const visibleColumnIndices = React.useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 1;
        const endIndex = Math.min(startIndex + columnsPerPage, columns.length);
        return Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex);
    }, [columnPage, columnsPerPage, columns.length]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state,
        setGlobalFilter,
        state: { pageIndex, pageSize, globalFilter }
    } = useTable(
        {
            columns,
            data,
            initialState: { pageSize: 10 },
            defaultCanSort: true,
            disableSortRemove: true
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const totalColumnPages = Math.ceil((columns.length - 1) / columnsPerPage);

    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles>
                <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                        <Box sx={{ width: "100%" }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121",
                                    marginBottom: 2,
                                    paddingTop: 0.6
                                }}
                            >
                                {tableTitle}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    {data && data.length > 0 ? (
                        <div style={{ width: "100%" }}>
                            <CSVLink
                                className="downloadbtn"
                                filename={csvFilename}
                                data={getCSVData(headerGroups, data)}
                            >
                                Export Table to CSV
                            </CSVLink>

                            <Box className="tableTools">
                                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                            </Box>

                            {columns.length > columnsPerPage + 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                    <Button
                                        sx={{
                                            color: "#2F7164"
                                        }}
                                        onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))}
                                        disabled={columnPage === 0}
                                    >
                                        Previous Columns
                                    </Button>
                                    <Typography sx={{ mx: 2, alignSelf: "center" }}>
                                        Column Page {columnPage + 1} of {totalColumnPages}
                                    </Typography>
                                    <Button
                                        sx={{
                                            color: "#2F7164"
                                        }}
                                        onClick={() =>
                                            setColumnPage((prev) => Math.min(totalColumnPages - 1, prev + 1))
                                        }
                                        disabled={columnPage >= totalColumnPages - 1}
                                    >
                                        Next Columns
                                    </Button>
                                </Box>
                            )}

                            <table {...getTableProps()} style={{ width: "100%", tableLayout: "fixed" }}>
                                <thead>
                                    {headerGroups.map((headerGroup) => (
                                        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                                            <th
                                                {...headerGroup.headers[0].getHeaderProps(
                                                    headerGroup.headers[0].getSortByToggleProps()
                                                )}
                                                style={{
                                                    position: "sticky",
                                                    left: 0,
                                                    background: "rgba(241, 241, 241, 1)",
                                                    zIndex: 2
                                                }}
                                            >
                                                {headerGroup.headers[0].render("Header")}
                                                <span>
                                                    {(() => {
                                                        const column = headerGroup.headers[0];
                                                        if (!column.isSorted)
                                                            return (
                                                                <Box sx={{ ml: 1, display: "inline" }}>
                                                                    <SwapVertIcon />
                                                                </Box>
                                                            );
                                                        if (column.isSortedDesc)
                                                            return (
                                                                <Box sx={{ ml: 1, display: "inline" }}>
                                                                    {"\u{25BC}"}
                                                                </Box>
                                                            );
                                                        return (
                                                            <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>
                                                        );
                                                    })()}
                                                </span>
                                            </th>
                                            {headerGroup.headers
                                                .filter((_, index) => visibleColumnIndices.includes(index))
                                                .map((column) => (
                                                    <th
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        key={column.id}
                                                    >
                                                        {(() => {
                                                            const headerText = column.render("Header");
                                                            if (
                                                                typeof headerText === "string" &&
                                                                headerText.includes(":")
                                                            ) {
                                                                const [beforeColon, afterColon] = headerText.split(":");
                                                                return (
                                                                    <>
                                                                        <div>
                                                                            <strong>{beforeColon}</strong>
                                                                        </div>
                                                                        <span>{afterColon.trim()}</span>
                                                                    </>
                                                                );
                                                            }
                                                            return headerText;
                                                        })()}
                                                        <span>
                                                            {(() => {
                                                                if (!column.isSorted)
                                                                    return (
                                                                        <Box sx={{ ml: 1, display: "inline" }}>
                                                                            <SwapVertIcon />
                                                                        </Box>
                                                                    );
                                                                if (column.isSortedDesc)
                                                                    return (
                                                                        <Box sx={{ ml: 1, display: "inline" }}>
                                                                            {"\u{25BC}"}
                                                                        </Box>
                                                                    );
                                                                return (
                                                                    <Box sx={{ ml: 1, display: "inline" }}>
                                                                        {"\u{25B2}"}
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </span>
                                                    </th>
                                                ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map((row) => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()} key={row.id}>
                                                <td
                                                    {...row.cells[0].getCellProps()}
                                                    style={{
                                                        position: "sticky",
                                                        left: 0,
                                                        background: "white",
                                                        zIndex: 1
                                                    }}
                                                >
                                                    {row.cells[0].render("Cell")}
                                                </td>
                                                {row.cells
                                                    .filter((_, index) => visibleColumnIndices.includes(index))
                                                    .map((cell) => (
                                                        <td {...cell.getCellProps()} key={cell.column.id}>
                                                            {cell.render("Cell")}
                                                        </td>
                                                    ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <Box className="pagination" sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Box>
                                    <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                        {"<<"}
                                    </Button>
                                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                        {"<"}
                                    </Button>
                                    <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                        {">"}
                                    </Button>
                                    <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                        {">>"}
                                    </Button>
                                    <span style={{ paddingLeft: 8 }}>
                                        Page
                                        <strong style={{ padding: 8 }}>
                                            {pageIndex + 1} of {pageOptions.length}
                                        </strong>
                                    </span>
                                    <span>
                                        | Go to page:
                                        <input
                                            type="number"
                                            defaultValue={pageIndex + 1}
                                            onChange={(e) => {
                                                const p = e.target.value ? Number(e.target.value) - 1 : 0;
                                                gotoPage(p);
                                            }}
                                            style={{ width: "3em", marginLeft: 8 }}
                                        />
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                        }}
                                    >
                                        {[10, 25, 40, 50].map((size) => (
                                            <option key={size} value={size}>
                                                Show {size}
                                            </option>
                                        ))}
                                    </select>
                                </Box>
                                <Box>
                                    <Typography>
                                        Showing {page.length} of {rows.length} results
                                    </Typography>
                                </Box>
                            </Box>

                            {/* After the pagination controls, add the empty counties section */}
                            {emptyCounties.length > 0 && (
                                <Box sx={{ mt: 4, p: 2, border: "1px solid #ddd", borderRadius: "4px" }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            mb: 1
                                        }}
                                        onClick={() => setShowAllEmptyCounties(!showAllEmptyCounties)}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#2F7164" }}>
                                            Counties with no data ({emptyCounties.length})
                                        </Typography>
                                        <Typography>{showAllEmptyCounties ? "−" : "+"}</Typography>
                                    </Box>
                                    <Box>
                                        {(showAllEmptyCounties ? emptyCounties : emptyCounties.slice(0, 5)).map(
                                            (county, index) => (
                                                <Typography key={index} sx={{ mb: 0.5 }}>
                                                    {county.county}, {county.state} (FIPS: {county.fips})
                                                </Typography>
                                            )
                                        )}
                                        {!showAllEmptyCounties && emptyCounties.length > 5 && (
                                            <Button
                                                sx={{ mt: 1, color: "#2F7164" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAllEmptyCounties(true);
                                                }}
                                            >
                                                Show all {emptyCounties.length} counties
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </div>
                    ) : (
                        <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                            No data available for the selected filters.
                        </Typography>
                    )}
                </TableContainer>
            </Styles>
        </Box>
    );
};

export default CountyCommodityTable;
