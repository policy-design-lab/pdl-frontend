import React from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";
import Box from "@mui/material/Box";
import statePerformance from "../../data/EQIP/EQIP_STATE_PERFORMANCE_DATA.json";
import "../../styles/table.css";

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
            padding-top: 1rem;
            padding-bottom: 1rem;
        }

        td {
            margin: 0;
            padding: 0rem;
            padding-left: 3rem;
            padding-right: 3rem;
            border-bottom: 1px solid #e4ebe7;
            border-right: none;

            :last-child {
                border-right: 2rem;
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

function App({ category }: { category: string }): JSX.Element {
    const eqipTableData: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(statePerformance)) {
        const ACur = value[0].statutes.find((s) => s.statuteName === "(6)(A) Practices");
        const AArray = ACur.practiceCategories;
        const BCur = value[0].statutes.find((s) => s.statuteName === "(6)(B) Practices");
        const BArray = BCur.practiceCategories;
        const TotalArray = AArray.concat(BArray);
        const categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
        const newRecord = () => {
            return {
                state: key,
                categoryBenefit: `$${Number(categoryRecord.paymentInDollars).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                })}`,
                categoryPercentage: `${categoryRecord.paymentInPercentageWithinState.toString()}%`,
                eqipBenefit: `$${value[0].totalPaymentInDollars.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                })}`,
                percentage: `${value[0].totalPaymentInPercentageNationwide.toString()}%`
            };
        };
        eqipTableData.push(newRecord());
    }

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

    const columns = React.useMemo(
        () => [
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 12, display: "flex", justifyContent: "center" }}
                    >
                        STATES
                    </Box>
                ),
                accessor: "state",
                Cell: function styleCells(props: {
                    value: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                }) {
                    return (
                        <div style={{ textAlign: "left" }}>
                            <Box sx={{ py: 2, pl: 6, display: "flex", justifyContent: "flex-start" }}>
                                {props.value}
                            </Box>
                        </div>
                    );
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 6, display: "flex", justifyContent: "center" }}
                    >
                        {`${category} Benefit`.toUpperCase()}
                    </Box>
                ),
                accessor: "categoryBenefit",
                sortType: compareWithDollarSign,
                Cell: function styleCells(props: {
                    value: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                }) {
                    return (
                        <div style={{ textAlign: "right" }}>
                            <Box
                                sx={{
                                    backgroundColor: "#fff0e2",
                                    py: 3,
                                    width: 240,
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <Box sx={{ textAlign: "right", width: 120 }}>{props.value}</Box>
                            </Box>
                        </div>
                    );
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 6, display: "flex", justifyContent: "center" }}
                    >
                        {`${category} Percentage Within State`.toUpperCase()}
                    </Box>
                ),
                accessor: "categoryPercentage",
                sortType: compareWithPercentSign,
                Cell: function styleCells(props: {
                    value: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                }) {
                    return (
                        <div style={{ textAlign: "right" }}>
                            <Box
                                sx={{
                                    backgroundColor: "#fff0e2",
                                    py: 3,
                                    width: 280,
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <Box sx={{ textAlign: "right", width: 80 }}>{props.value}</Box>
                            </Box>
                        </div>
                    );
                }
            },
            {
                Header: (
                    <Box
                        className="tableHeader"
                        sx={{ maxWidth: 240, pl: 7, display: "flex", justifyContent: "center" }}
                    >
                        EQIP BENEFITS
                    </Box>
                ),
                accessor: "eqipBenefit",
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
                <Table columns={columns} data={eqipTableData} />
            </Styles>
        </Box>
    );
}

export default App;