import React, { useMemo, useState, useEffect } from "react";
import { Box, Typography, Grid, TableContainer, Button } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import getCSVData from "../shared/getCSVData";
import countyFipsMapping from "../../files/maps/fips_county_mapping.json";

interface YearBreakdownData {
    current?: string | number;
    proposed?: string | number;
    difference?: string | number;
    total?: string | number;
}

interface CountyObject {
    state: string;
    county: string;
    fips: string;
    yearBreakdown?: { [year: string]: YearBreakdownData };
    [key: string]: string | number | { [year: string]: YearBreakdownData } | undefined;
}

interface ColumnDef {
    Header: string;
    accessor: string;
    sortType?: (a: any, b: any) => number;
}

const compareWithDollarSign = (a: any, b: any) => {
    if (typeof a === "string" && typeof b === "string") {
        const numA = parseFloat(a.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(b.replace(/[^0-9.-]+/g, ""));
        return numA - numB;
    }
    return 0;
};

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
        if (!isAggregatedYear) return [selectedYear];

        const [startYear, endYear] = selectedYear.split("-").map((y) => parseInt(y.trim(), 10));
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
            years.push(year.toString());
        }
        return years;
    }, [selectedYear, isAggregatedYear]);

    const getTableTitle = useMemo(() => {
        const yearPart = isAggregatedYear ? `Years ${selectedYear} (Aggregated)` : `Year ${selectedYear}`;

        let commodityPart = "";
        if (selectedCommodities.includes("All Commodities")) {
            commodityPart = "All Commodities";
        } else if (selectedCommodities.length === 1) {
            commodityPart = selectedCommodities[0];
        } else if (selectedCommodities.length > 1) {
            commodityPart = `${selectedCommodities.length} Selected Commodities`;
        }

        let programPart = "";
        if (selectedPrograms.includes("All Programs")) {
            programPart = "All Programs";
        } else if (selectedPrograms.length === 1) {
            programPart = selectedPrograms[0];
        } else if (selectedPrograms.length > 1) {
            programPart = `${selectedPrograms.length} Selected Programs`;
        }

        let viewPart = "";
        if (viewMode === "current") {
            viewPart = "Current Policy";
        } else if (viewMode === "proposed") {
            viewPart = "Proposed Policy";
        } else if (viewMode === "difference") {
            viewPart = "Policy Difference Analysis";
        }

        return `ARC-PLC County Payments - ${yearPart}, ${commodityPart}, ${programPart}, ${viewPart}`;
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getCsvFilename = useMemo(() => {
        const dateStr = new Date().toISOString().split("T")[0];
        const yearStr = isAggregatedYear ? selectedYear.replace("-", "to") : selectedYear;
        const commodityStr = selectedCommodities.includes("All Commodities")
            ? "all-commodities"
            : selectedCommodities.join("-").toLowerCase().replace(/\s+/g, "-");

        const programStr = selectedPrograms.includes("All Programs")
            ? "all-programs"
            : selectedPrograms.join("-").toLowerCase().replace(/\s+/g, "-");

        return `arc-plc-payments-${yearStr}-${commodityStr}-${programStr}-${viewMode}-${dateStr}.csv`;
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
                            const countyName = countyFipsMapping[county.countyFIPS] || "";
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
                                    yearBreakdown: {}
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
                                    difference: 0
                                };
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
                                            const proposedScenario = proposedCounty.scenarios.find(
                                                (s) => s.scenarioName === scenario.scenarioName
                                            );

                                            if (proposedScenario) {
                                                const proposedCommodity = proposedScenario.commodities.find(
                                                    (c) => c.commodityName === commodity.commodityName
                                                );

                                                if (proposedCommodity) {
                                                    const proposedProgram = proposedCommodity.programs.find(
                                                        (p) => p.programName === program.programName
                                                    );

                                                    if (proposedProgram) {
                                                        commodityProposedTotal +=
                                                            proposedProgram.totalPaymentInDollars || 0;
                                                    }
                                                }
                                            }
                                        }
                                    });

                                    if (countyObject.yearBreakdown) {
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
                            const countyName = countyFipsMapping[county.countyFIPS] || "";
                            const stateCountyKey = `${stateCode}-${county.countyFIPS}`;

                            let countyObject: CountyObject;
                            if (stateCountyMap.has(stateCountyKey)) {
                                countyObject = stateCountyMap.get(stateCountyKey);
                            } else {
                                countyObject = {
                                    state: stateName,
                                    county: countyName,
                                    fips: county.countyFIPS,
                                    yearBreakdown: {}
                                };
                                stateCountyMap.set(stateCountyKey, countyObject);
                                result.push(countyObject);
                            }

                            if (!countyObject.yearBreakdown) {
                                countyObject.yearBreakdown = {};
                            }

                            if (!countyObject.yearBreakdown[year]) {
                                countyObject.yearBreakdown[year] = {
                                    total: 0
                                };
                            }

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
                                    });

                                    if (countyObject.yearBreakdown) {
                                        (countyObject.yearBreakdown[year].total as number) += commodityTotal;
                                    }

                                    const commodityKey = `${commodity.commodityName}`;
                                    if (!countyObject[commodityKey]) {
                                        countyObject[commodityKey] = 0;
                                    }

                                    (countyObject[commodityKey] as number) += commodityTotal;
                                });
                            });
                        });
                    });
                }
            });

            result.forEach((county) => {
                Object.keys(county.yearBreakdown).forEach((year) => {
                    if (viewMode === "difference") {
                        county.yearBreakdown[year].current = `$${county.yearBreakdown[year].current.toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2
                            }
                        )}`;
                        county.yearBreakdown[year].proposed = `$${county.yearBreakdown[year].proposed.toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2
                            }
                        )}`;
                        county.yearBreakdown[year].difference = `$${county.yearBreakdown[
                            year
                        ].difference.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        })}`;
                    } else {
                        county.yearBreakdown[year].total = `$${county.yearBreakdown[year].total.toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2
                            }
                        )}`;
                    }
                });

                Object.keys(county).forEach((key) => {
                    if (key !== "state" && key !== "county" && key !== "fips" && key !== "yearBreakdown") {
                        if (typeof county[key] === "number") {
                            county[key] = `$${county[key].toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}`;
                        }
                    }
                });

                if (viewMode === "difference") {
                    county["Total Current"] = `$${Object.values(county.yearBreakdown)
                        .reduce((sum, yearData) => sum + parseFloat(yearData.current.replace(/[^0-9.-]+/g, "")), 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

                    county["Total Proposed"] = `$${Object.values(county.yearBreakdown)
                        .reduce((sum, yearData) => sum + parseFloat(yearData.proposed.replace(/[^0-9.-]+/g, "")), 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

                    county["Total Difference"] = `$${Object.values(county.yearBreakdown)
                        .reduce((sum, yearData) => sum + parseFloat(yearData.difference.replace(/[^0-9.-]+/g, "")), 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                } else {
                    county.Total = `$${Object.values(county.yearBreakdown)
                        .reduce((sum, yearData) => sum + parseFloat(yearData.total.replace(/[^0-9.-]+/g, "")), 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                }
            });

            return result;
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
                    const countyName = countyFipsMapping[county.countyFIPS] || "";

                    const countyObject: CountyObject = {
                        state: stateName,
                        county: countyName,
                        fips: county.countyFIPS
                    };

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
                                    const proposedScenario = proposedCounty.scenarios.find(
                                        (s) => s.scenarioName === scenario.scenarioName
                                    );

                                    if (proposedScenario) {
                                        const proposedCommodity = proposedScenario.commodities.find(
                                            (c) => c.commodityName === commodity.commodityName
                                        );

                                        if (proposedCommodity) {
                                            const proposedProgram = proposedCommodity.programs.find(
                                                (p) => p.programName === program.programName
                                            );

                                            if (proposedProgram) {
                                                commodityProposedTotal += proposedProgram.totalPaymentInDollars || 0;
                                                proposedTotal += proposedProgram.totalPaymentInDollars || 0;
                                            }
                                        }
                                    }
                                }
                            });

                            countyObject[
                                `${commodity.commodityName} Current`
                            ] = `$${commodityCurrentTotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}`;

                            countyObject[
                                `${commodity.commodityName} Proposed`
                            ] = `$${commodityProposedTotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}`;

                            countyObject[`${commodity.commodityName} Difference`] = `$${(
                                commodityProposedTotal - commodityCurrentTotal
                            ).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}`;
                        });
                    });

                    countyObject["Total Current"] = `$${currentTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;

                    countyObject["Total Proposed"] = `$${proposedTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;

                    countyObject["Total Difference"] = `$${(proposedTotal - currentTotal).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;

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
                    const countyName = countyFipsMapping[county.countyFIPS] || "";
                    const countyObject: CountyObject = {
                        state: stateName,
                        county: countyName,
                        fips: county.countyFIPS
                    };

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

                            countyObject[`${commodity.commodityName}`] = `$${commodityTotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}`;
                        });
                    });

                    countyObject.Total = `$${total.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;

                    result.push(countyObject);
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
        yearRange
    ]);

    const getColumns = React.useCallback(() => {
        const tableColumns: ColumnDef[] = [
            {
                Header: "STATE",
                accessor: "state"
            },
            {
                Header: "COUNTY",
                accessor: "county"
            },
            {
                Header: "FIPS",
                accessor: "fips"
            }
        ];

        if (isAggregatedYear) {
            if (viewMode === "difference") {
                yearRange.forEach((year) => {
                    tableColumns.push(
                        {
                            Header: `${year}: Current`,
                            accessor: `yearBreakdown.${year}.current`,
                            sortType: compareWithDollarSign
                        },
                        {
                            Header: `${year}: Proposed`,
                            accessor: `yearBreakdown.${year}.proposed`,
                            sortType: compareWithDollarSign
                        },
                        {
                            Header: `${year}: Difference`,
                            accessor: `yearBreakdown.${year}.difference`,
                            sortType: compareWithDollarSign
                        }
                    );
                });

                tableColumns.push(
                    {
                        Header: "Total Current: Payments",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Proposed: Payments",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Difference: Payments",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign
                    }
                );
            } else {
                yearRange.forEach((year) => {
                    tableColumns.push({
                        Header: `${year}: Payments`,
                        accessor: `yearBreakdown.${year}.total`,
                        sortType: compareWithDollarSign
                    });
                });

                tableColumns.push({
                    Header: "Total: Payments",
                    accessor: "Total",
                    sortType: compareWithDollarSign
                });
            }
        } else if (viewMode === "difference") {
            if (selectedCommodities.includes("All Commodities")) {
                tableColumns.push(
                    {
                        Header: "Total Current: Payments",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Proposed: Payments",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Difference: Payments",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign
                    }
                );
            } else {
                selectedCommodities.forEach((commodity) => {
                    tableColumns.push(
                        {
                            Header: `${commodity}: Current Payments`,
                            accessor: `${commodity} Current`,
                            sortType: compareWithDollarSign
                        },
                        {
                            Header: `${commodity}: Proposed Payments`,
                            accessor: `${commodity} Proposed`,
                            sortType: compareWithDollarSign
                        },
                        {
                            Header: `${commodity}: Difference`,
                            accessor: `${commodity} Difference`,
                            sortType: compareWithDollarSign
                        }
                    );
                });

                tableColumns.push(
                    {
                        Header: "Total Current: Payments",
                        accessor: "Total Current",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Proposed: Payments",
                        accessor: "Total Proposed",
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: "Total Difference: Payments",
                        accessor: "Total Difference",
                        sortType: compareWithDollarSign
                    }
                );
            }
        } else {
            const paymentsLabel = viewMode === "current" ? "Current Payments" : "Proposed Payments";

            if (selectedCommodities.includes("All Commodities")) {
                tableColumns.push({
                    Header: `Total: ${paymentsLabel}`,
                    accessor: "Total",
                    sortType: compareWithDollarSign
                });
            } else {
                selectedCommodities.forEach((commodity) => {
                    tableColumns.push({
                        Header: `${commodity}: ${paymentsLabel}`,
                        accessor: commodity,
                        sortType: compareWithDollarSign
                    });
                });

                tableColumns.push({
                    Header: `Total: ${paymentsLabel}`,
                    accessor: "Total",
                    sortType: compareWithDollarSign
                });
            }
        }

        return tableColumns;
    }, [viewMode, selectedCommodities, isAggregatedYear, yearRange]);

    const columns = React.useMemo(() => getColumns(), [getColumns]);
    const data = React.useMemo(() => getTableData(), [getTableData]);
    const tableTitle = getTableTitle;
    const csvFilename = getCsvFilename;

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
            initialState: { pageSize: 10 }
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
                        </div>
                    ) : (
                        <p>Loading data...</p>
                    )}
                </TableContainer>
            </Styles>
        </Box>
    );
};

export default CountyCommodityTable;
