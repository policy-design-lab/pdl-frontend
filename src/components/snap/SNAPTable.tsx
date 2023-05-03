import { Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
import { useTable, useSortBy, usePagination } from "react-table";
import Box from "@mui/material/Box";
import { compareWithAlphabetic, compareWithDollarSign, compareWithPercentSign } from "../shared/TableCompareFunctions";
import "../../styles/table.css";
import stateCodes from "../../data/stateCodes.json";

function SnapTable({
    SnapData,
    yearKey,
    color1,
    color2
}: {
    SnapData: any;
    yearKey: string;
    color1: string;
    color2: string;
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

            td[class$="cell1"] {
                background-color: ${color1};
            }

            td[class$="cell3"] {
                background-color: ${color2};
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
    // eslint-disable-next-line no-restricted-syntax
    SnapData[yearKey].forEach((d) => {
        const newRecord = () => {
            return {
                state: stateCodes[d.state],
                snapCost: `$${d.totalPaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                averageMonthlyParticipation: `${d.averageMonthlyParticipation
                    .toLocaleString(undefined, { minimumFractionDigits: 0 })
                    .toString()}`,
                paymentPercentage: `${d.totalPaymentInPercentageNationwide.toString()}%`,
                avgMonthlyPercentage: `${d.averageMonthlyParticipationInPercentageNationwide.toString()}%`
            };
        };
        resultData.push(newRecord());
    });
    const columns = React.useMemo(
        () => [
            {
                Header: "STATE",
                accessor: "state",
                sortType: compareWithAlphabetic
            },
            {
                Header: "SNAP COSTS",
                accessor: "snapCost",
                sortType: compareWithDollarSign
            },

            {
                Header: "COSTS PCT. NATIONWIDE",
                accessor: "paymentPercentage",
                sortType: compareWithPercentSign
            },
            {
                Header: "AVG. MONTHLY PARTICIPATION",
                accessor: "averageMonthlyParticipation",
                sortType: compareWithPercentSign
            },
            {
                Header: "PARTICIPATION PCT. NATIONWIDE",
                accessor: "avgMonthlyPercentage",
                sortType: compareWithPercentSign
            }
        ],
        []
    );
    return (
        <Box display="flex" justifyContent="center">
            <Styles>
                <Table
                    columns={columns}
                    data={resultData}
                    initialState={{
                        pageSize: 5,
                        pageIndex: 0
                    }}
                />
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
        <>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                // Add the sorting props to control sorting.
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
                                    {column.render("Header")}
                                    <span>
                                        {(() => {
                                            if (!column.isSorted)
                                                return <Box sx={{ ml: 1, display: "inline" }}>{"\u{2B83}"}</Box>;
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
                                    {row.cells.map((cell, item) => {
                                        return (
                                            <td className={`cell${item}`} key={cell.id} {...cell.getCellProps()}>
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
                                gotoPage(page);
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
                        {[10, 25, 40, 51].map((pSize) => (
                            <option key={pSize} value={pSize}>
                                Show {pSize}
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
        </>
    );
}

export default SnapTable;
