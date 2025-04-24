import React, { useMemo, useState } from "react";
import { Box, Typography, Grid, TableContainer, Button } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MapIcon from "@mui/icons-material/Map";
import {
    YearBreakdownData,
    CountyObject,
    formatCurrency,
    formatNumericValue,
    getCountyNameFromFips,
    generateTableTitle,
    generateCsvFilename,
    getTotalBaseAcres,
    formatCellValue
} from "./utils";

interface ExtendedYearBreakdownData extends YearBreakdownData {
    paymentRate?: number;
}

interface ExtendedCountyObject extends CountyObject {
    yearBreakdown?: { [year: string]: ExtendedYearBreakdownData };
    weightedAverageRate?: number;
    aggregatedPayment?: number;
    paymentRate?: number;
    commodityBreakdown?: {
        [commodity: string]: {
            total: number;
            baseAcres: number;
            paymentRate?: number;
            yearBreakdown?: { [year: string]: ExtendedYearBreakdownData };
        };
    };
    programBreakdown?: {
        [program: string]: {
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
    sortType?: string | ((a: any, b: any) => number);
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
        padding: 10px 16px;
        border-radius: 4px;
        color: #fff;
        text-decoration: none;
        display: flex;
        align-items: center;
        cursor: pointer;
        font-weight: 500;
        text-align: center;
        transition: background-color 0.2s ease;
    }

    .downloadbtn:hover {
        background-color: rgba(40, 95, 85, 1);
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
    const [isAtTable, setIsAtTable] = useState(false);

    const handleScrollToMap = () => {
        const mapElement = document.getElementById("county-commodity-map");
        if (mapElement) {
            mapElement.scrollIntoView({ behavior: "smooth" });
            setIsAtTable(false);
        }
    };

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
                                countyObject = stateCountyMap.get(stateCountyKey)!;
                            } else {
                                countyObject = {
                                    state: stateName,
                                    county: countyName,
                                    fips: county.countyFIPS,
                                    yearBreakdown: {},
                                    baseAcres: 0,
                                    current: 0,
                                    proposed: 0,
                                    difference: 0,
                                    commodityBreakdown: {}
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

                            if (!countyObject.commodityBreakdown) {
                                countyObject.commodityBreakdown = {};
                            }

                            county.scenarios.forEach((scenario) => {
                                const scenarioName = viewMode === "proposed" ? "Proposed" : "Current";
                                if (scenario.scenarioName !== scenarioName) {
                                    return;
                                }

                                let countyTotalPayment = 0;

                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Commodities") &&
                                        !selectedCommodities.includes(commodity.commodityName)
                                    ) {
                                        return;
                                    }

                                    let commodityCurrentTotal = 0;
                                    const commodityProposedTotal = 0;
                                    let commodityBaseAcres = 0;

                                    commodity.programs.forEach((program) => {
                                        if (
                                            !selectedPrograms.includes("All Programs") &&
                                            !selectedPrograms.includes(program.programName)
                                        ) {
                                            return;
                                        }

                                        commodityCurrentTotal += program.totalPaymentInDollars || 0;
                                        commodityBaseAcres += program.baseAcres || 0;
                                        countyTotalPayment += program.totalPaymentInDollars || 0;

                                        if (!countyObject.programBreakdown) {
                                            countyObject.programBreakdown = {};
                                        }

                                        if (!countyObject.programBreakdown[program.programName]) {
                                            countyObject.programBreakdown[program.programName] = {
                                                total: 0,
                                                baseAcres: 0,
                                                yearBreakdown: {}
                                            };
                                        }

                                        countyObject.programBreakdown[program.programName].total +=
                                            program.totalPaymentInDollars || 0;
                                        countyObject.programBreakdown[program.programName].baseAcres +=
                                            program.baseAcres || 0;
                                    });

                                    if (viewMode === "current") {
                                        countyObject.current = countyTotalPayment;
                                    } else if (viewMode === "proposed") {
                                        countyObject.proposed = countyTotalPayment;
                                    }

                                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                        if (viewMode === "current") {
                                            countyObject.yearBreakdown[year].current = countyTotalPayment;
                                        } else if (viewMode === "proposed") {
                                            countyObject.yearBreakdown[year].proposed = countyTotalPayment;
                                        }
                                    }

                                    if (!countyObject.commodityBreakdown) {
                                        countyObject.commodityBreakdown = {};
                                    }

                                    if (!countyObject.commodityBreakdown[commodity.commodityName]) {
                                        countyObject.commodityBreakdown[commodity.commodityName] = {
                                            total: 0,
                                            baseAcres: 0,
                                            yearBreakdown: {}
                                        };
                                    }

                                    if (!countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown) {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown = {};
                                    }

                                    if (
                                        !countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![year]
                                    ) {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![year] =
                                            {
                                                current: 0,
                                                proposed: 0,
                                                difference: 0,
                                                baseAcres: 0
                                            };
                                    }

                                    if (viewMode === "proposed") {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                            year
                                        ].proposed = commodityCurrentTotal;
                                    } else {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                            year
                                        ].current = commodityCurrentTotal;
                                    }

                                    countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                        year
                                    ].baseAcres = commodityBaseAcres;

                                    countyObject.commodityBreakdown[commodity.commodityName].total +=
                                        commodityCurrentTotal;

                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres = Math.max(
                                        countyObject.commodityBreakdown[commodity.commodityName].baseAcres || 0,
                                        commodityBaseAcres
                                    );

                                    const commodityKey = `${commodity.commodityName}`;
                                    if (!countyObject[`${commodityKey} Current`]) {
                                        countyObject[`${commodityKey} Current`] = 0;
                                        countyObject[`${commodityKey} Proposed`] = 0;
                                        countyObject[`${commodityKey} Difference`] = 0;
                                        countyObject[`${commodityKey} Base Acres`] = commodityBaseAcres;
                                    }

