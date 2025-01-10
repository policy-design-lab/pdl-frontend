import React from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Grid, TableContainer, Typography, Box, Button } from "@mui/material";
import { compareWithAlphabetic, compareWithPercentSign } from "../shared/TableCompareFunctions";
import "../../styles/table.css";
import getCSVData from "../shared/getCSVData";

function IRAPredictedPercentageTable({
    tableTitle,
    practices,
    stateCodes,
    IRAPredictedData,
    year,
    predict,
    attributes,
    summary,
    skipColumns,
    colors
}): JSX.Element {
    let resultData = [];
    const hashmap = {};

    // eslint-disable-next-line no-restricted-syntax
    IRAPredictedData[year].forEach((stateData) => {
        const state = stateData.state;
        let pData = null;
        if (practices.includes("Total")) {
            pData = stateData;
            hashmap[state] = {};
            attributes.forEach((attribute) => {
                const attributeData = pData[attribute];
                hashmap[state][attribute] = attributeData;
                // Calculate percentage nationwide
                if (attribute === "predictedTotalPaymentInDollars") {
                    hashmap[state][`${attribute}PredictedPercentageNationwide`] = `${(
                        (attributeData / summary[year].predictedTotalPaymentInDollars) *
                        100
                    ).toFixed(2)}%`;
                }
            });
        } else {
            const practices_total = {};
            if (!practices_total[state]) practices_total[state] = {};

            let totalStatePayments = 0;
            let totalNationalPayments = 0;

            practices.forEach((practice) => {
                const practiceData = stateData.practices.filter((p) => p.practiceName.toString() === practice);
                const nationalPracticeData = summary[year].practices.find((p) => p.practiceName === practice);
                if (!hashmap[state]) hashmap[state] = {};
                if (!practices_total[state]) practices_total[state] = {};
                attributes.forEach((attribute) => {
                    if (practices_total[state][attribute] === undefined) {
                        practices_total[state][attribute] = 0;
                    }
                });
                if (!practiceData || practiceData.length === 0) {
                    attributes.forEach((attribute) => {
                        const new_key = `${practice}: ${attribute}`;
                        hashmap[state][new_key] = 0;
                        practices_total[state][attribute] += 0;
                        // Set percentage to 0 for missing practices
                        hashmap[state][`${new_key}PredictedPercentageNationwide`] = "0.00%";
                    });
                } else {
                    const attributeData = practiceData[0];
                    attributes.forEach((attribute) => {
                        const new_key = `${practice}: ${attribute}`;
                        hashmap[state][new_key] = attributeData[attribute] || 0;
                        practices_total[state][attribute] += attributeData[attribute] || 0;
                        // Calculate percentage
                        if (nationalPracticeData) {
                            const nationalTotal =
                                attribute === "predictedTotalPaymentInDollars"
                                    ? nationalPracticeData.predictedTotalPaymentInDollars
                                    : nationalPracticeData.totalPracticeInstanceCount;

                            hashmap[state][`${new_key}PredictedPercentageNationwide`] = `${(
                                (attributeData[attribute] / nationalTotal) *
                                100
                            ).toFixed(2)}%`;
                        }
                    });
                }
            });

            practices.forEach((practice) => {
                const statePracticeData = stateData.practices.find((p) => p.practiceName === practice);
                const nationalPracticeData = summary[year].practices.find((p) => p.practiceName === practice);

                if (statePracticeData) {
                    totalStatePayments += statePracticeData.predictedTotalPaymentInDollars || 0;
                    // totalStateInstances += statePracticeData.practiceInstanceCount || 0;
                }

                if (nationalPracticeData) {
                    totalNationalPayments += nationalPracticeData.predictedTotalPaymentInDollars || 0;
                    // totalNationalInstances += nationalPracticeData.totalPracticeInstanceCount || 0;
                }
            });

            attributes.forEach((attribute) => {
                if (!practices_total[state] || practices_total[state][attribute] === undefined) {
                    if (!hashmap[state]) hashmap[state] = {};
                    hashmap[state][`All Practices: ${attribute}`] = 0;
                    hashmap[state][`All Practices: ${attribute}PredictedPercentageNationwide`] = "0.00%";
                } else {
                    hashmap[state][`All Practices: ${attribute}`] = practices_total[state][attribute];

                    // Calculate percentage for all practices combined
                    if (attribute === "predictedTotalPaymentInDollars") {
                        hashmap[state][`All Practices: ${attribute}PredictedPercentageNationwide`] = `${(
                            (totalStatePayments / totalNationalPayments) *
                            100
                        ).toFixed(2)}%`;
                    }
                }
            });

            // Reorder the hashmap[state] keys, move All Practices columns to the leftmost
            const allPracticesKeys = Object.keys(hashmap[state]).filter((key) => key.startsWith("All Practices:"));
            const otherKeys = Object.keys(hashmap[state]).filter((key) => !key.startsWith("All Practices:"));
            const reorderedHashmap = {};

            allPracticesKeys.forEach((key) => {
                reorderedHashmap[key] = hashmap[state][key];
            });
            otherKeys.forEach((key) => {
                reorderedHashmap[key] = hashmap[state][key];
            });
            hashmap[state] = reorderedHashmap;
        }
    });
    Object.keys(hashmap).forEach((s) => {
        const newRecord = { state: stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === s)[0]] };
        Object.entries(hashmap[s]).forEach(([attr, value]) => {
            if (value) {
                if (attr.includes("Dollar")) {
                    if (attr.includes("PredictedPercentageNationwide")) {
                        newRecord[attr] = value; // Keep as percentage
                    } else {
                        newRecord[attr] = `$${parseFloat(value).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        })}`;
                    }
                } else if (attr.includes("PredictedPercentageNationwide")) {
                    newRecord[attr] = value; // Keep as percentage
                } else {
                    newRecord[attr] = parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 });
                }
            } else if (attr.includes("Dollar")) {
                newRecord[attr] = "$0";
            } else {
                newRecord[attr] = "0";
            }
            newRecord[attr] = newRecord[attr].includes("NaN") ? "0.00%" : newRecord[attr];
        });
        resultData.push(newRecord);
    });

    const columnPrep = [];
    columnPrep.push({ Header: "STATE", accessor: "state", sortType: compareWithAlphabetic });
    // filter out all data attributes with the word "percentage" in them
    resultData = resultData.map(
        (item) =>
            Object.keys(item)
                .filter((key) => key.toLowerCase().includes("percentage") || key.toLowerCase().includes("state"))
                .reduce((obj, key) => {
                    obj[key] = item[key];
                    return obj;
                }, {} as any)
        /* eslint-disable-next-line function-paren-newline */
    );
    const attrs = resultData[0] ? Object.keys(resultData[0]).filter((item) => item.toLowerCase() !== "state") : [];
    attrs.forEach((attribute) => {
        const sortMethod = compareWithPercentSign;
        const json = {
            Header: attribute
                .replace("Payment", "Benefit")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
                .toUpperCase(),
            accessor: attribute,
            sortType: sortMethod
        };
        columnPrep.push(json);
    });
    const columns = React.useMemo(() => columnPrep, []);
    const Styles = styled.div`
        padding: 0;
        margin: 0;
        // .table-fixed {
        //     width: 100%;
        //     overflow-x: auto;
        // }

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
                        <Box id="IRAPredictedPercentageTableHeader" sx={{ width: "100%" }}>
                            <Typography
                                id="IRAPercentageBarHeader"
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
                                Comparing <b>{tableTitle}</b>
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
    const [columnPage, setColumnPage] = React.useState(0);
    const columnsPerPage = 6;
    const visibleColumnIndices = React.useMemo(() => {
        const startIndex = columnPage * columnsPerPage + 1;
        const endIndex = Math.min(startIndex + columnsPerPage, columns.length);
        return Array.from({ length: endIndex - startIndex }, (_, i) => i + startIndex);
    }, [columnPage, columnsPerPage, columns.length]);
    const totalColumnPages = Math.ceil((columns.length - 1) / columnsPerPage);
    React.useEffect(() => {
        setColumnPage(0);
    }, [columns.length]);
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
        <div>
            {data && data.length > 0 ? (
                <div style={{ width: "100%" }}>
                    <CSVLink className="downloadbtn" filename="pdl-data.csv" data={getCSVData(headerGroups, data)}>
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
                            <strong style={{ paddingRight: 8 }}>
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
                            {headerGroups.map((headerGroup) => (
                                <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
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
                                                if (!headerGroup.headers[0].isSorted)
                                                    return (
                                                        <Box sx={{ ml: 1, display: "inline" }}>
                                                            <SwapVertIcon />
                                                        </Box>
                                                    );
                                                if (headerGroup.headers[0].isSortedDesc)
                                                    return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>;
                                                return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>;
                                            })()}
                                        </span>
                                    </th>

                                    {headerGroup.headers
                                        .filter((_, index) => visibleColumnIndices.includes(index))
                                        .map((column) => (
                                            <th
                                                className={column.render("Header").replace(/\s/g, "")}
                                                key={column.id}
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                            >
                                                {(() => {
                                                    const headerText = column.render("Header");
                                                    if (headerText.includes(":")) {
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
                            {page.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()} key={row}>
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
                                            .map((cell, j) => (
                                                <td
                                                    className={`cell${j + 1}`}
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
                    <Box
                        className="pagination"
                        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
                    >
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
                                    Showing the first {parseInt(pageSize, 10) * (pageIndex + 1)} results of{" "}
                                    {rows.length} rows
                                </Typography>
                            ) : (
                                <Typography>
                                    Showing the first {rows.length} results of {rows.length}rows
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

export default IRAPredictedPercentageTable;
