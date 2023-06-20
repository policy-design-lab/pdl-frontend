import React from "react";
import styled from "styled-components";
import { useTable, useSortBy, usePagination } from "react-table";
import { Grid, TableContainer, Typography, Box } from "@mui/material";
import {
    compareWithNumber,
    compareWithAlphabetic,
    compareWithDollarSign,
    compareWithPercentSign,
    sortByDollars
} from "../shared/TableCompareFunctions";
import "../../styles/table.css";

function Title1ProgramTable({
    tableTitle,
    program,
    subprogram,
    stateCodes,
    Title1Data,
    year,
    color1,
    color2,
    color3,
    skipColumns
}): JSX.Element {
    const resultData = [];
    const hashmap = {};
    // eslint-disable-next-line no-restricted-syntax
    Title1Data[year].forEach((stateData) => {
        const state = stateData.state;
        let programData = null;
        programData = stateData.programs.filter((p) => {
            return p.programName.toString() === program;
        });
        if (subprogram !== undefined) {
            const subProgramData = programData[0].subPrograms.filter((p) => {
                return p.subProgramName.toString() === subprogram;
            });
            hashmap[state] = {
                paymentInDollars: subProgramData[0].paymentInDollars,
                paymentInPercentageNationwide: subProgramData[0].paymentInPercentageNationwide,
                paymentInPercentageWithinState: subProgramData[0].paymentInPercentageWithinState,
                areaInAcres: subProgramData[0].areaInAcres,
                recipientCount: subProgramData[0].recipientCount
            };
        } else if (program !== "Total Commodities Programs Benefits") {
            hashmap[state] = {
                programPaymentInDollars: programData[0].programPaymentInDollars,
                areaInAcres: programData[0].areaInAcres,
                recipientCount: programData[0].recipientCount
            };
        } else {
            hashmap[state] = {
                programPaymentInDollars: stateData.totalPaymentInDollars,
                paymentInPercentageNationwide: stateData.totalPaymentInPercentageNationwide
            };
        }
    });
    Object.entries(hashmap).forEach(([key, value]) => {
        const newRecord = () => {
            if (subprogram !== undefined) {
                return value.paymentInPercentageNationwide !== undefined
                    ? {
                          state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                          paymentInDollars: `$${value.paymentInDollars
                              .toLocaleString(undefined, { minimumFractionDigits: 2 })
                              .toString()}`,
                          paymentInPercentageNationwide: `${value.paymentInPercentageNationwide.toString()}%`,
                          paymentInPercentageWithinState: `${value.paymentInPercentageWithinState.toString()}%`,
                          areaInAcres:
                              value.areaInAcres === 0
                                  ? "0"
                                  : `${value.areaInAcres
                                        .toLocaleString(undefined, { minimumFractionDigits: 2 })
                                        .toString()}`,
                          recipientCount:
                              value.recipientCount === 0
                                  ? "0"
                                  : `${value.recipientCount
                                        .toLocaleString(undefined, { minimumFractionDigits: 0 })
                                        .toString()}`
                      }
                    : {
                          state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                          paymentInDollars: "$0",
                          paymentInPercentageNationwide: "0%",
                          paymentInPercentageWithinState: "0%",
                          areaInAcres: "0",
                          recipientCount: "0"
                      };
            }
            if (program === "Total Commodities Programs Benefits") {
                return {
                    state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                    programPaymentInDollars: `$${value.programPaymentInDollars
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })
                        .toString()}`,
                    paymentInPercentageNationwide: `${value.paymentInPercentageNationwide.toString()}%`
                };
            }
            return value.programPaymentInDollars !== undefined
                ? {
                      state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                      programPaymentInDollars: `$${value.programPaymentInDollars
                          .toLocaleString(undefined, { minimumFractionDigits: 2 })
                          .toString()}`,
                      areaInAcres:
                          value.areaInAcres === 0
                              ? "0"
                              : `${value.areaInAcres
                                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                                    .toString()}`,
                      recipientCount:
                          value.recipientCount === 0
                              ? "0"
                              : `${value.recipientCount
                                    .toLocaleString(undefined, { minimumFractionDigits: 0 })
                                    .toString()}`
                  }
                : {
                      state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                      programPaymentInDollars: "$0",
                      areaInAcres: "0",
                      recipientCount: "0"
                  };
        };
        resultData.push(newRecord());
    });
    if (subprogram !== undefined) {
        sortByDollars(resultData, "paymentInDollars");
    } else sortByDollars(resultData, "programPaymentInDollars");
    let columns;
    if (program === "Total Commodities Programs Benefits") {
        columns = React.useMemo(
            () => [
                {
                    Header: "STATE",
                    accessor: "state",
                    sortType: compareWithAlphabetic
                },
                {
                    Header: "PAYMENT",
                    accessor: "programPaymentInDollars",
                    sortType: compareWithDollarSign
                },

                {
                    Header: "PAYMENT PCT. NATIONWIDE",
                    accessor: "paymentInPercentageNationwide",
                    sortType: compareWithPercentSign
                }
            ],
            []
        );
    } else {
        columns =
            subprogram !== undefined
                ? React.useMemo(
                      () => [
                          {
                              Header: "STATE",
                              accessor: "state",
                              sortType: compareWithAlphabetic
                          },
                          {
                              Header: "PAYMENT",
                              accessor: "paymentInDollars",
                              sortType: compareWithDollarSign
                          },

                          {
                              Header: "PAYMENT PCT. NATIONWIDE",
                              accessor: "paymentInPercentageNationwide",
                              sortType: compareWithPercentSign
                          },
                          {
                              Header: "PAYMENT PCT. WITHIN STATE",
                              accessor: "paymentInPercentageWithinState",
                              sortType: compareWithPercentSign
                          },
                          {
                              Header: "AREA IN ACRES",
                              accessor: "areaInAcres",
                              sortType: compareWithNumber
                          },
                          {
                              Header: "RECIPIENT COUNT",
                              accessor: "recipientCount",
                              sortType: compareWithNumber
                          }
                      ],
                      []
                  )
                : React.useMemo(
                      () => [
                          {
                              Header: "STATE",
                              accessor: "state",
                              sortType: compareWithAlphabetic
                          },
                          {
                              Header: "PAYMENT",
                              accessor: "programPaymentInDollars",
                              sortType: compareWithDollarSign
                          },
                          {
                              Header: "AREA IN ACRES",
                              accessor: "areaInAcres",
                              sortType: compareWithNumber
                          },
                          {
                              Header: "RECIPIENT COUNT",
                              accessor: "recipientCount",
                              sortType: compareWithNumber
                          }
                      ],
                      []
                  );
    }
    const paymentsIndex =
        subprogram !== undefined
            ? columns.findIndex((c) => c.accessor === "paymentInDollars")
            : columns.findIndex((c) => c.accessor === "programPaymentInDollars");
    const areaInAcresIndex = columns.findIndex((c) => c.accessor === "areaInAcres");
    const recipeintCountIndex = columns.findIndex((c) => c.accessor === "recipientCount");
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

            td[class$="cell${paymentsIndex}"] {
                background-color: ${color1};
            }

            td[class$="cell${areaInAcresIndex}"] {
                background-color: ${color2};
            }

            td[class$="cell${recipeintCountIndex}"] {
                background-color: ${color3};
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
                        justifyContent: "space-between"
                    }}
                >
                    <Grid item xs={12} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                        <Box id="title1TableHeader" sx={{ width: "100%" }}>
                            <Typography
                                id="title1BarHeader"
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
                                {tableTitle}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <TableContainer sx={{ width: "100%" }}>
                    <Table
                        columns={columns.filter((column: any) => !skipColumns.includes(column.accessor))}
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

export default Title1ProgramTable;
