import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { ShortFormat, ToPercentageString, ToDollarString } from "../shared/ConvertionFormats";

export default function SNAPBar({
    SnapData,
    status,
    yearKey,
    margin,
    topSpace,
    w,
    h,
    color1,
    color2,
    widthPercentage,
    heightPercentage
}: {
    SnapData: any;
    status: number;
    yearKey: string;
    margin: { top: number; right: number; bottom: number; left: number };
    topSpace: number;
    w: number;
    h: number;
    color1: string;
    color2: string;
    widthPercentage: number;
    heightPercentage: number;
}): JSX.Element {
    const rn = React.useRef(null);
    const Styles = styled.div`
        svg {
            font-family: "Roboto", sans-serif;
        }

        .y0.axis path,
        .y0.axis line,
        .y1.axis path,
        .y1.axis line {
            stroke: #000;
            opacity: 10%;
        }

        .y0.axis text {
            color: #1f78b4;
        }
        .y1.axis text {
            color: #ba68c8;
        }

        .y0.axis .tick line,
        .y1.axis .tick line {
            visibility: hidden;
        }

        .x.axis path,
        .x.axis line {
            stroke: none;
        }
        .x.axis text {
            fill: #00000099;
        }

        .y0.axis-grid path,
        .y1.axis-grid path {
            stroke: none;
        }
        .y0.axis-grid line,
        .y1.axis-grid line {
            stroke: "#F0F0F0";
        }

        .x.axis .tick,
        .barChart rect {
            cursor: pointer;
        }
    `;
    const textPadding = 8;
    const InfoGap = 8;
    const lineGenerator = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y);
    const tooltipRn = React.useRef(null);
    const [width, setWidth] = React.useState(w);
    const [height, setHeight] = React.useState(h);

    React.useEffect(() => {
        renderBar(status);
        function handleResize() {
            setWidth(window.innerWidth * widthPercentage), setHeight(window.innerWidth * heightPercentage);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });

    const renderBar = (status) => {
        const data = SnapData[yearKey];
        data.sort(function (a, b) {
            if (a["totalPaymentInDollars"] === b["totalPaymentInDollars"]) return 0;
            if (a["totalPaymentInDollars"] > b["totalPaymentInDollars"]) return -1;
            if (a["totalPaymentInDollars"] < b["totalPaymentInDollars"]) return 1;
        });

        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom - topSpace;
        const color = d3
            .scaleOrdinal()
            .domain(["totalPaymentInDollars", "averageMonthlyParticipation"])
            .range([color1, color2]);
        const purpleLabel = (purpleBar, state, status) => {
            if (status === 0 || status === 2) {
                d3.select(rn.current).select(`.x.axis`).selectAll("text").style("opacity", 0.1);
                d3.select(rn.current)
                    .select(`.x-${state}`)
                    .select("text")
                    .style("font-weight", 600)
                    .style("opacity", 1);
                d3.select(rn.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                purpleBar.style("opacity", 1);
                const mousePos = d3.pointer(event, d3.select(rn.current).select(".y1.axis").node());
                const minusMouse = d3.pointer(event, purpleBar.node());
                const rightLineData = [
                    {
                        x: margin.left + graphWidth + mousePos[0] - minusMouse[0] + parseFloat(purpleBar.attr("width")),
                        y: purpleBar.attr("y")
                    },
                    { x: margin.left + graphWidth, y: purpleBar.attr("y") }
                ];
                d3.select(rn.current)
                    .append("path")
                    .attr("class", "rightLine")
                    .attr("d", lineGenerator(rightLineData))
                    .attr("stroke", color2)
                    .attr("stroke-width", parseFloat(purpleBar.attr("width")) / 2)
                    .attr("fill", "none");
            }
        };
        const purpleText = (purpleBar, state, status) => {
            const rightTextContent = `Participation: ${ToDollarString(
                purpleBar.data()[0]["averageMonthlyParticipation"],
                0
            )}  |  ${ToPercentageString(purpleBar.data()[0]["averageMonthlyParticipationInPercentageNationwide"])}`;
            const rightText = d3
                .select(rn.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(rightTextContent);
            const rightBox = rightText.node().getBBox();
            rightText.remove;
            d3.select(rn.current)
                .append("rect")
                .attr("class", "rightInfo")
                .attr("id", `${state}RightInfo`)
                .attr("x", graphWidth + margin.left - InfoGap * 2 - rightBox.width)
                .attr("y", purpleBar.attr("y") - InfoGap * 2 - rightBox.height)
                .attr("width", rightBox.width + textPadding * 2)
                .attr("height", rightBox.height + textPadding)
                .attr("fill", color2)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rn.current)
                .append("text")
                .attr("x", graphWidth + margin.left - InfoGap - rightBox.width)
                .attr("y", purpleBar.attr("y") - InfoGap * 2)
                .attr("class", "rightText")
                .attr("id", `${state}RightText`)
                .text(rightTextContent)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };
        const blueLabel = (blueBar, state, status) => {
            d3.select(rn.current).select(`.x.axis`).selectAll("text").style("opacity", 0.1);
            d3.select(rn.current).select(`.x-${state}`).select("text").style("font-weight", 600).style("opacity", 1);
            if (status === 0 || status === 1) {
                d3.select(rn.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                blueBar.style("opacity", 1);
                const mousePos = d3.pointer(event, d3.select(rn.current).select(".y0.axis").node());
                const minusMouse = d3.pointer(event, blueBar.node());
                const leftLineData = [
                    {
                        x: mousePos[0] + margin.left + parseFloat(blueBar.attr("width")) - minusMouse[0],
                        y: blueBar.attr("y")
                    },
                    { x: margin.left, y: blueBar.attr("y") }
                ];
                d3.select(rn.current)
                    .append("path")
                    .attr("class", "leftLine")
                    .attr("d", lineGenerator(leftLineData))
                    .attr("stroke", color1)
                    .attr("stroke-width", parseFloat(blueBar.attr("width")) / 2)
                    .attr("fill", "none");
            }
        };
        const blueText = (blueBar, state, status) => {
            const leftTextContent = `Costs: $${ToDollarString(
                blueBar.data()[0]["totalPaymentInDollars"],
                0
            )}  |  ${ToPercentageString(blueBar.data()[0]["totalPaymentInPercentageNationwide"])}`;
            const leftText = d3
                .select(rn.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent);
            const leftBox = leftText.node().getBBox();
            leftText.remove;
            d3.select(rn.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo`)
                .attr("x", margin.left)
                .attr("y", blueBar.attr("y") - InfoGap * 2 - leftBox.height)
                .attr("width", leftBox.width + textPadding * 2)
                .attr("height", leftBox.height + textPadding)
                .attr("fill", color1)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rn.current)
                .append("text")
                .attr("x", margin.left + textPadding)
                .attr("y", blueBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText`)
                .text(leftTextContent)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };
        const barColorRecover = (status) => {
            d3.select(rn.current).selectAll(".leftLine").remove();
            d3.select(rn.current).selectAll(".leftText").remove();
            d3.select(rn.current).selectAll(".leftInfo").remove();
            d3.select(rn.current).selectAll(".rightLine").remove();
            d3.select(rn.current).selectAll(".rightText").remove();
            d3.select(rn.current).selectAll(".rightInfo").remove();
            d3.select(rn.current).select(`.x.axis`).selectAll("text").style("opacity", 1);
            d3.select(rn.current).select(".x.axis").selectAll(".tick").select("text").style("font-weight", 400);
            d3.select(rn.current)
                .selectAll(".barChart")
                .selectAll("rect")
                .nodes()
                .forEach((d) => {
                    if (
                        d3
                            .select(d)
                            .attr("id")
                            .match(/^.*Purple$/) &&
                        status === 1
                    ) {
                        d3.select(d).style("opacity", 0.1);
                    } else if (
                        d3
                            .select(d)
                            .attr("id")
                            .match(/^.*Blue$/) &&
                        status === 2
                    ) {
                        d3.select(d).style("opacity", 0.1);
                    } else {
                        d3.select(d).style("opacity", 1);
                    }
                });
        };
        const x0 = d3.scaleBand().range([0, graphWidth]).paddingInner(0.4).paddingOuter(0.4);
        const x1 = d3.scaleBand();
        const y0 = d3.scaleLinear().range([graphHeight, 0]);
        const y1 = d3.scaleLinear().range([graphHeight, 0]);
        const xAxis = d3.axisBottom(x0).ticks(5).tickSizeOuter(0);
        const yAxisLeft = d3
            .axisLeft(y0)
            .tickFormat(function (d) {
                return `$${ShortFormat(parseInt(d))}`;
            })
            .tickSizeOuter(0);
        const yAxisRight = d3
            .axisRight(y1)
            .tickFormat(function (d) {
                return ShortFormat(parseInt(d));
            })
            .tickSizeOuter(0);
        x0.domain(
            data.map(function (d) {
                return d.state;
            })
        );
        x1.domain(["totalPaymentInDollars", "averageMonthlyParticipation"]).range([0, x0.bandwidth()]);
        y0.domain([
            0,
            d3.max(data, function (d) {
                return d["totalPaymentInDollars"] * 1.11;
            })
        ]);
        y1.domain([
            0,
            d3.max(data, function (d) {
                return d["averageMonthlyParticipation"] * 1.11;
            })
        ]);
        d3.select(rn.current).attr("width", width).attr("height", height).append("g");
        const x_axis = d3
            .select(rn.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin.left},${topSpace + graphHeight + margin.top})`)
            .call(xAxis);
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        d3.select(rn.current)
            .append("g")
            .attr("class", "y0 axis")
            .call(yAxisLeft)
            .attr("transform", `translate(${margin.left}, ${topSpace + margin.top})`)
            .append("text")
            .attr("x", 0 - margin.left)
            .attr("y", -margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .style("fill", color1)
            .text("SNAP Costs ($)")
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rn.current).select(".y0.axis").selectAll(".tick").style("fill", color1).style("font-size", "0.7rem");
        d3.select(rn.current)
            .append("g")
            .attr("class", "y1 axis")
            .attr("transform", `translate(${graphWidth + margin.left}, ${topSpace + margin.top})`)
            .call(yAxisRight)
            .append("text")
            .attr("y", -margin.top)
            .attr("x", margin.right)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .style("fill", color2)
            .style("font-weight", "400")
            .text("Avg. Monthly Participation (Person)")
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rn.current).select(".y1.axis").selectAll(".tick").style("fill", color2).style("font-size", "0.7rem");
        const base = d3
            .select(rn.current)
            .selectAll(null)
            .data(data)
            .enter()
            .append("g")
            .attr("class", "barChart")
            .attr("transform", function (d) {
                return `translate(${x0(d.state) + margin.left},0)`;
            });
        const blues = base
            .append("rect")
            .attr("class", (d) => d.state)
            .attr("id", (d) => `${d.state}Blue`)
            .attr("width", x1.bandwidth())
            .attr("x", function (d) {
                return x1("totalPaymentInDollars");
            })
            .attr("y", function (d) {
                return y0(d["totalPaymentInDollars"]) + topSpace + margin.top;
            })
            .attr("height", function (d) {
                return graphHeight - y0(d["totalPaymentInDollars"]);
            })
            .style("fill", function (d) {
                return color("totalPaymentInDollars");
            });
        if (status === 0 || status === 1) {
            blues
                .on("mouseover", function (e) {
                    blueLabel(d3.select(this), d3.select(this).data()[0]["state"], status);
                    blueText(d3.select(this), d3.select(this).data()[0]["state"], status);
                })
                .on("mouseleave", function (e) {
                    barColorRecover(status);
                });
        }
        const purples = base
            .append("rect")
            .attr("class", (d) => d.state)
            .attr("id", (d) => `${d.state}Purple`)
            .attr("width", x1.bandwidth())
            .attr("x", function (d) {
                return x1("averageMonthlyParticipation");
            })
            .attr("y", function (d) {
                return y1(d["averageMonthlyParticipation"]) + topSpace + margin.top;
            })
            .attr("height", function (d) {
                return graphHeight - y1(d["averageMonthlyParticipation"]);
            })
            .style("fill", function (d) {
                return color("averageMonthlyParticipation");
            });
        if (status === 0 || status === 2) {
            purples
                .on("mouseover", function (e) {
                    purpleLabel(d3.select(this), d3.select(this).data()[0]["state"], status);
                    purpleText(d3.select(this), d3.select(this).data()[0]["state"], status);
                })
                .on("mouseleave", function (e) {
                    barColorRecover(status);
                });
        }
        d3.select(rn.current)
            .select(".x.axis")
            .selectAll(".tick")
            .on("mouseover", function (e) {
                d3.select(rn.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                const state = d3.select(this).data();
                if (status === 0 || status === 1) {
                    blueLabel(d3.select(rn.current).selectAll(`#${state}Blue`), state, status);
                }
                if (status === 0 || status === 2) {
                    purpleLabel(d3.select(rn.current).selectAll(`#${state}Purple`), state, status);
                }
                if (status === 0 || status === 1) {
                    d3.select(rn.current).selectAll(`#${state}Blue`).style("opacity", 1);
                    blueText(d3.select(rn.current).selectAll(`#${state}Blue`), state, status);
                }
                if (status === 0 || status === 2) {
                    purpleText(d3.select(rn.current).selectAll(`#${state}Purple`), state, status);
                }
            })
            .on("mouseleave", function () {
                barColorRecover(status);
            });
        const y0_g = d3.scaleLinear().range([graphHeight, 0]);
        const y1_g = d3.scaleLinear().range([graphHeight, 0]);
        y0_g.domain([0, 0.12]);
        y1_g.domain([0, 0.12]);
        const y0AxisGrid = d3
            .axisLeft(y0_g)
            .tickSizeOuter(0)
            .tickSize(-graphWidth / 2)
            .tickFormat((d) => `${d * 100}%`)
            .ticks(5);
        const y0GridTicks = d3
            .select(rn.current)
            .append("g")
            .attr("class", "y0 axis-grid")
            .attr("transform", `translate(${margin.left}, ${topSpace + margin.top})`)
            .call(y0AxisGrid);
        y0GridTicks.selectAll(".tick").selectAll("line").style("opacity", 0.1);
        y0GridTicks
            .selectAll("text")
            .attr("x", graphWidth / 2)
            .attr("dy", "-0.75em")
            .style("color", "#A3A3A3")
            .style("font-size", "1em");
        y0GridTicks
            .selectAll("text")
            .filter((d, i) => i === 0)
            .style("opacity", "0%");
        const y1AxisGrid = d3
            .axisRight(y1_g)
            .tickSizeOuter(0)
            .tickSize(-graphWidth / 2)
            .tickFormat("")
            .ticks(5);
        d3.select(rn.current)
            .append("g")
            .attr("class", "y1 axis-grid")
            .attr("transform", `translate(${margin.left + graphWidth}, ${topSpace + margin.top})`)
            .call(y1AxisGrid)
            .selectAll(".tick")
            .style("opacity", 0.1);

        barColorRecover(status);
    };
    return (
        <div>
            <Styles>
                <svg ref={rn} id="SNAPBarChart" />
                <div ref={tooltipRn} />
            </Styles>
        </div>
    );
}
