import React, { useState } from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Grid, TableContainer, Typography, Box } from "@mui/material";
import { compareWithDollarSign, compareWithPercentSign } from "../TableCompareFunctions";
import "../../../styles/table.css";
import getCSVData from "../getCSVData";
import { getPracticeTotal } from "./PracticeMethods";

const Styles = styled.div`
    padding: 0;
    margin: 0;

    table {
        border-spacing: 0;
        border: 1px solid #e4ebe7;
        border-left: none;
        border-right: none;
        min-width: 100%;
        overflow-x: auto;

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
        td[class$="cell4"],
        td[class$="cell5"],
        td[class$="cell6"] {
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

function Table({ programName, columns, data }) {
    const [columnPage, setColumnPage] = useState(0);
    const columnsPerPage = 6;
    const visibleColumnIndices = React.useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 1;
        const endIndex = Math.min(startIndex + columnsPerPage, columns.length);
        return Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex);
    }, [columnPage, columnsPerPage, columns.length]);
    React.useEffect(() => {
        setColumnPage(0);
    }, [columns.length]);
    const totalColumnPages = Math.ceil((columns.length - 1) / columnsPerPage);
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
            initialState: { pageSize: 10 }
        },
        useSortBy,
        usePagination
    );
    const fileName = `${programName}-practice-data.csv`;
    return (
        <div>
            {data && data.length > 0 ? (
                <div style={{ width: "100%" }}>
                    <CSVLink className="downloadbtn" filename={fileName} data={getCSVData(headerGroups, data)}>
                        Export This Table to CSV
                    </CSVLink>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 2
                        }}
                    >
                        <button type="button" onClick={() => setColumnPage(0)} disabled={columnPage === 0}>
                            {"<<"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))}
                            disabled={columnPage === 0}
                        >
                            {"<"}
                        </button>
                        <span style={{ paddingLeft: 8 }}>
                            Column Page
                            <strong style={{ padding: "0px 8px" }}>
                                {columnPage + 1} of {totalColumnPages}
                            </strong>
                        </span>
                        <button
                            type="button"
                            onClick={() => setColumnPage((prev) => Math.min(totalColumnPages - 1, prev + 1))}
                            disabled={columnPage === totalColumnPages - 1}
                        >
                            {">"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setColumnPage(totalColumnPages - 1)}
                            disabled={columnPage === totalColumnPages - 1}
                        >
                            {">>"}
                        </button>
                    </Box>
                    <table {...getTableProps()} style={{ width: "100%", tableLayout: "fixed" }}>
                        <thead>
                            {headerGroups.map((headerGroup) => {
                                const headerGroupProps = headerGroup.getHeaderGroupProps();
                                return (
                                    <tr {...headerGroupProps} key={`header-${headerGroupProps.key}`}>
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
                                                            <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>
                                                        );
                                                    return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>;
                                                })()}
                                            </span>
                                        </th>
                                        {headerGroup.headers
                                            .filter((_, index) => visibleColumnIndices.includes(index))
                                            .map((column) => (
                                                <th
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    key={column.id || column.Header}
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
                                );
                            })}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row) => {
                                prepareRow(row);
                                const rowProps = row.getRowProps();
                                return (
                                    <tr {...rowProps} key={`row-${row.id}`}>
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
                                            .map((cell, cellIndex) => (
                                                <td
                                                    key={`${row.id}-${cell.column.id}`}
                                                    className={`cell${cellIndex + 1}`}
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
                    <Box
                        className="pagination"
                        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
                    >
                        <Box>
                            <button type="button" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                {"<<"}
                            </button>
                            <button type="button" onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {"<"}
                            </button>
                            <button type="button" onClick={() => nextPage()} disabled={!canNextPage}>
                                {">"}
                            </button>
                            <button type="button" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                {">>"}
                            </button>
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
                                        let p = e.target.value ? Number(e.target.value) - 1 : 0;
                                        if (p > pageOptions.length) p = pageOptions.length - 1;
                                        if (p < 0) p = 0;
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
                                {[10, 25, 40, 51].map((size) => (
                                    <option key={`size-${size}`} value={size}>
                                        Show {size}
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
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
}

function TitleIIPracticeTable({
    programName,
    statePerformance,
    year,
    stateCodes,
    selectedPractices
}: {
    programName: string;
    statePerformance: any;
    year: string;
    stateCodes: any;
    selectedPractices: string[];
}): JSX.Element {
    const getNationalTotalForPractice = React.useCallback(
        (practice: string) => {
            let total = 0;
            if (!statePerformance[year]) return total;
            statePerformance[year].forEach((state) => {
                total += getPracticeTotal(state, practice);
            });
            return total;
        },
        [statePerformance, year]
    );
    const getNationalTotal = React.useCallback(
        (practices: string[]) => {
            if (practices.includes("All Practices")) {
                let total = 0;
                statePerformance[year]?.forEach((state) => {
                    total += state.totalPaymentInDollars || 0;
                });
                return total;
            }
            let total = 0;
            practices.forEach((practice) => {
                total += getNationalTotalForPractice(practice);
            });
            return total;
        },
        [statePerformance, year, getNationalTotalForPractice]
    );

    const resultData = React.useMemo(() => {
        if (!statePerformance[year]) return [];

        return statePerformance[year].map((stateData) => {
            const stateCode = stateCodes.find((obj) => obj.code === stateData.state);
            const stateName = stateCode ? stateCode.name : stateData.state;
            const row: any = {
                state: stateName
            };
            let totalBenefits = 0;
            if (selectedPractices.includes("All Practices")) {
                totalBenefits = stateData.totalPaymentInDollars || 0;
                const nationalTotal = getNationalTotal(["All Practices"]);
                const totalPercentage = (totalBenefits / nationalTotal) * 100;
                row["Total Benefits"] = `$${totalBenefits.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                row["Percentage Nationwide"] = `${totalPercentage.toFixed(2)}%`;
            } else {
                selectedPractices.forEach((practice) => {
                    const practiceBenefits = getPracticeTotal(stateData, practice);
                    totalBenefits += practiceBenefits;
                    const practiceNationalTotal = getNationalTotalForPractice(practice);
                    const practicePercentage =
                        practiceNationalTotal > 0 ? (practiceBenefits / practiceNationalTotal) * 100 : 0;
                    const displayName = practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "");
                    row[`${displayName}: Benefits`] = `$${practiceBenefits.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;
                    row[`${displayName}: Percentage Nationwide`] = `${practicePercentage.toFixed(2)}%`;
                });
                const totalNational = getNationalTotal(selectedPractices);
                const totalPercentage = totalNational > 0 ? (totalBenefits / totalNational) * 100 : 0;
                row["Total Benefits"] = `$${totalBenefits.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                row["Percentage Nationwide"] = `${totalPercentage.toFixed(2)}%`;
            }
            return row;
        });
    }, [statePerformance, year, stateCodes, selectedPractices, getNationalTotal, getNationalTotalForPractice]);

    const columns = React.useMemo(() => {
        const cols = [
            {
                Header: "STATE",
                accessor: "state"
            }
        ];
        if (selectedPractices.includes("All Practices")) {
            cols.push(
                {
                    Header: `Total ${programName} Benefits`,
                    accessor: "Total Benefits",
                    sortType: compareWithDollarSign
                },
                {
                    Header: `${programName} Pct. Nationwide`,
                    accessor: "Percentage Nationwide",
                    sortType: compareWithPercentSign
                }
            );
        } else {
            cols.push(
                {
                    Header: "Total Benefits for Selected Practices",
                    accessor: "Total Benefits",
                    sortType: compareWithDollarSign
                },
                {
                    Header: "Pct. Nationwide for Selected Practices",
                    accessor: "Percentage Nationwide",
                    sortType: compareWithPercentSign
                }
            );
            selectedPractices.forEach((practice) => {
                const displayName = practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "");
                cols.push(
                    {
                        Header: `${displayName}: Benefits`,
                        accessor: `${displayName}: Benefits`,
                        sortType: compareWithDollarSign
                    },
                    {
                        Header: `${displayName}: Pct. Nationwide`,
                        accessor: `${displayName}: Percentage Nationwide`,
                        sortType: compareWithPercentSign
                    }
                );
            });
        }

        return cols;
    }, [selectedPractices]);

    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles>
                <Grid container columns={{ xs: 12 }} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Grid item xs={12} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                        <Box sx={{ width: "100%" }}>
                            <Typography
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
                                {programName} Practice Benefits by State
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    <Table programName={programName} columns={columns} data={resultData} />
                </TableContainer>
            </Styles>
        </Box>
    );
}
export default TitleIIPracticeTable;
