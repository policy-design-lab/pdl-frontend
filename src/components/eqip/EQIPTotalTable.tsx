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

const eqipTableData: any[] = [];

// eslint-disable-next-line no-restricted-syntax
for (const [key, value] of Object.entries(statePerformance)) {
    const newRecord = () => {
        return {
            state: key,
            eqipBenefit: `$${value[0].totalPaymentInDollars
                .toLocaleString(undefined, { minimumFractionDigits: 2 })
                .toString()}`,
            percentage: `${value[0].totalPaymentInPercentageNationwide.toString()}%`
        };
    };
    eqipTableData.push(newRecord());
}

function App(): JSX.Element {
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
                paddingRight: '32rem'
            },
            {
                Header: 'EQIP BENEFITS',
                accessor: 'eqipBenefit',
                sortType: compareWithDollarSign,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: 'right' }}>{row.value}</div>;
                }
            },
            {
                Header: 'PCT. NATIONWIDE',
                accessor: 'percentage',
                sortType: compareWithPercentSign,
                Cell: function styleCells(row) {
                    return <div style={{ textAlign: 'right' }}>{row.value}</div>;
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
