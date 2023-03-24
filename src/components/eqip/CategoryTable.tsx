import React from 'react';
import styled from 'styled-components';
import { useTable, useSortBy } from 'react-table';
import Box from '@mui/material/Box';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import statePerformance from '../../data/eqip/EQIP_STATE_PERFORMANCE_DATA.json';

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
            padding: 0rem;
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
                                    {column.render('Header')}
                                    {/* Add a sort direction indicator */}
                                    <span>
                                        {(() => {
                                            if (!column.isSorted) return '';
                                            if (column.isSortedDesc)
                                                return <ArrowDropDownOutlinedIcon fontSize="inherit" />;
                                            return <ArrowDropUpOutlinedIcon fontSize="inherit" />;
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
                    firstPageRows.map((row, i) => {
                            prepareRow(row);
                            return (
                                <tr key={row.id} {...row.getRowProps()}>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td key={cell.id} {...cell.getCellProps()}>
                                                {cell.render('Cell')}
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
        const ACur = value[0].statutes.find((s) => s.statuteName === '(6)(A) Practices');
        const AArray = ACur.practiceCategories;
        const BCur = value[0].statutes.find((s) => s.statuteName === '(6)(B) Practices');
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
        const a = Number.parseFloat(rowA.values[id].substring(1).replaceAll(',', ''));
        const b = Number.parseFloat(rowB.values[id].substring(1).replaceAll(',', ''));
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }

    function compareWithPercentSign(rowA, rowB, id, desc) {
        const a = Number.parseFloat(rowA.values[id].replaceAll('%', ''));
        const b = Number.parseFloat(rowB.values[id].replaceAll('%', ''));
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'STATES',
                accessor: 'state',
                paddingLeft: '5rem',
                paddingRight: '10rem'
            },
            {
                Header: `${category} Benefit`.toUpperCase(),
                accessor: 'categoryBenefit',
                sortType: compareWithDollarSign,
                Cell: function styleCells(props: {
                    value: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                }) {
                    return <Box sx={{ backgroundColor: '#fff0e2', padding: 2 }}>{props.value}</Box>;
                }
            },
            {
                Header: `${category} Percentage Within State`.toUpperCase(),
                accessor: 'categoryPercentage',
                sortType: compareWithPercentSign,
                Cell: function styleCells(props: {
                    value: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                }) {
                    return <Box sx={{ backgroundColor: '#fff0e2', padding: 2 }}>{props.value}</Box>;
                }
            },
            {
                Header: 'EQIP BENEFITS',
                accessor: 'eqipBenefit',
                sortType: compareWithDollarSign
            },
            {
                Header: 'PCT. NATIONWIDE',
                accessor: 'percentage',
                sortType: compareWithPercentSign
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