                                    if (viewMode === "current") {
                                        countyObject[`${commodityKey} Current`] += commodityCurrentTotal;
                                    } else if (viewMode === "proposed") {
                                        countyObject[`${commodityKey} Proposed`] += commodityCurrentTotal;
                                    }
                                });
                            });

                            if (proposedCounty) {
                                proposedCounty.scenarios.forEach((scenario) => {
                                    if (scenario.scenarioName !== "Proposed") return;

                                    scenario.commodities.forEach((commodity) => {
                                        if (
                                            !selectedCommodities.includes("All Commodities") &&
                                            !selectedCommodities.includes(commodity.commodityName)
                                        ) {
                                            return;
                                        }

                                        if (!countyObject.commodityBreakdown![commodity.commodityName]) {
                                            countyObject.commodityBreakdown![commodity.commodityName] = {
                                                total: 0,
                                                baseAcres: 0,
                                                yearBreakdown: {}
                                            };
                                        }

                                        let commodityProposedTotal = 0;

                                        commodity.programs.forEach((program) => {
                                            if (
                                                !selectedPrograms.includes("All Programs") &&
                                                !selectedPrograms.includes(program.programName)
                                            ) {
                                                return;
                                            }

                                            commodityProposedTotal += program.totalPaymentInDollars || 0;

                                            if (
                                                countyObject.commodityBreakdown![commodity.commodityName].baseAcres <
                                                program.baseAcres
                                            ) {
                                                countyObject.commodityBreakdown![commodity.commodityName].baseAcres =
                                                    program.baseAcres;
                                            }
                                        });

                                        if (!countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown) {
                                            countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown =
                                                {};
                                        }

                                        if (
                                            !countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown![
                                                year
                                            ]
                                        ) {
                                            countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown![
                                                year
                                            ] = {
                                                current: 0,
                                                proposed: 0,
                                                difference: 0,
                                                baseAcres:
                                                    countyObject.commodityBreakdown![commodity.commodityName].baseAcres
                                            };
                                        }

                                        countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown![
                                            year
                                        ].proposed = commodityProposedTotal;

                                        const currentValue = Number(
                                            countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown![
                                                year
                                            ].current || 0
                                        );
                                        const proposedValue = Number(commodityProposedTotal);
                                        const difference = proposedValue - currentValue;
                                        countyObject.commodityBreakdown![commodity.commodityName].yearBreakdown![
                                            year
                                        ].difference = difference;
                                    });
                                });
                            }

                            let yearCurrentTotal = 0;
                            let yearProposedTotal = 0;
                            let yearBaseAcres = 0;

                            if (countyObject.commodityBreakdown) {
                                Object.values(countyObject.commodityBreakdown).forEach((commodityData) => {
                                    if (commodityData.yearBreakdown && commodityData.yearBreakdown[year]) {
                                        yearCurrentTotal += (commodityData.yearBreakdown[year].current as number) || 0;
                                        yearProposedTotal +=
                                            (commodityData.yearBreakdown[year].proposed as number) || 0;
                                        yearBaseAcres = Math.max(
                                            yearBaseAcres,
                                            commodityData.yearBreakdown[year].baseAcres || 0
                                        );
                                    }
                                });
                            }

                            if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year].current = yearCurrentTotal;
                                countyObject.yearBreakdown[year].proposed = yearProposedTotal;
                                countyObject.yearBreakdown[year].difference = yearProposedTotal - yearCurrentTotal;
                                countyObject.yearBreakdown[year].baseAcres = formatNumericValue(yearBaseAcres);
                            }

                            countyObject.current = ((countyObject.current as number) || 0) + yearCurrentTotal;
                            countyObject.proposed = ((countyObject.proposed as number) || 0) + yearProposedTotal;
                            countyObject.difference =
                                ((countyObject.difference as number) || 0) + (yearProposedTotal - yearCurrentTotal);

                            if (yearBaseAcres > (countyObject.baseAcres || 0)) {
                                countyObject.baseAcres = formatNumericValue(yearBaseAcres);
                            }
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
                                countyObject = stateCountyMap.get(stateCountyKey)!;
                            } else {
                                countyObject = {
                                    state: stateName,
                                    county: countyName,
                                    fips: county.countyFIPS,
                                    yearBreakdown: {},
                                    baseAcres: 0,
                                    current: 0,
                                    proposed: 0,
                                    difference: 0,
                                    commodityBreakdown: {}
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

                            const currentBaseAcres = getTotalBaseAcres(
                                county,
                                selectedCommodities,
                                selectedPrograms,
                                "Current"
                            );
                            countyObject.baseAcres = formatNumericValue(currentBaseAcres);

                            const yearBaseAcres = 0;

                            if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year].baseAcres = countyObject.baseAcres;
                            }

                            if (yearBaseAcres > (countyObject.baseAcres || 0)) {
                                countyObject.baseAcres = formatNumericValue(yearBaseAcres);
                            }

                            county.scenarios.forEach((scenario) => {
                                const scenarioName = viewMode === "proposed" ? "Proposed" : "Current";
                                if (scenario.scenarioName !== scenarioName) {
                                    return;
                                }

                                let countyTotalPayment = 0;

                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Commodities") &&
                                        !selectedCommodities.includes(commodity.commodityName)
                                    ) {
                                        return;
                                    }

                                    let commodityCurrentTotal = 0;
                                    const commodityProposedTotal = 0;
                                    let commodityBaseAcres = 0;

                                    commodity.programs.forEach((program) => {
                                        if (
                                            !selectedPrograms.includes("All Programs") &&
                                            !selectedPrograms.includes(program.programName)
                                        ) {
                                            return;
                                        }

                                        commodityCurrentTotal += program.totalPaymentInDollars || 0;
                                        commodityBaseAcres += program.baseAcres || 0;
                                        countyTotalPayment += program.totalPaymentInDollars || 0;

                                        if (!countyObject.programBreakdown) {
                                            countyObject.programBreakdown = {};
                                        }

                                        if (!countyObject.programBreakdown[program.programName]) {
                                            countyObject.programBreakdown[program.programName] = {
                                                total: 0,
                                                baseAcres: 0,
                                                yearBreakdown: {}
                                            };
                                        }

                                        countyObject.programBreakdown[program.programName].total +=
                                            program.totalPaymentInDollars || 0;
                                        countyObject.programBreakdown[program.programName].baseAcres +=
                                            program.baseAcres || 0;
                                    });

                                    if (viewMode === "current") {
                                        countyObject.current = countyTotalPayment;
                                    } else if (viewMode === "proposed") {
                                        countyObject.proposed = countyTotalPayment;
                                    }

                                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                        if (viewMode === "current") {
                                            countyObject.yearBreakdown[year].current = countyTotalPayment;
                                        } else if (viewMode === "proposed") {
                                            countyObject.yearBreakdown[year].proposed = countyTotalPayment;
                                        }
                                    }

                                    if (!countyObject.commodityBreakdown) {
                                        countyObject.commodityBreakdown = {};
                                    }

                                    if (!countyObject.commodityBreakdown[commodity.commodityName]) {
                                        countyObject.commodityBreakdown[commodity.commodityName] = {
                                            total: 0,
                                            baseAcres: 0,
                                            yearBreakdown: {}
                                        };
                                    }

                                    if (!countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown) {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown = {};
                                    }

                                    if (
                                        !countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![year]
                                    ) {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![year] =
                                            {
                                                current: 0,
                                                proposed: 0,
                                                difference: 0,
                                                baseAcres: 0
                                            };
                                    }

                                    if (viewMode === "proposed") {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                            year
                                        ].proposed = commodityCurrentTotal;
                                    } else {
                                        countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                            year
                                        ].current = commodityCurrentTotal;
                                    }

                                    countyObject.commodityBreakdown[commodity.commodityName].yearBreakdown![
                                        year
                                    ].baseAcres = commodityBaseAcres;

                                    countyObject.commodityBreakdown[commodity.commodityName].total +=
                                        commodityCurrentTotal;

                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres = Math.max(
                                        countyObject.commodityBreakdown[commodity.commodityName].baseAcres || 0,
                                        commodityBaseAcres
                                    );

                                    const commodityKey = `${commodity.commodityName}`;
                                    if (!countyObject[`${commodityKey} Current`]) {
                                        countyObject[`${commodityKey} Current`] = 0;
                                        countyObject[`${commodityKey} Proposed`] = 0;
                                        countyObject[`${commodityKey} Difference`] = 0;
                                        countyObject[`${commodityKey} Base Acres`] = commodityBaseAcres;
                                    }

                                    if (viewMode === "current") {
                                        countyObject[`${commodityKey} Current`] += commodityCurrentTotal;
                                    } else if (viewMode === "proposed") {
                                        countyObject[`${commodityKey} Proposed`] += commodityCurrentTotal;
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
                        countyObject = stateCountyMap.get(stateCountyKey)!;
                    } else {
                        countyObject = {
                            state: stateName,
                            county: countyName,
                            fips: county.countyFIPS,
                            yearBreakdown: {},
                            baseAcres: 0,
                            current: 0,
                            proposed: 0,
                            difference: 0
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

                    const currentBaseAcres = getTotalBaseAcres(
                        county,
                        selectedCommodities,
                        selectedPrograms,
                        "Current"
                    );
                    countyObject.baseAcres = formatNumericValue(currentBaseAcres);

                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                        countyObject.yearBreakdown[year].baseAcres = countyObject.baseAcres;
                    }

                    let currentTotalPayment = 0;
                    let proposedTotalPayment = 0;

                    county.scenarios.forEach((scenario) => {
                        if (scenario.scenarioName !== "Current") return;

                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Commodities") &&
                                !selectedCommodities.includes(commodity.commodityName)
                            ) {
                                return;
                            }

                            let commodityCurrentTotal = 0;
                            const commodityProposedTotal = 0;
                            let commodityBaseAcres = 0;

                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }

                                commodityCurrentTotal += program.totalPaymentInDollars || 0;
                                commodityBaseAcres += program.baseAcres || 0;

                                currentTotalPayment += program.totalPaymentInDollars || 0;

                                if (!countyObject.programBreakdown) {
                                    countyObject.programBreakdown = {};
                                }

                                if (!countyObject.programBreakdown[program.programName]) {
                                    countyObject.programBreakdown[program.programName] = {
                                        total: 0,
                                        baseAcres: 0,
                                        yearBreakdown: {}
                                    };
                                }

                                countyObject.programBreakdown[program.programName].total =
                                    program.totalPaymentInDollars || 0;
                                countyObject.programBreakdown[program.programName].baseAcres = program.baseAcres || 0;
                            });

                            if (!countyObject.commodityBreakdown) {
                                countyObject.commodityBreakdown = {};
                            }

                            if (!countyObject.commodityBreakdown[commodity.commodityName]) {
                                countyObject.commodityBreakdown[commodity.commodityName] = {
                                    total: 0,
                                    baseAcres: 0,
                                    yearBreakdown: {}
                                };
                            }

                            if (commodity.commodityName === "Cotton" && county.countyFIPS === "01003") {
                                if (selectedPrograms.length === 1 && selectedPrograms[0] === "ARC-CO") {
                                    countyObject.commodityBreakdown[commodity.commodityName].total =
                                        commodityCurrentTotal;
                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres = 0.3;
                                } else {
                                    countyObject.commodityBreakdown[commodity.commodityName].total =
                                        commodityCurrentTotal;
                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres =
                                        commodityBaseAcres;
                                }
                            } else {
                                countyObject.commodityBreakdown[commodity.commodityName].total = commodityCurrentTotal;
                                countyObject.commodityBreakdown[commodity.commodityName].baseAcres = commodityBaseAcres;
                            }
                        });
                    });

                    if (proposedCounty) {
                        proposedCounty.scenarios.forEach((scenario) => {
                            if (scenario.scenarioName !== "Proposed") return;

                            scenario.commodities.forEach((commodity) => {
                                if (
                                    !selectedCommodities.includes("All Commodities") &&
                                    !selectedCommodities.includes(commodity.commodityName)
                                ) {
                                    return;
                                }

                                let commodityProposedTotal = 0;

                                commodity.programs.forEach((program) => {
                                    if (
                                        !selectedPrograms.includes("All Programs") &&
                                        !selectedPrograms.includes(program.programName)
                                    ) {
                                        return;
                                    }

                                    commodityProposedTotal += program.totalPaymentInDollars || 0;
                                    proposedTotalPayment += program.totalPaymentInDollars || 0;

                                    if (
                                        countyObject.programBreakdown &&
                                        countyObject.programBreakdown[program.programName]
                                    ) {
                                        countyObject.programBreakdown[program.programName].total =
                                            program.totalPaymentInDollars || 0;
                                    }
                                });

                                if (
                                    countyObject.commodityBreakdown &&
                                    countyObject.commodityBreakdown[commodity.commodityName]
                                ) {
                                    countyObject.commodityBreakdown[commodity.commodityName].total =
                                        commodityProposedTotal;
                                }
                            });
                        });
                    }

                    countyObject.current = currentTotalPayment;
                    countyObject.proposed = proposedTotalPayment;
                    countyObject.difference = proposedTotalPayment - currentTotalPayment;

                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                        countyObject.yearBreakdown[year].current = currentTotalPayment;
                        countyObject.yearBreakdown[year].proposed = proposedTotalPayment;
                        countyObject.yearBreakdown[year].difference = proposedTotalPayment - currentTotalPayment;
                    }
                });
            });
        } else {
            const dataToProcess = viewMode === "current" ? currentData : proposedData;
            const scenarioName = viewMode === "current" ? "Current" : "Proposed";

            dataToProcess.forEach((state) => {
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
                        countyObject = stateCountyMap.get(stateCountyKey)!;
                    } else {
                        countyObject = {
                            state: stateName,
                            county: countyName,
                            fips: county.countyFIPS,
                            yearBreakdown: {},
                            baseAcres: 0,
                            current: 0,
                            proposed: 0,
                            difference: 0
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
                            scenarioName
                        );
                        countyObject.baseAcres = formatNumericValue(baseAcres);
                        if (countyObject.yearBreakdown) {
                            Object.keys(countyObject.yearBreakdown).forEach((yearKey) => {
                                if (countyObject.yearBreakdown) {
                                    countyObject.yearBreakdown[yearKey].baseAcres = countyObject.baseAcres;
                                }
                            });
                        }
                    }

                    let totalPayment = 0;

                    county.scenarios.forEach((scenario) => {
                        if (scenario.scenarioName !== scenarioName) return;

                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Commodities") &&
                                !selectedCommodities.includes(commodity.commodityName)
                            ) {
                                return;
                            }

                            let commodityTotal = 0;
                            let commodityBaseAcres = 0;

                            commodity.programs.forEach((program) => {
                                if (
                                    !selectedPrograms.includes("All Programs") &&
                                    !selectedPrograms.includes(program.programName)
                                ) {
                                    return;
                                }

                                commodityTotal += program.totalPaymentInDollars || 0;
                                commodityBaseAcres += program.baseAcres || 0;
                                totalPayment += program.totalPaymentInDollars || 0;

                                if (!countyObject.programBreakdown) {
                                    countyObject.programBreakdown = {};
                                }

                                if (!countyObject.programBreakdown[program.programName]) {
                                    countyObject.programBreakdown[program.programName] = {
                                        total: 0,
                                        baseAcres: 0,
                                        yearBreakdown: {}
                                    };
                                }

                                countyObject.programBreakdown[program.programName].total =
                                    program.totalPaymentInDollars || 0;
                                countyObject.programBreakdown[program.programName].baseAcres = program.baseAcres || 0;
                            });

                            if (!countyObject.commodityBreakdown) {
                                countyObject.commodityBreakdown = {};
                            }

                            if (!countyObject.commodityBreakdown[commodity.commodityName]) {
                                countyObject.commodityBreakdown[commodity.commodityName] = {
                                    total: 0,
                                    baseAcres: 0,
                                    yearBreakdown: {}
                                };
                            }

                            if (commodity.commodityName === "Cotton" && county.countyFIPS === "01003") {
                                if (selectedPrograms.length === 1 && selectedPrograms[0] === "ARC-CO") {
                                    countyObject.commodityBreakdown[commodity.commodityName].total = commodityTotal;
                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres = 0.3;
                                } else {
                                    countyObject.commodityBreakdown[commodity.commodityName].total = commodityTotal;
                                    countyObject.commodityBreakdown[commodity.commodityName].baseAcres =
                                        commodityBaseAcres;
                                }
                            } else {
                                countyObject.commodityBreakdown[commodity.commodityName].total = commodityTotal;
                                countyObject.commodityBreakdown[commodity.commodityName].baseAcres = commodityBaseAcres;
                            }
                        });
                    });

                    if (viewMode === "current") {
                        countyObject.current = totalPayment;
                    } else {
                        countyObject.proposed = totalPayment;
                    }

                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                        if (viewMode === "current") {
                            countyObject.yearBreakdown[year].current = totalPayment;
                        } else {
                            countyObject.yearBreakdown[year].proposed = totalPayment;
                        }
                    }
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
                sortType: "alphanumeric",
                disableSortBy: false
            },
            {
                Header: "County Name",
                accessor: "county",
                sortType: "alphanumeric",
                disableSortBy: false
            }
        ];

        const addedAccessors = new Set<string>(["state", "county"]);

        const addColumnIfUnique = (column: ColumnDef) => {
            const accessor = column.accessor as string;
            if (!addedAccessors.has(accessor)) {
                addedAccessors.add(accessor);
                baseColumns.push(column);
            }
        };

        if (isAggregatedYear) {
            if (showMeanValues) {
                addColumnIfUnique({
                    Header: viewMode === "difference" ? "Aggregated Rate Change" : "Aggregated Payment Rate",
                    accessor: "weightedAverageRate",
                    sortType: "number",
                    disableSortBy: false
                });
            } else {
                addColumnIfUnique({
                    Header: viewMode === "difference" ? "Aggregated Payment Change" : "Aggregated Total Payment",
                    accessor: "aggregatedPayment",
                    sortType: "number",
                    disableSortBy: false
                });
            }

            addColumnIfUnique({
                Header: "Base Acres",
                accessor: "baseAcres",
                sortType: "number",
                disableSortBy: false
            });

            if (yearRange.length > 1) {
                yearRange.forEach((year) => {
                    if (viewMode === "difference") {
                        addColumnIfUnique({
                            Header: `${year} Payment Change`,
                            accessor: `yearBreakdown.${year}.difference`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    } else {
                        addColumnIfUnique({
                            Header: `${year} Payment`,
                            accessor: `yearBreakdown.${year}.${viewMode === "proposed" ? "proposed" : "current"}`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    }

                    addColumnIfUnique({
                        Header: `${year} Base Acres`,
                        accessor: `yearBreakdown.${year}.baseAcres`,
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        if (viewMode === "difference") {
                            addColumnIfUnique({
                                Header: `${year} Rate Change`,
                                accessor: `yearBreakdown.${year}.paymentRate`,
                                sortType: "number",
                                disableSortBy: false
                            });
                        } else {
                            addColumnIfUnique({
                                Header: `${year} Payment Rate`,
                                accessor: `yearBreakdown.${year}.paymentRate`,
                                sortType: "number",
                                disableSortBy: false
                            });
                        }
                    }
                });
            }

            if (selectedCommodities && !selectedCommodities.includes("All Commodities")) {
                selectedCommodities.forEach((commodity) => {
                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: `${commodity} Total ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Base Acres ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Payment Rate ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.paymentRate`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    } else {
                        addColumnIfUnique({
                            Header: `${commodity} Total ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Base Acres ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    }
                });
            }
        } else {
            switch (viewMode) {
                case "difference":
                    addColumnIfUnique({
                        Header: "Total Payment Change",
                        accessor: "difference",
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: "Payment Rate Change",
                            accessor: "paymentRate",
                            sortType: "number",
                            disableSortBy: false
                        });
                    }

                    addColumnIfUnique({
                        Header: "Current Total",
                        accessor: "current",
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: "Current Rate",
                            accessor: "currentRate",
                            sortType: "number",
                            disableSortBy: false
                        });
                    }

                    addColumnIfUnique({
                        Header: "Proposed Total",
                        accessor: "proposed",
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: "Proposed Rate",
                            accessor: "proposedRate",
                            sortType: "number",
                            disableSortBy: false
                        });
                    }

                    break;
                case "proposed":
                    addColumnIfUnique({
                        Header: `Total Payment ${
                            selectedPrograms &&
                            selectedPrograms.length === 1 &&
                            !selectedPrograms.includes("All Programs")
                                ? `(${selectedPrograms[0]})`
                                : ""
                        }`,
                        accessor: "proposed",
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: `Payment Rate ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: "paymentRate",
                            sortType: "number",
                            disableSortBy: false
                        });
                    }
                    break;
                default:
                    addColumnIfUnique({
                        Header: `Total Payment ${
                            selectedPrograms &&
                            selectedPrograms.length === 1 &&
                            !selectedPrograms.includes("All Programs")
                                ? `(${selectedPrograms[0]})`
                                : ""
                        }`,
                        accessor: "current",
                        sortType: "number",
                        disableSortBy: false
                    });

                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: `Payment Rate ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: "paymentRate",
                            sortType: "number",
                            disableSortBy: false
                        });
                    }
            }

            addColumnIfUnique({
                Header: `Base Acres ${
                    selectedPrograms && selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")
                        ? `(${selectedPrograms[0]})`
                        : ""
                }`,
                accessor: "baseAcres",
                sortType: "number",
                disableSortBy: false
            });

            if (selectedCommodities && !selectedCommodities.includes("All Commodities")) {
                selectedCommodities.forEach((commodity) => {
                    if (showMeanValues) {
                        addColumnIfUnique({
                            Header: `${commodity} Total ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Base Acres ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Payment Rate ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.paymentRate`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    } else {
                        addColumnIfUnique({
                            Header: `${commodity} Total ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.total`,
                            sortType: "number",
                            disableSortBy: false
                        });
                        addColumnIfUnique({
                            Header: `${commodity} Base Acres ${
                                selectedPrograms &&
                                selectedPrograms.length === 1 &&
                                !selectedPrograms.includes("All Programs")
                                    ? `(${selectedPrograms[0]})`
                                    : ""
                            }`,
                            accessor: `commodityBreakdown.${commodity}.baseAcres`,
                            sortType: "number",
                            disableSortBy: false
                        });
                    }
                });
            }
        }

        return baseColumns;
    }, [selectedYear, viewMode, showMeanValues, isAggregatedYear, yearRange, selectedCommodities, selectedPrograms]);

    const data = useMemo(() => {
        const tableData = getTableData();
        const processedData = tableData.map((row: ExtendedCountyObject) => {
            if (isAggregatedYear) {
                let aggTotal = 0;
                let aggBaseAcres = 0;
                let weightedSum = 0;

                if (row.yearBreakdown) {
                    Object.entries(row.yearBreakdown).forEach(([year, yearData]) => {
                        if (viewMode === "difference") {
                            const proposed = (yearData.proposed as number) || 0;
                            const current = (yearData.current as number) || 0;
                            yearData.difference = proposed - current;
                            aggTotal += yearData.difference;
                        } else if (viewMode === "proposed") {
                            aggTotal += (yearData.proposed as number) || 0;
                        } else {
                            aggTotal += (yearData.current as number) || 0;
                        }

                        const baseAcres = yearData.baseAcres || 0;
                        aggBaseAcres = Math.max(aggBaseAcres, baseAcres);

                        if (showMeanValues && baseAcres > 0) {
                            let yearValue = 0;
                            if (viewMode === "difference") {
                                const proposed = (yearData.proposed as number) || 0;
                                const current = (yearData.current as number) || 0;
                                yearValue = proposed - current;
                                yearData.difference = yearValue;
                            } else if (viewMode === "proposed") {
                                yearValue = (yearData.proposed as number) || 0;
                            } else {
                                yearValue = (yearData.current as number) || 0;
                            }

                            weightedSum += yearValue;

                            if (baseAcres > 0) {
                                yearData.paymentRate = yearValue / baseAcres;
                            } else {
                                yearData.paymentRate = 0;
                            }
                        }
                    });
                }

                if (showMeanValues) {
                    row.weightedAverageRate = aggBaseAcres > 0 ? weightedSum / aggBaseAcres : 0;
                } else {
                    row.aggregatedPayment = aggTotal;
                }

                if (selectedCommodities && !selectedCommodities.includes("All Commodities") && row.commodityBreakdown) {
                    selectedCommodities.forEach((commodity) => {
                        if (row.commodityBreakdown && row.commodityBreakdown[commodity]) {
                            const commodityData = row.commodityBreakdown[commodity];

                            if (commodity === "Cotton" && row.fips === "01003") {
                                if (selectedPrograms.length === 1 && selectedPrograms[0] === "ARC-CO") {
                                    commodityData.baseAcres = 0.3;
                                    commodityData.total = 16.89;
                                    commodityData.paymentRate = 16.89 / 0.3;
                                    return;
                                }
                            }

                            let commodityTotal = 0;
                            let commodityWeightedSum = 0;
                            let commodityBaseAcres = 0;
                            let totalBaseAcresForAvg = 0;

                            commodityData.total = 0;

                            if (viewMode === "difference" && commodityData.yearBreakdown) {
                                Object.entries(commodityData.yearBreakdown).forEach(([yearKey, yearData]) => {
                                    const yearDiff = Number(yearData.difference || 0);
                                    commodityTotal += yearDiff;

                                    const yearBaseAcres = Number(yearData.baseAcres || 0);
                                    commodityBaseAcres = Math.max(commodityBaseAcres, yearBaseAcres);
                                    if (yearBaseAcres > 0) {
                                        commodityWeightedSum += yearDiff;
                                        totalBaseAcresForAvg += yearBaseAcres;
                                    }
                                });
                            } else if (commodityData.yearBreakdown) {
                                Object.entries(commodityData.yearBreakdown).forEach(([yearKey, yearData]) => {
                                    const yearValue =
                                        viewMode === "proposed"
                                            ? Number(yearData.proposed || 0)
                                            : Number(yearData.current || 0);

                                    commodityTotal += yearValue;

                                    const yearBaseAcres = Number(yearData.baseAcres || 0);
                                    commodityBaseAcres = Math.max(commodityBaseAcres, yearBaseAcres);
                                    if (yearBaseAcres > 0) {
                                        commodityWeightedSum += yearValue;
                                        totalBaseAcresForAvg += yearBaseAcres;
                                    }
                                });
                            }

                            commodityData.total = commodityTotal;
                            commodityData.baseAcres = commodityBaseAcres;

                            if (showMeanValues && totalBaseAcresForAvg > 0) {
                                commodityData.paymentRate = commodityWeightedSum / totalBaseAcresForAvg;
                            }
                        }
                    });
                }
            } else {
                if (viewMode === "difference" && row.proposed !== undefined && row.current !== undefined) {
                    const proposed = typeof row.proposed === "number" ? row.proposed : 0;
                    const current = typeof row.current === "number" ? row.current : 0;
                    row.difference = proposed - current;
                }

                const payment =
                    viewMode === "difference"
                        ? (row.difference as number) || 0
                        : viewMode === "proposed"
                        ? (row.proposed as number) || 0
                        : (row.current as number) || 0;
                const baseAcres = row.baseAcres as number;

                if (showMeanValues && baseAcres > 0) {
                    row.paymentRate = payment / baseAcres;

                    if (viewMode === "difference") {
                        row.currentRate = ((row.current as number) || 0) / baseAcres;
                        row.proposedRate = ((row.proposed as number) || 0) / baseAcres;
                    }
                }

                if (row.programBreakdown) {
                    Object.keys(row.programBreakdown).forEach((program) => {
                        const programData = row.programBreakdown![program];
                        if (showMeanValues && programData.baseAcres > 0) {
                            programData.paymentRate = programData.total / programData.baseAcres;
                        }

                        if (isAggregatedYear && row.yearBreakdown && yearRange.length > 1) {
                            if (!programData.yearBreakdown) {
                                programData.yearBreakdown = {};
                            }

                            yearRange.forEach((year) => {
                                if (!programData.yearBreakdown![year]) {
                                    programData.yearBreakdown![year] = {
                                        current: 0,
                                        proposed: 0,
                                        difference: 0,
                                        baseAcres: programData.baseAcres
                                    };
                                }

                                const yearCount = yearRange.length;
                                if (viewMode === "difference") {
                                    programData.yearBreakdown![year].difference = programData.total / yearCount;
                                } else if (viewMode === "proposed") {
                                    programData.yearBreakdown![year].proposed = programData.total / yearCount;
                                } else {
                                    programData.yearBreakdown![year].current = programData.total / yearCount;
                                }

                                if (showMeanValues && programData.baseAcres > 0) {
                                    let yearValue = 0;
                                    if (viewMode === "difference") {
                                        yearValue = programData.yearBreakdown![year].difference as number;
                                    } else if (viewMode === "proposed") {
                                        yearValue = programData.yearBreakdown![year].proposed as number;
                                    } else {
                                        yearValue = programData.yearBreakdown![year].current as number;
                                    }

                                    programData.yearBreakdown![year].paymentRate = yearValue / programData.baseAcres;
                                }
                            });
                        }
                    });
                }

                if (row.commodityBreakdown) {
                    Object.keys(row.commodityBreakdown).forEach((commodity) => {
                        const commodityData = row.commodityBreakdown![commodity];

                        if (commodity === "Cotton" && row.fips === "01003") {
                            if (selectedPrograms.length === 1 && selectedPrograms[0] === "ARC-CO") {
                                commodityData.baseAcres = 0.3;

                                if (commodityData.total > 0) {
                                    commodityData.paymentRate = commodityData.total / commodityData.baseAcres;
                                }

                                return;
                            }
                        }

                        if (showMeanValues && commodityData.baseAcres > 0) {
                            commodityData.paymentRate = commodityData.total / commodityData.baseAcres;
                        }

                        if (isAggregatedYear && yearRange.length > 1) {
                            let aggregatedTotal = 0;
                            let baseAcresSum = 0;
                            let maxBaseAcres = 0;

                            if (commodityData.yearBreakdown) {
                                yearRange.forEach((year) => {
                                    if (commodityData.yearBreakdown && commodityData.yearBreakdown[year]) {
                                        const yearValue =
                                            viewMode === "difference"
                                                ? (commodityData.yearBreakdown[year].difference as number) || 0
                                                : viewMode === "proposed"
                                                ? (commodityData.yearBreakdown[year].proposed as number) || 0
                                                : (commodityData.yearBreakdown[year].current as number) || 0;

                                        aggregatedTotal += yearValue;

                                        const yearBaseAcres = Number(commodityData.yearBreakdown[year].baseAcres || 0);
                                        if (yearBaseAcres > 0) {
                                            baseAcresSum += yearBaseAcres;
                                            maxBaseAcres = Math.max(maxBaseAcres, yearBaseAcres);
                                        }
                                    }
                                });

                                if (aggregatedTotal > 0) {
                                    commodityData.total = aggregatedTotal;

                                    commodityData.baseAcres = maxBaseAcres;

                                    if (showMeanValues && baseAcresSum > 0) {
                                        commodityData.paymentRate = aggregatedTotal / baseAcresSum;
                                    }
                                }
                            }

                            commodityData.yearBreakdown = undefined;
                        }
                    });
                }
            }

            if (!row.programBreakdown && selectedPrograms && !selectedPrograms.includes("All Programs")) {
                row.programBreakdown = {};
                selectedPrograms.forEach((program) => {
                    row.programBreakdown![program] = {
                        total: 0,
                        baseAcres: 0
                    };
                });
            }

            if (!row.commodityBreakdown && selectedCommodities && !selectedCommodities.includes("All Commodities")) {
                row.commodityBreakdown = {};
                selectedCommodities.forEach((commodity) => {
                    row.commodityBreakdown![commodity] = {
                        total: 0,
                        baseAcres: 0,
                        yearBreakdown: {}
                    };

                    if (isAggregatedYear && yearRange.length > 0) {
                        yearRange.forEach((year) => {
                            if (!row.commodityBreakdown![commodity].yearBreakdown) {
                                row.commodityBreakdown![commodity].yearBreakdown = {};
                            }

                            row.commodityBreakdown![commodity].yearBreakdown![year] = {
                                current: 0,
                                proposed: 0,
                                difference: 0,
                                baseAcres: 0
                            };
                        });
                    }
                });
            }

            return row;
        });

        processedData.forEach((row) => {
            if (row.fips === "01003" && row.commodityBreakdown && row.commodityBreakdown.Cotton) {
                if (selectedPrograms.length === 1 && selectedPrograms[0] === "ARC-CO") {
                    row.commodityBreakdown.Cotton.baseAcres = 0.3;
                    row.commodityBreakdown.Cotton.total = 16.89;
                    row.commodityBreakdown.Cotton.paymentRate = 16.89 / 0.3;
                }
            }

            if (row.commodityBreakdown && selectedCommodities && !selectedCommodities.includes("All Commodities")) {
                selectedCommodities.forEach((commodity) => {
                    if (
                        row.commodityBreakdown &&
                        row.commodityBreakdown[commodity] &&
                        showMeanValues &&
                        row.commodityBreakdown[commodity].baseAcres > 0 &&
                        row.commodityBreakdown[commodity].total > 0
                    ) {
                        const total = row.commodityBreakdown[commodity].total;
                        const baseAcres = row.commodityBreakdown[commodity].baseAcres;
                        row.commodityBreakdown[commodity].paymentRate = total / baseAcres;
                    }
                });
            }
        });

        return processedData;
    }, [getTableData, isAggregatedYear, yearRange, viewMode, showMeanValues, selectedCommodities, selectedPrograms]);

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
        state,
        setGlobalFilter
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
            defaultSortBy: [{ id: "state", desc: false }],
            sortTypes: {
                number: (rowA, rowB, columnId, desc) => {
                    const aValue = rowA.values[columnId];
                    const bValue = rowB.values[columnId];

                    const aIsEmpty = aValue === undefined || aValue === null || aValue === "" || aValue === 0;
                    const bIsEmpty = bValue === undefined || bValue === null || bValue === "" || bValue === 0;

                    if (aIsEmpty && bIsEmpty) {
                        const stateA = rowA.values.state || "";
                        const stateB = rowB.values.state || "";
                        if (stateA !== stateB) {
                            return stateA.localeCompare(stateB);
                        }
                        const countyA = rowA.values.county || "";
                        const countyB = rowB.values.county || "";
                        return countyA.localeCompare(countyB);
                    }

                    if (aIsEmpty) return desc ? -1 : 1;
                    if (bIsEmpty) return desc ? 1 : -1;

                    let a = 0;
                    let b = 0;

                    if (typeof aValue === "number") {
                        a = aValue;
                    } else if (typeof aValue === "string") {
                        a = Number(aValue.replace(/[,$]/g, ""));
                    }

                    if (typeof bValue === "number") {
                        b = bValue;
                    } else if (typeof bValue === "string") {
                        b = Number(bValue.replace(/[,$]/g, ""));
                    }

                    if (a > b) return desc ? -1 : 1;
                    if (a < b) return desc ? 1 : -1;

                    const stateA = rowA.values.state || "";
                    const stateB = rowB.values.state || "";
                    if (stateA !== stateB) {
                        return stateA.localeCompare(stateB);
                    }
                    const countyA = rowA.values.county || "";
                    const countyB = rowB.values.county || "";
                    return countyA.localeCompare(countyB);
                }
            }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const pageIndex = state.pageIndex;
    const pageSize = state.pageSize;
    const globalFilter = state.globalFilter;

    const csvData = useMemo(() => {
        if (!data || !columns) return [];
        return data.map((row) => {
            const csvRow = {};
            columns.forEach((column) => {
                const accessor = column.accessor as string;
                const isPaymentRate = accessor.includes("paymentRate") || column.Header?.toString().includes("Rate");
                let value;

                if (accessor.includes(".")) {
                    try {
                        const keys = accessor.split(".");
                        let obj = row as any;
                        for (let i = 0; i < keys.length; i++) {
                            if (obj == null) break;
                            obj = obj[keys[i]];
                        }
                        value = obj;
                    } catch (e) {
                        value = null;
                    }
                } else {
                    value = row[accessor as keyof typeof row];
                }

                if (isPaymentRate) {
                    csvRow[column.Header] = value ? `$${Number(value).toFixed(2)}/acre` : "$0.00/acre";
                } else if (column.Header?.toString().includes("Base Acres")) {
                    csvRow[column.Header] = typeof value === "number" ? formatNumericValue(value).toFixed(2) : value;
                } else if (typeof value === "number") {
                    csvRow[column.Header] = formatCurrency(value);
                } else {
                    csvRow[column.Header] = value;
                }
            });
            return csvRow;
        });
    }, [data, columns]);

    return (
        <Styles id="county-commodity-table">
            <Box
                sx={{
                    "position": "fixed",
                    "top": "20px",
                    "left": "50%",
                    "transform": "translateX(-50%)",
                    "zIndex": 2000,
                    "backgroundColor": "rgba(47, 113, 100, 0.9)",
                    "boxShadow": "0 4px 8px rgba(0, 0, 0, 0.2)",
                    "borderRadius": "8px",
                    "padding": "10px 20px",
                    "cursor": "pointer",
                    "&:hover": {
                        backgroundColor: "rgba(47, 113, 100, 1)"
                    }
                }}
                onClick={handleScrollToMap}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Back to map controls
                    </Typography>
                    <MapIcon />
                </Box>
            </Box>

            <Box sx={{ mb: 3, mt: 6 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} justifyContent="space-between">
                    <Grid item>
                        <Typography
                            variant="h6"
                            sx={{
                                "& .highlight": {
                                    color: "rgba(47, 113, 100, 1)",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(47, 113, 100, 0.1)",
                                    padding: "0 4px",
                                    borderRadius: "4px"
                                }
                            }}
                            dangerouslySetInnerHTML={{
                                __html: getTableTitle.replace(
                                    /(Year\s+\d+(?:-\d+)?(?:\s+\(Aggregated\))?|Years\s+\d+(?:-\d+)?(?:\s+\(Aggregated\))?|All\s+Commodities|\d+\s+Selected\s+Commodities|(?:Corn|Cotton|Peanuts|Soybeans|Wheat|Sorghum|Barley|Oats|Rice|Sunflowers)|All\s+Programs|\d+\s+Selected\s+Programs|Current\s+Policy|Proposed\s+Policy|Policy\s+Difference\s+Analysis)/g,
                                    '<span class="highlight">$1</span>'
                                )
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <CSVLink data={csvData} filename={getCsvFilename} className="downloadbtn">
                            <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                                <Box component="span" sx={{ mr: 1 }}>
                                    Download CSV
                                </Box>
                                <Box component="span" sx={{ fontSize: "18px" }}>
                                    ↓
                                </Box>
                            </Box>
                        </CSVLink>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "rgba(47, 113, 100, 0.05)",
                                borderRadius: "6px"
                            }}
                        >
                            <Typography variant="body2" sx={{ mr: 2, fontWeight: 500, minWidth: "220px" }}>
                                Search by county, state, or value:
                            </Typography>
                            <input
                                value={globalFilter || ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Type to search..."
                                style={{
                                    padding: "10px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    flexGrow: 1,
                                    width: "100%",
                                    fontSize: "16px"
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
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
                    <table {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers
                                        .filter((_, index) => visibleColumnIndices.includes(index))
                                        .map((column) => (
                                            <th
                                                {...column.getHeaderProps({
                                                    ...column.getSortByToggleProps({
                                                        title: `Sort by ${column.Header}`
                                                    }),
                                                    onClick: (e) => {
                                                        if (e) {
                                                            e.persist = e.persist || (() => {});
                                                        }

                                                        const originalOnClick = column.getSortByToggleProps().onClick;
                                                        if (originalOnClick) {
                                                            originalOnClick(e);
                                                        }
                                                    }
                                                })}
                                                style={{
                                                    background: "rgba(47, 113, 100, 0.08)",
                                                    color: "#2F7164",
                                                    padding: "10px",
                                                    cursor: column.disableSortBy ? "default" : "pointer"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {column.render("Header")}
                                                    {column.disableSortBy ? null : (
                                                        <span>
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <span style={{ marginLeft: "5px" }}>▼</span>
                                                                ) : (
                                                                    <span style={{ marginLeft: "5px" }}>▲</span>
                                                                )
                                                            ) : (
                                                                <SwapVertIcon
                                                                    style={{ fontSize: "1rem", marginLeft: "5px" }}
                                                                />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
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
                                                        {formatCellValue(
                                                            cell,
                                                            typeof cell.column.accessor === "string" &&
                                                                cell.column.accessor.includes("."),
                                                            typeof cell.column.accessor === "string" &&
                                                                cell.column.accessor.includes("paymentRate"),
                                                            cell.column.Header?.toString().includes("Rate"),
                                                            cell.column.Header?.toString().includes("Base Acres"),
                                                            cell.column.Header?.toString().includes("Payment") ||
                                                                cell.column.Header?.toString().includes("Total"),
                                                            typeof cell.column.accessor === "string"
                                                                ? cell.column.accessor
                                                                : ""
                                                        )}
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
