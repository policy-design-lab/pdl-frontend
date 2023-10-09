import React from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";
import Box from "@mui/material/Box";
import "../../styles/table.css";

const Styles = styled.div`
    padding: 1rem;
    margin-left: ${window.innerWidth <= 1440 ? "480px" : "auto"};

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
                                        style: { paddingLeft: column.paddingLeft, paddingRight: column.paddingRight }
                                    })}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}>
                                        {column.render("Header")}
                                        <div>
                                            {(() => {
                                                if (!column.isSorted) return <Box sx={{ ml: 1 }}>{"\u{2B83}"}</Box>;
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
    function compareWithDollarSign(rowA, rowB, id, desc) {
        const a = Number.parseFloat(rowA.values[id].substring(1).replaceAll(",", ""));
        const b = Number.parseFloat(rowB.values[id].substring(1).replaceAll(",", ""));
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }

    function compareWithPercentSign(rowA, rowB, id, desc) {
        const a = Number.parseFloat(rowA.values[id].replaceAll("%", ""));
        const b = Number.parseFloat(rowB.values[id].replaceAll("%", ""));
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }

    function compareNumber(rowA, rowB, id, desc) {
        const a = Number.parseInt(rowA.values[id].replaceAll(",", ""), 10);
        const b = Number.parseInt(rowB.values[id].replaceAll(",", ""), 10);
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }

    const rcppTableData: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    statePerformance[year].forEach((value) => {
        const totalRcpp = value.programs.find((s) => s.programName === "RCPP");
        const stateName = value.state;
        const newRecord = () => {
            return {
                state: stateName,
                rcppBenefit: `$${totalRcpp.paymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                percentage: `${totalRcpp.totalPaymentInPercentageNationwide.toString()}%`,
                noContract: `${totalRcpp.totalContracts
                    .toLocaleString(undefined, { minimumFractionDigits: 0 })
                    .toString()}`,
                totAcre: `${totalRcpp.totalAcres.toLocaleString(undefined, { minimumFractionDigits: 0 }).toString()}`,
                finPayment: `$${totalRcpp.assistancePaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                reimbursePayment: `$${totalRcpp.reimbursePaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                techPayment: `$${totalRcpp.techPaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`
            };
        };
        rcppTableData.push(newRecord());
    });

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
                        sx={{ maxWidth: 240, pl: 6, display: "flex", justifyContent: "center" }}
                    >
                        TOTAL RCPP BENEFITS
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
                        sx={{ maxWidth: 240, pl: 2, display: "flex", justifyContent: "center" }}
                    >
                        NO. OF CONTRACTS <br />
                    </Box>
                ),
                accessor: "noContract",
                sortType: compareNumber,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 2, display: "flex", justifyContent: "right" }}
                    >
                        ACRES <br />
                    </Box>
                ),
                accessor: "totAcre",
                sortType: compareNumber,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: "right" }}>{row.value}</div>;
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 2, display: "flex", justifyContent: "center" }}
                    >
                        FINANCIAL ASSISTANT PAYMENTS <br />
                    </Box>
                ),
                accessor: "finPayment",
                sortType: compareWithDollarSign,
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
