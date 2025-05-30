import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
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
    Cotton: "#ECF0EE",
    Peanuts: "#DEB887",
    Rice: "#F5DEB3",
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
            const currentYearData = data.current[year]?.[0];
            const proposedYearData = data.proposed[year]?.[0];
            const getCurrentTotal = (yearData: any) => {
                if (!yearData?.counties) return 0;
                return yearData.counties.reduce((total: number, county: any) => {
                    return total + (county.scenarios?.[0]?.totalPaymentInDollars || 0);
                }, 0);
            };
            const getCommodities = (yearData: any) => {
                if (!yearData?.counties) return [];
                const commodityMap = new Map<string, number>();
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
                return Array.from(commodityMap.entries()).map(([name, total]) => ({
                    commodityName: name,
                    totalPaymentInDollars: total
                }));
            };
            return {
                year,
                current: {
                    totalPayment: getCurrentTotal(currentYearData),
                    commodities: getCommodities(currentYearData)
                },
                proposed: {
                    totalPayment: getCurrentTotal(proposedYearData),
                    commodities: getCommodities(proposedYearData)
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
    }, [processedData, containerWidth, height]);
    const renderChart = () => {
        if (!svgRef.current || processedData.length === 0) return;
        const chartWidth = width || containerWidth;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const graphWidth = chartWidth - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;
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
        const legendItemWidth = Math.min(120, graphWidth / allCommodities.length);
        const legendRows = Math.ceil((allCommodities.length * legendItemWidth) / graphWidth);
        const itemsPerRow = Math.ceil(allCommodities.length / legendRows);
        allCommodities.forEach((commodity, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            const x = col * legendItemWidth;
            const y = row * 20;
            const legendItem = legend
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", `translate(${x}, ${y})`);
            legendItem
                .append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", commodityColors[commodity] || "#999");
            legendItem
                .append("text")
                .attr("x", 16)
                .attr("y", 9)
                .text(commodity)
                .style("font-size", "0.75rem")
                .style("fill", "#00000099")
                .style("font-family", "Roboto, sans-serif");
        });
        const policyLegend = svg
            .append("g")
            .attr("class", "policy-legend")
            .attr("transform", `translate(${margin.left + graphWidth - 200}, 20)`);
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
                const commodities = yearData[type].commodities;
                let cumulativeHeight = 0;
                const totalPayment = yearData[type].totalPayment;
                const totalLabel = chartGroup
                    .append("text")
                    .attr("x", (xScale(yearData.year) || 0) + xOffset + barWidth / 2)
                    .attr("y", yScale(totalPayment) - 8)
                    .attr("text-anchor", "middle")
                    .style("font-size", "0.7rem")
                    .style("font-family", "Roboto, sans-serif")
                    .style("fill", type === "current" ? "#FF8C00" : "rgb(1, 87, 155)")
                    .style("font-weight", "600")
                    .style("opacity", 0)
                    .text(`$${ShortFormat(totalPayment)}`);
                commodities.forEach((commodity) => {
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
                    rect.on("mouseover", function onMouseOver(event) {
                        totalLabel.style("opacity", 1);
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
                        totalLabel.style("opacity", 0);
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
        </StyledContainer>
    );
}
