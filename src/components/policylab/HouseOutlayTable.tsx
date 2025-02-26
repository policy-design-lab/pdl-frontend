import React, { useState } from "react";
import { Box, Button, Grid, TableContainer, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { useTable, useSortBy, usePagination } from "react-table";
import { CSVLink } from "react-csv";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { compareWithDollarSign } from "../shared/TableCompareFunctions";
import getCSVData from "../shared/getCSVData";

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

function Table({ columns, data }) {
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

    const totalColumnPages = Math.ceil((columns.length - 1) / columnsPerPage);

    return (
        <div>
            {data && data.length > 0 ? (
                <div style={{ width: "100%" }}>
                    <CSVLink
                        className="downloadbtn"
                        filename="house-outlay-data.csv"
                        data={getCSVData(headerGroups, data)}
                    >
                        Export Table to CSV
                    </CSVLink>

                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                        <Button onClick={() => setColumnPage(0)} disabled={columnPage === 0}>
                            {"<<"}
                        </Button>
                        <Button
                            onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))}
                            disabled={columnPage === 0}
                        >
                            {"<"}
                        </Button>
                        <span style={{ paddingLeft: 8 }}>
                            Column Page
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
                                                    return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>;
                                                return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>;
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
                                                    if (typeof headerText === "string" && headerText.includes(":")) {
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
                                                            <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>
                                                        );
                                                    })()}
                                                </span>
                                            </th>
                                        ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, rowIndex) => {
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
                                            .map((cell, cellIndex) => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    className={`cell${cellIndex + 1}`}
                                                    key={cell.column.id}
                                                >
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
                                {[10, 25, 40, 51].map((size) => (
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
        </div>
    );
}

const HouseOutlayTable = ({
    statePerformance,
    year,
    selectedPractices,
    stateCodes,
    programName
}: {
    statePerformance: any;
    year: string;
    selectedPractices: string[];
    stateCodes: any;
    programName: string;
}): JSX.Element => {
    const getNationalTotalForPractice = React.useCallback(
        (practice) => {
            let total = 0;
            if (!statePerformance[year]) return total;
            statePerformance[year].forEach((state) => {
                const practiceData = state.practices.find((p) => p.practiceName === practice);
                total += practiceData?.predictedMaximumTotalPaymentInDollars || 0;
            });
            return total;
        },
        [statePerformance, year]
    );

    const getNationalTotal = React.useCallback(() => {
        if (selectedPractices.includes("All Practices")) {
            let total = 0;
            statePerformance[year]?.forEach((state) => {
                total += state.predictedMaximumTotalPaymentInDollars || 0;
            });
            return total;
        }
        let total = 0;
        selectedPractices.forEach((practice) => {
            total += getNationalTotalForPractice(practice);
        });
        return total;
    }, [statePerformance, year, selectedPractices, getNationalTotalForPractice]);

    const resultData = React.useMemo(() => {
        if (!statePerformance[year]) return [];

        return statePerformance[year].map((stateData) => {
            const stateCode = stateCodes.find((obj) => obj.code === stateData.state);
            const stateName = stateCode ? stateCode.name : stateData.state;
            const row = {
                state: stateName
            };

            if (selectedPractices.includes("All Practices")) {
                const totalPayments = stateData.predictedMaximumTotalPaymentInDollars || 0;
                row["Total Projected Payments"] = `$${totalPayments.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                })}`;
            } else {
                let totalPayments = 0;
                selectedPractices.forEach((practice) => {
                    const practiceData = stateData.practices.find((p) => p.practiceName === practice);
                    const practicePayments = practiceData?.predictedMaximumTotalPaymentInDollars || 0;
                    totalPayments += practicePayments;
                    row[`${practice}: Projected Payments`] = `$${practicePayments.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`;
                });
                row["Total Projected Payments"] = `$${totalPayments.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                })}`;
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
            cols.push({
                Header: `Total ${programName} Projected Change in Financial Assistance`,
                accessor: "Total Projected Payments",
                sortType: compareWithDollarSign
            });
        } else {
            cols.push({
                Header: "Total Projected Change in Financial Assistance for Selected Practices",
                accessor: "Total Projected Payments",
                sortType: compareWithDollarSign
            });
            selectedPractices.forEach((practice) => {
                cols.push({
                    Header: `${practice} Projected Change in Financial Assistance`,
                    accessor: `${practice}: Projected Payments`,
                    sortType: compareWithDollarSign
                });
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
                                {programName} Projected Changes by State
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    <Table columns={columns} data={resultData} />
                </TableContainer>
            </Styles>
        </Box>
    );
};
export default HouseOutlayTable;
