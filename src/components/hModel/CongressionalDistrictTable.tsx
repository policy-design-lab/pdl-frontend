import React, { useMemo, useState } from "react";
import { Box, Typography, Grid, TableContainer, Button, CircularProgress, Fade } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MapIcon from "@mui/icons-material/Map";
import { formatCurrency, generateTableTitle, generateCsvFilename, formatCellValue } from "./utils";

interface DistrictObject {
    state: string;
    district: string;
    districtId: string;
    yearBreakdown?: { [year: string]: any };
    baseAcres: number;
    current: number;
    proposed: number;
    difference: number;
    commodityBreakdown?: { [commodity: string]: any };
    programBreakdown?: { [program: string]: any };
    paymentRate?: number;
    weightedAverageRate?: number;
    aggregatedPayment?: number;
    currentBaseAcres?: number | string;
    proposedBaseAcres?: number | string;
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

interface CongressionalDistrictTableProps {
    districtData: Record<string, any>;
    districtDataProposed: Record<string, any>;
    selectedYear: string | string[];
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    selectedState: string;
    stateCodesData: Record<string, string>;
    showMeanValues: boolean;
    yearAggregation: number;
    aggregationEnabled: boolean;
}

const CongressionalDistrictTable: React.FC<CongressionalDistrictTableProps> = ({
    districtData,
    districtDataProposed,
    selectedYear,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    stateCodesData,
    showMeanValues,
    yearAggregation,
    aggregationEnabled
}) => {
    const [isTableLoading] = useState(false);

    const handleScrollToMap = () => {
        const mapElement =
            document.getElementById("congressional-district-map") || document.getElementById("county-commodity-map");
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
            showMeanValues
        ).replace("County Data", "Congressional District Data");
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear, showMeanValues]);

    const getCsvFilename = useMemo(() => {
        return generateCsvFilename(
            selectedYear,
            selectedCommodities,
            selectedPrograms,
            viewMode,
            isAggregatedYear
        ).replace("county", "congressional-district");
    }, [selectedYear, selectedCommodities, selectedPrograms, viewMode, isAggregatedYear]);

    const getTableData = React.useCallback(() => {
        const result: DistrictObject[] = [];
        const year = Array.isArray(selectedYear) ? selectedYear[0] : selectedYear;

        if (!districtData[year]) {
            return result;
        }

        const stateDistrictMap = new Map();
        const dataToProcess = viewMode === "proposed" ? districtDataProposed[year] : districtData[year];

        if (!dataToProcess || !Array.isArray(dataToProcess)) {
            return result;
        }

        dataToProcess.forEach((state, stateIndex) => {
            if (selectedState !== "All States" && stateCodesData[state.state] !== selectedState) {
                return;
            }

            const stateCode = state.state;
            const stateName = stateCodesData[stateCode] || stateCode;

            const districts = state.districts || state.counties || [];
            if (!Array.isArray(districts)) {
                return;
            }
            districts.forEach((district) => {
                const districtId = district.countyFIPS || district.districtId;
                const districtName =
                    district.countyName || district.districtName || `Congressional District ${districtId.slice(-2)}`;
                const stateDistrictKey = `${stateCode}-${districtId}`;

                let districtObject: DistrictObject;
                if (stateDistrictMap.has(stateDistrictKey)) {
                    districtObject = stateDistrictMap.get(stateDistrictKey)!;
                } else {
                    districtObject = {
                        state: stateName,
                        district: districtName,
                        districtId,
                        yearBreakdown: {},
                        baseAcres: 0,
                        current: 0,
                        proposed: 0,
                        difference: 0,
                        commodityBreakdown: {}
                    };
                    stateDistrictMap.set(stateDistrictKey, districtObject);
                    result.push(districtObject);
                }

                if (!districtObject.yearBreakdown) {
                    districtObject.yearBreakdown = {};
                }
                if (!districtObject.yearBreakdown[year]) {
                    districtObject.yearBreakdown[year] = {
                        current: 0,
                        proposed: 0,
                        difference: 0,
                        baseAcres: 0
                    };
                }

                let totalPayment = 0;
                let totalBaseAcres = 0;

                if (district.scenarios && Array.isArray(district.scenarios)) {
                    district.scenarios.forEach((scenario) => {
                        const scenarioName = "Current";
                        if (scenario.scenarioName && scenario.scenarioName !== scenarioName) return;

                        if (scenario.commodities && Array.isArray(scenario.commodities)) {
                            scenario.commodities.forEach((commodity) => {
                                if (
                                    !selectedCommodities.includes("All Program Crops") &&
                                    !selectedCommodities.includes(commodity.commodityName)
                                ) {
                                    return;
                                }

                                let commodityTotal = 0;
                                let commodityBaseAcres = 0;

                                if (commodity.programs && Array.isArray(commodity.programs)) {
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
                                        totalBaseAcres += program.baseAcres || 0;
                                    });
                                }

                                if (!districtObject.commodityBreakdown) {
                                    districtObject.commodityBreakdown = {};
                                }
                                if (!districtObject.commodityBreakdown[commodity.commodityName]) {
                                    districtObject.commodityBreakdown[commodity.commodityName] = {
                                        total: 0,
                                        baseAcres: 0
                                    };
                                }
                                districtObject.commodityBreakdown[commodity.commodityName].total = commodityTotal;
                                districtObject.commodityBreakdown[commodity.commodityName].baseAcres =
                                    commodityBaseAcres;
                            });
                        }
                    });
                }

                if (viewMode === "current") {
                    districtObject.current = totalPayment;
                } else {
                    districtObject.proposed = totalPayment;
                }
                districtObject.baseAcres = totalBaseAcres;

                if (districtObject.yearBreakdown && districtObject.yearBreakdown[year]) {
                    if (viewMode === "current") {
                        districtObject.yearBreakdown[year].current = totalPayment;
                    } else {
                        districtObject.yearBreakdown[year].proposed = totalPayment;
                    }
                    districtObject.yearBreakdown[year].baseAcres = totalBaseAcres;
                }

                if (showMeanValues && totalBaseAcres > 0) {
                    districtObject.paymentRate = totalPayment / totalBaseAcres;
                }
            });
        });

        return result;
    }, [
        districtData,
        districtDataProposed,
        selectedYear,
        viewMode,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        stateCodesData,
        showMeanValues
    ]);

    const data = useMemo(() => {
        const tableData = getTableData();
        return tableData.map((row) => ({
            ...row,
            __id: `${row.state}-${row.district}-${row.districtId}`
        }));
    }, [getTableData]);

    const [columnPage, setColumnPage] = useState(0);
    const columnsPerPage = 6;

    const baseColumns = useMemo(() => {
        const columns = [
            {
                Header: "District Name",
                accessor: "district",
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
                Header: "District ID",
                accessor: "districtId",
                disableSortBy: false,
                sortType: "emptyBottomText"
            }
        ];

        if (showMeanValues) {
            columns.push({
                Header: "Payment Rate",
                accessor: "paymentRate",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        } else {
            let headerText;
            if (viewMode === "difference") {
                headerText = "Total Difference";
            } else if (viewMode === "proposed") {
                headerText = "Total Payment (Proposed)";
            } else {
                headerText = "Total Payment";
            }
            columns.push({
                Header: headerText,
                accessor: "current",
                disableSortBy: false,
                sortType: "emptyBottomNumeric"
            });
        }

        columns.push({
            Header: "Base Acres",
            accessor: "baseAcres",
            disableSortBy: false,
            sortType: "emptyBottomNumeric"
        });

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

        return columns;
    }, [showMeanValues, selectedCommodities, viewMode]);

    const visibleColumnIndices = useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 3;
        const endIndex = Math.min(startIndex + columnsPerPage, baseColumns.length);
        return [0, 1, 2, ...Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex)];
    }, [columnPage, columnsPerPage, baseColumns.length]);

    const totalColumnPages = Math.ceil((baseColumns.length - 3) / columnsPerPage);

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
        state: tableState,
        setGlobalFilter
    } = useTable(
        {
            columns: baseColumns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
            defaultSortBy: [{ id: "state", desc: false }],
            disableSortRemove: false,
            autoResetSortBy: false,
            disableMultiSort: true,
            getRowId: (row, index) => `${row.state}-${row.district}-${row.districtId}-${index}`,
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

    const pageIndex = tableState.pageIndex;
    const pageSize = tableState.pageSize;
    const globalFilter = tableState.globalFilter;

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
        <Styles id="congressional-district-table">
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

                <Box sx={{ mb: 3, mt: 3 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#666",
                            fontStyle: "italic",
                            textAlign: "center",
                            backgroundColor: "rgba(47, 113, 100, 0.05)",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(47, 113, 100, 0.1)"
                        }}
                    >
                        Note: Data shows congressional districts instead of counties. District identifiers match actual
                        congressional district boundaries.
                    </Typography>
                </Box>

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
                                Search by district, state, or value:
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

            {totalColumnPages > 1 && (
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
            )}

            <div className="tableWrap">
                <TableContainer>
                    <table {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup, hgIndex) => (
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
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, rowIndex) => {
                                prepareRow(row);
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

export default CongressionalDistrictTable;
