/**
 * Based on landing page map data (before api revision), create corresponding table
 */
import { Grid, TableContainer, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Box from "@mui/material/Box";
import { compareWithAlphabetic, compareWithDollarSign } from "./TableCompareFunctions";
import "../../styles/table.css";

/**
 * SummaryKey: "Title I Total", "SNAP Total", etc
 */
export default function LandingPageTable({
    TableTitle,
    TableData,
    stateCodes,
    SummaryKey
}: {
    TableTitle: string;
    TableData: any;
    stateCodes: any;
    SummaryKey: string;
}): JSX.Element {
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
                padding: 1em 3em;
                cursor: pointer;
                text-align: left;
            }

            th:not(:first-of-type) {
                text-align: right;
            }

            td[class$="cell0"] {
                padding-right: 10em;
            }

            td[class$="cell1"],
            td[class$="cell2"],
            td[class$="cell3"],
            td[class$="cell4"] {
                text-align: right;
            }

            td {
                padding: 1em 3em;
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

        @media screen and (max-width: 1024px) {
            th,
            td {
                padding: 8px;
            }
            td[class$="cell0"] {
                padding-right: 1em;
            }
            .pagination {
                margin-top: 8px;
            }
        }
    `;
    const resultData = [];
    TableData.sort((a, b) => b[SummaryKey] - a[SummaryKey]);
    // eslint-disable-next-line no-restricted-syntax
    TableData.forEach((d) => {
        if (d.State.length === 2) {
            const newRecord = () => {
                return {
                    state: stateCodes[d.State],
                    totalPaymentInDollars: `$${d[SummaryKey].toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }).toString()}`
                };
            };
            resultData.push(newRecord());
        }
    });
    const columns = React.useMemo(
        () => [
            {
                Header: "STATE",
                accessor: "state",
                sortType: compareWithAlphabetic
            },
            {
                Header: "TOTAL BENEFITS IN DOLLARS",
                accessor: "totalPaymentInDollars",
                sortType: compareWithDollarSign
            }
        ],
        []
    );
    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles>
                <Grid
                    container
                    columns={{ xs: 12 }}
                    className="stateChartTableContainer"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <Grid item xs={12} justifyContent="center" alignItems="center" sx={{ display: "flex" }}>
                        <Box id="LandingPageTableHeader" sx={{ width: "100%" }}>
                            <Typography
                                id="LandingPageBarHeader"
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121",
                                    marginBottom: 4,
                                    paddingTop: 0.6
                                }}
                            >
                                {TableTitle}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    <Table
                        columns={columns}
                        data={resultData}
                        initialState={{
                            pageSize: 5,
                            pageIndex: 0
                        }}
                    />
                </TableContainer>
            </Styles>
        </Box>
    );
}
// eslint-disable-next-line
function Table({ columns, data, initialState }: { columns: any; data: any; initialState: any }) {
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
    return (
        <div style={{ width: "100%" }}>
            <table {...getTableProps()} style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                // Add the sorting props to control sorting.
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
                    {
                        // eslint-disable-next-line
                        page.map((row, i) => {
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
                        })
                    }
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
                        {[10, 25, 40, 51].map((p) => (
                            <option key={p} value={p}>
                                Show {p}
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    {" "}
                    {pageSize * (pageIndex + 1) <= rows.length ? (
                        <Typography>
                            Showing the first {parseInt(pageSize, 10) * (pageIndex + 1)} results of {rows.length} rows
                        </Typography>
                    ) : (
                        <Typography>
                            Showing the first {rows.length} results of {rows.length}rows
                        </Typography>
                    )}
                </Box>
            </Box>
        </div>
    );
}
