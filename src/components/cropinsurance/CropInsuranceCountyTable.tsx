import React from "react";
import styled from "styled-components";
import { CSVLink } from "react-csv";
import { useTable, useSortBy, usePagination } from "react-table";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
    Button,
    Grid,
    TableContainer,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import "../../styles/table.css";
import { ALL_CROPS_SENTINEL } from "./cropSelection/commodityMapping";
import { formatMetric, resolveMetricKey } from "./cropSelection/CountyBreakdownTables";

interface CropInsuranceCountyTableProps {
    tableTitle: string;
    attributes: string[];
    stateCodes: Record<string, string>;
    countyData: any;
    year: string;
    skipColumns: string[];
    selectedState: string;
    onStateChange: (state: string) => void;
    selectedCrops?: string[];
    yearKeys?: string[];
    attribute?: string;
}

const IDENTITY_COLUMN_COUNT = 3;
const COLUMNS_PER_PAGE = 6;

const headerFromAttribute = (attribute: string): string =>
    attribute
        .replace(/InDollars$/, "")
        .replace(/InAcres$/, "")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const readPath = (row: any, path: string): any => {
    if (!path.includes(".")) {
        return row ? row[path] : undefined;
    }
    return path.split(".").reduce((acc: any, key: string) => (acc == null ? acc : acc[key]), row);
};

const Styles = styled.div`
    padding: 0;
    margin: 0;
    width: 100%;
    table {
        border-spacing: 0;
        border: 1px solid #e4ebe7;
        border-left: none;
        border-right: none;
        width: 100%;
    }
    th,
    td {
        margin: 0;
        padding: 0.8rem 1rem;
        border-bottom: 1px solid #e4ebe7;
        border-right: none;
    }
    th {
        background-color: rgba(47, 113, 100, 0.08);
        color: #2f7164;
        font-weight: 400;
        cursor: pointer;
        white-space: nowrap;
    }
    td.numeric {
        text-align: right;
    }
    th.numeric {
        text-align: right;
    }
    .downloadbtn {
        display: inline-block;
        margin-bottom: 0.5rem;
        color: #2f7164;
        text-decoration: none;
        font-size: 0.9em;
    }
`;

