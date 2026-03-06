import React from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Grid, TableContainer, Typography, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { compareWithNumber, compareWithAlphabetic, compareWithDollarSign } from "../shared/TableCompareFunctions";
import "../../styles/table.css";
import { formatCurrency } from "../shared/ConvertionFormats";
import getCSVData from "../shared/getCSVData";

interface CropInsuranceCountyTableProps {
    tableTitle: string;
    attributes: string[];
    stateCodes: Record<string, string>;
    countyData: any;
    year: string;
    skipColumns: string[];
    selectedState: string;
    onStateChange: (state: string) => void;
}

function CropInsuranceCountyTable({
    tableTitle,
    attributes,
    stateCodes,
    countyData,
    year,
    skipColumns,
    selectedState,
    onStateChange
}: CropInsuranceCountyTableProps): JSX.Element {
    const countyRows = React.useMemo(() => {
        if (!countyData || !countyData[year]) {
            return [];
        }
        if (selectedState === "All States") {
            return countyData[year];
        }
        return countyData[year].filter((county: any) => {
            const stateName = stateCodes[county.state] || county.state;
            return stateName === selectedState;
        });
    }, [countyData, year, selectedState, stateCodes]);

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
                const stateName = stateCodes[county.state] || county.state;
                const newRecord: any = {
                    state: stateName,
                    county: county.countyName
                };

                attributes.forEach((attribute) => {
                    const attributeData = county[attribute];
                    if (attribute === "lossRatio") {
                        const ratioValue = Number(attributeData);
                        newRecord[attribute] = Number.isFinite(ratioValue)
                            ? ratioValue.toLocaleString(undefined, { maximumFractionDigits: 3 })
                            : "0";
                    } else if (
                        attribute === "averageInsuredAreaInAcres" ||
                        attribute === "totalPoliciesEarningPremium"
                    ) {
                        newRecord[attribute] = formatCurrency(attributeData, 0);
                    } else {
                        newRecord[attribute] = formatCurrency(attributeData, 0);
                    }
                });

                return newRecord;
            }),
        [countyRows, attributes, stateCodes]
    );

    const columns = React.useMemo(() => {
        const columnPrep: any[] = [];
        columnPrep.push({ Header: "STATE", accessor: "state", sortType: compareWithAlphabetic });
        columnPrep.push({ Header: "COUNTY", accessor: "county", sortType: compareWithAlphabetic });
        attributes.forEach((attribute) => {
            let sortMethod = compareWithDollarSign;
            if (attribute === "lossRatio") sortMethod = compareWithNumber;
            if (attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium") {
                sortMethod = compareWithNumber;
            }
            columnPrep.push({
                Header: attribute
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .split(" ")
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                    .toUpperCase(),
                accessor: attribute,
                sortType: sortMethod
            });
        });
        return columnPrep;
    }, [attributes]);

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

            td[class$="cell0"] {
                padding-right: 2em;
            }

            td[class$="cell1"] {
                padding-right: 2em;
            }

            td[class$="cell2"],
            td[class$="cell3"],
            td[class$="cell4"],
            td[class$="cell5"],
            td[class$="cell6"] {
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
                        <Box id="cropInsuranceCountyTableHeader" sx={{ width: "100%" }}>
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
                                Comparing {tableTitle}
                            </Typography>
                            {attributes.includes("averageInsuredAreaInAcres") ? (
                                <Box display="flex" justifyContent="start">
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#AAA" }}>
                                        (Average acres includes acres insured by Pasture, Rangeland, and Forage (PRF)
                                        policies)
                                    </Typography>
                                </Box>
                            ) : null}
                        </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="state-filter-label">Filter by State</InputLabel>
                            <Select
                                labelId="state-filter-label"
                                id="state-filter"
                                value={selectedState}
                                label="Filter by State"
                                onChange={(e) => onStateChange(e.target.value)}
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
                        columns={columns.filter((column: any) => !skipColumns.includes(column.accessor))}
                        data={resultData}
                        initialState={{
                            pageSize: 10,
                            pageIndex: 0
                        }}
                        tableTitle={`Comparing ${tableTitle}`}
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
                                    {...column.getHeaderProps({
                                        style: {
                                            paddingLeft: column.paddingLeft,
                                            paddingRight: column.paddingRight
                                        }
                                    })}
                                >
                                    {column.render("Header")}
                                    <span>
                                        {(() => {
                                            if (!column.isSorted)
                                                return (
                                                    <Box sx={{ ml: 1, display: "inline" }}>
                                                        <SwapVertIcon />
                                                    </Box>
                                                );
                                            if (column.isSortedDesc)
                                                return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>;
                                            return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>;
                                        })()}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr key={row.id} {...row.getRowProps()}>
                                {row.cells.map((cell, j) => {
                                    return (
                                        <td
                                            className={`cell${j}`}
                                            key={cell.id}
                                            {...cell.getCellProps()}
                                            style={{ width: "100%", whiteSpace: "nowrap" }}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    );
                                })}
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
                            onChange={(e) => {
                                let p = e.target.value ? Number(e.target.value) - 1 : 0;
                                if (p > pageOptions.length) p = pageOptions.length - 1;
                                if (p < 0) p = 0;
                                gotoPage(p);
                            }}
                            style={{ width: "3em" }}
                        />{" "}
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 25, 50, 100].map((p) => (
                            <option key={p} value={p}>
                                Show {p}
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    {pageSize * (pageIndex + 1) <= rows.length ? (
                        <Typography>
                            Showing the first {parseInt(pageSize, 10) * (pageIndex + 1)} results of {rows.length} rows
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

export default CropInsuranceCountyTable;
