import * as React from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { ShortFormat } from "./ConvertionFormats";
import "../../styles/drawLegend.css";
import { processRegionsInRange, TooltipData } from "./LegendTooltipUtils";
import LegendTooltipContent from "./LegendTooltipContent";
import { PercentileMode } from "../hModel/CountyCommodityMap/percentileConfig";

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
    regionType = "county",
    percentileMode = "default"
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
    percentileMode?: string;
}): JSX.Element {
    const legendRn = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
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
    const updateWidthAndDraw = React.useCallback(() => {
        if (containerRef.current) {
            const newWidth = containerRef.current.offsetWidth || 992;
            if (newWidth > 0 && Math.abs(newWidth - width) > 20) {
                setWidth(newWidth);
            }
        }
    }, [width]);
    React.useEffect(() => {
        updateWidthAndDraw();
        const observer = new ResizeObserver(() => {
            updateWidthAndDraw();
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        window.addEventListener("resize", updateWidthAndDraw);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateWidthAndDraw);
        };
    }, [updateWidthAndDraw]);
    React.useEffect(() => {
        if (percentileRanges.length > 0 && width > 0) {
            drawLegend();
        }
    }, [percentileRanges, colorScale, prepColor, width, percentileMode]);
    const drawLegend = () => {
        if (!legendRn.current) return;
        d3.select(legendRn.current).selectAll("svg").remove();
        const baseSVG = d3
            .select(legendRn.current)
            .append("svg")
            .attr("width", "100%")
            .attr("height", 110)
            .attr("viewBox", `0 0 ${width} 110`)
            .attr("preserveAspectRatio", "xMinYMid meet");
        const customScale = colorScale.domain();
        const minValue = Math.min(...programData);
        const cut_points = customScale[0] === minValue ? [...customScale] : [minValue, ...customScale];
        const segmentCount = cut_points.length - 1;
        if (Math.min(...programData) === Infinity || Math.max(...programData) === Infinity) {
            return;
        }
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
        const segments = baseSVG
            .selectAll("g.segment")
            .data(data_distribution)
            .enter()
            .append("g")
            .attr("class", "segment")
            .attr("data-index", (d, i) => i);
        let segmentPositions: number[] = [];
        if (percentileMode === PercentileMode.EQUAL) {
            const segmentWidth = svgWidth / segmentCount;
            segmentPositions = Array.from({ length: segmentCount + 1 }, (_, i) => margin + i * segmentWidth);
        } else {
            let currentPosition = margin;
            segmentPositions = [currentPosition];
            for (let i = 0; i < data_distribution.length; i++) {
                currentPosition += data_distribution[i] * svgWidth;
                segmentPositions.push(currentPosition);
            }
        }
        segments
            .append("rect")
            .attr("class", "legendRect")
            .attr("data-index", (d, i) => i)
            .attr("id", (d, i) => `legendRect${i}`)
            .attr("x", (d, i) => segmentPositions[i])
            .attr("y", () => 20)
            .attr("width", (d, i) => segmentPositions[i + 1] - segmentPositions[i])
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
                const dataForProcessing = Object.entries(countyData).reduce((acc, [fips, county]) => {
                    if (!county || typeof county !== "object" || !county.hasData) {
                        return acc;
                    }
                    if (notDollar) {
                        if (
                            county.hasOwnProperty("meanPaymentRateInDollarsPerAcre") &&
                            county.hasValidBaseAcres &&
                            county.meanPaymentRateInDollarsPerAcre !== undefined
                        ) {
                            const roundedValue = Math.round(county.meanPaymentRateInDollarsPerAcre * 100) / 100;
                            acc[fips] = {
                                ...county,
                                value: roundedValue
                            };
                        }
                    } else {
                        acc[fips] = county;
                    }
                    return acc;
                }, {});
                const { minRegion, maxRegion, regionCount } = processRegionsInRange(
                    dataForProcessing,
                    min,
                    max,
                    stateCodeToName,
                    regionType
                );
                setTooltipData({
                    percentileRange: binRange,
                    regionCount,
                    minRegion: regionCount > 0 ? minRegion : minRegion,
                    maxRegion: regionCount > 0 ? maxRegion : maxRegion,
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
            });
        baseSVG
            .selectAll(null)
            .data(cut_points)
            .enter()
            .append("text")
            .attr("class", "legendText")
            .attr("id", (d, i) => `legendText${i}`)
            .attr("y", (d, i) => (i % 2 === 0 ? 60 : 10))
            .attr("x", (d, i) => segmentPositions[i])
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text((d) => {
                if (isRatio) {
                    return `${Math.round(d * 100)}%`;
                }
                const roundedValue = Math.round(d * 100) / 100;
                if (!notDollar) {
                    const res = ShortFormat(roundedValue.toFixed(2), -1, 2);
                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                }
                return ShortFormat(roundedValue.toFixed(2), -1, 2);
            });
        if (emptyState.length !== 0) {
            const zeroState = emptyState.filter((item, index) => emptyState.indexOf(item) === index);
            baseSVG
                .append("text")
                .attr("class", "legendTextSide")
                .attr("x", width / 2)
                .attr("y", 90)
                .attr("text-anchor", "middle")
                .text(`${zeroState.join(", ")} has no data available`);
        } else {
            baseSVG
                .append("text")
                .attr("class", "legendTextSide")
                .attr("x", width / 2)
                .attr("y", 90)
                .attr("text-anchor", "middle")
                .text("Gray states indicate no available data or a value of 0");
        }
    };
    return (
        <Box
            ref={containerRef}
            sx={{
                width: "100%",
                position: "relative",
                minHeight: "140px"
            }}
        >
            <div ref={legendRn} style={{ width: "100%" }} />
            {showTooltips && tooltipData && tooltipVisible && (
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
