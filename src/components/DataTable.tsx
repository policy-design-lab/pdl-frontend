import React from 'react';
import styled from 'styled-components';
import { useTable, useSortBy } from 'react-table';
import Box from '@mui/material/Box';
import eqipTableData from '../data/eqipTableData.json';

const Styles = styled.div`
    padding: 1rem;

    table {
        border-spacing: 0;
        border: 1px solid black;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th,
        td {
            margin: 0;
            padding: 1rem;
            padding-left: 5rem;
            padding-right: 5rem;
            border-bottom: 1px solid black;
            border-right: 1px solid black;

            :last-child {
                border-right: 0;
            }
        }
    }
`;

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
                                <th key={column.id} {...column.getHeaderProps(column.getSortByToggleProps())}>
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
                    {firstPageRows.map((row, i) => {
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
                    })}
                </tbody>
            </table>
            <br />
            <div>
                Showing the first {rows.length} results of {rows.length} rows
            </div>
        </>
    );
}

function App() {
    const columns = React.useMemo(
        () => [
            {
                Header: 'STATES',
                accessor: 'state'
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
