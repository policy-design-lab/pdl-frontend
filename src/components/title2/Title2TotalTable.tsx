import React from "react";
import styled from "styled-components";
import { useTable, useSortBy, usePagination } from "react-table";
import Box from "@mui/material/Box";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import "../../styles/table.css";
import { Typography, Grid, TableContainer } from "@mui/material";
import { compareWithDollarSign } from "../shared/TableCompareFunctions";
import { formatCurrency } from "../shared/ConvertionFormats";

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

        .pagination {
            margin-top: 1.5em;
        }
    }
`;

function Table({ columns, data }: { columns: any; data: any }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
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
        rows
    } = useTable(
        {
            columns,
            data,
            initialState: { pageSize: 10 }
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
                                <th
                                    key={column.id}
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    {...column.getHeaderProps({
                                        style: {
                                            paddingLeft: column.paddingLeft,
                                            paddingRight: column.paddingRight
                                        }
                                    })}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: column.align === "right" ? "flex-end" : "flex-start"
                                        }}
                                    >
                                        {column.render("Header")}
                                        <div>
                                            {/* eslint-disable-next-line no-nested-ternary */}
                                            {!column.isSorted ? (
                                                <Box sx={{ ml: 1 }}>
                                                    <SwapVertIcon />
                                                </Box>
                                            ) : column.isSortedDesc ? (
                                                <Box sx={{ ml: 1 }}>▼</Box>
                                            ) : (
                                                <Box sx={{ ml: 1 }}>▲</Box>
                                            )}
                                        </div>
                                    </Box>
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
                                {row.cells.map((cell, j) => (
                                    <td
                                        key={cell.id}
                                        {...cell.getCellProps()}
                                        className={`cell${j}`}
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
                            onChange={(e) => {
                                let p = e.target.value ? Number(e.target.value) - 1 : 0;
                                if (p > pageOptions.length) p = pageOptions.length - 1;
                                if (p < 0) p = 0;
                                gotoPage(p);
                            }}
                            style={{ width: "3em" }}
                        />
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 25, 40, 50].map((p) => (
                            <option key={p} value={p}>
                                Show {p}
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

function Title2TotalTable({
    TableTitle,
    statePerformance,
    year,
    stateCodes
}: {
    TableTitle: string;
    statePerformance: any;
    year: any;
    stateCodes: any;
}): JSX.Element {
    const rcppTableData: any[] = [];

    statePerformance[year].forEach((value) => {
        const totalRcpp = value;
        let stateName;
        stateCodes.forEach((sValue) => {
            if (sValue.code.toUpperCase() === value.state.toUpperCase()) {
                stateName = sValue.name;
            }
        });
        rcppTableData.push({
            state: stateName,
            rcppBenefit: formatCurrency(totalRcpp.totalPaymentInDollars, { minimumFractionDigits: 0 })
        });
    });

    const columns = React.useMemo(
        () => [
            {
                Header: "STATE",
                accessor: "state",
                sortType: "alphanumeric"
            },
            {
                Header: "TOTAL TITLE II BENEFITS",
                accessor: "rcppBenefit",
                align: "right",
                sortType: compareWithDollarSign,
                Cell: ({ value }: any) => <div style={{ textAlign: "right" }}>{value}</div>
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
                    sx={{ display: "flex", justifyContent: "space-between" }}
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
                    <Table columns={columns} data={rcppTableData} />
                </TableContainer>
            </Styles>
        </Box>
    );
}

export default Title2TotalTable;