function CropInsuranceCountyTable({
    tableTitle,
    attributes,
    stateCodes,
    countyData,
    year,
    skipColumns,
    selectedState,
    onStateChange,
    selectedCrops = [],
    yearKeys = [],
    attribute = ""
}: CropInsuranceCountyTableProps): JSX.Element {
    const [columnPage, setColumnPage] = React.useState(0);

    const countyRows = React.useMemo(() => {
        if (!countyData || !countyData[year]) {
            return [];
        }
        if (selectedState === "All States") {
            return countyData[year];
        }
        return countyData[year].filter((county: any) => {
            const stateName = stateCodes[county.state] || county.state;
            return stateName === selectedState;
        });
    }, [countyData, year, selectedState, stateCodes]);

    const availableStates = React.useMemo(() => {
        const states = new Set<string>();
        if (countyData && countyData[year]) {
            countyData[year].forEach((county: any) => {
                if (county.state && stateCodes[county.state]) {
                    states.add(stateCodes[county.state]);
                }
            });
        }
        return Array.from(states).sort();
    }, [countyData, year, stateCodes]);

    const resultData = React.useMemo(
        () =>
            countyRows.map((county: any) => ({
                ...county,
                state: stateCodes[county.state] || county.state,
                county: county.countyName,
                fips: county.countyFips
            })),
        [countyRows, stateCodes]
    );

    const showYearColumns = yearKeys.length > 1;
    const showCropColumns = selectedCrops.length > 0 && !selectedCrops.includes(ALL_CROPS_SENTINEL);
    const breakdownAttribute = attribute || attributes[0] || "";

    const baseColumns = React.useMemo(() => {
        const columnPrep: any[] = [
            { Header: "County Name", accessor: "county", numeric: false },
            { Header: "State", accessor: "state", numeric: false },
            { Header: "FIPS Code", accessor: "fips", numeric: false }
        ];

        attributes
            .filter((attr) => !skipColumns.includes(attr))
            .forEach((attr) => {
                columnPrep.push({
                    Header: headerFromAttribute(attr).toUpperCase(),
                    accessor: attr,
                    metric: attr,
                    numeric: true
                });
            });

        const breakdownKey = resolveMetricKey(breakdownAttribute);

        if (showYearColumns) {
            yearKeys.forEach((yearKey) => {
                columnPrep.push({
                    Header: `${yearKey} ${headerFromAttribute(breakdownAttribute)}`,
                    accessor: `yearBreakdown.${yearKey}.${breakdownKey}`,
                    metric: breakdownAttribute,
                    numeric: true
                });
            });
        }

        if (showCropColumns) {
            selectedCrops.forEach((crop) => {
                columnPrep.push({
                    Header: `${crop} ${headerFromAttribute(breakdownAttribute)}`,
                    accessor: `commodityBreakdown.${crop}.${breakdownKey}`,
                    metric: breakdownAttribute,
                    numeric: true
                });
            });
        }

        return columnPrep;
    }, [attributes, skipColumns, showYearColumns, showCropColumns, yearKeys, selectedCrops, breakdownAttribute]);

    const totalColumnPages = Math.max(1, Math.ceil((baseColumns.length - IDENTITY_COLUMN_COUNT) / COLUMNS_PER_PAGE));

    React.useEffect(() => {
        if (columnPage > totalColumnPages - 1) {
            setColumnPage(0);
        }
    }, [columnPage, totalColumnPages]);

    const visibleColumnIndices = React.useMemo(() => {
        const startIndex = columnPage * COLUMNS_PER_PAGE + IDENTITY_COLUMN_COUNT;
        const endIndex = Math.min(startIndex + COLUMNS_PER_PAGE, baseColumns.length);
        const trailing = Array.from({ length: Math.max(0, endIndex - startIndex) }, (_, i) => i + startIndex);
        return [0, 1, 2, ...trailing];
    }, [columnPage, baseColumns.length]);

    const csvData = React.useMemo(
        () =>
            resultData.map((row: any) => {
                const csvRow: Record<string, string | number> = {};
                baseColumns.forEach((column: any) => {
                    const value = readPath(row, column.accessor);
                    if (column.numeric) {
                        csvRow[column.Header] = Number.isFinite(Number(value)) ? Number(value) : 0;
                    } else {
                        csvRow[column.Header] = value ?? "";
                    }
                });
                return csvRow;
            }),
        [resultData, baseColumns]
    );

    return (
        <Box display="flex" justifyContent="center" sx={{ width: "100%" }}>
            <Styles>
                <Grid
                    container
                    columns={{ xs: 12 }}
                    className="stateChartTableContainer"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                    }}
                >
                    <Grid item xs={8} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                        <Box id="cropInsuranceCountyTableHeader" sx={{ width: "100%" }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121",
                                    paddingTop: 0.6
                                }}
                            >
                                Comparing {tableTitle}
                            </Typography>
                            {attributes.includes("averageInsuredAreaInAcres") ? (
                                <Box display="flex" justifyContent="start">
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#AAA" }}>
                                        (Average acres includes acres insured by Pasture, Rangeland, and Forage (PRF)
                                        policies)
                                    </Typography>
                                </Box>
                            ) : null}
                        </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="state-filter-label">Filter by State</InputLabel>
                            <Select
                                labelId="state-filter-label"
                                id="state-filter"
                                value={selectedState}
                                label="Filter by State"
                                onChange={(e) => onStateChange(e.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 240
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="All States">All States</MenuItem>
                                {availableStates.map((state) => (
                                    <MenuItem key={state} value={state}>
                                        {state}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                {totalColumnPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2, gap: 0.5 }}>
                        <Button size="small" onClick={() => setColumnPage(0)} disabled={columnPage === 0}>
                            {"<<"}
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))}
                            disabled={columnPage === 0}
                        >
                            {"<"}
                        </Button>
                        <Typography variant="body2" sx={{ px: 1, color: "#2F7164" }}>
                            Column Page <strong>{columnPage + 1}</strong> of <strong>{totalColumnPages}</strong>
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => setColumnPage((prev) => Math.min(totalColumnPages - 1, prev + 1))}
                            disabled={columnPage >= totalColumnPages - 1}
                        >
                            {">"}
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setColumnPage(totalColumnPages - 1)}
                            disabled={columnPage >= totalColumnPages - 1}
                        >
                            {">>"}
                        </Button>
                    </Box>
                )}
                <TableContainer sx={{ width: "100%" }}>
                    <Table
                        columns={baseColumns}
                        data={resultData}
                        csvData={csvData}
                        visibleColumnIndices={visibleColumnIndices}
                        initialState={{
                            pageSize: 10,
                            pageIndex: 0
                        }}
                        tableTitle={`Comparing ${tableTitle}`}
                    />
                </TableContainer>
            </Styles>
        </Box>
    );
}

