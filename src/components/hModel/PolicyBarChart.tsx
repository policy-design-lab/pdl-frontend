import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box
} from "@mui/material";
import { ShortFormatInteger, CurrencyFormat } from "../shared/ConvertionFormats";
import { transformYearDataForward } from "./utils";

interface CommodityData {
    commodityName: string;
    totalPaymentInDollars: number;
}

interface YearData {
    year: string;
    current: {
        totalPayment: number;
        commodities: CommodityData[];
    };
    proposed: {
        totalPayment: number;
        commodities: CommodityData[];
    };
}

interface County {
    scenarios?: Array<{
        totalPaymentInDollars?: number;
        commodities?: Array<{
            commodityName: string;
            programs?: Array<{
                totalPaymentInDollars?: number;
            }>;
        }>;
    }>;
}

interface StateData {
    counties?: County[];
}

interface ProcessedData {
    current: Record<string, StateData[]>;
    proposed: Record<string, StateData[]>;
}

interface PolicyBarChartProps {
    data: ProcessedData;
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    currentLabel?: string;
    proposedLabel?: string;
    chartCurrentLabel?: string;
    chartProposedLabel?: string;
}

const StyledContainer = styled.div`
    position: relative;
    width: 100%;
    svg {
        font-family: "Roboto", sans-serif;
        width: 100%;
        height: auto;
    }
    .axis path,
    .axis line {
        stroke: #000;
        opacity: 10%;
    }
    .axis text {
        fill: #00000099;
        font-size: 0.75rem;
        font-family: "Roboto", sans-serif;
    }
    .axis .tick line {
        visibility: hidden;
    }
    .x-axis path,
    .x-axis line {
        stroke: none;
    }
    .grid-line {
        stroke: #f0f0f0;
        stroke-width: 1;
    }
    .bar {
        cursor: pointer;
        transition: opacity 0.3s ease;
    }
    .bar:hover {
        opacity: 0.8;
    }
    .legend {
        font-size: 0.75rem;
        font-family: "Roboto", sans-serif;
    }
    .legend-item {
        cursor: pointer;
    }
    .legend-item:hover rect {
        opacity: 0.8;
    }
    .tooltip {
        position: fixed;
        background: #2f7164;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: "Roboto", sans-serif;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
`;

const predefinedCommodityColors = {
    "Corn": "#2F7164",
    "Wheat": "#8B4513",
    "Soybeans": "#ebe288",
    "Seed Cotton": "#4a4a4a",
    "Peanuts": "#dc2626",
    "Rice": "#1e90ff",
    "Sorghum": "#4a148c",
    "Barley": "#DAA520",
    "Oats": "#B8860B"
};

const generateColorPalette = (commodities: string[]): Record<string, string> => {
    const colors: Record<string, string> = {};
    const defaultColors = [
        "#2F7164",
        "#8B4513",
        "#ebe288",
        "#ECF0EE",
        "#DEB887",
        "#F5DEB3",
        "#4a148c",
        "#DAA520",
        "#B8860B",
        "#4682B4",
        "#8A2BE2",
        "#A0522D",
        "#5F9EA0",
        "#7FFF00",
        "#D2691E",
        "#FF7F50",
        "#6495ED",
        "#DC143C",
        "#00CED1",
        "#9400D3",
        "#FF1493",
        "#00BFFF",
        "#696969",
        "#1E90FF",
        "#B22222",
        "#32CD32",
        "#FF6347",
        "#40E0D0",
        "#EE82EE",
        "#F0E68C"
    ];
    let colorIndex = 0;
    commodities.forEach((commodity) => {
        if (predefinedCommodityColors[commodity]) {
            colors[commodity] = predefinedCommodityColors[commodity];
        } else {
            colors[commodity] = defaultColors[colorIndex % defaultColors.length];
            colorIndex += 1;
        }
    });
    return colors;
};

