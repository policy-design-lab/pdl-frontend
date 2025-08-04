import React from "react";
import styled from "styled-components";
import { useTable, useSortBy, usePagination } from "react-table";
import { Grid, TableContainer, Typography, Box } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
    compareWithNumber,
    compareWithAlphabetic,
    compareWithDollarSign,
    compareWithPercentSign
} from "../shared/TableCompareFunctions";
import "../../styles/table.css";
import { formatCurrency } from "../shared/ConvertionFormats";

function AcepProgramTable({
    tableTitle,
    program,
    attributes,
    stateCodes,
    AcepData,
    year,
    colors,
    skipColumns
}): JSX.Element {
    const resultData = [];
    const hashmap = {};
    // eslint-disable-next-line no-restricted-syntax
    AcepData[year].forEach((stateData) => {
        let state;
        stateCodes.forEach((sValue) => {
            if (sValue.code.toUpperCase() === stateData.state.toUpperCase()) {
                state = sValue.name;
            }
        });
        hashmap[state] = {};
        attributes.forEach((attribute) => {
            const attributeData = stateData[attribute];
            hashmap[state][attribute] = attributeData;
        });
    });
    Object.keys(hashmap).forEach((s) => {
        const newRecord = {
            state: s
        };
        Object.entries(hashmap[s]).forEach(([attr, value]) => {
            if (attr.includes("Percentage")) {
                newRecord[attr] = `${value.toString()}%`;
            } else if (attr === "totalAreaInAcres" || attr === "totalContracts") {
                newRecord[attr] = `${formatCurrency(value, 0)}`;
            } else {
                newRecord[attr] = formatCurrency(value, 0);
            }
        });
        resultData.push(newRecord);
    });
    const columnPrep = [];
    columnPrep.push({ Header: "STATE", accessor: "state", sortType: compareWithAlphabetic });
    attributes.forEach((attribute) => {
        let sortMethod = compareWithDollarSign;
        if (attribute.includes("Percentage")) sortMethod = compareWithPercentSign;
        if (attribute.includes("totalContracts") || attribute.includes("totalAreaInAcres"))
            sortMethod = compareWithNumber;
        let attrName = attribute
            .replace(/([A-Z])/g, " $1")
            .trim()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
            .toUpperCase();
        if (attribute === "totalPaymentInDollars") attrName = "Total Payment in Dollars".toUpperCase();
        if (attribute === "totalPaymentInPercentageNationwide")
            attrName = "Total Payment In Percentage Nationwide".toUpperCase();
        const json = {
            Header: attrName,
            accessor: attribute,
            sortType: sortMethod
        };
        columnPrep.push(json);
    });
    const columns = React.useMemo(() => columnPrep, []);
    const paymentsIndex = columns.findIndex((c) => c.accessor === "totalPaymentInDollars");
    const acresIndex = columns.findIndex((c) => c.accessor === "totalAreaInAcres");
    const contractsIndex = columns.findIndex((c) => c.accessor === "totalContracts");
    const paymentsPercentageIndex = columns.findIndex((c) => c.accessor === "totalPaymentInPercentageNationwide");
    const contractsPercentageIndex = columns.findIndex((c) => c.accessor === "totalContractsInPercentageNationwide");
    const acresPercentageIndex = columns.findIndex((c) => c.accessor === "totalAreaInPercentageNationwide");
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
              background-color: ${colors[0]};
          }

          td[class$="cell${paymentsPercentageIndex}"] {
            background-color: ${colors[0]};
          }
          td[class$="cell${contractsIndex}"] {
          background-color: ${colors[1]};
          }
          td[class$="cell${contractsPercentageIndex}"] {
              background-color: ${colors[1]};
          }
          td[class$="cell${acresIndex}"] {
              background-color: ${colors[2]};
          }
          td[class$="cell${acresPercentageIndex}"] {
              background-color: ${colors[2]};
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

            table .tableArrow{
              margin-left: 8px;
            }
        }
        .pagination {
            margin-top: 1.5em;
        }

        @media screen and (max-width: 1440px) {
          table {
            font-size: 0.9em;

            th:not(:first-of-type) {
              text-align: left;
            }
          }
          table th,
          table td {
                padding: 1em;
                text-align: left;
          }
          .pagination {
                margin-top: 8px;
          }
        }

        .acepBox > .stateTitle {
          margin-top: 0.5em;
          font-size: 1.2em;
          text-align: left;
          margin-bottom: 1em;
          padding-top: 0.5em;
        }

        .
    `;
    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles value={attributes[0]}>
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
                        <Grid item xs={12} className="acepBox" sx={{ width: "100%" }}>
                            <Typography className="stateTitle">
                                Comparing {tableTitle} ({year})
                            </Typography>
                        </Grid>
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
                                                return (
                                                    <Box className="tableArrow" sx={{ display: "inline" }}>
                                                        <SwapVertIcon />
                                                    </Box>
                                                );
                                            if (column.isSortedDesc)
                                                return (
                                                    <Box className="tableArrow" sx={{ display: "inline" }}>
                                                        {"\u{25BC}"}
                                                    </Box>
                                                );
                                            return (
                                                <Box className="tableArrow" sx={{ display: "inline" }}>
                                                    {"\u{25B2}"}
                                                </Box>
                                            );
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

export default AcepProgramTable;
