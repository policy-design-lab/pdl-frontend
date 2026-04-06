import React from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { usePagination, useSortBy, useTable } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TableContainer, Typography } from "@mui/material";
import {
    compareWithAlphabetic,
    compareWithDollarSign,
    compareWithNumber,
    compareWithPercentSign
} from "../shared/TableCompareFunctions";
import { formatCurrency, formatNumericValue } from "../shared/ConvertionFormats";
import getCSVData from "../shared/getCSVData";
import "../../styles/table.css";
import {
    formatTitle1Percent,
    getTitle1CountyScopedRecord,
    Title1CountyColumnConfig,
    Title1CountySelector
} from "./title1County";

interface Title1CountyTableProps {
    tableTitle: string;
    selector: Title1CountySelector;
    columnsConfig: Title1CountyColumnConfig[];
    stateCodes: Record<string, string>;
    countyData: any;
    year: string;
    selectedState: string;
    onStateChange: (state: string) => void;
}

const Styles = styled.div`
    padding: 0;
    margin: 0;

    table {
        border-spacing: 0;
        border: 1px solid #e4ebe7;
        border-left: none;
        border-right: none;
        width: 100%;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th {
            background-color: rgba(241, 241, 241, 1);
            padding: 1em 2em;
            cursor: pointer;
            text-align: left;
        }

        th:not(:first-of-type):not(:nth-of-type(2)) {
            text-align: right;
        }

        td[class$="cell0"],
        td[class$="cell1"] {
            padding-right: 2em;
        }

        td[class^="cell"]:not(.cell0):not(.cell1) {
            text-align: right;
        }

        td {
            padding: 1em 2em;
            border-bottom: 1px solid #e4ebe7;
            border-right: none;

            :last-child {
                border-right: 0;
            }
        }
    }

    .pagination {
        margin-top: 1.5em;
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

    @media screen and (max-width: 1024px) {
        th,
        td {
            padding: 8px;
        }

        td[class$="cell0"],
        td[class$="cell1"] {
            padding-right: 1em;
        }

        .pagination {
            margin-top: 8px;
        }
    }
`;

const formatTableValue = (value: number, type: Title1CountyColumnConfig["type"]): string => {
    if (type === "currency") {
        return formatCurrency(value, 0);
    }
    if (type === "percent") {
        return formatTitle1Percent(value);
    }
    return formatNumericValue(value, 0);
};

const getSortType = (type: Title1CountyColumnConfig["type"]) => {
    if (type === "currency") {
        return compareWithDollarSign;
    }
    if (type === "percent") {
        return compareWithPercentSign;
    }
    return compareWithNumber;
};