function Table({
    columns,
    data,
    csvData,
    visibleColumnIndices,
    initialState,
    tableTitle
}: {
    columns: any;
    data: any;
    csvData: any;
    visibleColumnIndices: number[];
    initialState: any;
    tableTitle: string;
}) {
    const state = React.useMemo(() => initialState, []);
    const sortTypes = React.useMemo(
        () => ({
            emptyBottomNumeric: (rowA: any, rowB: any, columnId: string) => {
                const a = Number(rowA.values[columnId]);
                const b = Number(rowB.values[columnId]);
                const safeA = Number.isFinite(a) ? a : 0;
                const safeB = Number.isFinite(b) ? b : 0;
                if (safeA === safeB) return 0;
                return safeA > safeB ? 1 : -1;
            },
            emptyBottomText: (rowA: any, rowB: any, columnId: string) =>
                String(rowA.values[columnId] ?? "").localeCompare(String(rowB.values[columnId] ?? ""))
        }),
        []
    );

    const tableColumns = React.useMemo(
        () =>
            columns.map((column: any) => ({
                ...column,
                sortType: column.numeric ? "emptyBottomNumeric" : "emptyBottomText"
            })),
        [columns]
    );

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
            columns: tableColumns,
            data,
            state,
            sortTypes,
            autoResetSortBy: false
        },
        useSortBy,
        usePagination
    );
    const fileName = `${tableTitle.replace(/\s+/g, "-").toLowerCase()}-data.csv`;

    return (
        <div style={{ width: "100%" }}>
            {data && data.length > 0 && (
                <CSVLink className="downloadbtn" filename={fileName} data={csvData}>
                    Export This Table to CSV
                </CSVLink>
            )}
            <table {...getTableProps()} style={{ width: "100%" }}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers
                                .filter((_, index) => visibleColumnIndices.includes(index))
                                .map((column: any) => (
                                    <th
                                        className={column.numeric ? "numeric" : ""}
                                        key={column.id}
                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                    >
                                        {column.render("Header")}
                                        <span>
                                            {(() => {
                                                if (!column.isSorted)
                                                    return (
                                                        <Box sx={{ ml: 1, display: "inline" }}>
                                                            <SwapVertIcon />
                                                        </Box>
                                                    );
                                                if (column.isSortedDesc)
                                                    return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25BC}"}</Box>;
                                                return <Box sx={{ ml: 1, display: "inline" }}>{"\u{25B2}"}</Box>;
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
                            <tr key={row.id} {...row.getRowProps()}>
                                {row.cells
                                    .filter((_, index) => visibleColumnIndices.includes(index))
                                    .map((cell: any) => {
                                        const { numeric, metric } = cell.column;
                                        return (
                                            <td
                                                className={numeric ? "numeric" : ""}
                                                key={cell.id}
                                                {...cell.getCellProps()}
                                                style={{ whiteSpace: "nowrap" }}
                                            >
                                                {numeric
                                                    ? formatMetric(metric, Number(cell.value) || 0)
                                                    : cell.render("Cell")}
                                            </td>
                                        );
                                    })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Box className="pagination" sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
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
                        {[10, 25, 50, 100].map((p) => (
                            <option key={p} value={p}>
                                Show {p}
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    {pageSize * (pageIndex + 1) <= rows.length ? (
                        <Typography>
                            Showing the first {parseInt(pageSize, 10) * (pageIndex + 1)} results of {rows.length} rows
                        </Typography>
                    ) : (
                        <Typography>
                            Showing the first {rows.length} results of {rows.length} rows
                        </Typography>
                    )}
                </Box>
            </Box>
        </div>
    );
}

export default CropInsuranceCountyTable;
