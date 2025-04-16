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

interface ExtendedYearBreakdownData extends YearBreakdownData {
    paymentRate?: number;
}

interface ExtendedCountyObject extends CountyObject {
    yearBreakdown?: { [year: string]: ExtendedYearBreakdownData };
    weightedAverageRate?: number;
    aggregatedPayment?: number;
    commodityBreakdown?: {
        [commodity: string]: {
            total: number;
            baseAcres: number;
            paymentRate?: number;
            yearBreakdown?: { [year: string]: ExtendedYearBreakdownData };
        };
    };
}

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
    stateCodesData,
    yearAggregation,
    aggregationEnabled,
    showMeanValues
}) => {
    const isAggregatedYear = useMemo(() => {
        return (
            (typeof selectedYear === "string" && selectedYear.includes("-")) ||
            (aggregationEnabled && yearAggregation > 0)
        );
    }, [selectedYear, yearAggregation, aggregationEnabled]);

    const yearRange = useMemo(() => {
        if (aggregationEnabled && yearAggregation > 0) {
            const startYear = 2024;
            const endYear = parseInt(selectedYear);
            const years: string[] = [];
            for (let year = startYear; year <= endYear; year++) {
                years.push(year.toString());
            }
            return years;
        }
        return [selectedYear];
    }, [selectedYear, yearAggregation, aggregationEnabled]);

    const getTableTitle = useMemo(() => {
        return generateTableTitle(selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear);
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getCsvFilename = useMemo(() => {
        return generateCsvFilename(selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear);
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getTableData = React.useCallback(() => {
        if (isAggregatedYear) {
            const result: ExtendedCountyObject[] = [];
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

                            let countyObject: ExtendedCountyObject;
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

                                        if (viewMode === "difference" && proposedCounty) {
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

                            let countyObject: ExtendedCountyObject;
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

                                        if (viewMode === "difference" && proposedCounty) {
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
                }
            });

            return result;
        }

        const year = selectedYear;
        const result: ExtendedCountyObject[] = [];
        const stateCountyMap = new Map();
        const currentYearData = viewMode === "proposed" ? countyDataProposed[year] : countyData[year];
        const currentData = countyData[year] || [];
        const proposedData = countyDataProposed[year] || [];

        if (viewMode === "difference") {
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
                    const proposedCounty = proposedState?.counties.find((c) => c.countyFIPS === county.countyFIPS);
                    let countyObject: ExtendedCountyObject;
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
                                if (viewMode === "difference" && proposedCounty) {
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
                    let countyObject: ExtendedCountyObject;
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
                                if (viewMode === "difference" && proposedCounty) {
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
        }
        return result;
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
        yearRange,
        yearAggregation,
        aggregationEnabled
    ]);

    const columns = useMemo(() => {
        const baseColumns: ColumnDef[] = [
            {
                Header: "State",
                accessor: "state",
                disableSortBy: false
            },
            {
                Header: "County",
                accessor: "county",
                disableSortBy: false
            }
        ];

        if (isAggregatedYear) {
            if (showMeanValues) {
                baseColumns.push({
                    Header: "Aggregated Payment Rate",
                    accessor: "weightedAverageRate",
                    sortType: compareWithDollarSign,
                    disableSortBy: false
                });
            } else {
                baseColumns.push({
                    Header: "Aggregated Total Payment",
                    accessor: "aggregatedPayment",
                    sortType: compareWithDollarSign,
                    disableSortBy: false
                });
            }

            yearRange.forEach((year) => {
                if (showMeanValues) {
                    baseColumns.push(
                        {
                            Header: `${year} Payment`,
                            accessor: `yearBreakdown.${year}.${viewMode === "difference" ? "difference" : viewMode}`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${year} Base Acres`,
                            accessor: `yearBreakdown.${year}.baseAcres`,
                            sortType: (a, b) => a - b,
                            disableSortBy: false
                        },
                        {
                            Header: `${year} Payment Rate`,
                            accessor: `yearBreakdown.${year}.paymentRate`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        }
                    );
                } else {
                    baseColumns.push(
                        {
                            Header: `${year} Payment`,
                            accessor: `yearBreakdown.${year}.${viewMode === "difference" ? "difference" : viewMode}`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${year} Base Acres`,
                            accessor: `yearBreakdown.${year}.baseAcres`,
                            sortType: (a, b) => a - b,
                            disableSortBy: false
                        }
                    );
                }
            });
        } else {
            baseColumns.push(
                {
                    Header: "Payment",
                    accessor: viewMode === "difference" ? "difference" : viewMode,
                    sortType: compareWithDollarSign,
                    disableSortBy: false
                },
                {
                    Header: "Base Acres",
                    accessor: "baseAcres",
                    sortType: (a, b) => a - b,
                    disableSortBy: false
                }
            );

            if (showMeanValues) {
                baseColumns.push({
                    Header: "Payment Rate",
                    accessor: "paymentRate",
                    sortType: compareWithDollarSign,
                    disableSortBy: false
                });
            }
        }

        if (!selectedCommodities.includes("All Commodities")) {
            selectedCommodities.forEach((commodity) => {
                if (showMeanValues) {
                    baseColumns.push(
                        {
                            Header: `${commodity} Total`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity} Base Acres`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: (a, b) => a - b,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity} Payment Rate`,
                            accessor: `commodityBreakdown.${commodity}.paymentRate`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        }
                    );
                } else {
                    baseColumns.push(
                        {
                            Header: `${commodity} Total`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: compareWithDollarSign,
                            disableSortBy: false
                        },
                        {
                            Header: `${commodity} Base Acres`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: (a, b) => a - b,
                            disableSortBy: false
                        }
                    );
                }
            });
        }

        return baseColumns;
    }, [selectedYear, viewMode, showMeanValues, isAggregatedYear, yearRange, selectedCommodities]);

    const data = useMemo(() => {
        const tableData = getTableData();
        return tableData.map((row: ExtendedCountyObject) => {
            if (isAggregatedYear) {
                let aggTotal = 0;
                let aggBaseAcres = 0;
                let weightedSum = 0;

                if (!selectedCommodities.includes("All Commodities")) {
                    row.commodityBreakdown = {};
                    selectedCommodities.forEach((commodity) => {
                        row.commodityBreakdown![commodity] = {
                            total: 0,
                            baseAcres: 0,
                            yearBreakdown: {}
                        };
                    });
                }

                yearRange.forEach((year) => {
                    const yearData = row.yearBreakdown?.[year] as ExtendedYearBreakdownData;
                    if (yearData) {
                        const payment =
                            viewMode === "difference"
                                ? (yearData.difference as number)
                                : viewMode === "proposed"
                                ? (yearData.proposed as number)
                                : (yearData.current as number);

                        const baseAcres = (row.yearBreakdown?.["2024"]?.baseAcres as number) || 0;
                        yearData.baseAcres = baseAcres;

                        aggTotal += payment;
                        aggBaseAcres = baseAcres;
                        weightedSum += payment;

                        if (showMeanValues && baseAcres > 0) {
                            yearData.paymentRate = payment / baseAcres;
                        }

                        if (!selectedCommodities.includes("All Commodities") && row.commodityBreakdown) {
                            selectedCommodities.forEach((commodity) => {
                                const commodityData = row.commodityBreakdown![commodity];
                                const yearCommodityData = yearData[commodity] as any;
                                if (yearCommodityData) {
                                    commodityData.total += yearCommodityData.payment || 0;
                                    commodityData.baseAcres = yearCommodityData.baseAcres || 0;
                                    if (showMeanValues && commodityData.baseAcres > 0) {
                                        commodityData.paymentRate = commodityData.total / commodityData.baseAcres;
                                    }
                                }
                            });
                        }
                    }
                });

                if (showMeanValues) {
                    row.weightedAverageRate = aggBaseAcres > 0 ? weightedSum / aggBaseAcres : 0;
                } else {
                    row.aggregatedPayment = aggTotal;
                }
            } else {
                const payment =
                    viewMode === "difference"
                        ? (row.difference as number)
                        : viewMode === "proposed"
                        ? (row.proposed as number)
                        : (row.current as number);
                const baseAcres = row.baseAcres as number;

                if (showMeanValues && baseAcres > 0) {
                    (row as ExtendedCountyObject).paymentRate = payment / baseAcres;
                }

                if (!selectedCommodities.includes("All Commodities")) {
                    row.commodityBreakdown = {};
                    const yearData = row.yearBreakdown?.[selectedYear] as ExtendedYearBreakdownData;
                    if (yearData) {
                        selectedCommodities.forEach((commodity) => {
                            const commodityData = yearData[commodity] as any;
                            if (commodityData) {
                                row.commodityBreakdown![commodity] = {
                                    total: commodityData.payment || 0,
                                    baseAcres: commodityData.baseAcres || 0
                                };
                                if (showMeanValues && commodityData.baseAcres > 0) {
                                    row.commodityBreakdown![commodity].paymentRate =
                                        commodityData.payment / commodityData.baseAcres;
                                }
                            }
                        });
                    }
                }
            }
            return row;
        });
    }, [getTableData, isAggregatedYear, yearRange, viewMode, showMeanValues, selectedCommodities, selectedYear]);

    const [columnPage, setColumnPage] = useState(0);
    const columnsPerPage = 6;
    const visibleColumnIndices = useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 2;
        const endIndex = Math.min(startIndex + columnsPerPage, columns.length);
        return [0, 1, ...Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex)];
    }, [columnPage, columnsPerPage, columns.length]);
    const totalColumnPages = Math.ceil((columns.length - 2) / columnsPerPage);

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
        state: { pageIndex, pageSize },
        setGlobalFilter,
        state: { globalFilter }
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const csvData = useMemo(() => {
        if (!data || !columns) return [];
        return data.map((row) => {
            const csvRow = {};
            columns.forEach((column) => {
                const value = row[column.accessor];
                csvRow[column.Header] = typeof value === "number" ? formatCurrency(value) : value;
            });
            return csvRow;
        });
    }, [data, columns]);

    return (
        <Styles>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {getTableTitle}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item>
                        <CSVLink data={csvData} filename={getCsvFilename} className="downloadbtn">
                            Download CSV
                        </CSVLink>
                    </Grid>
                </Grid>
                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                <Button onClick={() => setColumnPage(0)} disabled={columnPage === 0}>
                    {"<<"}
                </Button>
                <Button onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))} disabled={columnPage === 0}>
                    {"<"}
                </Button>
                <span style={{ paddingLeft: 8 }}>
                    Column Page{" "}
                    <strong style={{ padding: "0px 8px" }}>
                        {columnPage + 1} of {totalColumnPages}
                    </strong>
                </span>
                <Button
                    onClick={() => setColumnPage((prev) => Math.min(totalColumnPages - 1, prev + 1))}
                    disabled={columnPage === totalColumnPages - 1}
                >
                    {">"}
                </Button>
                <Button
                    onClick={() => setColumnPage(totalColumnPages - 1)}
                    disabled={columnPage === totalColumnPages - 1}
                >
                    {">>"}
                </Button>
            </Box>
            <div className="tableWrap">
                <TableContainer>
                    <table {...getTableProps()} id="county-commodity-table">
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers
                                        .filter((_, index) => visibleColumnIndices.includes(index))
                                        .map((column) => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                {column.render("Header")}
                                                <span>
                                                    {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
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
                                    <tr {...row.getRowProps()}>
                                        {row.cells
                                            .filter((_, index) => visibleColumnIndices.includes(index))
                                            .map((cell) => {
                                                return (
                                                    <td {...cell.getCellProps()}>
                                                        {typeof cell.column.accessor === "string" &&
                                                        cell.column.accessor.includes(".")
                                                            ? formatCurrency(cell.value)
                                                            : cell.render("Cell")}
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </TableContainer>
            </div>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} sx={{ mr: 1 }}>
                        {"<<"}
                    </Button>
                    <Button onClick={() => previousPage()} disabled={!canPreviousPage} sx={{ mr: 1 }}>
                        {"<"}
                    </Button>
                    <Button onClick={() => nextPage()} disabled={!canNextPage} sx={{ mr: 1 }}>
                        {">"}
                    </Button>
                    <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} sx={{ mr: 1 }}>
                        {">>"}
                    </Button>
                    <span style={{ paddingLeft: 8 }}>
                        Page{" "}
                        <strong style={{ padding: 8 }}>
                            {pageIndex + 1} of {pageCount}
                        </strong>
                    </span>
                </Box>
                <Box>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                        }}
                        style={{ padding: "4px" }}
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </Box>
            </Box>
        </Styles>
    );
};

export default CountyCommodityTable;
