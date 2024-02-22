import React from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Box from "@mui/material/Box";
import "../../styles/table.css";
import { compareWithDollarSign, compareWithPercentSign } from "../shared/TableCompareFunctions";

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
    year: string;
    stateCodes: any;
}): JSX.Element {
    const cspTableData: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    statePerformance[year].forEach((value) => {
        const newRecord = () => {
            let stateName = "";
            stateCodes.forEach((sValue) => {
                if (sValue.code.toUpperCase() === value.state.toUpperCase()) {
                    stateName = sValue.name;
                }
            });
            return {
                state: stateName,
                cspBenefit: `$${value.totalPaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                percentage: `${value.totalPaymentInPercentageNationwide.toString()}%`
            };
        };
        cspTableData.push(newRecord());
    });

    const columns = React.useMemo(
        () => [
            {
                Header: <Box className="tableHeader">STATES</Box>,
                accessor: "state",
                paddingLeft: "5rem",
                paddingRight: "32rem"
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{
                            maxWidth: 240,
                            pl: 9,
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        CSP BENEFITS
                    </Box>
                ),
                accessor: "cspBenefit",
                sortType: compareWithDollarSign,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: <Box className="tableHeader">PCT. NATIONWIDE</Box>,
                accessor: "percentage",
                sortType: compareWithPercentSign,
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
                <Table columns={columns} data={cspTableData.filter((obj) => Object.keys(obj).length > 0)} />
            </Styles>
        </Box>
    );
}

export default App;
