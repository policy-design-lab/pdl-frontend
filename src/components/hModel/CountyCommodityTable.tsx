import React, { useMemo, useState } from "react";
import { Box, Typography, Grid, TableContainer, Button, CircularProgress, Fade } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MapIcon from "@mui/icons-material/Map";
import {
    YearBreakdownData,
    CountyObject,
    getCountyNameFromFips,
    generateTableTitle,
    generateCsvFilename,
    getTotalBaseAcres,
    formatCellValue
} from "./utils";
import { formatCurrency, formatNumericValue } from "../shared/ConvertionFormats";

interface ExtendedYearBreakdownData extends YearBreakdownData {
    paymentRate?: number;
    currentBaseAcres?: number | string;
    proposedBaseAcres?: number | string;
}

interface ExtendedCountyObject extends CountyObject {
    yearBreakdown?: { [year: string]: ExtendedYearBreakdownData };
    weightedAverageRate?: number;
    aggregatedPayment?: number;
    paymentRate?: number;
    currentBaseAcres?: number | string;
    proposedBaseAcres?: number | string;
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

interface CountyCommodityTableProps {
    countyData: Record<string, unknown>;
    countyDataProposed: Record<string, unknown>;
    selectedYear: string | string[];
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    selectedState: string;
    stateCodesData: Record<string, string>;
    yearAggregation: number;
    aggregationEnabled: boolean;
    showMeanValues: boolean;
    enableScenarioSwitching?: boolean;
    currentScenarioName?: string;
    proposedScenarioName?: string;
    currentPolicyTitle?: string;
    proposedPolicyTitle?: string;
}

const CountyCommodityTable: React.FC<CountyCommodityTableProps> = ({
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
    showMeanValues,
    enableScenarioSwitching = true,
    currentScenarioName = "Current",
    proposedScenarioName = "Proposed",
    currentPolicyTitle = "Current Policy",
    proposedPolicyTitle = "Proposed Policy"
}) => {
    const [isTableLoading] = useState(false);
    const handleScrollToMap = () => {
        const mapElement = document.getElementById("county-commodity-map");
        if (mapElement) {
            mapElement.scrollIntoView({ behavior: "smooth" });
        }
    };
    const isAggregatedYear = useMemo(() => {
        return (
            (typeof selectedYear === "string" && selectedYear.includes("-")) ||
            (aggregationEnabled && yearAggregation > 0) ||
            (Array.isArray(selectedYear) && selectedYear.length > 1)
        );
    }, [selectedYear, yearAggregation, aggregationEnabled]);
    const yearRange = useMemo(() => {
        if (aggregationEnabled) {
            if (Array.isArray(selectedYear)) {
                return selectedYear;
            }
            return [selectedYear];
        }
        return Array.isArray(selectedYear) ? selectedYear : [selectedYear];
    }, [selectedYear, aggregationEnabled]);
    const getTableTitle = useMemo(() => {
        return generateTableTitle(
            selectedYear,
            selectedCommodities,
            selectedPrograms,
            viewMode,
            isAggregatedYear,
            showMeanValues,
            currentPolicyTitle,
            proposedPolicyTitle
        );
    }, [
        selectedYear,
        selectedCommodities,
        selectedPrograms,
        viewMode,
        isAggregatedYear,
        showMeanValues,
        currentPolicyTitle,
        proposedPolicyTitle
    ]);
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
                if (viewMode === "difference" && enableScenarioSwitching) {
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
                                if (enableScenarioSwitching) {
                                    const expectedScenario =
                                        viewMode === "proposed" ? proposedScenarioName : currentScenarioName;
                                    if (scenario.scenarioName !== expectedScenario) {
                                        return;
                                    }
                                }
                                let countyTotalPayment = 0;
                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Program Crops") &&
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
                            if (proposedCounty && enableScenarioSwitching) {
                                proposedCounty.scenarios.forEach((scenario) => {
                                    if (scenario.scenarioName !== proposedScenarioName) return;
                                    scenario.commodities.forEach((commodity) => {
                                        if (
                                            !selectedCommodities.includes("All Program Crops") &&
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
                            const yearCurrentBaseAcres = getTotalBaseAcres(
                                county,
                                selectedCommodities,
                                selectedPrograms,
                                "Current"
                            );
                            const yearProposedBaseAcres = proposedCounty
                                ? getTotalBaseAcres(proposedCounty, selectedCommodities, selectedPrograms, "Proposed")
                                : yearCurrentBaseAcres;

                            if (!countyObject.currentBaseAcres) countyObject.currentBaseAcres = 0;
                            if (!countyObject.proposedBaseAcres) countyObject.proposedBaseAcres = 0;
                            countyObject.currentBaseAcres =
                                (countyObject.currentBaseAcres as number) + yearCurrentBaseAcres;
                            countyObject.proposedBaseAcres =
                                (countyObject.proposedBaseAcres as number) + yearProposedBaseAcres;

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
                            const yearBaseAcres = currentBaseAcres;
                            if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year].baseAcres = formatNumericValue(yearBaseAcres);
                            }
                            if (yearBaseAcres > (countyObject.baseAcres || 0)) {
                                countyObject.baseAcres = formatNumericValue(yearBaseAcres);
                            }
                            county.scenarios.forEach((scenario) => {
                                if (enableScenarioSwitching) {
                                    const expectedScenario =
                                        viewMode === "proposed" ? proposedScenarioName : currentScenarioName;
                                    if (scenario.scenarioName !== expectedScenario) {
                                        return;
                                    }
                                }
                                let countyTotalPayment = 0;
                                scenario.commodities.forEach((commodity) => {
                                    if (
                                        !selectedCommodities.includes("All Program Crops") &&
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
                    const proposedBaseAcres = proposedCounty
                        ? getTotalBaseAcres(proposedCounty, selectedCommodities, selectedPrograms, "Proposed")
                        : currentBaseAcres;

                    countyObject.baseAcres = formatNumericValue(currentBaseAcres);
                    countyObject.currentBaseAcres = formatNumericValue(currentBaseAcres);
                    countyObject.proposedBaseAcres = formatNumericValue(proposedBaseAcres);

                    if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                        countyObject.yearBreakdown[year].baseAcres = countyObject.baseAcres;
                        countyObject.yearBreakdown[year].currentBaseAcres = countyObject.currentBaseAcres;
                        countyObject.yearBreakdown[year].proposedBaseAcres = countyObject.proposedBaseAcres;
                    }
                    let currentTotalPayment = 0;
                    let proposedTotalPayment = 0;
                    county.scenarios.forEach((scenario) => {
                        if (scenario.scenarioName !== currentScenarioName) return;
                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Program Crops") &&
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
                            countyObject.commodityBreakdown[commodity.commodityName].total = commodityCurrentTotal;
                            countyObject.commodityBreakdown[commodity.commodityName].baseAcres = commodityBaseAcres;
                        });
                    });
                    if (proposedCounty && enableScenarioSwitching) {
                        proposedCounty.scenarios.forEach((scenario) => {
                            if (scenario.scenarioName !== "Proposed") return;
                            scenario.commodities.forEach((commodity) => {
                                if (
                                    !selectedCommodities.includes("All Program Crops") &&
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
            const scenarioName = viewMode === "current" ? currentScenarioName : proposedScenarioName;
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
                        if (countyObject.yearBreakdown && countyObject.yearBreakdown[year]) {
                            countyObject.yearBreakdown[year].baseAcres = formatNumericValue(baseAcres);
                        }
                    }
                    let totalPayment = 0;
                    county.scenarios.forEach((scenario) => {
                        if (scenario.scenarioName !== scenarioName) return;
                        scenario.commodities.forEach((commodity) => {
                            if (
                                !selectedCommodities.includes("All Program Crops") &&
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
                            countyObject.commodityBreakdown[commodity.commodityName].total = commodityTotal;
                            countyObject.commodityBreakdown[commodity.commodityName].baseAcres = commodityBaseAcres;
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
    const data = useMemo(() => {
        const tableData = getTableData();
        const processedData = tableData.map((row: ExtendedCountyObject) => {
            if (isAggregatedYear) {
                let aggTotal = 0;
                let aggCurrentTotal = 0;
                let aggProposedTotal = 0;
                let aggCurrentBaseAcres = 0;
                let aggProposedBaseAcres = 0;
                let aggBaseAcres = 0;
                let weightedSum = 0;
                if (row.yearBreakdown) {
                    Object.entries(row.yearBreakdown).forEach(([year, yearData]) => {
                        const proposed = (yearData.proposed as number) || 0;
                        const current = (yearData.current as number) || 0;

                        aggCurrentTotal += current;
                        aggProposedTotal += proposed;

                        if (viewMode === "difference") {
                            yearData.difference = proposed - current;
                            aggTotal += yearData.difference;
                        } else if (viewMode === "proposed") {
                            aggTotal += proposed;
                        } else {
                            aggTotal += current;
                        }
                        const currentBaseAcres = Number(yearData.currentBaseAcres) || Number(yearData.baseAcres) || 0;
                        const proposedBaseAcres = Number(yearData.proposedBaseAcres) || Number(yearData.baseAcres) || 0;
                        const baseAcres = Number(yearData.baseAcres) || 0;

                        aggCurrentBaseAcres = Math.max(aggCurrentBaseAcres, currentBaseAcres);
                        aggProposedBaseAcres = Math.max(aggProposedBaseAcres, proposedBaseAcres);
                        aggBaseAcres = Math.max(aggBaseAcres, baseAcres);
                        if (showMeanValues && baseAcres > 0) {
                            let yearValue = 0;
                            if (viewMode === "difference") {
                                const proposedAmount = (yearData.proposed as number) || 0;
                                const currentAmount = (yearData.current as number) || 0;
                                yearValue = proposedAmount - currentAmount;
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
                    let totalBaseAcres = 0;
                    if (row.yearBreakdown) {
                        Object.entries(row.yearBreakdown).forEach(([, yearData]) => {
                            const baseAcres = yearData.baseAcres || 0;
                            totalBaseAcres += baseAcres;
                        });
                    } else {
                        totalBaseAcres = (row.baseAcres as number) || 0;
                    }
                    if (viewMode === "difference") {
                        const currentTotal = aggCurrentTotal || 0;
                        const proposedTotal = aggProposedTotal || 0;
                        const actualCurrentBaseAcres = (row.currentBaseAcres as number) || totalBaseAcres;
                        const actualProposedBaseAcres = (row.proposedBaseAcres as number) || totalBaseAcres;
                        const currentRate = actualCurrentBaseAcres > 0 ? currentTotal / actualCurrentBaseAcres : 0;
                        const proposedRate = actualProposedBaseAcres > 0 ? proposedTotal / actualProposedBaseAcres : 0;
                        row.weightedAverageRate = proposedRate - currentRate;
                    } else if (totalBaseAcres > 0) {
                        const precisedTotal = formatNumericValue(aggTotal);
                        const precisedBaseAcres = formatNumericValue(totalBaseAcres);
                        row.weightedAverageRate = precisedTotal / precisedBaseAcres;
                    } else {
                        row.weightedAverageRate = 0;
                    }
                } else {
                    row.aggregatedPayment = aggTotal;
                }
                if (
                    selectedCommodities &&
                    !selectedCommodities.includes("All Program Crops") &&
                    row.commodityBreakdown
                ) {
                    selectedCommodities.forEach((commodity) => {
                        if (row.commodityBreakdown && row.commodityBreakdown[commodity]) {
                            const commodityData = row.commodityBreakdown[commodity];
                            let commodityTotal = 0;
                            let commodityWeightedSum = 0;
                            let maxCommodityBaseAcres = 0;
                            let commodityYearCount = 0;
                            commodityData.total = 0;
                            if (viewMode === "difference" && commodityData.yearBreakdown) {
                                Object.entries(commodityData.yearBreakdown).forEach(([, yearData]) => {
                                    const currentPayment = Number(yearData.current || 0);
                                    const proposedPayment = Number(yearData.proposed || 0);
                                    const yearDiff = proposedPayment - currentPayment;
                                    commodityTotal += yearDiff;
                                    const yearBaseAcres = Number(yearData.baseAcres || 0);
                                    if (yearBaseAcres > 0) {
                                        const currentRate = currentPayment / yearBaseAcres;
                                        const proposedRate = proposedPayment / yearBaseAcres;
                                        const rateDiff = proposedRate - currentRate;
                                        commodityWeightedSum += rateDiff * yearBaseAcres;
                                        maxCommodityBaseAcres = Math.max(maxCommodityBaseAcres, yearBaseAcres);
                                        commodityYearCount += 1;
                                    }
                                });
                            } else if (commodityData.yearBreakdown) {
                                Object.entries(commodityData.yearBreakdown).forEach(([, yearData]) => {
                                    const yearValue =
                                        viewMode === "proposed"
                                            ? Number(yearData.proposed || 0)
                                            : Number(yearData.current || 0);
                                    commodityTotal += yearValue;
                                    const yearBaseAcres = Number(yearData.baseAcres || 0);
                                    if (yearBaseAcres > 0) {
                                        commodityWeightedSum += yearValue;
                                        maxCommodityBaseAcres = Math.max(maxCommodityBaseAcres, yearBaseAcres);
                                        commodityYearCount += 1;
                                    }
                                });
                            }
                            commodityData.total = commodityTotal;
                            const adjustedCommodityBaseAcres =
                                commodityYearCount > 1
                                    ? maxCommodityBaseAcres * commodityYearCount
                                    : maxCommodityBaseAcres;
                            commodityData.baseAcres = adjustedCommodityBaseAcres;
                            if (showMeanValues && adjustedCommodityBaseAcres > 0) {
                                commodityData.paymentRate = commodityWeightedSum / adjustedCommodityBaseAcres;
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
                if (showMeanValues) {
                    if (viewMode === "difference") {
                        const currentBaseAcres = (row.currentBaseAcres as number) || (row.baseAcres as number) || 0;
                        const proposedBaseAcres = (row.proposedBaseAcres as number) || (row.baseAcres as number) || 0;
                        const currentPayment = (row.current as number) || 0;
                        const proposedPayment = (row.proposed as number) || 0;
                        const currentRate = currentBaseAcres > 0 ? currentPayment / currentBaseAcres : 0;
                        const proposedRate = proposedBaseAcres > 0 ? proposedPayment / proposedBaseAcres : 0;
                        row.currentRate = currentRate;
                        row.proposedRate = proposedRate;
                        row.paymentRate = proposedRate - currentRate;
                    } else {
                        const payment =
                            viewMode === "proposed" ? (row.proposed as number) || 0 : (row.current as number) || 0;
                        const baseAcres = (row.baseAcres as number) || 0;
                        if (baseAcres > 0) {
                            const precisedPayment = Math.round(payment * 100) / 100;
                            const precisedBaseAcres = Math.round(baseAcres * 100) / 100;
                            row.paymentRate = precisedPayment / precisedBaseAcres;
                        }
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
                        if (showMeanValues && commodityData.baseAcres > 0) {
                            commodityData.paymentRate = commodityData.total / commodityData.baseAcres;
                        }
                        if (isAggregatedYear && yearRange.length > 1) {
                            let aggregatedTotal = 0;
                            let baseAcresSum = 0;
                            if (commodityData.yearBreakdown) {
                                yearRange.forEach((year) => {
                                    if (commodityData.yearBreakdown && commodityData.yearBreakdown[year]) {
                                        let yearValue = 0;
                                        if (viewMode === "difference") {
                                            yearValue = (commodityData.yearBreakdown[year].difference as number) || 0;
                                        } else if (viewMode === "proposed") {
                                            yearValue = (commodityData.yearBreakdown[year].proposed as number) || 0;
                                        } else {
                                            yearValue = (commodityData.yearBreakdown[year].current as number) || 0;
                                        }
                                        aggregatedTotal += yearValue;
                                        const yearBaseAcres = Number(commodityData.yearBreakdown[year].baseAcres || 0);
                                        if (yearBaseAcres > 0) {
                                            baseAcresSum += yearBaseAcres;
                                        }
                                    }
                                });
                                if (aggregatedTotal > 0) {
                                    commodityData.total = aggregatedTotal;
                                    commodityData.baseAcres = baseAcresSum;
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
            if (!row.commodityBreakdown && selectedCommodities && !selectedCommodities.includes("All Program Crops")) {
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
            return { ...row };
        });
        processedData.forEach((row) => {
            if (row.commodityBreakdown && selectedCommodities && !selectedCommodities.includes("All Program Crops")) {
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
        return [...processedData];
    }, [
        getTableData,
        isAggregatedYear,
        yearRange,
        viewMode,
        showMeanValues,
        selectedCommodities,
        selectedPrograms,
        selectedState
    ]);
    const dataWithKeys = useMemo(() => {
        return data.map((row, index) => ({
            ...row,
            __id: `${row.state}-${row.county}-${row.fips}-${index}`
        }));
    }, [data]);
    const [columnPage, setColumnPage] = useState(0);
    const columnsPerPage = 6;
    const baseColumns = useMemo(() => {
        const columns = [
            {
                Header: "County Name",
                accessor: "county",
                disableSortBy: false,
                sortType: "emptyBottomText"
            },
            {
                Header: "State",
                accessor: "state",
                disableSortBy: false,
                sortType: "emptyBottomText"
            },
            {
                Header: "FIPS Code",
                accessor: "fips",
                disableSortBy: false,
                sortType: "emptyBottomText"
            }
        ];

        if (isAggregatedYear && showMeanValues) {
            columns.push({
                Header: "Weighted Avg Rate",
                accessor: "weightedAverageRate",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        } else if (isAggregatedYear) {
            let headerText = "Aggregated Payment";
            if (viewMode === "difference") {
                headerText = "Aggregated Difference";
            } else if (viewMode === "proposed") {
                headerText = "Aggregated Payment (Proposed)";
            }
            columns.push({
                Header: headerText,
                accessor: "aggregatedPayment",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        } else {
            let headerText;
            if (showMeanValues) {
                headerText = "Payment Rate";
            } else if (viewMode === "difference") {
                headerText = "Total Difference";
            } else if (viewMode === "proposed") {
                headerText = "Total Payment (Proposed)";
            } else {
                headerText = "Total Payment";
            }
            columns.push({
                Header: headerText,
                accessor: showMeanValues ? "paymentRate" : "current",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        }

        if (!(isAggregatedYear && yearRange.length > 1)) {
            columns.push({
                Header: "Base Acres",
                accessor: "baseAcres",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        }

        if (isAggregatedYear && yearRange.length > 1) {
            yearRange.forEach((year) => {
                if (showMeanValues) {
                    columns.push({
                        Header: `${year} Rate`,
                        accessor: `yearBreakdown.${year}.paymentRate`,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                } else {
                    let accessor;
                    if (viewMode === "difference") {
                        accessor = `yearBreakdown.${year}.difference`;
                    } else if (viewMode === "proposed") {
                        accessor = `yearBreakdown.${year}.proposed`;
                    } else {
                        accessor = `yearBreakdown.${year}.current`;
                    }
                    let headerText = `${year} Payment`;
                    if (viewMode === "difference") {
                        headerText = `${year} Difference`;
                    } else if (viewMode === "proposed") {
                        headerText = `${year} Payment (Proposed)`;
                    }
                    columns.push({
                        Header: headerText,
                        accessor,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                }
                columns.push({
                    Header: `${year} Base Acres`,
                    accessor: `yearBreakdown.${year}.baseAcres`,
                    disableSortBy: false,
                    sortType: "emptyBottomNumeric"
                });
            });
        }

        if (
            selectedCommodities &&
            !selectedCommodities.includes("All Program Crops") &&
            selectedCommodities.length > 0
        ) {
            selectedCommodities.forEach((commodity) => {
                if (showMeanValues) {
                    columns.push({
                        Header: `${commodity} Rate`,
                        accessor: `commodityBreakdown.${commodity}.paymentRate`,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                } else {
                    let headerText = `${commodity} Payment`;
                    if (viewMode === "difference") {
                        headerText = `${commodity} Difference`;
                    } else if (viewMode === "proposed") {
                        headerText = `${commodity} Payment (Proposed)`;
                    }
                    columns.push({
                        Header: headerText,
                        accessor: `commodityBreakdown.${commodity}.total`,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                }
                columns.push({
                    Header: `${commodity} Base Acres`,
                    accessor: `commodityBreakdown.${commodity}.baseAcres`,
                    disableSortBy: false,
                    sortType: "emptyBottomNumeric"
                });
            });
        }

        if (
            selectedPrograms &&
            !selectedPrograms.includes("All Programs") &&
            selectedPrograms.length > 1 &&
            selectedPrograms.length <= 3
        ) {
            selectedPrograms.forEach((program) => {
                if (showMeanValues) {
                    columns.push({
                        Header: `${program} Rate`,
                        accessor: `programBreakdown.${program}.paymentRate`,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                } else {
                    let headerText = `${program} Payment`;
                    if (viewMode === "difference") {
                        headerText = `${program} Difference`;
                    } else if (viewMode === "proposed") {
                        headerText = `${program} Payment (Proposed)`;
                    }
                    columns.push({
                        Header: headerText,
                        accessor: `programBreakdown.${program}.total`,
                        disableSortBy: false,
                        sortType: "emptyBottomNumeric"
                    });
                }
                columns.push({
                    Header: `${program} Base Acres`,
                    accessor: `programBreakdown.${program}.baseAcres`,
                    disableSortBy: false,
                    sortType: "emptyBottomNumeric"
                });
            });
        }

        return columns;
    }, [showMeanValues, isAggregatedYear, yearRange, selectedCommodities, selectedPrograms, viewMode]);

    const visibleColumnIndices = useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 3;
        const endIndex = Math.min(startIndex + columnsPerPage, baseColumns.length);
        return [0, 1, 2, ...Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex)];
    }, [columnPage, columnsPerPage, baseColumns.length]);
    const totalColumnPages = Math.ceil((baseColumns.length - 3) / columnsPerPage);
    const { state } = useTable(
        {
            columns: baseColumns,
            data: dataWithKeys,
            initialState: { pageIndex: 0, pageSize: 10 },
            defaultSortBy: [{ id: "state", desc: false }],
            disableSortRemove: false,
            autoResetSortBy: false,
            disableMultiSort: true,
            getRowId: (row, index) => `${row.state}-${row.county}-${row.fips}-${index}`,
            sortTypes: {
                emptyBottomNumeric: (rowA, rowB, columnId) => {
                    const aValue = rowA.values[columnId];
                    const bValue = rowB.values[columnId];
                    const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
                    const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
                    return aNum - bNum;
                },
                emptyBottomText: (rowA, rowB, columnId) => {
                    const aValue = rowA.values[columnId];
                    const bValue = rowB.values[columnId];
                    const aStr = aValue ? String(aValue).toLowerCase() : "";
                    const bStr = bValue ? String(bValue).toLowerCase() : "";
                    return aStr.localeCompare(bStr);
                }
            }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );
    const countiesWithValues = useMemo(() => {
        const sortBy = state?.sortBy?.[0]?.id || "state";
        const withValues: typeof dataWithKeys = [];
        dataWithKeys.forEach((row) => {
            const hasValidCountyName = row.county && row.county !== "";
            if (!hasValidCountyName) {
                return;
            }
            // hide rows with empty county name, may update this in the future after confirming the FIPS code processing strategy
            let value = row[sortBy];
            if (sortBy.includes(".")) {
                const keys = sortBy.split(".");
                value = keys.reduce((obj, key) => obj?.[key], row);
            }
            const isNumericColumn =
                sortBy === "current" ||
                sortBy === "paymentRate" ||
                sortBy === "weightedAverageRate" ||
                sortBy === "aggregatedPayment" ||
                sortBy === "baseAcres" ||
                sortBy.includes("Payment") ||
                sortBy.includes("Rate") ||
                sortBy.includes("Base Acres") ||
                sortBy.includes("yearBreakdown") ||
                sortBy.includes("commodityBreakdown") ||
                sortBy.includes("programBreakdown");
            const isEmpty = isNumericColumn
                ? value === undefined || value === null || value === "" || value === 0
                : !value || value === "";

            if (!isEmpty) {
                withValues.push(row);
            }
        });
        return withValues;
    }, [dataWithKeys, state?.sortBy]);
    const mainTableData = useMemo(() => countiesWithValues, [countiesWithValues]);
    const {
        getTableProps: getMainTableProps,
        getTableBodyProps: getMainTableBodyProps,
        headerGroups: mainHeaderGroups,
        rows: mainRows,
        prepareRow: prepareMainRow,
        page: mainPage,
        canPreviousPage: mainCanPreviousPage,
        canNextPage: mainCanNextPage,
        pageOptions: mainPageOptions,
        pageCount: mainPageCount,
        gotoPage: mainGotoPage,
        nextPage: mainNextPage,
        previousPage: mainPreviousPage,
        setPageSize: mainSetPageSize,
        state: mainState,
        setGlobalFilter: mainSetGlobalFilter
    } = useTable(
        {
            columns: baseColumns,
            data: mainTableData,
            initialState: { pageIndex: 0, pageSize: 10 },
            defaultSortBy: [{ id: "state", desc: false }],
            disableSortRemove: false,
            autoResetSortBy: false,
            disableMultiSort: true,
            getRowId: (row, index) => `${row.state}-${row.county}-${row.fips}-${index}`,
            sortTypes: {
                emptyBottomNumeric: (rowA, rowB, columnId) => {
                    const aValue = rowA.values[columnId];
                    const bValue = rowB.values[columnId];
                    const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
                    const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
                    return aNum - bNum;
                },
                emptyBottomText: (rowA, rowB, columnId) => {
                    const aValue = rowA.values[columnId];
                    const bValue = rowB.values[columnId];
                    const aStr = aValue ? String(aValue).toLowerCase() : "";
                    const bStr = bValue ? String(bValue).toLowerCase() : "";
                    return aStr.localeCompare(bStr);
                }
            }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const pageIndex = mainState.pageIndex;
    const pageSize = mainState.pageSize;
    const globalFilter = mainState.globalFilter;
    const csvData = useMemo(() => {
        if (!data || !baseColumns) return [];
        return data.map((row) => {
            const csvRow = {};
            baseColumns.forEach((column) => {
                const accessor = column.accessor as string;
                const isPaymentRate = accessor.includes("paymentRate") || column.Header?.toString().includes("Rate");
                let value;
                if (accessor.includes(".")) {
                    try {
                        const keys = accessor.split(".");
                        let obj = row as any;
                        for (let i = 0; i < keys.length; i += 1) {
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
                    csvRow[column.Header] = value ? Number(value).toFixed(2) : "0.00";
                } else if (column.Header?.toString().includes("Base Acres")) {
                    csvRow[column.Header] =
                        typeof value === "number"
                            ? Number(value).toLocaleString("en-US", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2
                              })
                            : value;
                } else if (typeof value === "number") {
                    csvRow[column.Header] = formatCurrency(value);
                } else {
                    csvRow[column.Header] = value;
                }
            });
            return csvRow;
        });
    }, [data, baseColumns]);
    return (
        <Styles id="county-commodity-table">
            {isTableLoading && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1500,
                        backdropFilter: "blur(2px)"
                    }}
                >
                    <Fade in={isTableLoading} timeout={300}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                p: 3,
                                backgroundColor: "white",
                                borderRadius: 2,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                        >
                            <CircularProgress size={40} thickness={4} sx={{ color: "rgba(47, 113, 100, 1)" }} />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "rgba(47, 113, 100, 1)",
                                    fontWeight: 500
                                }}
                            >
                                Processing table data...
                            </Typography>
                        </Box>
                    </Fade>
                </Box>
            )}
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
                                    /(Years\s+(?:\d+,\s+)+\d+\s+\(Aggregated\)|Year\s+\d+(?:-\d+)?(?:\s+\(Aggregated\))?|Years\s+\d+(?:-\d+)?(?:\s+\(Aggregated\))?|All\s+Commodities|\d+\s+Selected\s+Commodities|(?:Seed Cotton|Corn|Peanuts|Soybeans|Wheat|Sorghum|Barley|Oats|Rice|Sunflowers)|All\s+Programs|\d+\s+Selected\s+Programs|Current\s+Policy|Proposed\s+Policy|Policy\s+Difference\s+Analysis)/g,
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
                        {mainState.sortBy &&
                            mainState.sortBy.length > 0 &&
                            !mainState.sortBy[0].desc &&
                            (mainState.sortBy[0].id === "current" ||
                                mainState.sortBy[0].id === "paymentRate" ||
                                mainState.sortBy[0].id === "weightedAverageRate" ||
                                mainState.sortBy[0].id === "aggregatedPayment" ||
                                mainState.sortBy[0].id === "baseAcres" ||
                                mainState.sortBy[0].id.includes("Payment") ||
                                mainState.sortBy[0].id.includes("Rate")) &&
                            (() => {
                                const sortBy = mainState.sortBy[0].id;
                                let firstNonEmptyIndex = -1;
                                for (let i = 0; i < mainRows.length; i += 1) {
                                    const value = mainRows[i].values[sortBy];
                                    if (value !== undefined && value !== null && value !== "" && value !== 0) {
                                        firstNonEmptyIndex = i;
                                        break;
                                    }
                                }
                                if (firstNonEmptyIndex === -1) return null;
                                const targetPage = Math.floor(firstNonEmptyIndex / pageSize) + 1;
                                return (
                                    <Box
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            backgroundColor: "rgba(255, 193, 7, 0.1)",
                                            borderRadius: "6px",
                                            border: "1px solid rgba(255, 193, 7, 0.3)"
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "rgba(255, 143, 0, 0.9)", lineHeight: 1.5, mb: 1 }}
                                        >
                                            💡 <strong>Tip:</strong> You&apos;re sorting by ascending order. Counties
                                            with no values appear first. Counties with actual values start on{" "}
                                            <strong>page {targetPage}</strong>.
                                        </Typography>
                                        {targetPage !== pageIndex + 1 && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => mainGotoPage(targetPage - 1)}
                                                sx={{
                                                    "borderColor": "rgba(255, 143, 0, 0.5)",
                                                    "color": "rgba(255, 143, 0, 0.9)",
                                                    "&:hover": {
                                                        borderColor: "rgba(255, 143, 0, 0.8)",
                                                        backgroundColor: "rgba(255, 143, 0, 0.1)"
                                                    }
                                                }}
                                            >
                                                Jump to page {targetPage}
                                            </Button>
                                        )}
                                    </Box>
                                );
                            })()}
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
                                onChange={(e) => mainSetGlobalFilter(e.target.value)}
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
                    <table {...getMainTableProps()}>
                        <thead>
                            {mainHeaderGroups.map((headerGroup, hgIndex) => (
                                <tr
                                    {...headerGroup.getHeaderGroupProps()}
                                    key={`header-group-${headerGroup.id || hgIndex}`}
                                >
                                    {headerGroup.headers
                                        .filter((_, index) => visibleColumnIndices.includes(index))
                                        .map((column, colIndex) => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                style={{
                                                    background: "rgba(47, 113, 100, 0.08)",
                                                    color: "#2F7164",
                                                    padding: "10px",
                                                    cursor: "pointer"
                                                }}
                                                key={`column-${column.id || colIndex}`}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {column.render("Header")}
                                                    <span style={{ marginLeft: "5px" }}>
                                                        {(() => {
                                                            if (column.isSorted) {
                                                                if (column.isSortedDesc) {
                                                                    return <span>↓</span>;
                                                                }
                                                                return <span>↑</span>;
                                                            }
                                                            return (
                                                                <SwapVertIcon sx={{ fontSize: "16px", opacity: 0.5 }} />
                                                            );
                                                        })()}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getMainTableBodyProps()}>
                            {mainPage.map((row, rowIndex) => {
                                prepareMainRow(row);
                                return (
                                    <tr {...row.getRowProps()} key={row.id || `row-${rowIndex}`}>
                                        {row.cells
                                            .filter((_, index) => visibleColumnIndices.includes(index))
                                            .map((cell, cellIndex) => {
                                                return (
                                                    <td
                                                        {...cell.getCellProps()}
                                                        key={`cell-${cell.column.id || cellIndex}`}
                                                    >
                                                        {formatCellValue(
                                                            cell,
                                                            typeof cell.column.accessor === "string" &&
                                                                cell.column.accessor.includes("."),
                                                            typeof cell.column.accessor === "string" &&
                                                                cell.column.accessor.includes("paymentRate"),
                                                            cell.column.Header?.toString().includes("Rate"),
                                                            cell.column.Header?.toString().includes("Base Acres"),
                                                            cell.column.Header?.toString().includes("Payment") ||
                                                                cell.column.Header?.toString().includes("Total") ||
                                                                cell.column.Header?.toString().includes("Difference"),
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
                    <Button onClick={() => mainGotoPage(0)} disabled={!mainCanPreviousPage} sx={{ mr: 1 }}>
                        {"<<"}
                    </Button>
                    <Button onClick={() => mainPreviousPage()} disabled={!mainCanPreviousPage} sx={{ mr: 1 }}>
                        {"<"}
                    </Button>
                    <Button onClick={() => mainNextPage()} disabled={!mainCanNextPage} sx={{ mr: 1 }}>
                        {">"}
                    </Button>
                    <Button onClick={() => mainGotoPage(mainPageCount - 1)} disabled={!mainCanNextPage} sx={{ mr: 1 }}>
                        {">>"}
                    </Button>
                    <span style={{ paddingLeft: 8 }}>
                        Page{" "}
                        <strong style={{ padding: 8 }}>
                            {pageIndex + 1} of {mainPageCount}
                        </strong>
                    </span>
                </Box>
                <Box>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            mainSetPageSize(Number(e.target.value));
                        }}
                        style={{ padding: "4px" }}
                    >
                        {[10, 20, 30, 40, 50].map((pageSizeOption) => (
                            <option key={pageSizeOption} value={pageSizeOption}>
                                Show {pageSizeOption}
                            </option>
                        ))}
                    </select>
                </Box>
            </Box>
        </Styles>
    );
};
export default CountyCommodityTable;
