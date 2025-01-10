import React, { useState } from "react";
import styled from "@emotion/styled";
import * as d3 from "d3";
import { ShortFormat } from "../shared/ConvertionFormats";

export default function TreeMapSquares({
    svgWidth,
    svgHeight,
    stateCodes,
    originalData,
    chartData,
    color,
    availableAttributes,
    program
}): JSX.Element {
    const Styles = styled.div`
        #Title1TreeMap {
            font-family: "Roboto", sans-serif;
        }
    `;

    const rn = React.useRef(null);
    React.useEffect(() => {
        if (chartData) {
            d3.select(rn.current).selectAll(".base").remove();
            const base = d3.select(rn.current).append("g").attr("class", "base");
            const margin = 30;
            const lineMargin = 80;
            const baseSize = 10;
            const stepSize = 20;
            let rowTrack = 0;
            let largestSquare = 200;
            if (window.innerWidth >= 1920) {
                largestSquare = 250;
            }
            let yTrack = largestSquare + lineMargin;
            const d = chartData.filter(
                (stateData) => stateData.baseAcres !== 0 || stateData.payments !== 0 || stateData.recipients !== 0
            );
            let i = 0;
            let lineNumber = 0;
            let maxInLine = 0;
            while (i < d.length) {
                const stateData = d[i];
                if (
                    rowTrack + margin <=
                    svgWidth - largestSquare * Math.max(stateData.baseAcres, stateData.payments, stateData.recipients)
                ) {
                    const squareGroup = base.append("g").attr("class", "squareGroup");
                    const re_sorted = [stateData.baseAcres, stateData.payments, stateData.recipients].sort(
                        (a, b) => b - a
                    );
                    maxInLine = re_sorted[0];
                    const baseArcesOriginalData = ShortFormat(
                        originalData.find((s) => s.state === stateData.state).baseAcres
                    );
                    const paymentsOriginalData = ShortFormat(
                        originalData.find((s) => s.state === stateData.state).payments
                    );
                    const recipientsOriginalData = ShortFormat(
                        originalData.find((s) => s.state === stateData.state).recipients
                    );
                    const collectedOriginalData = {
                        baseAcres: baseArcesOriginalData,
                        payments: paymentsOriginalData,
                        recipients: recipientsOriginalData
                    };
                    for (let index = 0; index < re_sorted.length; index += 1) {
                        const value = re_sorted[index];
                        for (let j = 0; j < Object.values(stateData).length; j += 1) {
                            const v = Object.values(stateData)[j];
                            if (Number(v) === value) {
                                const [key] = Object.entries(stateData).find(([_, val]) => val === value) || [];
                                if (key && availableAttributes.includes(key)) {
                                    squareGroup
                                        .append("rect")
                                        .attr("class", "TreeMapSquare")
                                        .attr("width", value * largestSquare)
                                        .attr("height", value * largestSquare)
                                        .attr("x", rowTrack)
                                        .attr("y", yTrack - value * largestSquare)
                                        .attr("fill", color[key]);
                                    const firstFewLines = window.innerWidth >= 1920 ? 3 : 2;
                                    if (yTrack <= (largestSquare + lineMargin) * firstFewLines) {
                                        const inSquareText = squareGroup
                                            .append("text")
                                            .attr("id", `inSquareText${value}`)
                                            .text(
                                                key === "payments"
                                                    ? `$${collectedOriginalData[key]}`
                                                    : collectedOriginalData[key]
                                            )
                                            .style("font-size", "0.7em")
                                            .style("fill", "white");
                                        const textLength = inSquareText.node().getComputedTextLength();
                                        if (rowTrack + value * largestSquare - textLength - 10 > 0) {
                                            inSquareText
                                                .attr("x", rowTrack + value * largestSquare - textLength - 10)
                                                .attr("y", yTrack - value * largestSquare + 18);
                                        } else {
                                            inSquareText.attr("x", 0).attr("y", yTrack - value * largestSquare + 18);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    squareGroup
                        .on("mouseover", function (e) {
                            base.selectAll(".TreeMapSquareTip").remove();
                            // eslint-disable-next-line no-restricted-globals
                            const mousePos = d3.pointer(event, squareGroup.node());
                            const tipGroup = base.append("g").attr("class", "TreeMapSquareTip");
                            const xPosition = mousePos[0] + 160 > svgWidth ? mousePos[0] - 160 : mousePos[0];
                            const tipHeight =
                                program === "Agriculture Risk Coverage Individual Coverage (ARC-IC)" ? 80 : 100;
                            tipGroup
                                .append("rect")
                                .attr("x", xPosition)
                                .attr("y", mousePos[1])
                                .attr("width", 155)
                                .attr("height", tipHeight)
                                .attr("rx", 5)
                                .attr("ry", 5)
                                .attr("fill", "#2F7164")
                                .style("opacity", 0.8)
                                .style("z-index", 100000);
                            tipGroup
                                .append("text")
                                .text(
                                    `${
                                        stateCodes[
                                            Object.keys(stateCodes).filter(
                                                (stateCode) => stateCode === stateData.state
                                            )[0]
                                        ]
                                    }`
                                )
                                .attr("x", xPosition + baseSize)
                                .attr("y", mousePos[1] + stepSize * 1)
                                .style("font-size", "0.9em")
                                .style("font-weight", "700")
                                .style("fill", "white");
                            tipGroup
                                .append("text")
                                .text(`Payments:  $${paymentsOriginalData}`)
                                .attr("x", xPosition + baseSize)
                                .attr("y", mousePos[1] + stepSize * 2)
                                .style("font-size", "0.8em")
                                .style("fill", "white");
                            if (program === "Agriculture Risk Coverage Individual Coverage (ARC-IC)") {
                                tipGroup
                                    .append("text")
                                    .text(`Avg. Recipients:  ${recipientsOriginalData}`)
                                    .attr("x", xPosition + baseSize)
                                    .attr("y", mousePos[1] + stepSize * 3)
                                    .style("font-size", "0.8em")
                                    .style("fill", "white");
                            } else {
                                tipGroup
                                    .append("text")
                                    .text(`Avg. Base Acres: ${baseArcesOriginalData}`)
                                    .attr("x", xPosition + baseSize)
                                    .attr("y", mousePos[1] + stepSize * 3)
                                    .style("font-size", "0.8em")
                                    .style("fill", "white");
                                tipGroup
                                    .append("text")
                                    .text(`Avg. Recipients:  ${recipientsOriginalData}`)
                                    .attr("x", xPosition + 10)
                                    .attr("y", mousePos[1] + stepSize * 4)
                                    .style("font-size", "0.8em")
                                    .style("fill", "white");
                            }
                        })
                        .on("mouseleave", function (e) {
                            base.selectAll(".TreeMapSquareTip").remove();
                        });
                    const stateName = squareGroup
                        .append("text")
                        .text(
                            stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === stateData.state)[0]]
                        )
                        .style("font-size", "0.75em");
                    const textLength = stateName.node().getComputedTextLength();
                    if (rowTrack + (maxInLine * largestSquare) / 2 - textLength / 2 < 0) {
                        stateName.attr("x", 0).attr("y", yTrack + 16);
                    } else {
                        stateName
                            .attr("x", rowTrack + (maxInLine * largestSquare) / 2 - textLength / 2)
                            .attr("y", yTrack + 16);
                    }
                    rowTrack = rowTrack + maxInLine * largestSquare + margin * 2;
                    i += 1;
                } else {
                    let max = 0;
                    for (let temp = 1; temp <= 5; temp += 1) {
                        if (chartData[temp + 1]) {
                            const nextOne = chartData[temp + 1];
                            max =
                                max > [nextOne.baseAcres, nextOne.payments, nextOne.recipients].sort((a, b) => b - a)[0]
                                    ? max
                                    : [nextOne.baseAcres, nextOne.payments, nextOne.recipients].sort(
                                          (a, b) => b - a
                                      )[0];
                        }
                    }
                    if (max <= 0.8) {
                        yTrack = yTrack + largestSquare * max + lineMargin * 0.5;
                    } else {
                        yTrack = yTrack + largestSquare + lineMargin;
                    }
                    lineNumber += 1;
                    rowTrack = 0;
                }
            }
            // check if see if any of state has all zeros
            const zeroData = chartData.filter(
                (stateData) => stateData.baseAcres === 0 && stateData.payments === 0 && stateData.recipients === 0
            );
            let j = 0;
            lineNumber = 0;
            yTrack = rowTrack !== margin * 0.8 ? yTrack : yTrack - 20;
            while (j < zeroData.length) {
                const stateData = zeroData[j];
                if (stateData) {
                    if (
                        rowTrack + margin <=
                        svgWidth -
                            largestSquare * Math.max(stateData.baseAcres, stateData.payments, stateData.recipients)
                    ) {
                        const zeros = base.append("g").attr("class", "ZeroGroup");
                        zeros
                            .append("rect")
                            .attr("width", 20)
                            .attr("height", 20)
                            .attr("x", rowTrack)
                            .attr("y", yTrack - 20)
                            .attr("fill", "#DDD");
                        zeros
                            .append("text")
                            .text("0")
                            .attr("x", rowTrack + 6.5)
                            .attr("y", yTrack - 5)
                            .style("font-size", "0.8em")
                            .style("fill", "white");
                        const underSquare = zeros.append("text").text(stateData.state).style("font-size", "0.8em");
                        const textLength = underSquare.node().getComputedTextLength();
                        if (rowTrack + (20 - textLength) / 2 < 0) {
                            underSquare.attr("x", 0).attr("y", yTrack + 16);
                        } else {
                            underSquare.attr("x", rowTrack + (20 - textLength) / 2).attr("y", yTrack + 16);
                        }
                        rowTrack = rowTrack + 20 + margin * 2;
                        j += 1;
                    } else {
                        yTrack = yTrack + largestSquare * 0.8 - lineNumber * 20;
                        lineNumber += 5;
                        rowTrack = 0;
                    }
                }
            }
            d3.select(rn.current).attr("height", yTrack + largestSquare);
        }
    });

    return (
        <Styles>
            <svg ref={rn} id="Title1TreeMap" width={svgWidth} height={svgHeight} />
        </Styles>
    );
}
