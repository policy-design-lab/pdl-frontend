import React from 'react';
import styled from 'styled-components';
import { useTable, useSortBy, usePagination } from 'react-table';
import Box from '@mui/material/Box';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import { compareWithDollarSign, compareWithPercentSign } from '../shared/TableCompareFunctions';
import SnapData from '../../data/snap/snap_state_distribution_data.json';

const Styles = styled.div`
    padding: 0;
    margin: 0;

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
function Table({ columns, data, initialState }: { columns: any; data: any, initialState: any}) {
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
                        page.map((row, i) => {
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
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>{' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>{' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>{' '}
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
                <span>
                    | Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            gotoPage(page);
                        }}
                        style={{ width: '20%' }}
                    />
                </span>{' '}
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
            <br />
            <div>
                Showing the first {parseInt(page[page.length - 1].id) + 1} results of {rows.length} rows
            </div>
        </>
    );
}

const resultData: any[] = [];
function SnapTable(): JSX.Element {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(SnapData)) {
        const newRecord = () => {
            return {
                state: key,
                snapBenefit: `$${value[5].totalPaymentInDollars
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    .toString()}`,
                averageMonthlyParticipation: `${value[5].averageMonthlyParticipation.toLocaleString(undefined, { minimumFractionDigits: 0 })
                .toString()}`,
                percentage: `${value[5].totalPaymentInPercentageNationwide.toString()}%`
            };
        };
        resultData.push(newRecord());
    }
    const columns = React.useMemo(
        () => [
            {
                Header: 'STATE',
                accessor: 'state',
                paddingLeft: '5rem',
                paddingRight: '15rem'
            },
            {
                Header: 'SNAP BENEFITS',
                accessor: 'snapBenefit',
                sortType: compareWithDollarSign
            },
            {
                Header: 'AVG. MONTHLY PARTICIPATION',
                accessor: 'averageMonthlyParticipation',
                sortType: compareWithPercentSign
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
                <Table
                    columns={columns}
                    data={resultData}
                    initialState={{
                        pageSize: 5,
                        pageIndex: 0
                    }}
                />
            </Styles>
        </Box>
    );
}

export default SnapTable;
