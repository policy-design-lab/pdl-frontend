import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from "@mui/material";
import { ShortFormat, CurrencyFormat } from "../shared/ConvertionFormats";

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

interface PolicyBarChartProps {
    data: any;
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
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
    Corn: "#2F7164",
    Wheat: "#8B4513",
    Soybeans: "#ebe288",
    Cotton: "#4a4a4a",
    Peanuts: "#dc2626",
    Rice: "#1e90ff",
    Sorghum: "#4a148c",
    Barley: "#DAA520",
    Oats: "#B8860B"
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
            colorIndex++;
        }
    });
    return colors;
};

const CommoditySummaryTable: React.FC<{ 
    data: YearData[]; 
    selectedCommodities: string[]; 
    setSelectedCommodities: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ data, selectedCommodities, setSelectedCommodities }) => {
    const commoditySummaries = React.useMemo(() => {
        const summaryMap = new Map<string, { currentTotal: number; proposedTotal: number }>();
        
        data.forEach(yearData => {
            yearData.current.commodities.forEach(commodity => {
                if (selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName)) {
                    const existing = summaryMap.get(commodity.commodityName) || { currentTotal: 0, proposedTotal: 0 };
                    existing.currentTotal += commodity.totalPaymentInDollars;
                    summaryMap.set(commodity.commodityName, existing);
                }
            });
            
            yearData.proposed.commodities.forEach(commodity => {
                if (selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName)) {
                    const existing = summaryMap.get(commodity.commodityName) || { currentTotal: 0, proposedTotal: 0 };
                    existing.proposedTotal += commodity.totalPaymentInDollars;
                    summaryMap.set(commodity.commodityName, existing);
                }
            });
        });
        
        return Array.from(summaryMap.entries()).map(([commodityName, totals]) => ({
            commodityName,
            currentTotal: totals.currentTotal,
            proposedTotal: totals.proposedTotal
        })).sort((a, b) => b.currentTotal - a.currentTotal);
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
                10-Year Payment Totals by Commodity
                {selectedCommodities.length > 0 && (
                    <Typography 
                        component="span" 
                        sx={{ 
                            fontSize: "0.8rem", 
                            ml: 2, 
                            color: "#666",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                        onClick={() => {
                            setSelectedCommodities([]);
                        }}
                    >
                        (Clear Selection)
                    </Typography>
                )}
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                                Commodity
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f5f5f5", color: "#FF8C00" }}>
                                Current Policy
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f5f5f5", color: "rgb(1, 87, 155)" }}>
                                Proposed Policy
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                                Difference
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {commoditySummaries.map((commodity) => {
                            const difference = commodity.proposedTotal - commodity.currentTotal;
                            const isSelected = selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName);
                            return (
                                <TableRow 
                                    key={commodity.commodityName} 
                                    hover
                                    sx={{ 
                                        backgroundColor: isSelected ? "#f0f8ff" : "inherit",
                                        "&:hover": { backgroundColor: isSelected ? "#e6f3ff" : "#f5f5f5" }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: isSelected ? 600 : 500 }}>
                                        {commodity.commodityName}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "#FF8C00", fontWeight: isSelected ? 600 : 400 }}>
                                        {CurrencyFormat(commodity.currentTotal)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "rgb(1, 87, 155)", fontWeight: isSelected ? 600 : 400 }}>
                                        {CurrencyFormat(commodity.proposedTotal)}
                                    </TableCell>
                                    <TableCell 
                                        align="right" 
                                        sx={{ 
                                            color: "rgb(156, 39, 176)",
                                            fontWeight: isSelected ? 600 : 500
                                        }}
                                    >
                                        {difference >= 0 ? "+" : ""}{CurrencyFormat(difference)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{ borderTop: 2, borderColor: "#2F7164" }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                                Overall Total
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "#FF8C00", fontSize: "1rem" }}>
                                {CurrencyFormat(overallTotals.currentTotal)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "rgb(1, 87, 155)", fontSize: "1rem" }}>
                                {CurrencyFormat(overallTotals.proposedTotal)}
                            </TableCell>
                            <TableCell 
                                align="right" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: "rgb(156, 39, 176)",
                                    fontSize: "1rem"
                                }}
                            >
                                {(overallTotals.proposedTotal - overallTotals.currentTotal) >= 0 ? "+" : ""}
                                {CurrencyFormat(overallTotals.proposedTotal - overallTotals.currentTotal)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default function PolicyBarChart({
    data,
    width,
    height = 400,
    margin = { top: 60, right: 80, bottom: 80, left: 80 }
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
        const years = Object.keys(data.current);
        const processed: YearData[] = years.map((year) => {
            const currentYearDataArray = data.current[year] || [];
            const proposedYearDataArray = data.proposed[year] || [];
            const getCurrentTotal = (yearDataArray: any[]) => {
                if (!yearDataArray || yearDataArray.length === 0) return 0;
                let total = 0;
                yearDataArray.forEach(yearData => {
                    if (!yearData?.counties) return;
                    yearData.counties.forEach((county: any) => {
                        total += county.scenarios?.[0]?.totalPaymentInDollars || 0;
                    });
                });
                return total;
            };
            
            const getCommodities = (yearDataArray: any[]) => {
                if (!yearDataArray || yearDataArray.length === 0) return [];
                const commodityMap = new Map<string, number>();
                
                yearDataArray.forEach(yearData => {
                    if (!yearData?.counties) return;
                    yearData.counties.forEach((county: any) => {
                        county.scenarios?.[0]?.commodities?.forEach((commodity: any) => {
                            const name = commodity.commodityName;
                            const payment =
                                commodity.programs?.reduce(
                                    (sum: number, program: any) => sum + (program.totalPaymentInDollars || 0),
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
    const renderChart = () => {
        if (!svgRef.current || processedData.length === 0) return;
        const chartWidth = width || containerWidth;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const graphWidth = chartWidth - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;
        
        const defs = svg.append("defs");
        const pattern = defs.append("pattern")
            .attr("id", "stripes")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 4)
            .attr("height", 4);
        pattern.append("rect")
            .attr("width", 4)
            .attr("height", 4)
            .attr("fill", "rgba(255,255,255,0.3)");
        pattern.append("path")
            .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
            .attr("stroke", "rgba(255,255,255,0.6)")
            .attr("stroke-width", 0.5);
        
        const allCommodities = Array.from(
            new Set(
                processedData.flatMap((d) => [
                    ...d.current.commodities.map((c) => c.commodityName),
                    ...d.proposed.commodities.map((c) => c.commodityName)
                ])
            )
        );
        const commodityColors = generateColorPalette(allCommodities);
        const legend = svg.append("g").attr("class", "legend").attr("transform", `translate(${margin.left}, 20)`);
        const legendItemWidth = Math.min(140, graphWidth / allCommodities.length);
        const legendRows = Math.ceil((allCommodities.length * legendItemWidth) / graphWidth);
        const itemsPerRow = Math.ceil(allCommodities.length / legendRows);
        allCommodities.forEach((commodity, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            const x = col * legendItemWidth;
            const y = row * 25;
            const isSelected = selectedCommodities.length === 0 || selectedCommodities.includes(commodity);
            
            const legendItem = legend
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", `translate(${x}, ${y})`)
                .style("cursor", "pointer");
            if (isSelected && selectedCommodities.length > 0) {
                legendItem
                    .append("path")
                    .attr("d", "M3,7 L6,10 L11,3")
                    .attr("stroke", "white")
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round");
            }
            
            legendItem
                .append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(commodity)
                .style("font-size", "0.75rem")
                .style("fill", "#00000099")
                .style("font-family", "Roboto, sans-serif");
             legendItem.on("click", function() {
                if (selectedCommodities.includes(commodity)) {
                    setSelectedCommodities(prev => prev.filter(c => c !== commodity));
                } else {
                    setSelectedCommodities(prev => [...prev, commodity]);
                }
            });
        });
        const policyLegend = svg
            .append("g")
            .attr("class", "policy-legend")
            .attr("transform", `translate(${margin.left + graphWidth - 250}, 20)`);
        const currentLegendItem = policyLegend.append("g").attr("class", "legend-item");
        currentLegendItem
            .append("rect")
            .attr("width", 16)
            .attr("height", 12)
            .attr("fill", "#FF8C00")
            .attr("opacity", 0.8);
        currentLegendItem
            .append("text")
            .attr("x", 20)
            .attr("y", 9)
            .text("Current Policy")
            .style("font-size", "0.75rem")
            .style("fill", "#FF8C00")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "500");
        const proposedLegendItem = policyLegend
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", "translate(120, 0)");
        proposedLegendItem
            .append("rect")
            .attr("width", 16)
            .attr("height", 12)
            .attr("fill", "rgb(1, 87, 155)")
            .attr("opacity", 0.8);
        proposedLegendItem
            .append("rect")
            .attr("width", 16)
            .attr("height", 12)
            .attr("fill", "url(#stripes)")
            .attr("opacity", 0.6);
        proposedLegendItem
            .append("text")
            .attr("x", 20)
            .attr("y", 9)
            .text("Proposed Policy")
            .style("font-size", "0.75rem")
            .style("fill", "rgb(1, 87, 155)")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "500");
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

        const yScale = d3
            .scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([graphHeight, 0]);

        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3
            .axisLeft(yScale)
            .tickFormat((d) => `$${ShortFormat(d as number)}`)
            .tickSizeOuter(0);

        const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

        chartGroup
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${graphHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#2F7164")
            .style("font-family", "Roboto, sans-serif");

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
            .data(yScale.ticks())
            .enter()
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("x2", graphWidth)
            .attr("y1", (d) => yScale(d))
            .attr("y2", (d) => yScale(d));
        const drawStackedBars = (
            chartData: YearData[],
            type: "current" | "proposed",
            color: string,
            xOffset: number,
            yScale: d3.ScaleLinear<number, number>
        ) => {
            chartData.forEach((yearData) => {
                const allCommodities = yearData[type].commodities;
                const visibleCommodities = selectedCommodities.length === 0 ? 
                    allCommodities : 
                    allCommodities.filter(c => selectedCommodities.includes(c.commodityName));
                let cumulativeHeight = 0;
                const totalPayment = selectedCommodities.length === 0 ?
                    yearData[type].totalPayment :
                    visibleCommodities.reduce((sum, c) => sum + c.totalPaymentInDollars, 0);
                    
                allCommodities.forEach((commodity) => {
                    const isVisible = selectedCommodities.length === 0 || selectedCommodities.includes(commodity.commodityName);
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
                        .attr("opacity", isVisible ? 0.8 : 0.2);                     
                    if (type === "proposed") {
                        chartGroup
                            .append("rect")
                            .attr("class", "bar-stripe")
                            .attr("x", (xScale(yearData.year) || 0) + xOffset)
                            .attr("y", yScale(cumulativeHeight + commodity.totalPaymentInDollars))
                            .attr("width", barWidth)
                            .attr("height", barHeight)
                            .attr("fill", "url(#stripes)")
                            .attr("opacity", isVisible ? 0.6 : 0.1)
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
                                    Year: ${yearData.year}<br/>
                                    Type: ${type === "current" ? "Current Policy" : "Proposed Policy"}<br/>
                                    Payment: ${CurrencyFormat(commodity.totalPaymentInDollars)}<br/>
                                    <em>Total ${type}: ${CurrencyFormat(totalPayment)}</em>
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
        drawStackedBars(processedData, "current", "#FF8C00", 0, yScale);
        drawStackedBars(processedData, "proposed", "rgb(1, 87, 155)", barWidth + barGap, yScale);
        svg.attr("width", chartWidth).attr("height", height);
    };
    return (
        <StyledContainer ref={containerRef}>
            <svg ref={svgRef} />
            <div ref={tooltipRef} className="tooltip" style={{ opacity: 0 }} />
            <CommoditySummaryTable data={processedData} selectedCommodities={selectedCommodities} setSelectedCommodities={setSelectedCommodities} />
        </StyledContainer>
    );
}