function Title1CountyTable({
    tableTitle,
    selector,
    columnsConfig,
    stateCodes,
    countyData,
    year,
    selectedState,
    onStateChange
}: Title1CountyTableProps): JSX.Element {
    const countyRows = React.useMemo(() => {
        if (!countyData || !countyData[year]) {
            return [];
        }
        return countyData[year].filter((county: any) => {
            const stateName = stateCodes[county.state] || county.state;
            if (selectedState !== "All States" && stateName !== selectedState) {
                return false;
            }
            return getTitle1CountyScopedRecord(county, selector) !== null;
        });
    }, [countyData, year, selectedState, selector, stateCodes]);

    const availableStates = React.useMemo(() => {
        const states = new Set<string>();
        if (countyData && countyData[year]) {
            countyData[year].forEach((county: any) => {
                if (county.state && stateCodes[county.state]) {
                    states.add(stateCodes[county.state]);
                }
            });
        }
        return Array.from(states).sort();
    }, [countyData, year, stateCodes]);

    const resultData = React.useMemo(
        () =>
            countyRows.map((county: any) => {
                const scopedRecord = getTitle1CountyScopedRecord(county, selector);
                const stateName = stateCodes[county.state] || county.state;
                const newRecord: Record<string, string> = {
                    state: stateName,
                    county: county.countyName
                };
                columnsConfig.forEach((column) => {
                    const value = Number(scopedRecord?.[column.accessor]);
                    newRecord[column.accessor] = Number.isFinite(value) ? formatTableValue(value, column.type) : "";
                });
                return newRecord;
            }),
        [columnsConfig, countyRows, selector, stateCodes]
    );

    const columns = React.useMemo(() => {
        const preparedColumns: any[] = [
            { Header: "STATE", accessor: "state", sortType: compareWithAlphabetic },
            { Header: "COUNTY", accessor: "county", sortType: compareWithAlphabetic }
        ];
        columnsConfig.forEach((column) => {
            preparedColumns.push({
                Header: column.header,
                accessor: column.accessor,
                sortType: getSortType(column.type)
            });
        });
        return preparedColumns;
    }, [columnsConfig]);

    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles>
                <Grid
                    container
                    columns={{ xs: 12 }}
                    className="stateChartTableContainer"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                    }}
                >
                    <Grid item xs={8} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                        <Box sx={{ width: "100%" }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121",
                                    paddingTop: 0.6
                                }}
                            >
                                {tableTitle}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="title1-county-state-filter-label">Filter by State</InputLabel>
                            <Select
                                labelId="title1-county-state-filter-label"
                                id="title1-county-state-filter"
                                value={selectedState}
                                label="Filter by State"
                                onChange={(event) => onStateChange(event.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 240
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="All States">All States</MenuItem>
                                {availableStates.map((state) => (
                                    <MenuItem key={state} value={state}>
                                        {state}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    <Table
                        columns={columns}
                        data={resultData}
                        initialState={{ pageSize: 10, pageIndex: 0 }}
                        tableTitle={tableTitle}
                    />
                </TableContainer>
            </Styles>
        </Box>
    );
}

function Table({
    columns,
    data,
    initialState,
    tableTitle
}: {
    columns: any;
    data: any;
    initialState: any;
    tableTitle: string;
}) {
    const state = React.useMemo(() => initialState, []);
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
        state: { pageIndex, pageSize }
    } = useTable(
        {
            columns,
            data,
            state
        },
        useSortBy,
        usePagination
    );
    const fileName = `${tableTitle.replace(/\s+/g, "-").toLowerCase()}-data.csv`;

    return (
        <div style={{ width: "100%" }}>
            {data && data.length > 0 && (
                <CSVLink className="downloadbtn" filename={fileName} data={getCSVData(headerGroups, data)}>
                    Export This Table to CSV
                </CSVLink>
            )}
            <table {...getTableProps()} style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    className={column.render("Header").replace(/\s/g, "")}
                                    key={column.id}
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                >
                                    {column.render("Header")}
                                    <span>
                                        {!column.isSorted ? (
                                            <Box sx={{ ml: 1, display: "inline" }}>
                                                <SwapVertIcon />
                                            </Box>
                                        ) : column.isSortedDesc ? (
                                            <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>
                                        ) : (
                                            <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>
                                        )}
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
                            <tr key={row.id} {...row.getRowProps()}>
                                {row.cells.map((cell, columnIndex) => (
                                    <td
                                        className={`cell${columnIndex}`}
                                        key={cell.id}
                                        {...cell.getCellProps()}
                                        style={{ width: "100%", whiteSpace: "nowrap" }}
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Box className="pagination" sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <Box>
                    <button type="button" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                        {"<<"}
                    </button>{" "}
                    <button type="button" onClick={() => previousPage()} disabled={!canPreviousPage}>
                        {"<"}
                    </button>{" "}
                    <button type="button" onClick={() => nextPage()} disabled={!canNextPage}>
                        {">"}
                    </button>{" "}
                    <button type="button" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                        {">>"}
                    </button>{" "}
                    <span>
                        Page{" "}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{" "}
                    </span>
                    <span>
                        | Go to page:{" "}
                        <input
                            type="number"
                            defaultValue={pageIndex + 1}
                            onChange={(event) => {
                                let nextPageIndex = event.target.value ? Number(event.target.value) - 1 : 0;
                                if (nextPageIndex > pageOptions.length) {
                                    nextPageIndex = pageOptions.length - 1;
                                }
                                if (nextPageIndex < 0) {
                                    nextPageIndex = 0;
                                }
                                gotoPage(nextPageIndex);
                            }}
                            style={{ width: "3em" }}
                        />{" "}
                    </span>
                    <select
                        value={pageSize}
                        onChange={(event) => {
                            setPageSize(Number(event.target.value));
                        }}
                    >
                        {[10, 25, 50, 100].map((pageCountValue) => (
                            <option key={pageCountValue} value={pageCountValue}>
                                Show {pageCountValue}
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    {pageSize * (pageIndex + 1) <= rows.length ? (
                        <Typography>
                            Showing the first {pageSize * (pageIndex + 1)} results of {rows.length} rows
                        </Typography>
                    ) : (
                        <Typography>
                            Showing the first {rows.length} results of {rows.length} rows
                        </Typography>
                    )}
                </Box>
            </Box>
        </div>
    );
}

export default Title1CountyTable;
