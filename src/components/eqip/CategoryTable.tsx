import React from 'react';
import styled from 'styled-components';
import { useTable, useSortBy } from 'react-table';
import Box from '@mui/material/Box';
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
                                    {column.render('Header')}
                                    {/* Add a sort direction indicator */}
                                    <span>
                                        {(() => {
                                            if (!column.isSorted) return '';
                                            if (column.isSortedDesc) return ' 🔽';
                                            return ' 🔼';
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
                categoryBenefit: `$${categoryRecord.paymentInDollars.toString()}`,
                categoryPercentage: `${categoryRecord.paymentInPercentageWithinState.toString()}%`,
                eqipBenefit: `$${value[0].totalPaymentInDollars.toString()}`,
                percentage: `${value[0].totalPaymentInPercentageNationwide.toString()}%`
            };
        };
        eqipTableData.push(newRecord());
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
                Header: `${category} Benefit`,
                accessor: 'categoryBenefit'
            },
            {
                Header: `${category} Percentage Within State`,
                accessor: 'categoryPercentage'
            },
            {
                Header: 'EQIP BENEFITS',
                accessor: 'eqipBenefit'
            },
            {
                Header: 'PCT. NATIONWIDE',
                accessor: 'percentage'
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