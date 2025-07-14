import * as React from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { ShortFormat, ShortFormatPaymentRate } from "./ConvertionFormats";
import "../../styles/drawLegend.css";
import { processRegionsInRange, TooltipData } from "./LegendTooltipUtils";
import LegendTooltipContent from "./LegendTooltipContent";
import { PercentileMode, getMapPercentiles } from "../hModel/CountyCommodityMap/percentileConfig";
import { CheckAddZero } from "./ColorFunctions";

interface CountyDataItem {
    hasData?: boolean;
    hasValidBaseAcres?: boolean;
    meanPaymentRateInDollarsPerAcre?: number;
    value?: number;
    [key: string]: unknown;
}

interface ColorScale {
    domain(): number[];
}

type RectHoverCallback = (index: number, data?: unknown) => void;

export default function DrawLegendNew({
    isRatio = false,
    notDollar = false,
    colorScale,
    programData,
    prepColor,
    emptyState = [],
    countyData = {},
    onRectHover = null,
    stateCodeToName = {},
    showTooltips = false,
    regionType = "county",
    percentileMode = "default",
    isPaymentRate = false,
    viewMode = "current",
    boundaryType = "county",
    selectedState = "All States"
}: {
    isRatio?: boolean;
    notDollar?: boolean;
    colorScale: ColorScale;
    programData: number[];
    prepColor: string[];
    emptyState?: string[];
    countyData?: Record<string, CountyDataItem>;
    onRectHover?: RectHoverCallback | null;
    stateCodeToName: Record<string, string>;
    showTooltips?: boolean;
    regionType?: string;
    percentileMode?: string;
    isPaymentRate?: boolean;
    viewMode?: string;
    boundaryType?: string;
    selectedState?: string;
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
        const percentiles = getMapPercentiles(
            percentileMode === "equal" ? PercentileMode.EQUAL : PercentileMode.DEFAULT
        );
        for (let i = 0; i < segmentCount; i += 1) {
            const startPercent = percentiles[i];
            const endPercent = percentiles[i + 1];
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
        const percentiles = getMapPercentiles(
            percentileMode === "equal" ? PercentileMode.EQUAL : PercentileMode.DEFAULT
        );
        const expectedSegments = percentiles.length - 1;
        const customScale = colorScale.domain();
        let cut_points;
        if (viewMode === "difference") {
            const hasNegativeAndPositive = programData.some((d) => d < 0) && programData.some((d) => d > 0);
            if (hasNegativeAndPositive) {
                const sortedThresholds = [...customScale].sort((a, b) => a - b);
                const processedThresholds = CheckAddZero(sortedThresholds);
                cut_points = [
                    sortedThresholds[0],
                    ...processedThresholds,
                    sortedThresholds[sortedThresholds.length - 1]
                ];
            } else {
                cut_points = [...customScale];
            }
        } else {
            cut_points = [...customScale];
        }
        if (cut_points.length - 1 !== expectedSegments) {
            cut_points = cut_points.slice(0, expectedSegments + 1);
        }
        const segmentCount = cut_points.length - 1;
        if (
            programData.length === 0 ||
            Math.min(...programData) === Infinity ||
            Math.max(...programData) === Infinity
        ) {
            let message = "No data available for the selected filters";
            if (boundaryType === "congressional-district" && selectedState !== "All States") {
                message = `No congressional district data available for ${selectedState}. Sample data includes Alabama, California, and Texas.`;
            } else if (boundaryType === "congressional-district") {
                message = "No congressional district data available for the selected filters";
            }
            baseSVG
                .append("text")
                .attr("class", "legendTextSide")
                .attr("x", width / 2)
                .attr("y", 55)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text(message);
            return;
        }
        if (segmentCount <= 0 || cut_points.some((p) => !Number.isFinite(p))) {
            baseSVG
                .append("text")
                .attr("class", "legendTextSide")
                .attr("x", width / 2)
                .attr("y", 55)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text("Unable to generate legend with current data");
            return;
        }
        baseSVG.selectAll("text").remove();
        baseSVG.selectAll("rect").remove();
        const data_distribution: number[] = [];
        let totalValueSum = 0;
        for (let i = 0; i < expectedSegments; i += 1) {
            const lowerValue = cut_points[i];
            const upperValue = cut_points[i + 1];
            let countInRange;
            if (i === expectedSegments - 1) {
                countInRange = programData.filter((d) => d >= lowerValue).length;
            } else {
                countInRange = programData.filter((d) => d >= lowerValue && d < upperValue).length;
            }
            const segmentValue = countInRange > 0 ? countInRange : Math.max(1, programData.length * 0.01);
            data_distribution.push(segmentValue);
            totalValueSum += segmentValue;
        }
        for (let i = 0; i < data_distribution.length; i += 1) {
            data_distribution[i] /= totalValueSum;
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
        let currentPosition = margin;
        segmentPositions = [currentPosition];
        for (let i = 0; i < expectedSegments; i += 1) {
            const percentileRange = percentiles[i + 1] - percentiles[i];
            const segmentWidth = (percentileRange / 100) * svgWidth;
            if (!Number.isFinite(segmentWidth)) {
                segmentPositions = [];
                currentPosition = margin;
                segmentPositions = [currentPosition];
                const equalSegmentWidth = svgWidth / expectedSegments;
                for (let j = 0; j < expectedSegments; j += 1) {
                    currentPosition += equalSegmentWidth;
                    segmentPositions.push(currentPosition);
                }
                break;
            }
            currentPosition += segmentWidth;
            segmentPositions.push(currentPosition);
        }
        segments
            .append("rect")
            .attr("class", "legendRect")
            .attr("data-index", (d, i) => i)
            .attr("id", (d, i) => `legendRect${i}`)
            .attr("x", (d, i) => {
                const x = segmentPositions[i];
                return Number.isFinite(x) ? x : 0;
            })
            .attr("y", () => 20)
            .attr("width", (d, i) => {
                const segmentWidth = segmentPositions[i + 1] - segmentPositions[i];
                return Number.isFinite(segmentWidth) && segmentWidth > 0 ? segmentWidth : 0;
            })
            .attr("height", 20)
            .style("fill", (d, i) => prepColor[i])
            .style("cursor", "pointer")
            .on("mouseover", function handleMouseOver(this: SVGRectElement) {
                const rectIndex = parseInt(d3.select(this).attr("data-index"), 10);
                if (percentileRanges.length === 0) {
                    return;
                }
                if (Number.isNaN(rectIndex) || rectIndex < 0 || rectIndex >= percentileRanges.length) {
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
                    if (viewMode === "difference" && isPaymentRate) {
                        if (county.hasValidBaseAcres) {
                            const currentBaseAcres =
                                typeof county.currentBaseAcres === "number" ? county.currentBaseAcres : 0;
                            const proposedBaseAcres =
                                typeof county.proposedBaseAcres === "number" ? county.proposedBaseAcres : 0;
                            const currentValue = typeof county.currentValue === "number" ? county.currentValue : 0;
                            const proposedValue = typeof county.proposedValue === "number" ? county.proposedValue : 0;
                            const currentRate = currentBaseAcres > 0 ? currentValue / currentBaseAcres : 0;
                            const proposedRate = proposedBaseAcres > 0 ? proposedValue / proposedBaseAcres : 0;
                            const calculatedDifference = proposedRate - currentRate;
                            acc[fips] = {
                                ...county,
                                value: calculatedDifference
                            };
                        }
                    } else if (notDollar || isPaymentRate) {
                        if (county.hasValidBaseAcres) {
                            let totalPayment = 0;
                            let baseAcres = 0;

                            if (viewMode === "proposed") {
                                if (typeof county.proposedValue === "number") {
                                    totalPayment = county.proposedValue;
                                }
                                if (typeof county.proposedBaseAcres === "number") {
                                    baseAcres = county.proposedBaseAcres;
                                }
                            } else {
                                if (typeof county.currentValue === "number") {
                                    totalPayment = county.currentValue;
                                }
                                if (typeof county.currentBaseAcres === "number") {
                                    baseAcres = county.currentBaseAcres;
                                }
                            }
                            const calculatedRate =
                                (baseAcres as number) > 0 ? (totalPayment as number) / (baseAcres as number) : 0;
                            const roundedValue = Math.round(calculatedRate * 100) / 100;
                            acc[fips] = {
                                ...county,
                                value: roundedValue
                            };
                        }
                    } else {
                        acc[fips] = county;
                    }
                    return acc;
                }, {} as Record<string, CountyDataItem>);
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
                const rectElement = this as SVGRectElement;
                const rectDOMBounds = rectElement.getBoundingClientRect();
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
            .on("mouseout", function handleMouseOut(this: SVGRectElement) {
                const rectIndex = parseInt(d3.select(this).attr("data-index"), 10);
                if (Number.isNaN(rectIndex) || rectIndex < 0 || rectIndex >= percentileRanges.length) {
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
            .attr("x", (d, i) => {
                const x = segmentPositions[i];
                return Number.isFinite(x) ? x : 0;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text((d) => {
                if (isRatio) {
                    return `${Math.round(d * 100)}%`;
                }
                if (viewMode === "difference" && isPaymentRate) {
                    const res = ShortFormatPaymentRate(d, true);
                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                }
                if (isPaymentRate) {
                    const res = ShortFormatPaymentRate(d, false);
                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                }

                const roundedValue = Math.round(d);
                const res = ShortFormat(roundedValue.toString(), 0, 0);
                if (notDollar && !isPaymentRate) {
                    return res;
                }
                return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
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
                    <LegendTooltipContent
                        tooltipData={tooltipData}
                        notDollar={notDollar}
                        regionType={regionType}
                        viewMode={viewMode}
                        isPaymentRate={isPaymentRate}
                    />
                </div>
            )}
        </Box>
    );
}
