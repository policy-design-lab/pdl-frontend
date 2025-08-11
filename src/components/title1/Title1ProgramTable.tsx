import React from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Grid, TableContainer, Typography, Box } from "@mui/material";
import {
    compareWithNumber,
    compareWithAlphabetic,
    compareWithDollarSign,
    compareWithPercentSign
} from "../shared/TableCompareFunctions";
import { formatCurrency, formatNumericValue } from "../shared/ConvertionFormats";
import getCSVData from "../shared/getCSVData";
import "../../styles/table.css";

function Title1ProgramTable({
    tableTitle,
    subtitle,
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
        programData = stateData.programs.filter((p) => p.programName.toString() === program);
        if (subtitle.includes("Subtitle D") || subtitle.includes("Subtitle E")) {
            // SADA's program
            if (program) {
                hashmap[state] = {
                    totalPaymentInDollars: programData[0].totalPaymentInDollars,
                    totalPaymentInPercentageNationwide: programData[0].totalPaymentInPercentageNationwide,
                    totalPaymentInPercentageWithinState: programData[0].totalPaymentInPercentageWithinState,
                    averageRecipientCount: programData[0].averageRecipientCount,
                    averageRecipientCountInPercentageNationwide:
                        programData[0].averageRecipientCountInPercentageNationwide,
                    averageRecipientCountInPercentageWithinState:
                        programData[0].averageRecipientCountInPercentageWithinState
                };
            } else {
                // Subtitle D and E
                hashmap[state] = {
                    totalPaymentInDollars: stateData.totalPaymentInDollars,
                    totalPaymentInPercentageNationwide: stateData.totalPaymentInPercentageNationwide,
                    averageRecipientCount: stateData.averageRecipientCount,
                    averageRecipientCountInPercentageNationwide: stateData.averageRecipientCountInPercentageNationwide
                };
            }
        } else if (subtitle && program && subprogram) {
            // ARC subprograms
            const subProgramData = programData[0].subPrograms.filter((p) => {
                return p.subProgramName.toString() === subprogram;
            });
            hashmap[state] = {
                totalPaymentInDollars: subProgramData[0].totalPaymentInDollars,
                totalPaymentInPercentageNationwide: subProgramData[0].totalPaymentInPercentageNationwide,
                totalPaymentInPercentageWithinState: subProgramData[0].totalPaymentInPercentageWithinState,
                averageAreaInAcres: subProgramData[0].averageAreaInAcres,
                averageRecipientCount: subProgramData[0].averageRecipientCount
            };
        } else if (program) {
            // PLC and ARC
            hashmap[state] = {
                totalPaymentInDollars: programData[0].totalPaymentInDollars,
                averageAreaInAcres: programData[0].averageAreaInAcres,
                averageRecipientCount: programData[0].averageRecipientCount,
                totalPaymentInPercentageNationwide: programData[0].totalPaymentInPercentageNationwide
            };
        } else {
            // Subtitle A Case
            hashmap[state] = {
                totalPaymentInDollars: stateData.totalPaymentInDollars,
                totalPaymentInPercentageNationwide: stateData.totalPaymentInPercentageNationwide
            };
        }
    });
    Object.entries(hashmap).forEach(([key, value]) => {
        const newRecord = () => {
            if (
                subtitle.includes("Subtitle D") ||
                subtitle.includes("Subtitle E") // Subtitle D and E. If new subtitles have different attributes, change this condition
            ) {
                if (program) {
                    // SADA's program
                    return {
                        state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                        totalPaymentInDollars: formatCurrency(value.totalPaymentInDollars, 0),
                        totalPaymentInPercentageNationwide: `${value.totalPaymentInPercentageNationwide.toString()}%`,
                        totalPaymentInPercentageWithinState: `${value.totalPaymentInPercentageWithinState.toString()}%`,
                        averageRecipientCount: formatNumericValue(value.averageRecipientCount, 0),
                        averageRecipientCountInPercentageNationwide: `${value.averageRecipientCountInPercentageNationwide.toString()}%`,
                        averageRecipientCountInPercentageWithinState: `${value.averageRecipientCountInPercentageWithinState.toString()}%`
                    };
                }
                return {
                    // subtitle D and E
                    state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                    totalPaymentInDollars: formatCurrency(value.totalPaymentInDollars, 0),
                    totalPaymentInPercentageNationwide: `${value.totalPaymentInPercentageNationwide.toString()}%`,
                    averageRecipientCount: formatNumericValue(value.averageRecipientCount, 0),
                    averageRecipientCountInPercentageNationwide: `${value.averageRecipientCountInPercentageNationwide.toString()}%`
                };
            }
            // subtitle A
            if (subtitle && !program) {
                return {
                    state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                    totalPaymentInDollars: formatCurrency(value.totalPaymentInDollars, 0),
                    totalPaymentInPercentageNationwide: `${value.totalPaymentInPercentageNationwide.toString()}%`
                };
            }
            // ARC's subprograms
            if (subprogram) {
                return {
                    state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                    totalPaymentInDollars: formatCurrency(value.totalPaymentInDollars, 0),
                    totalPaymentInPercentageNationwide: `${value.totalPaymentInPercentageNationwide.toString()}%`,
                    totalPaymentInPercentageWithinState: `${value.totalPaymentInPercentageWithinState.toString()}%`,
                    averageAreaInAcres:
                        value.averageAreaInAcres === 0 ? "0" : formatNumericValue(value.averageAreaInAcres, 0),
                    averageRecipientCount:
                        value.averageRecipientCount === 0
                            ? "0"
                            : formatNumericValue(value.averageRecipientCount, 0)
                };
            }
            // ARC & PLC
            return value.totalPaymentInDollars !== undefined
                ? {
                      state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                      totalPaymentInDollars: formatCurrency(value.totalPaymentInDollars, 0),
                      totalPaymentInPercentageNationwide: `${value.totalPaymentInPercentageNationwide.toString()}%`,
                      averageAreaInAcres:
                          value.averageAreaInAcres === 0 ? "0" : formatNumericValue(value.averageAreaInAcres, 0),
                      averageRecipientCount:
                          value.averageRecipientCount === 0
                              ? "0"
                              : formatNumericValue(value.averageRecipientCount, 0)
                  }
                : {
                      state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === key)[0]],
                      totalPaymentInDollars: "$0",
                      averageAreaInAcres: "0",
                      averageRecipientCount: "0"
                  };
        };
        resultData.push(newRecord());
    });
    let columns;
    if (subtitle.includes("Subtitle A") && !program) {
        columns = React.useMemo(
            () => [
                {
                    Header: "STATE",
                    accessor: "state",
                    sortType: compareWithAlphabetic
                },
                {
                    Header: "PAYMENT",
                    accessor: "totalPaymentInDollars",
                    sortType: compareWithDollarSign
                },

                {
                    Header: "PAYMENT PCT. NATIONWIDE",
                    accessor: "totalPaymentInPercentageNationwide",
                    sortType: compareWithPercentSign
                }
            ],
            []
        );
    } else if (subtitle.includes("Subtitle A") && program) {
        columns = subprogram
            ? React.useMemo(
                  // ARC's subprograms
                  () => [
                      {
                          Header: "STATE",
                          accessor: "state",
                          sortType: compareWithAlphabetic
                      },
                      {
                          Header: "PAYMENT",
                          accessor: "totalPaymentInDollars",
                          sortType: compareWithDollarSign
                      },

                      {
                          Header: "PAYMENT PCT. NATIONWIDE",
                          accessor: "totalPaymentInPercentageNationwide",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "PAYMENT PCT. WITHIN STATE",
                          accessor: "totalPaymentInPercentageWithinState",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "AVG. BASE ACRES",
                          accessor: "averageAreaInAcres",
                          sortType: compareWithNumber
                      },
                      {
                          Header: "AVG. AVG. AVG. RECIPIENTS",
                          accessor: "averageRecipientCount",
                          sortType: compareWithNumber
                      }
                  ],
                  []
              )
            : React.useMemo(
                  // ARC & PLC
                  () => [
                      {
                          Header: "STATE",
                          accessor: "state",
                          sortType: compareWithAlphabetic
                      },
                      {
                          Header: "PAYMENT",
                          accessor: "totalPaymentInDollars",
                          sortType: compareWithDollarSign
                      },
                      {
                          Header: "PAYMENT PCT. NATIONWIDE",
                          accessor: "totalPaymentInPercentageNationwide",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "AVG. BASE ACRES",
                          accessor: "averageAreaInAcres",
                          sortType: compareWithNumber
                      },
                      {
                          Header: "AVG. AVG. RECIPIENTS",
                          accessor: "averageRecipientCount",
                          sortType: compareWithNumber
                      }
                  ],
                  []
              );
    } else {
        columns = program
            ? React.useMemo(
                  // SADA's program
                  () => [
                      {
                          Header: "STATE",
                          accessor: "state",
                          sortType: compareWithAlphabetic
                      },
                      {
                          Header: "PAYMENT",
                          accessor: "totalPaymentInDollars",
                          sortType: compareWithDollarSign
                      },
                      {
                          Header: "PAYMENT PCT. NATIONWIDE",
                          accessor: "totalPaymentInPercentageNationwide",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "PAYMENT PCT. WITHIN STATE",
                          accessor: "totalPaymentInPercentageWithinState",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "AVG. RECIPIENTS",
                          accessor: "averageRecipientCount",
                          sortType: compareWithNumber
                      },
                      {
                          Header: "AVG. RECIPIENTS PCT. NATIONWIDE",
                          accessor: "averageRecipientCountInPercentageNationwide",
                          sortType: compareWithNumber
                      },
                      {
                          Header: "AVG. RECIPIENTS PCT. WITHIN STATE",
                          accessor: "averageRecipientCountInPercentageWithinState",
                          sortType: compareWithNumber
                      }
                  ],
                  []
              )
            : React.useMemo(
                  // Subtitle D and E
                  () => [
                      {
                          Header: "STATE",
                          accessor: "state",
                          sortType: compareWithAlphabetic
                      },
                      {
                          Header: "PAYMENT",
                          accessor: "totalPaymentInDollars",
                          sortType: compareWithDollarSign
                      },
                      {
                          Header: "PAYMENT PCT. NATIONWIDE",
                          accessor: "totalPaymentInPercentageNationwide",
                          sortType: compareWithPercentSign
                      },
                      {
                          Header: "AVG. RECIPIENTS",
                          accessor: "averageRecipientCount",
                          sortType: compareWithNumber
                      },
                      {
                          Header: "AVG. RECIPIENTS PCT. NATIONWIDE",
                          accessor: "averageRecipientCountInPercentageNationwide",
                          sortType: compareWithNumber
                      }
                  ],
                  []
              );
    }
    const paymentsIndex =
        columns.findIndex((c) => c.accessor === "totalPaymentInDollars") !== -1
            ? columns.findIndex((c) => c.accessor === "totalPaymentInDollars")
            : columns.findIndex((c) => c.accessor === "totalPaymentInDollars");
    const averageAreaInAcresIndex = columns.findIndex((c) => c.accessor === "averageAreaInAcres");
    const averageRecipientCountIndex = columns.findIndex((c) => c.accessor === "averageRecipientCount");

    const Styles =
        program && subtitle.includes("Subtitle A")
            ? styled.div`
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

                      td[class$="cell${averageAreaInAcresIndex}"] {
                          background-color: ${color2};
                      }

                      td[class$="cell${averageRecipientCountIndex}"] {
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

                  @media screen and (max-width: 1790px) {
                      table {
                          font-size: 0.9em;
                      }
                      table th,
                      table td {
                          padding: 1em;
                      }
                      td[class$="cell${paymentsIndex}"],
                      td[class$="cell${averageAreaInAcresIndex}"],
                      td[class$="cell${averageRecipientCountIndex}"] {
                          text-align: left;
                          padding: 1em;
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
              `
            : styled.div`
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

                  @media screen and (max-width: 1790px) {
                      table {
                          font-size: 0.9em;
                      }
                      table th,
                      table td {
                          padding: 1em;
                      }
                      td[class$="cell0"] {
                          text-align: left;
                          padding: 1em;
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
                            {program && subtitle.includes("Subtitle A") ? (
                                <Typography
                                    sx={{
                                        fontWeight: 400,
                                        paddingLeft: 0,
                                        fontSize: "0.7em",
                                        color: "rgb(163, 163, 163)"
                                    }}
                                >
                                    <i>
                                        The payments,base acres and payment recipients are calculated as the total of
                                        the data from 2014-2023. 2024 payments for Title I have not yet been paid.
                                    </i>
                                </Typography>
                            ) : (
                                <div />
                            )}

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
                            pageSize: 10,
                            pageIndex: 0
                        }}
                        tableTitle={tableTitle}
                    />
                </TableContainer>
            </Styles>
        </Box>
    );
}

// eslint-disable-next-line
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
            initialState
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

export default Title1ProgramTable;
