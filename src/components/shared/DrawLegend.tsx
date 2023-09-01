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
    emptyState,
    initRatioLarge,
    initRatioSmall
}: {
    isRatio: boolean;
    notDollar: boolean;
    colorScale: d3.ScaleThreshold<number, string>;
    title: React.ReactElement;
    programData: number[];
    prepColor: string[];
    emptyState: string[];
    initRatioLarge: number;
    initRatioSmall: number;
}): JSX.Element {
    const legendRn = React.useRef(null);
    const margin = 40;
    let cut_points: number[] = [];
    const [width, setWidth] = React.useState(
        window.innerWidth >= 1679 ? window.innerWidth * initRatioLarge : window.innerWidth * initRatioSmall
    );
    React.useEffect(() => {
        if (window.innerWidth > 1679) setWidth(window.innerWidth * initRatioLarge);
        else setWidth(window.innerWidth * initRatioSmall);
        drawLegend();
    });
    const drawLegend = () => {
        if (legendRn.current) {
            d3.select(legendRn.current).selectAll("svg").remove();
            const baseSVG = d3.select(legendRn.current).append("svg").attr("width", width).attr("height", 90);
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
                    // Leave following part as the backup of solution 2.
                    // programData
                    //     .filter((d) => d >= cut_points[i - 1] && d < cut_points[i])
                    //     .reduce((accumulator, currentValue) => accumulator + currentValue, 0) /
                    //     programData.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
                });
                data_distribution.push(
                    programData.filter((d) => d >= cut_points[cut_points.length - 1]).length / programData.length
                );
                // Leave following part as the backup of solution 2.
                // data_distribution.push(
                //     programData
                //         .filter((d) => d >= cut_points[cut_points.length - 1])
                //         .reduce((accumulator, currentValue) => accumulator + currentValue, 0) /
                //         programData.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
                // );
                const svgWidth = baseSVG.attr("width") - margin * 2;
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
                    legendRectX[legendRectX.length - 1] + data_distribution[data_distribution.length - 1] * svgWidth;
                legendRectX.push(last);
                if (window.innerWidth > 1679) {
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
                                return `${Math.round(cut_points[i] * 100)}%`;
                            }
                            if (i === 0 && !notDollar) {
                                const res = ShortFormat(Math.round(cut_points[i]), i);
                                return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                            }
                            return ShortFormat(Math.round(cut_points[i]), i);
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
                                return `${Math.round(cut_points[i] * 100)}%`;
                            }
                            if (i === 0 && !notDollar) {
                                const res = ShortFormat(Math.round(cut_points[i]), i);
                                return res.indexOf("-") < 0 ? `$${res}` : `-$${res.substring(1)}`;
                            }
                            return ShortFormat(Math.round(cut_points[i]), i);
                        });
                }
                if (emptyState.length !== 0) {
                    const middleText = baseSVG
                        .append("text")
                        .attr("class", "legendTextSide")
                        .attr("x", -1000)
                        .attr("y", -1000)
                        .text(`${emptyState.join(", ")}'s data is not available`);
                    const middleBox = middleText.node().getBBox();
                    middleText.remove();
                    baseSVG
                        .append("text")
                        .attr("class", "legendTextSide")
                        .attr("x", (svgWidth + margin * 2) / 2 - middleBox.width / 2)
                        .attr("y", 80)
                        .text(`${emptyState.join(", ")}'s data is not available`);
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
