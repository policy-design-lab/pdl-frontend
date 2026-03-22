import * as React from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import { ShortFormat } from "./ConvertionFormats";
import { CheckAddZero } from "./ColorFunctions";
import "../../styles/drawLegend.css";

export default function DrawLegend({
    isRatio = false,
    notDollar = false,
    colorScale,
    title,
    programData,
    prepColor,
    emptyState = [],
    useQuantiles = false,
    useQuantileSpread = false,
    quantilePercentiles = [20, 40, 60, 80],
    quantileSpread = [0, 20, 40, 60, 80, 100],
    quantileCaps = [5, 95],
    ratioAsPercent = true,
    grayAreasSuffix = ""
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
                        ? ((legendRn.current as HTMLElement).parentElement?.offsetWidth ?? 0)
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
    }, [
        width,
        programData,
        colorScale,
        prepColor,
        emptyState,
        isRatio,
        notDollar,
        useQuantiles,
        useQuantileSpread,
        quantilePercentiles,
        ratioAsPercent,
        grayAreasSuffix
    ]);

    const percentile = (values: number[], p: number) => {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const idx = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        if (lower === upper) return sorted[lower];
        const weight = idx - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const getQuantileThresholds = () => {
        const spread =
            Array.isArray(quantileSpread) && quantileSpread.length === 6 ? quantileSpread : [0, 20, 40, 60, 80, 100];
        const caps = Array.isArray(quantileCaps) && quantileCaps.length === 2 ? quantileCaps : [5, 95];
        const capLow = percentile(programData, caps[0]);
        const capHigh = percentile(programData, caps[1]);
        const clamped = programData.map((v) => Math.min(capHigh, Math.max(capLow, v)));
        const thresholds = [];
        for (let i = 1; i < spread.length - 1; i += 1) {
            thresholds.push(percentile(clamped, spread[i]));
        }
        return thresholds;
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
            let customScale = useQuantiles ? getQuantileThresholds() : colorScale.domain();
            if (useQuantileSpread && !useQuantiles) {
                const nonZeroData = programData.filter((v) => v !== 0);
                if (nonZeroData.length >= 5) {
                    const sorted = [...nonZeroData].sort((a, b) => a - b);
                    const p = (arr: number[], pct: number) => {
                        const idx = (pct / 100) * (arr.length - 1);
                        const lo = Math.floor(idx);
                        const hi = Math.ceil(idx);
                        if (lo === hi) return arr[lo];
                        return arr[lo] * (1 - (idx - lo)) + arr[hi] * (idx - lo);
                    };
                    customScale = quantilePercentiles.map((pct) => p(sorted, pct));
                    const hasNeg = programData.some((d) => d < 0);
                    const hasPos = programData.some((d) => d > 0);
                    if (hasNeg && hasPos && !customScale.includes(0)) {
                        const negThresholds = customScale.filter((v) => v < 0);
                        const posThresholds = customScale.filter((v) => v > 0);
                        if (negThresholds.length > 0 && posThresholds.length > 0) {
                            const closestNegIdx = customScale.indexOf(Math.max(...negThresholds));
                            const closestPosIdx = customScale.indexOf(Math.min(...posThresholds));
                            const closestNeg = Math.abs(customScale[closestNegIdx]);
                            const closestPos = Math.abs(customScale[closestPosIdx]);
                            if (closestNeg <= closestPos) {
                                customScale[closestNegIdx] = 0;
                            } else {
                                customScale[closestPosIdx] = 0;
                            }
                        } else if (negThresholds.length > 0) {
                            customScale[customScale.indexOf(Math.max(...negThresholds))] = 0;
                        } else {
                            customScale[customScale.indexOf(Math.min(...posThresholds))] = 0;
                        }
                    }
                }
            }
            if (!useQuantileSpread) {
                const hasNegativeAndPositive = programData.some((d) => d < 0) && programData.some((d) => d > 0);
                if (hasNegativeAndPositive) {
                    const allThresholds = [Math.min(...programData), ...customScale, Math.max(...programData)];
                    const sortedAll = [...allThresholds].sort((a, b) => a - b);
                    const processed = CheckAddZero(sortedAll);
                    customScale = processed;
                }
            }
            cut_points.push(Math.min(...programData));
            cut_points = cut_points.concat(customScale);
            const legendRectX: number[] = [];
            if (Math.min(...programData) !== Infinity && Math.max(...programData) !== Infinity) {
                baseSVG.selectAll("text").remove();
                baseSVG.selectAll("rect").remove();
                const data_distribution: number[] = [];
                if (useQuantileSpread && !useQuantiles) {
                    const pctBoundaries = [0, ...quantilePercentiles, 100];
                    for (let i = 0; i < pctBoundaries.length - 1; i += 1) {
                        data_distribution.push(pctBoundaries[i + 1] - pctBoundaries[i]);
                    }
                    const totalPct = data_distribution.reduce((acc, curr) => acc + curr, 0);
                    for (let i = 0; i < data_distribution.length; i += 1) {
                        data_distribution[i] /= totalPct;
                    }
                } else {
                    const cutCount = Array.from({ length: cut_points.length - 1 }, (v, i) => 1 + i);
                    cutCount.forEach((i) => {
                        const count =
                            programData.filter((d) => d >= cut_points[i - 1] && d < cut_points[i]).length ||
                            Math.max(1, programData.length * 0.01);
                        data_distribution.push(count);
                    });
                    const lastCount =
                        programData.filter((d) => d >= cut_points[cut_points.length - 1]).length ||
                        Math.max(1, programData.length * 0.01);
                    data_distribution.push(lastCount);
                    const totalCount = data_distribution.reduce((acc, curr) => acc + curr, 0);
                    for (let i = 0; i < data_distribution.length; i += 1) {
                        data_distribution[i] /= totalCount;
                    }
                }
                const svgWidth = width - margin * 2;
                // No need to show color length if there are less than five colors (i.e. not enough data points or label is not correctly identified)
                if (data_distribution.length > 0) {
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
                    baseSVG
                        .selectAll(".legendRect")
                        .nodes()
                        .forEach((d) => {
                            legendRectX.push(Number(d3.select(d).attr("x")));
                        });
                    const last =
                        legendRectX[legendRectX.length - 1] +
                        data_distribution[data_distribution.length - 1] * svgWidth;
                    legendRectX.push(last);
                    if (svgWidth > 1690) {
                        baseSVG
                            .selectAll(null)
                            .data(legendRectX)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d) => `legendText${d}`)
                            .attr("y", 50)
                            .attr("x", (d, i) => {
                                return i === 0 ? d : d - margin / 4;
                            })
                            .text((d, i) => {
                                if (isRatio) {
                                    const ratioValue = Number(cut_points[i]);
                                    return ratioAsPercent
                                        ? `${Math.round(ratioValue * 100)}%`
                                        : ratioValue.toLocaleString(undefined, { maximumFractionDigits: 3 });
                                }
                                const roundedValue = Math.round(cut_points[i]);
                                if (!notDollar) {
                                    const res = ShortFormat(roundedValue.toString(), 0, 0);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(roundedValue.toString(), 0, 0);
                            });
                    } else {
                        baseSVG
                            .selectAll(null)
                            .data(legendRectX)
                            .enter()
                            .append("text")
                            .attr("class", "legendText")
                            .attr("id", (d) => `legendText${d}`)
                            .attr("y", (d, i) => {
                                return i % 2 === 0 ? 50 : 10;
                            })
                            .attr("x", (d, i) => {
                                return i === 0 ? d : d - margin / 4;
                            })
                            .text((d, i) => {
                                if (isRatio) {
                                    const ratioValue = Number(cut_points[i]);
                                    return ratioAsPercent
                                        ? `${Math.round(ratioValue * 100)}%`
                                        : ratioValue.toLocaleString(undefined, { maximumFractionDigits: 3 });
                                }
                                const roundedValue = Math.round(cut_points[i]);
                                if (!notDollar) {
                                    const res = ShortFormat(roundedValue.toString(), 0, 0);
                                    return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                                }
                                return ShortFormat(roundedValue.toString(), 0, 0);
                            });
                    }
                    baseSVG
                        .append("text")
                        .attr("class", "legendTextSide")
                        .attr("x", width / 2 - 150)
                        .attr("y", 80)
                        .text(`Gray areas indicate no available data${grayAreasSuffix ? ` ${grayAreasSuffix}` : ""}`);
                } else {
                    baseSVG.attr("height", 90);
                    baseSVG
                        .append("text")
                        .attr("class", "legendTextSide")
                        .attr("text-anchor", "middle")
                        .attr("x", width / 2)
                        .attr("y", 45)
                        .style("font-size", "14px")
                        .text("There isn't sufficient data to display the legend");
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