const CommoditySummaryTable: React.FC<{
    data: YearData[];
    selectedCommodities: string[];
    currentLabel: string;
    proposedLabel: string;
}> = ({ data, selectedCommodities, currentLabel, proposedLabel }) => {
    const commoditySummaries = React.useMemo(() => {
        const summaryMap = new Map<string, { currentTotal: number; proposedTotal: number }>();

        data.forEach((yearData) => {
            yearData.current.commodities.forEach((commodity) => {
                if (selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName)) {
                    const existing = summaryMap.get(commodity.commodityName) || { currentTotal: 0, proposedTotal: 0 };
                    existing.currentTotal += commodity.totalPaymentInDollars;
                    summaryMap.set(commodity.commodityName, existing);
                }
            });

            yearData.proposed.commodities.forEach((commodity) => {
                if (selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName)) {
                    const existing = summaryMap.get(commodity.commodityName) || { currentTotal: 0, proposedTotal: 0 };
                    existing.proposedTotal += commodity.totalPaymentInDollars;
                    summaryMap.set(commodity.commodityName, existing);
                }
            });
        });

        return Array.from(summaryMap.entries())
            .map(([commodityName, totals]) => ({
                commodityName,
                currentTotal: totals.currentTotal,
                proposedTotal: totals.proposedTotal
            }))
            .sort((a, b) => b.currentTotal - a.currentTotal);
    }, [data, selectedCommodities]);

    const overallTotals = React.useMemo(() => {
        return commoditySummaries.reduce(
            (acc, commodity) => ({
                currentTotal: acc.currentTotal + commodity.currentTotal,
                proposedTotal: acc.proposedTotal + commodity.proposedTotal
            }),
            { currentTotal: 0, proposedTotal: 0 }
        );
    }, [commoditySummaries]);
    const maxTotal = React.useMemo(() => {
        return Math.max(
            ...commoditySummaries.map((c) => Math.max(c.currentTotal, c.proposedTotal)),
            Math.max(overallTotals.currentTotal, overallTotals.proposedTotal)
        );
    }, [commoditySummaries, overallTotals]);

    return (
        <Box sx={{ mt: 3 }}>
            <Typography
                sx={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    color: "#2F7164",
                    mb: 2,
                    textAlign: "center"
                }}
            >
                Payment Totals by Commodity: Total for 10 Fiscal Years
            </Typography>
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                <TableContainer component={Paper} sx={{ maxHeight: 400, flex: 1 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>Commodity</TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 600, backgroundColor: "#f5f5f5", color: "#FF8C00" }}
                                >
                                    {currentLabel}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 600, backgroundColor: "#f5f5f5", color: "rgb(1, 87, 155)" }}
                                >
                                    {proposedLabel}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                                    Difference
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                                    % Change
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {commoditySummaries.map((commodity) => {
                                const difference = commodity.proposedTotal - commodity.currentTotal;
                                const percentChange =
                                    commodity.currentTotal > 0 ? (difference / commodity.currentTotal) * 100 : 0;
                                const isSelected =
                                    selectedCommodities.length === 0 ||
                                    selectedCommodities.includes(commodity.commodityName);
                                return (
                                    <TableRow
                                        key={commodity.commodityName}
                                        hover
                                        sx={{
                                            "backgroundColor": isSelected ? "#f0f8ff" : "inherit",
                                            "&:hover": { backgroundColor: isSelected ? "#e6f3ff" : "#f5f5f5" }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: isSelected ? 600 : 500 }}>
                                            {commodity.commodityName}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ color: "#FF8C00", fontWeight: isSelected ? 600 : 400 }}
                                        >
                                            ${Math.round(commodity.currentTotal).toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ color: "rgb(1, 87, 155)", fontWeight: isSelected ? 600 : 400 }}
                                        >
                                            ${Math.round(commodity.proposedTotal).toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{
                                                color: "rgb(156, 39, 176)",
                                                fontWeight: isSelected ? 600 : 500
                                            }}
                                        >
                                            {difference >= 0 ? "+" : ""}${Math.round(difference).toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{
                                                color: percentChange >= 0 ? "#2e7d32" : "#d32f2f",
                                                fontWeight: isSelected ? 600 : 500
                                            }}
                                        >
                                            {percentChange >= 0 ? "+" : ""}
                                            {percentChange.toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            <TableRow sx={{ borderTop: 2, borderColor: "#2F7164" }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Overall Total</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: "#FF8C00", fontSize: "1rem" }}>
                                    ${Math.round(overallTotals.currentTotal).toLocaleString()}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 700, color: "rgb(1, 87, 155)", fontSize: "1rem" }}
                                >
                                    ${Math.round(overallTotals.proposedTotal).toLocaleString()}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color: "rgb(156, 39, 176)",
                                        fontSize: "1rem"
                                    }}
                                >
                                    {overallTotals.proposedTotal - overallTotals.currentTotal >= 0 ? "+" : ""}$
                                    {Math.round(
                                        overallTotals.proposedTotal - overallTotals.currentTotal
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color:
                                            overallTotals.currentTotal > 0 &&
                                            ((overallTotals.proposedTotal - overallTotals.currentTotal) /
                                                overallTotals.currentTotal) *
                                                100 >=
                                                0
                                                ? "#2e7d32"
                                                : "#d32f2f",
                                        fontSize: "1rem"
                                    }}
                                >
                                    {overallTotals.currentTotal > 0 ? (
                                        <>
                                            {((overallTotals.proposedTotal - overallTotals.currentTotal) /
                                                overallTotals.currentTotal) *
                                                100 >=
                                            0
                                                ? "+"
                                                : ""}
                                            {(
                                                ((overallTotals.proposedTotal - overallTotals.currentTotal) /
                                                    overallTotals.currentTotal) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default function PolicyBarChart({
    data,
    width,
    height = 400,
    margin = { top: 60, right: 80, bottom: 80, left: 80 },
    currentLabel = "Baseline",
    proposedLabel = "OBBBA",
    chartCurrentLabel = "B",
    chartProposedLabel = "O"
}: PolicyBarChartProps): JSX.Element {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const svgRef = React.useRef<SVGSVGElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [processedData, setProcessedData] = React.useState<YearData[]>([]);
    const [containerWidth, setContainerWidth] = React.useState(800);
    const [selectedCommodities, setSelectedCommodities] = React.useState<string[]>([]);

    React.useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);
    const processData = React.useCallback(() => {
        if (!data || !data.current || !data.proposed) return;
        const transformedCurrentData = transformYearDataForward(data.current);
        const transformedProposedData = transformYearDataForward(data.proposed);
        const years = Object.keys(transformedCurrentData);
        const processed: YearData[] = years.map((year) => {
            const currentYearDataArray = transformedCurrentData[year] || [];
            const proposedYearDataArray = transformedProposedData[year] || [];
            const getCurrentTotal = (yearDataArray: StateData[]) => {
                if (!yearDataArray || yearDataArray.length === 0) return 0;
                let total = 0;
                yearDataArray.forEach((yearDataItem) => {
                    if (!yearDataItem?.counties) return;
                    yearDataItem.counties.forEach((county: County) => {
                        total += county.scenarios?.[0]?.totalPaymentInDollars || 0;
                    });
                });
                return total;
            };

            const getCommodities = (yearDataArray: StateData[]) => {
                if (!yearDataArray || yearDataArray.length === 0) return [];
                const commodityMap = new Map<string, number>();

                yearDataArray.forEach((yearDataItem) => {
                    if (!yearDataItem?.counties) return;
                    yearDataItem.counties.forEach((county: County) => {
                        county.scenarios?.[0]?.commodities?.forEach((commodity) => {
                            const name = commodity.commodityName;
                            const payment =
                                commodity.programs?.reduce(
                                    (sum: number, program) => sum + (program.totalPaymentInDollars || 0),
                                    0
                                ) || 0;
                            commodityMap.set(name, (commodityMap.get(name) || 0) + payment);
                        });
                    });
                });
                return Array.from(commodityMap.entries()).map(([name, total]) => ({
                    commodityName: name,
                    totalPaymentInDollars: total
                }));
            };
            const currentTotal = getCurrentTotal(currentYearDataArray);
            const proposedTotal = getCurrentTotal(proposedYearDataArray);
            const currentCommodities = getCommodities(currentYearDataArray);
            const proposedCommodities = getCommodities(proposedYearDataArray);
            return {
                year,
                current: {
                    totalPayment: currentTotal,
                    commodities: currentCommodities
                },
                proposed: {
                    totalPayment: proposedTotal,
                    commodities: proposedCommodities
                }
            };
        });
        setProcessedData(processed);
    }, [data]);
    React.useEffect(() => {
        processData();
    }, [processData]);
    React.useEffect(() => {
        if (processedData.length === 0 || containerWidth === 0) return;
        renderChart();
    }, [processedData, containerWidth, height, selectedCommodities]);

    React.useEffect(() => {
        if (processedData.length > 0 && selectedCommodities.length === 0) {
            const allCommodities = Array.from(
                new Set(
                    processedData.flatMap((d) => [
                        ...d.current.commodities.map((c) => c.commodityName),
                        ...d.proposed.commodities.map((c) => c.commodityName)
                    ])
                )
            );
            setSelectedCommodities(allCommodities);
        }
    }, [processedData]);

    const renderChart = () => {
        if (!svgRef.current || processedData.length === 0) return;
        const chartWidth = width || containerWidth;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const graphWidth = chartWidth - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;

        const defs = svg.append("defs");
        const pattern = defs
            .append("pattern")
            .attr("id", "stripes")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 4)
            .attr("height", 4);
        pattern.append("rect").attr("width", 4).attr("height", 4).attr("fill", "rgba(255,255,255,0.3)");
        pattern
            .append("path")
            .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
            .attr("stroke", "rgba(255,255,255,0.6)")
            .attr("stroke-width", 0.5);

        const allCommoditiesInChart = Array.from(
            new Set(
                processedData.flatMap((d) => [
                    ...d.current.commodities.map((c) => c.commodityName),
                    ...d.proposed.commodities.map((c) => c.commodityName)
                ])
            )
        );
        const commodityColors = generateColorPalette(allCommoditiesInChart);
        const legend = svg.append("g").attr("class", "legend").attr("transform", `translate(${margin.left}, 20)`);
        const minItemWidth = 90;
        const maxItemsPerRow = Math.max(1, Math.floor(graphWidth / minItemWidth));
        const actualItemsPerRow = Math.min(maxItemsPerRow, allCommoditiesInChart.length);
        const legendItemWidth = graphWidth / actualItemsPerRow;
        const legendRows = Math.ceil(allCommoditiesInChart.length / actualItemsPerRow);
        const itemsPerRow = actualItemsPerRow;
        allCommoditiesInChart.forEach((commodity, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            const x = col * legendItemWidth;
            const y = row * 32;
            const isSelected = selectedCommodities.length === 0 || selectedCommodities.includes(commodity);
            const legendItem = legend
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", `translate(${x}, ${y})`)
                .style("cursor", "pointer");
            const rectSize = Math.min(20, Math.max(16, legendItemWidth * 0.12));
            const fontSize = Math.min(16, Math.max(12, legendItemWidth * 0.1));
            legendItem
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", rectSize)
                .attr("height", rectSize)
                .attr("fill", commodityColors[commodity] || "#999")
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("rx", 2)
                .attr("opacity", 0.8);
            if (isSelected && selectedCommodities.length > 0) {
                const checkmarkScale = rectSize / 14;
                legendItem
                    .append("path")
                    .attr(
                        "d",
                        `M${3 * checkmarkScale},${7 * checkmarkScale} L${6 * checkmarkScale},${10 * checkmarkScale} L${
                            11 * checkmarkScale
                        },${3 * checkmarkScale}`
                    )
                    .attr("stroke", "white")
                    .attr("stroke-width", 2 * checkmarkScale)
                    .attr("fill", "none")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round");
            }
            legendItem
                .append("text")
                .attr("x", rectSize + 6)
                .attr("y", rectSize / 2 + 2)
                .text(commodity)
                .style("font-size", `${fontSize}px`)
                .style("fill", "#00000099")
                .style("font-family", "Roboto, sans-serif")
                .style("dominant-baseline", "middle");
            const strikeRectSize = Math.min(14, Math.max(10, legendItemWidth * 0.08));
            const textWidth = commodity.length * fontSize * 0.55;
            legendItem
                .append("rect")
                .attr("x", rectSize + 6 + textWidth + 6)
                .attr("y", rectSize / 2 - strikeRectSize / 2)
                .attr("width", strikeRectSize)
                .attr("height", strikeRectSize)
                .attr("fill", commodityColors[commodity] || "#999")
                .attr("opacity", 0.8)
                .style("fill", "url(#stripes)")
                .attr("rx", 1);
            legendItem.on("click", function handleLegendClick() {
                if (selectedCommodities.includes(commodity)) {
                    if (selectedCommodities.length > 1) {
                        setSelectedCommodities((prev) => prev.filter((c) => c !== commodity));
                    }
                } else {
                    setSelectedCommodities((prev) => [...prev, commodity]);
                }
            });
        });

        const xScale = d3
            .scaleBand()
            .domain(processedData.map((d) => d.year))
            .range([0, graphWidth])
            .paddingInner(0.4)
            .paddingOuter(0.2);
        const barWidth = xScale.bandwidth() / 2.5;
        const barGap = barWidth * 0.3;
        const maxCurrent = d3.max(processedData, (d) => d.current.totalPayment) || 0;
        const maxProposed = d3.max(processedData, (d) => d.proposed.totalPayment) || 0;
        const maxValue = Math.max(maxCurrent, maxProposed);

        const yScaleChart = d3
            .scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([graphHeight, 0]);

        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3
            .axisLeft(yScaleChart)
            .tickFormat((d) => `$${ShortFormatInteger(d as number)}`)
            .tickSizeOuter(0);

        const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

        chartGroup
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#2F7164")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "bold");

        chartGroup
            .append("text")
            .attr("transform", `translate(${graphWidth / 2}, ${graphHeight + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#2F7164")
            .style("font-size", "0.85rem")
            .style("font-family", "Roboto, sans-serif")
            .text("Fiscal Year");

        chartGroup.append("g").attr("class", "y-left axis").call(yAxis).selectAll("text").style("fill", "#00000099");

        chartGroup
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - graphHeight / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#00000099")
            .style("font-size", "0.85rem")
            .style("font-family", "Roboto, sans-serif")
            .text("Payment Amount ($)");

        const gridLines = chartGroup.append("g").attr("class", "grid");
        gridLines
            .selectAll(".grid-line")
            .data(yScaleChart.ticks())
            .enter()
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("x2", graphWidth)
            .attr("y1", (d) => yScaleChart(d))
            .attr("y2", (d) => yScaleChart(d));
        const drawStackedBars = (
            chartData: YearData[],
            type: "current" | "proposed",
            color: string,
            xOffset: number,
            yScale: d3.ScaleLinear<number, number>
        ) => {
            chartData.forEach((yearData) => {
                const commodityData = yearData[type].commodities;
                const visibleCommodities =
                    selectedCommodities.length === 0
                        ? commodityData
                        : commodityData.filter((c) => selectedCommodities.includes(c.commodityName));
                let cumulativeHeight = 0;
                const totalPayment =
                    selectedCommodities.length === 0
                        ? yearData[type].totalPayment
                        : visibleCommodities.reduce((sum, c) => sum + c.totalPaymentInDollars, 0);

                chartGroup
                    .append("text")
                    .attr("x", (xScale(yearData.year) || 0) + xOffset + barWidth / 2)
                    .attr("y", yScale(totalPayment) - 8)
                    .attr("text-anchor", "middle")
                    .style("font-size", "0.7rem")
                    .style("font-family", "Roboto, sans-serif")
                    .style("fill", type === "current" ? "#FF8C00" : "rgb(1, 87, 155)")
                    .style("font-weight", "600")
                    .style("opacity", 1)
                    .text(`$${ShortFormatInteger(totalPayment)}`);
                visibleCommodities.forEach((commodity) => {
                    const barHeight = graphHeight - yScale(commodity.totalPaymentInDollars);
                    const commodityColor = commodityColors[commodity.commodityName] || color;
                    const rect = chartGroup
                        .append("rect")
                        .attr("class", "bar")
                        .attr("x", (xScale(yearData.year) || 0) + xOffset)
                        .attr("y", yScale(cumulativeHeight + commodity.totalPaymentInDollars))
                        .attr("width", barWidth)
                        .attr("height", barHeight)
                        .attr("fill", commodityColor)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.8);
                    if (type === "proposed") {
                        chartGroup
                            .append("rect")
                            .attr("class", "bar-stripe")
                            .attr("x", (xScale(yearData.year) || 0) + xOffset)
                            .attr("y", yScale(cumulativeHeight + commodity.totalPaymentInDollars))
                            .attr("width", barWidth)
                            .attr("height", barHeight)
                            .attr("fill", "url(#stripes)")
                            .attr("opacity", 0.6)
                            .style("pointer-events", "none");
                    }
                    rect.on("mouseover", function onMouseOver(event) {
                        if (tooltipRef.current) {
                            const tooltip = d3.select(tooltipRef.current);
                            tooltip
                                .style("opacity", 1)
                                .style("left", `${event.clientX + 10}px`)
                                .style("top", `${event.clientY - 10}px`).html(`
                                    <strong>${commodity.commodityName}</strong><br/>
                                    Fiscal Year: ${yearData.year}<br/>
                                    Type: ${type === "current" ? currentLabel : proposedLabel}<br/>
                                    Payment: $${ShortFormatInteger(commodity.totalPaymentInDollars)}<br/>
                                    <em>Total ${type}: $${ShortFormatInteger(totalPayment)}</em>
                                `);
                        }
                    }).on("mouseout", function onMouseOut() {
                        if (tooltipRef.current) {
                            d3.select(tooltipRef.current).style("opacity", 0);
                        }
                    });
                    cumulativeHeight += commodity.totalPaymentInDollars;
                });
            });
        };
        drawStackedBars(processedData, "current", "#FF8C00", 0, yScaleChart);
        drawStackedBars(processedData, "proposed", "rgb(1, 87, 155)", barWidth + barGap, yScaleChart);
        processedData.forEach((yearData) => {
            chartGroup
                .append("text")
                .attr("x", (xScale(yearData.year) || 0) + barWidth / 2)
                .attr("y", graphHeight + 10)
                .attr("text-anchor", "middle")
                .style("font-size", "0.5rem")
                .style("font-family", "Roboto, sans-serif")
                .style("fill", "#FF8C00")
                .style("font-weight", "700")
                .text(chartCurrentLabel);
            chartGroup
                .append("text")
                .attr("x", (xScale(yearData.year) || 0) + barWidth + barGap + barWidth / 2)
                .attr("y", graphHeight + 10)
                .attr("text-anchor", "middle")
                .style("font-size", "0.5rem")
                .style("font-family", "Roboto, sans-serif")
                .style("fill", "rgb(1, 87, 155)")
                .style("font-weight", "700")
                .text(chartProposedLabel);
        });
        svg.attr("width", chartWidth).attr("height", height);
    };
    return (
        <StyledContainer ref={containerRef}>
            <svg ref={svgRef} />
            <div ref={tooltipRef} className="tooltip" style={{ opacity: 0 }} />
            <CommoditySummaryTable
                data={processedData}
                selectedCommodities={selectedCommodities}
                currentLabel={currentLabel}
                proposedLabel={proposedLabel}
            />
        </StyledContainer>
    );
}
