import * as React from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import { ShortFormat } from "./ConvertionFormats";
import "../../styles/drawLegend.css";
import { processRegionsInRange, TooltipData } from "./LegendTooltipUtils";
import LegendTooltipContent from "./LegendTooltipContent";

type RectHoverCallback = (index: number, data?: any) => void;

export default function DrawLegendNew({
    isRatio = false,
    notDollar = false,
    colorScale,
    title,
    programData,
    prepColor,
    emptyState = [],
    countyData = {},
    showPercentileExplanation = false,
    onRectHover = null,
    stateCodeToName = {},
    showTooltips = false,
    regionType = "county"
}: {
    isRatio?: boolean;
    notDollar?: boolean;
    colorScale: any;
    title: React.ReactNode;
    programData: number[];
    prepColor: string[];
    emptyState?: string[];
    countyData?: Record<string, any>;
    showPercentileExplanation?: boolean;
    onRectHover?: RectHoverCallback | null;
    stateCodeToName: Record<string, string>;
    showTooltips?: boolean;
    regionType?: string;
}): JSX.Element {
    const legendRn = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const margin = 40;
    const [width, setWidth] = React.useState(992);
    const [tooltipData, setTooltipData] = React.useState<TooltipData | null>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    const [percentileRanges, setPercentileRanges] = React.useState<string[]>([]);
    const [activeRectIndex, setActiveRectIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        const trackMousePosition = (e: MouseEvent) => {
            if (activeRectIndex !== null) {
                setTooltipPosition({
                    x: e.clientX,
                    y: e.clientY
                });
            }
        };
        window.addEventListener("mousemove", trackMousePosition);
        return () => {
            window.removeEventListener("mousemove", trackMousePosition);
        };
    }, [activeRectIndex]);

    React.useEffect(() => {
        if (programData.length === 0) {
            setPercentileRanges([]);
            return;
        }
        const customScale = colorScale.domain();
        const minValue = Math.min(...programData);
        const localCutPoints = customScale[0] === minValue ? [...customScale] : [minValue, ...customScale];
        const segmentCount = localCutPoints.length - 1;
        const newPercentileRanges: string[] = [];
        const sortedData = [...programData].sort((a, b) => a - b);
        for (let i = 0; i < segmentCount; i++) {
            const lowerValue = localCutPoints[i];
            const upperValue = localCutPoints[i + 1];
            const lowerPercentile = (sortedData.findIndex((v) => v >= lowerValue) / sortedData.length) * 100;
            const upperPercentile =
                i === segmentCount - 1 ? 100 : (sortedData.findIndex((v) => v >= upperValue) / sortedData.length) * 100;
            const startPercent = Math.round(lowerPercentile);
            const endPercent = Math.round(upperPercentile);
            newPercentileRanges.push(`${startPercent}% - ${endPercent}%`);
        }
        setPercentileRanges(newPercentileRanges);
    }, [programData, colorScale]);

    React.useEffect(() => {
        const updateWidth = () => {
            if (legendRn.current) {
                requestAnimationFrame(() => {
                    const containerWidth = legendRn.current
                        ? (legendRn.current as HTMLElement).parentElement?.offsetWidth ?? 0
                        : 0;
                    if (containerWidth > 0 && containerWidth !== width) {
                        setWidth(containerWidth);
                    }
                });
            }
        };
        updateWidth();
        const observer = new ResizeObserver(() => {
            updateWidth();
        });
        if (legendRn.current?.parentElement) {
            observer.observe(legendRn.current.parentElement);
        }
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (percentileRanges.length > 0) {
            drawLegend();
        }
    }, [width, countyData, percentileRanges]);
    const drawLegend = () => {
        if (legendRn.current && width > 0) {
            d3.select(legendRn.current).selectAll("svg").remove();
            const baseSVG = d3
                .select(legendRn.current)
                .append("svg")
                .attr("width", "100%")
                .attr("height", showPercentileExplanation ? 140 : 110)
                .attr("viewBox", `0 0 ${width} ${showPercentileExplanation ? 140 : 110}`)
                .attr("preserveAspectRatio", "xMinYMid meet");

            const customScale = colorScale.domain();
            const minValue = Math.min(...programData);
            const cut_points = customScale[0] === minValue ? [...customScale] : [minValue, ...customScale];
            const segmentCount = cut_points.length - 1;
            if (Math.min(...programData) !== Infinity && Math.max(...programData) !== Infinity) {
                baseSVG.selectAll("text").remove();
                baseSVG.selectAll("rect").remove();
                const data_distribution: number[] = [];
                let totalValueSum = 0;
                for (let i = 0; i < segmentCount; i++) {
                    const lowerValue = cut_points[i];
                    const upperValue = cut_points[i + 1];
                    let countInRange;
                    if (i === segmentCount - 1) {
                        countInRange = programData.filter((d) => d >= lowerValue).length;
                    } else {
                        countInRange = programData.filter((d) => d >= lowerValue && d < upperValue).length;
                    }
                    const segmentValue = countInRange > 0 ? countInRange : Math.max(1, programData.length * 0.01);
                    data_distribution.push(segmentValue);
                    totalValueSum += segmentValue;
                }
                for (let i = 0; i < data_distribution.length; i++) {
                    data_distribution[i] = data_distribution[i] / totalValueSum;
                }
                const svgWidth = width - margin * 2;
                const hasValidDistribution = programData.length > 0;

                if (hasValidDistribution) {
                    const segments = baseSVG
                        .selectAll("g.segment")
                        .data(data_distribution)
                        .enter()
                        .append("g")
                        .attr("class", "segment")
                        .attr("data-index", (d, i) => i);
                    const segmentPositions: number[] = [];
                    let currentPosition = margin;
                    for (let i = 0; i < data_distribution.length; i++) {
                        segmentPositions.push(currentPosition);
                        currentPosition += data_distribution[i] * svgWidth;
                    }
                    segmentPositions.push(currentPosition);
                    segments
                        .append("rect")
                        .attr("class", "legendRect")
                        .attr("data-index", (d, i) => i)
                        .attr("id", (d, i) => `legendRect${i}`)
                        .attr("x", (d, i) => segmentPositions[i])
                        .attr("y", () => 20)
                        .attr("width", (d) => d * svgWidth)
                        .attr("height", 20)
                        .style("fill", (d, i) => prepColor[i])
                        .style("cursor", "pointer")
                        .on("mouseover", function (this: SVGRectElement) {
                            const rectIndex = parseInt(d3.select(this).attr("data-index"), 10);
                            if (percentileRanges.length === 0) {
                                return;
                            }
                            if (isNaN(rectIndex) || rectIndex < 0 || rectIndex >= percentileRanges.length) {
                                return;
                            }
                            setActiveRectIndex(rectIndex);
                            const binRange = percentileRanges[rectIndex];
                            const min = cut_points[rectIndex];
                            const max = cut_points[rectIndex + 1];
                            const { minRegion, maxRegion, regionCount } = processRegionsInRange(
                                countyData,
                                min,
                                max,
                                stateCodeToName,
                                regionType
                            );
                            setTooltipData({
                                percentileRange: binRange,
                                regionCount,
                                minRegion: regionCount > 0 ? minRegion : "N/A",
                                maxRegion: regionCount > 0 ? maxRegion : "N/A",
                                rectIndex
                            });
                            const rectDOMBounds = this.getBoundingClientRect();
                            setTooltipPosition({
                                x: rectDOMBounds.left + rectDOMBounds.width / 2,
                                y: rectDOMBounds.top
                            });
                            setTooltipVisible(true);
                            d3.select(this).classed("tooltip-visible", true);
                            if (onRectHover) {
                                onRectHover(rectIndex, d3.select(this).datum());
                            }
                        })
                        .on("mouseout", function (this: SVGRectElement) {
                            const rectIndex = parseInt(d3.select(this).attr("data-index"), 10);
                            if (isNaN(rectIndex) || rectIndex < 0 || rectIndex >= percentileRanges.length) {
                                return;
                            }
                            d3.select(this).classed("tooltip-visible", false);
                            setActiveRectIndex(null);
                            setTooltipVisible(false);
                        })
                        .on("click", function (this: SVGRectElement) {
                            const rectIndex = parseInt(d3.select(this).attr("data-index"), 10);
                            if (isNaN(rectIndex) || rectIndex < 0 || rectIndex >= percentileRanges.length) {
                                return;
                            }
                            if (onRectHover) {
                                onRectHover(rectIndex, d3.select(this).datum());
                            }
                        });
                    const uniquePositions = segmentPositions;
                    const uniqueCutPoints: number[] = [];
                    for (let i = 0; i < cut_points.length; i++) {
                        uniqueCutPoints.push(cut_points[i]);
                    }

                    if (svgWidth > 1690) {
                        baseSVG
                            .selectAll(null)
                            .data(uniquePositions)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d, i) => `legendText${i}`)
                            .attr("y", 60)
                            .attr("x", (d) => d)
                            .attr("text-anchor", "middle")
                            .style("font-size", "11px")
                            .text((d, i) => {
                                if (isRatio) {
                                    return `${Math.round(uniqueCutPoints[i] * 100)}%`;
                                }
                                if (!notDollar) {
                                    const res = ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                            });
                    } else {
                        baseSVG
                            .selectAll(null)
                            .data(uniquePositions)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d, i) => `legendText${i}`)
                            .attr("y", (d, i) => (i % 2 === 0 ? 60 : 10))
                            .attr("x", (d) => d)
                            .attr("text-anchor", "middle")
                            .style("font-size", "11px")
                            .text((d, i) => {
                                if (isRatio) {
                                    return `${Math.round(uniqueCutPoints[i] * 100)}%`;
                                }
                                if (!notDollar) {
                                    const res = ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                            });
                    }

                    if (showPercentileExplanation) {
                        baseSVG
                            .append("text")
                            .attr("class", "legendTextExplanation")
                            .attr("x", width / 2)
                            .attr("y", 100)
                            .attr("text-anchor", "middle")
                            .style("font-size", "11px")
                            .text(
                                "Counties are grouped by percentile ranges based on their actual payment values or rates, not by count. Hover for details."
                            );
                    }

                    if (emptyState.length !== 0) {
                        const zeroState = emptyState.filter((item, index) => emptyState.indexOf(item) === index);
                        const middleText = baseSVG
                            .append("text")
                            .attr("class", "legendTextSide")
                            .attr("x", -1000)
                            .attr("y", -1000)
                            .text(`${zeroState.join(", ")} has no data available`);
                        const middleBox = middleText.node().getBBox();
                        middleText.remove();
                        baseSVG
                            .append("text")
                            .attr("class", "legendTextSide")
                            .attr("x", (svgWidth + margin * 2) / 2 - middleBox.width / 2)
                            .attr("y", showPercentileExplanation ? 120 : 90)
                            .text(`${zeroState.join(", ")} has no data available`);
                    } else {
                        baseSVG
                            .append("text")
                            .attr("class", "legendTextSide")
                            .attr("x", width / 2 - 150)
                            .attr("y", showPercentileExplanation ? 120 : 90)
                            .text("Gray states indicate no available data or a value of 0");
                    }
                } else {
                    baseSVG.attr("height", showPercentileExplanation ? 140 : 110);
                    const noDataMessage =
                        programData.length === 0
                            ? "There is no data available for the current selection"
                            : "There isn't sufficient data distribution to display a detailed legend";
                    baseSVG
                        .append("text")
                        .attr("class", "legendTextSide")
                        .attr("text-anchor", "middle")
                        .attr("x", width / 2)
                        .attr("y", 45)
                        .style("font-size", "14px")
                        .text(noDataMessage);
                    if (programData.length > 0) {
                        const minValue = Math.min(...programData);
                        const maxValue = Math.max(...programData);

                        if (isFinite(minValue) && isFinite(maxValue)) {
                            baseSVG
                                .append("text")
                                .attr("class", "legendTextSide")
                                .attr("text-anchor", "middle")
                                .attr("x", width / 2)
                                .attr("y", 70)
                                .style("font-size", "12px")
                                .text(
                                    `Range: ${
                                        isRatio
                                            ? `${Math.round(minValue * 100)}%`
                                            : ShortFormat(minValue.toFixed(2), -1, 2)
                                    } to ${
                                        isRatio
                                            ? `${Math.round(maxValue * 100)}%`
                                            : ShortFormat(maxValue.toFixed(2), -1, 2)
                                    }`
                                );
                        }
                    }
                }
            }
        }
    };
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 560,
                position: "relative"
            }}
        >
            <Box display="flex" justifyContent="center">
                <Typography variant="h5" sx={{ mb: 1 }}>
                    <strong>{title}</strong>
                </Typography>
            </Box>
            <div ref={legendRn} className="MapLegendSVG" />
            {tooltipData && tooltipVisible && showTooltips && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: "fixed",
                        top: `${tooltipPosition.y - 120}px`,
                        left: `${tooltipPosition.x}px`,
                        transform: "translateX(-50%)",
                        backgroundColor: "white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "12px",
                        zIndex: 9999,
                        width: "300px",
                        pointerEvents: "none"
                    }}
                >
                    <LegendTooltipContent tooltipData={tooltipData} notDollar={notDollar} regionType={regionType} />
                </div>
            )}
        </Box>
    );
}
