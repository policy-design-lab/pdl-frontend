import React from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";
import Box from "@mui/material/Box";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import "../../styles/table.css";
import { compareWithDollarSign, compareWithNumber } from "../shared/TableCompareFunctions";
import { formatCurrency, formatNumericValue } from "../shared/ConvertionFormats";

const Styles = styled.div`
    padding: 1rem;

    table {
        border-spacing: 0;
        border: 1px solid #e4ebe7;
        border-left: none;
        border-right: none;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th {
            background-color: #f1f1f1;
            padding: 1rem;
        }

        td {
            margin: 0;
            padding: 1rem;
            padding-left: 5rem;
            padding-right: 5rem;
            border-bottom: 1px solid #e4ebe7;
            border-right: none;

            :last-child {
                border-right: 0;
            }
        }
    }
`;

// eslint-disable-next-line
function Table({ columns, data }: { columns: any; data: any }) {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data
        },
        useSortBy
    );

    const firstPageRows = rows.slice(0, 50);

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
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "horizontal",
                                            alignItems: "center"
                                        }}
                                    >
                                        {column.render("Header")}
                                        <div>
                                            {(() => {
                                                if (!column.isSorted)
                                                    return (
                                                        <Box sx={{ ml: 1 }}>
                                                            <SwapVertIcon />
                                                        </Box>
                                                    );
                                                if (column.isSortedDesc) return <Box sx={{ ml: 1 }}>{"\u{25BC}"}</Box>;
                                                return <Box sx={{ ml: 1 }}>{"\u{25B2}"}</Box>;
                                            })()}
                                        </div>
                                    </Box>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {
                        // eslint-disable-next-line
                        firstPageRows.map((row, i) => {
                            prepareRow(row);
                            return (
                                <tr key={row.id} {...row.getRowProps()}>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td key={cell.id} {...cell.getCellProps()}>
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
            <br />
            <div>
                Showing the first {rows.length} results of {rows.length} rows
            </div>
        </>
    );
}

function App({
    statePerformance,
    year,
    stateCodes
}: {
    statePerformance: any;
    year: any;
    stateCodes: any;
}): JSX.Element {
    const rcppTableData: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    statePerformance[year].forEach((value) => {
        const totalRcpp = value;
        let stateName;
        stateCodes.forEach((sValue) => {
            if (sValue.code.toUpperCase() === value.state.toUpperCase()) {
                stateName = sValue.name;
            }
        });
        const newRecord = () => {
            return {
                state: stateName,
                rcppBenefit: formatCurrency(totalRcpp.totalPaymentInDollars, 0),
                percentage: `${totalRcpp.totalPaymentInPercentageNationwide.toString()}%`,
                noContract: `${formatNumericValue(totalRcpp.totalContracts, 0)}`,
                totAcre: `${formatNumericValue(totalRcpp.totalAreaInAcres, 0)}`
            };
        };
        rcppTableData.push(newRecord());
    });

    // PENDING: The 'pl' below are hard coded values that are inherited from old code design. Need to update this in the future
    const columns = React.useMemo(
        () => [
            {
                Header: <Box className="tableHeader">STATES</Box>,
                accessor: "state",
                paddingLeft: "5rem",
                paddingRight: "5rem"
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{
                            maxWidth: 240,
                            pl: 6,
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        TOTAL ACEP BENEFITS
                    </Box>
                ),
                accessor: "rcppBenefit",
                sortType: compareWithDollarSign,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{
                            maxWidth: 240,
                            pl: 2,
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        NO. OF CONTRACTS
                    </Box>
                ),
                accessor: "noContract",
                sortType: compareWithNumber,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{
                            maxWidth: 240,
                            pl: 8,
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <div>ACRES</div>
                    </Box>
                ),
                accessor: "totAcre",
                sortType: compareWithNumber,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{
                            maxWidth: 240,
                            pl: 8,
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <div>PCT. NATIONWIDE</div>
                    </Box>
                ),
                accessor: "percentage",
                sortType: compareWithNumber,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            }
        ],
        []
    );

    return (
        <Box display="flex" justifyContent="center">
            <Styles>
                <Table columns={columns} data={rcppTableData} />
            </Styles>
        </Box>
    );
}

export default App;
