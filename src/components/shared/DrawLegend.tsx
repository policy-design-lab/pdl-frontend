import * as React from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import { ShortFormat } from "./ConvertionFormats";
import "../../styles/drawLegend.css";

/**
 * Keys in legendConfig.json must match the 'searchKey' variable in DrawLegend.tsx file.
 * If there's any changes in legendConfig.json, please re-check and update the 'searchKey' variable here.
 * The programData parameter is the array of all data points that will be used to draw the legend.
 */
export default function DrawLegend({
    isRatio = false,
    notDollar = false,
    colorScale,
    title,
    programData,
    prepColor,
    emptyState = []
}): JSX.Element {
    const legendRn = React.useRef<HTMLDivElement>(null);
    const margin = 40;
    let cut_points: number[] = [];
    const [width, setWidth] = React.useState(992);

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
        drawLegend();
    }, [width]);

    // Adjust label positions to prevent overlaps
    const getOptimalLabelPositions = (points: number[], svgWidth: number) => {
        // For smaller screens, use simple alternating pattern (one up, one down)
        // This restores the original design where labels alternate between top and bottom
        return points.map((_, i) => i % 2 === 0 ? 50 : 10);
    };

    const drawLegend = () => {
        if (legendRn.current && width > 0) {
            d3.select(legendRn.current).selectAll("svg").remove();
            const baseSVG = d3
                .select(legendRn.current)
                .append("svg")
                .attr("width", "100%")
                .attr("height", 90)
                .attr("viewBox", `0 0 ${width} 90`)
                .attr("preserveAspectRatio", "xMinYMid meet");
            const customScale = colorScale.domain();
            cut_points.push(Math.min(...programData));
            cut_points = cut_points.concat(customScale);
            const legendRectX: number[] = [];
            if (Math.min(...programData) !== Infinity && Math.max(...programData) !== Infinity) {
                baseSVG.selectAll("text").remove();
                baseSVG.selectAll("rect").remove();
                const data_distribution: number[] = [];
                const cutCount = Array.from({ length: cut_points.length - 1 }, (v, i) => 1 + i);
                cutCount.forEach((i) => {
                    data_distribution.push(
                        programData.filter((d) => d >= cut_points[i - 1] && d < cut_points[i]).length /
                            programData.length
                    );
                });
                data_distribution.push(
                    programData.filter((d) => d >= cut_points[cut_points.length - 1]).length / programData.length
                );
                const svgWidth = width - margin * 2;
                const hasValidDistribution = data_distribution.some((d) => d > 0.01) && programData.length > 0;

                if (hasValidDistribution) {
                    // Add legend rectangles
                    baseSVG
                        .selectAll(null)
                        .data(data_distribution)
                        .enter()
                        .append("rect")
                        .attr("class", "legendRect")
                        .attr("id", (d) => `legendRect${d}`)
                        .attr("x", (d, i) => {
                            if (i === 0) {
                                return margin;
                            }
                            const sum = data_distribution.slice(0, i).reduce((acc, curr) => acc + curr, 0);
                            return margin + svgWidth * sum;
                        })
                        .attr("y", () => {
                            return 20;
                        })
                        .attr("width", (d) => {
                            return d * svgWidth;
                        })
                        .attr("height", 10)
                        .style("fill", (d, i) => prepColor[i]);
                    
                    cut_points = cut_points.concat(Math.max(...programData));
                    
                    // Get rectangle positions for label placement
                    baseSVG
                        .selectAll(".legendRect")
                        .nodes()
                        .forEach((d) => {
                            legendRectX.push(Number(d3.select(d).attr("x")));
                        });
                    
                    // Add final position
                    const last =
                        legendRectX[legendRectX.length - 1] +
                        data_distribution[data_distribution.length - 1] * svgWidth;
                    legendRectX.push(last);
                    
                    // Remove any duplicate positions that might be too close to each other
                    // This prevents duplicate labels at the first and last positions
                    const uniquePositions: number[] = [];
                    const uniqueCutPoints: number[] = [];
                    
                    // Only keep positions that are at least 5px apart
                    legendRectX.forEach((pos, index) => {
                        if (index === 0 || Math.abs(pos - uniquePositions[uniquePositions.length - 1]) > 5) {
                            uniquePositions.push(pos);
                            uniqueCutPoints.push(cut_points[index]);
                        }
                    });
                    
                    // For wide screens, use uniform label position
                    if (svgWidth > 1690) {
                        baseSVG
                            .selectAll(null)
                            .data(uniquePositions)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d) => `legendText${d}`)
                            .attr("y", 50)
                            .attr("x", (d, i) => {
                                return i === 0 ? d : d - margin / 4;
                            })
                            .attr("text-anchor", (d, i) => i === 0 ? "start" : "middle")
                            .text((d, i) => {
                                if (isRatio) {
                                    return `${Math.round(uniqueCutPoints[i] * 100)}%`;
                                }
                                if (i === 0 && !notDollar) {
                                    const res = ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                            });
                    } else {
                        // Determine optimal label positions based on space constraints
                        const labelPositions = getOptimalLabelPositions(uniquePositions, svgWidth);
                        
                        baseSVG
                            .selectAll(null)
                            .data(uniquePositions)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d) => `legendText${d}`)
                            .attr("y", (d, i) => {
                                return labelPositions[i];
                            })
                            .attr("x", (d, i) => {
                                return i === 0 ? d : d - margin / 4;
                            })
                            .attr("text-anchor", (d, i) => i === 0 ? "start" : "middle")
                            .text((d, i) => {
                                if (isRatio) {
                                    return `${Math.round(uniqueCutPoints[i] * 100)}%`;
                                }
                                if (i === 0 && !notDollar) {
                                    const res = ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(uniqueCutPoints[i].toFixed(2), -1, 2);
                            });
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
                            .attr("y", 80)
                            .text(`${zeroState.join(", ")} has no data available`);
                    } else {
                        baseSVG
                            .append("text")
                            .attr("class", "legendTextSide")
                            .attr("x", width / 2 - 150)
                            .attr("y", 80)
                            .text("Gray states indicate no available data or a value of 0");
                    }
                } else {
                    baseSVG.attr("height", 90);
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
                minWidth: 560
            }}
        >
            <Box display="flex" justifyContent="center">
                <Typography variant="h5" sx={{ mb: 1 }}>
                    <strong>{title}</strong>
                </Typography>
            </Box>
            <div ref={legendRn} className="MapLegendSVG" />
        </Box>
    );
}
