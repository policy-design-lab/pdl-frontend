import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { randomBytes } from "crypto";
import { ShortFormat, ToPercentageString, ToDollarString } from "../../shared/ConvertionFormats";

export default function CropInsuranceBar({
    CIData,
    status,
    yearKey,
    barKeyAttr,
    margin,
    topSpace,
    w,
    h,
    color1,
    color2,
    widthPercentage,
    heightPercentage
}: {
    CIData: any;
    status: number;
    yearKey: string;
    barKeyAttr: string;
    margin: { top: number; right: number; bottom: number; left: number };
    topSpace: number;
    w: number;
    h: number;
    color1: string;
    color2: string;
    widthPercentage: number;
    heightPercentage: number;
}): JSX.Element {
    const rnBar = React.useRef(null);
    const Styles = styled.div`
        svg {
            font-family: "Roboto", sans-serif;
        }

        .y0.axis path,
        .y0.axis line,
        .y1.axis path,
        .y1.axis line,
        .x.axis path,
        .x.axis line {
            stroke: #000;
            opacity: 10%;
        }

        .y0.axis text {
            color: ${color1};
        }

        .y1.axis text {
            color: ${color2};
        }
        .y0.axis .tick line,
        .x.axis .tick line,
        .y1.axis .tick line {
            visibility: hidden;
        }

        .x.axis text {
            fill: #00000099;
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

    const [width, setWidth] = React.useState(w);
    const [height, setHeight] = React.useState(h);
    const handleResize: () => void = () => {
        setWidth(window.innerWidth * widthPercentage);
        setHeight(window.innerWidth * heightPercentage);
    };
    const [whichBar, setWhichBar] = React.useState(barKeyAttr);
    const [barStatus, setBarStatus] = React.useState(status);
    React.useEffect(() => {
        d3.select(rnBar.current).html("");
        setWhichBar(barKeyAttr);
        setBarStatus(status);
        if (["0", "00", "01", "02", "03"].includes(whichBar)) {
            if (barStatus === 0) {
                renderTotalBar();
            } else if (barStatus === 1) {
                renderSingleBar(
                    prepStackedBarData(CIData[yearKey]),
                    "totalFarmerPaidPremiumInDollars",
                    "Farmer Paid Premium ($)",
                    "Farmer Paid Premium",
                    color1
                );
            } else if (barStatus === 2)
                renderSingleBar(
                    prepStackedBarData(CIData[yearKey]),
                    "totalPremiumSubsidyInDollars",
                    "Premium Subsidy ($)",
                    "Premium Subsidy",
                    color2
                );
        } else if (barStatus === 3) {
            renderDuoBar(prepDueBarData(CIData[yearKey], "totalPoliciesEarningPremium"));
        } else if (barStatus === 4) {
            renderSingleBar(
                prepDueBarData(CIData[yearKey], "totalPoliciesEarningPremium"),
                "totalPoliciesEarningPremium",
                "Total Policies Earning Premium ($)",
                "Total Policies Earning Premium",
                color1
            );
        } else if (barStatus === 5)
            renderSingleBar(
                prepDueBarData(CIData[yearKey], "totalIndemnitiesInDollars"),
                "totalIndemnitiesInDollars",
                "Total Indemnities ($)",
                "Total Indemnities",
                color2
            );
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });

    const prepStackedBarData = (data) => {
        data.sort(function (a, b) {
            if (a.programs[0].totalPremiumInDollars === b.programs[0].totalPremiumInDollars) return 0;
            if (a.programs[0].totalPremiumInDollars > b.programs[0].totalPremiumInDollars) return -1;
            return 1;
        });
        const states = data.map((d) => d.state);
        const res = states.map((state, i) => ({
            state,
            totalFarmerPaidPremiumInDollars: data[i].programs[0].totalFarmerPaidPremiumInDollars,
            totalPremiumSubsidyInDollars: data[i].programs[0].totalPremiumSubsidyInDollars
        }));
        return res;
    };
    const prepDueBarData = (data, sortedAttr) => {
        data.sort(function (a, b) {
            if (a.programs[0][sortedAttr] === b.programs[0][sortedAttr]) return 0;
            if (a.programs[0][sortedAttr] > b.programs[0][sortedAttr]) return -1;
            return 1;
        });
        const states = data.map((d) => d.state);
        const res = states.map((state, i) => ({
            state,
            totalPoliciesEarningPremium: data[i].programs[0].totalPoliciesEarningPremium,
            totalIndemnitiesInDollars: data[i].programs[0].totalIndemnitiesInDollars
        }));
        return res;
    };
    const barColorRecover = () => {
        d3.select(rnBar.current).selectAll(".leftLine").remove();
        d3.select(rnBar.current).selectAll(".leftText").remove();
        d3.select(rnBar.current).selectAll(".leftInfo").remove();
        d3.select(rnBar.current).selectAll(".rightLine").remove();
        d3.select(rnBar.current).selectAll(".rightText").remove();
        d3.select(rnBar.current).selectAll(".rightInfo").remove();
        d3.select(rnBar.current).select(".x.axis").selectAll("text").style("opacity", 1);
        d3.select(rnBar.current).select(".x.axis").selectAll(".tick").select("text").style("font-weight", 400);
        d3.select(rnBar.current)
            .selectAll(".barChart")
            .selectAll("rect")
            .nodes()
            .forEach((d) => {
                d3.select(d).style("opacity", 1);
            });
    };
    const renderTotalBar = () => {
        d3.select(rnBar.current).html("");
        const data = prepStackedBarData(CIData[yearKey]);
        const stack = d3.stack().keys(["totalFarmerPaidPremiumInDollars", "totalPremiumSubsidyInDollars"])(data);

        const keys = Object.keys(data[0]).slice(1);

        stack.map((d, i) => {
            d.map((item: { key: string }) => {
                item.key = keys[i];
                return item;
            });
            return d;
        });
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom - topSpace;
        const TotalLabel = (TotalBars, state) => {
            d3.select(rnBar.current).select(".x.axis").selectAll("text").style("opacity", 0.1);
            d3.select(rnBar.current).select(`.x-${state}`).select("text").style("font-weight", 600).style("opacity", 1);

            d3.select(rnBar.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
            TotalBars.style("opacity", 1);
            const topBar = d3.select(TotalBars.nodes()[1]);
            const leftLineData = [
                {
                    x: Number(topBar.attr("x")) + Number(topBar.attr("width")) + margin.left,
                    y: topBar.attr("y")
                },
                { x: margin.left, y: topBar.attr("y") }
            ];
            d3.select(rnBar.current)
                .append("path")
                .attr("class", "leftLine")
                .attr("d", lineGenerator(leftLineData))
                .attr("stroke", "#672500")
                .attr("stroke-width", parseFloat(topBar.attr("width")) / 4)
                .attr("fill", "none");
        };
        const TotalText = (TotalBars, state) => {
            const bottomBar = d3.select(TotalBars.nodes()[0]);
            const topBar = d3.select(TotalBars.nodes()[1]);
            const leftTextContent1 = `Total Premium: $${ToDollarString(
                bottomBar.data()[0].data.totalFarmerPaidPremiumInDollars +
                    topBar.data()[0].data.totalPremiumSubsidyInDollars,
                6
            )}`;
            const leftText1 = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent1);
            const leftBox1 = leftText1.node().getBBox();
            leftText1.remove();
            const leftTextBK1 = d3
                .select(rnBar.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo1`)
                .attr("x", margin.left)
                .attr("y", topBar.attr("y") - InfoGap * 2 - leftBox1.height)
                .attr("width", leftBox1.width + textPadding * 2)
                .attr("height", leftBox1.height + textPadding)
                .attr("fill", "#672500")
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr("x", margin.left + textPadding)
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText2`)
                .text(leftTextContent1)
                .style("font-size", "0.81rem")
                .style("fill", "white");
            d3.select(rnBar.current)
                .append("text")
                .attr("x", margin.left + leftBox1.width + textPadding * 2 + textPadding / 2)
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText2`)
                .text("=")
                .style("font-size", "0.81rem")
                .style("fill", "black");
            const leftTextContent2 = `Total Farmer Paid Premium: $${ToDollarString(
                bottomBar.data()[0].data.totalFarmerPaidPremiumInDollars,
                6
            )}`;
            const leftText2 = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent2);
            const leftBox2 = leftText2.node().getBBox();
            leftText2.remove();
            const leftTextBK2 = d3
                .select(rnBar.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo2`)
                .attr("x", margin.left + leftBox1.width + textPadding * 4)
                .attr("y", topBar.attr("y") - InfoGap * 2 - leftBox2.height)
                .attr("width", leftBox2.width + textPadding * 2)
                .attr("height", leftBox2.height + textPadding)
                .attr("fill", color1)
                .attr("opacity", 1)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr("x", margin.left + leftBox1.width + textPadding * 4 + textPadding)
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText2`)
                .text(leftTextContent2)
                .style("font-size", "0.81rem")
                .style("fill", "white");
            d3.select(rnBar.current)
                .append("text")
                .attr(
                    "x",
                    margin.left +
                        leftBox1.width +
                        textPadding * 4 +
                        textPadding +
                        leftBox2.width +
                        textPadding +
                        textPadding / 2
                )
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText2`)
                .text("+")
                .style("font-size", "0.81rem")
                .style("fill", "black");
            const leftTextContent3 = `Total Premium Subsidy: $${ToDollarString(
                topBar.data()[0].data.totalPremiumSubsidyInDollars,
                6
            )}`;

            const leftText3 = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent3);
            const leftBox3 = leftText3.node().getBBox();
            leftText3.remove();
            const leftTextBK3 = d3
                .select(rnBar.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo2`)
                .attr(
                    "x",
                    margin.left + leftBox1.width + textPadding * 4 + textPadding + leftBox2.width + textPadding * 3
                )
                .attr("y", topBar.attr("y") - InfoGap * 2 - leftBox3.height)
                .attr("width", leftBox3.width + textPadding * 2)
                .attr("height", leftBox3.height + textPadding)
                .attr("fill", color2)
                .attr("opacity", 1)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr(
                    "x",
                    margin.left +
                        leftBox1.width +
                        textPadding * 4 +
                        textPadding +
                        leftBox2.width +
                        textPadding +
                        textPadding * 3
                )
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText3`)
                .text(leftTextContent3)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };

        const x0 = d3.scaleBand().range([0, graphWidth]).paddingInner(0.4).paddingOuter(0.4);
        const y0 = d3.scaleLinear().range([graphHeight, 0]);
        const xAxis = d3.axisBottom(x0).ticks(5).tickSizeOuter(0);
        const yAxisLeft = d3
            .axisLeft(y0)
            .ticks(10)
            .tickFormat(function (d) {
                return `$${ShortFormat(parseInt(d, 10))}`;
            })
            .tickSizeOuter(0);
        x0.domain(
            data.map(function (d) {
                return d.state;
            })
        );
        const yMax = d3.max(data, (d) => keys.reduce((acc, k) => acc + d[k], 0));
        y0.domain([0, yMax * 1.1]);
        d3.select(rnBar.current).attr("width", width).attr("height", height).append("g");
        const x_axis = d3
            .select(rnBar.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin.left},${topSpace + graphHeight + margin.top})`)
            .call(xAxis);
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        d3.select(rnBar.current)
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
            .text("Total Premium ($)")
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rnBar.current)
            .select(".y0.axis")
            .selectAll(".tick")
            .style("fill", color1)
            .style("font-size", "0.7rem");
        const base = d3
            .select(rnBar.current)
            .append("g")
            .attr("class", "barChart")
            .attr("transform", `translate(${margin.left},0)`);
        const temp = base
            .selectAll("g")
            .data(stack)
            .enter()
            .append("g")
            .selectAll("rect")
            .data((d) => d)
            .enter();

        temp.append("rect")
            .attr("x", (d, i) => {
                return x0(data[i].state);
            })
            .attr("width", x0.bandwidth())
            .attr("height", (d) => {
                return y0(d[0]) - y0(d[1]);
            })
            .attr("y", (d) => y0(d[1]) + topSpace + margin.top)
            .attr("fill", (d) => (d.key === "totalFarmerPaidPremiumInDollars" ? color1 : color2))
            .attr("class", (d) => d.key)
            .attr("id", (d) => `${d.data.state}${d.key}`);
        const bar1 = base.selectAll("rect").filter((d) => d.key === "totalFarmerPaidPremiumInDollars");
        const bar2 = base.selectAll("rect").filter((d) => d.key === "totalPremiumSubsidyInDollars");
        bar1.on("mouseover", function (e) {
            const allRect = base.selectAll("rect").filter((d) => d.data.state === d3.select(this).data()[0].data.state);
            TotalLabel(allRect, d3.select(this).data()[0].data.state);
            TotalText(allRect, d3.select(this).data()[0].data.state);
        }).on("mouseleave", function (e) {
            barColorRecover();
        });
        bar2.on("mouseover", function (e) {
            const allRect = base.selectAll("rect").filter((d) => d.data.state === d3.select(this).data()[0].data.state);
            TotalLabel(allRect, d3.select(this).data()[0].data.state);
            TotalText(allRect, d3.select(this).data()[0].data.state);
        }).on("mouseleave", function (e) {
            barColorRecover();
        });
        d3.select(rnBar.current)
            .select(".x.axis")
            .selectAll(".tick")
            .on("mouseover", function (e) {
                const state = d3.select(this).data()[0];
                if (status === 0) {
                    const allRect = base.selectAll("rect").filter((d) => d.data.state === state);
                    TotalLabel(allRect, state);
                    TotalText(allRect, state);
                }
            })
            .on("mouseout", function () {
                barColorRecover();
            });
    };
    const renderSingleBar = (data, attr, yLabel, tipText, color) => {
        d3.select(rnBar.current).html("");
        data.sort(function (a, b) {
            if (a[attr] === b[attr]) return 0;
            if (a[attr] > b[attr]) return -1;
            return 1;
        });
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom - topSpace;
        const x0 = d3.scaleBand().range([0, graphWidth]).paddingInner(0.4).paddingOuter(0.4);
        const y0 = d3.scaleLinear().range([graphHeight, 0]);
        const xAxis = d3.axisBottom(x0).ticks(5).tickSizeOuter(0);
        const yAxisLeft = d3
            .axisLeft(y0)
            .ticks(10)
            .tickFormat(function (d) {
                return `$${ShortFormat(parseInt(d, 10))}`;
            })
            .tickSizeOuter(0);
        x0.domain(
            data.map(function (d) {
                return d.state;
            })
        );
        y0.domain([0, d3.max(data, (d) => d[attr] * 1.01)]);
        d3.select(rnBar.current).attr("width", width).attr("height", height).append("g");
        const x_axis = d3
            .select(rnBar.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin.left},${topSpace + graphHeight + margin.top})`)
            .call(xAxis);
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        d3.select(rnBar.current)
            .append("g")
            .attr("class", "y0 axis")
            .call(yAxisLeft)
            .attr("transform", `translate(${margin.left}, ${topSpace + margin.top})`)
            .append("text")
            .attr("x", 0 - margin.left)
            .attr("y", -margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .style("fill", color)
            .text(yLabel)
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rnBar.current)
            .select(".y0.axis")
            .selectAll(".tick")
            .style("fill", color)
            .style("font-size", "0.7rem");
        const base = d3
            .select(rnBar.current)
            .selectAll(null)
            .data(data)
            .enter()
            .append("g")
            .attr("class", "barChart")
            .attr("transform", function (d) {
                return `translate(${x0(d.state) + margin.left},0)`;
            });

        const bars = base
            .append("rect")
            .attr("class", (d) => d.state)
            .attr("id", (d) => `${d.state + attr}`)
            .attr("width", x0.bandwidth())
            .attr("x", function (d) {
                return x0(attr);
            })
            .attr("y", function (d) {
                return y0(d[attr]) + topSpace + margin.top;
            })
            .attr("height", function (d) {
                return graphHeight - y0(d[attr]);
            })
            .style("fill", color);
        const createLabel = (Bar, state) => {
            d3.select(rnBar.current).select(".x.axis").selectAll("text").style("opacity", 0.1);
            d3.select(rnBar.current).select(`.x-${state}`).select("text").style("font-weight", 600).style("opacity", 1);

            d3.select(rnBar.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
            Bar.style("opacity", 1);
            const topBar = Bar;
            // eslint-disable-next-line no-restricted-globals
            const mousePos = d3.pointer(event, d3.select(rnBar.current).select(".y0.axis").node());
            // eslint-disable-next-line no-restricted-globals
            const minusMouse = d3.pointer(event, topBar.node());
            const leftLineData = [
                {
                    x: mousePos[0] + margin.left + parseFloat(topBar.attr("width")) - minusMouse[0],
                    y: topBar.attr("y")
                },
                { x: margin.left, y: topBar.attr("y") }
            ];
            d3.select(rnBar.current)
                .append("path")
                .attr("class", "leftLine")
                .attr("d", lineGenerator(leftLineData))
                .attr("stroke", color)
                .attr("stroke-width", parseFloat(topBar.attr("width")) / 4)
                .attr("fill", "none");
        };
        const createText = (Bar, state) => {
            const topBar = Bar;

            const leftTextContent3 = `${tipText}: $${ToDollarString(topBar.data()[0][attr], 6)}`;
            const leftText3 = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent3);
            const leftBox3 = leftText3.node().getBBox();
            leftText3.remove();
            const leftTextBK3 = d3
                .select(rnBar.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo2`)
                .attr("x", margin.left)
                .attr("y", topBar.attr("y") - InfoGap * 2 - leftBox3.height)
                .attr("width", leftBox3.width + textPadding * 2)
                .attr("height", leftBox3.height + textPadding)
                .attr("fill", color)
                .attr("opacity", 1)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr("x", margin.left + textPadding)
                .attr("y", topBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText3`)
                .text(leftTextContent3)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };
        bars.on("mouseover", function (e) {
            createLabel(d3.select(this), d3.select(this).data()[0].state);
            createText(d3.select(this), d3.select(this).data()[0].state);
        }).on("mouseleave", function (e) {
            barColorRecover();
        });
        barColorRecover();
    };
    const renderDuoBar = (data) => {
        d3.select(rnBar.current).html("");
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom - topSpace;
        const color = d3
            .scaleOrdinal()
            .domain(["totalPoliciesEarningPremium", "totalIndemnitiesInDollars"])
            .range([color1, color2]);
        const totalIndemnitiesInDollarsLabel = (totalIndemnitiesInDollarsBar, state) => {
            if (status === 3 || status === 4) {
                d3.select(rnBar.current).select(".x.axis").selectAll("text").style("opacity", 0.1);
                d3.select(rnBar.current)
                    .select(`.x-${state}`)
                    .select("text")
                    .style("font-weight", 600)
                    .style("opacity", 1);
                d3.select(rnBar.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                totalIndemnitiesInDollarsBar.style("opacity", 1);
                // eslint-disable-next-line no-restricted-globals
                const mousePos = d3.pointer(event, d3.select(rnBar.current).select(".y1.axis").node());
                // eslint-disable-next-line no-restricted-globals
                const minusMouse = d3.pointer(event, totalIndemnitiesInDollarsBar.node());
                const rightLineData = [
                    {
                        x:
                            margin.left +
                            graphWidth +
                            mousePos[0] -
                            minusMouse[0] +
                            parseFloat(totalIndemnitiesInDollarsBar.attr("width")),
                        y: totalIndemnitiesInDollarsBar.attr("y")
                    },
                    { x: margin.left + graphWidth, y: totalIndemnitiesInDollarsBar.attr("y") }
                ];
                d3.select(rnBar.current)
                    .append("path")
                    .attr("class", "rightLine")
                    .attr("d", lineGenerator(rightLineData))
                    .attr("stroke", color2)
                    .attr("stroke-width", parseFloat(totalIndemnitiesInDollarsBar.attr("width")) / 2)
                    .attr("fill", "none");
            }
        };
        const totalIndemnitiesInDollarsText = (totalIndemnitiesInDollarsBar, state) => {
            const rightTextContent = `Total Indemnities: ${ToDollarString(
                totalIndemnitiesInDollarsBar.data()[0].totalIndemnitiesInDollars,
                0
            )} `;
            const rightText = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(rightTextContent);
            const rightBox = rightText.node().getBBox();
            rightText.remove();
            d3.select(rnBar.current)
                .append("rect")
                .attr("class", "rightInfo")
                .attr("id", `${state}RightInfo`)
                .attr("x", graphWidth + margin.left - InfoGap * 2 - rightBox.width)
                .attr("y", totalIndemnitiesInDollarsBar.attr("y") - InfoGap * 2 - rightBox.height)
                .attr("width", rightBox.width + textPadding * 2)
                .attr("height", rightBox.height + textPadding)
                .attr("fill", color2)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr("x", graphWidth + margin.left - InfoGap - rightBox.width)
                .attr("y", totalIndemnitiesInDollarsBar.attr("y") - InfoGap * 2)
                .attr("class", "rightText")
                .attr("id", `${state}RightText`)
                .text(rightTextContent)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };
        const totalPoliciesEarningPremiumLabel = (totalPoliciesEarningPremiumBar, state) => {
            d3.select(rnBar.current).select(".x.axis").selectAll("text").style("opacity", 0.1);
            d3.select(rnBar.current).select(`.x-${state}`).select("text").style("font-weight", 600).style("opacity", 1);
            if (status === 3 || status === 4) {
                d3.select(rnBar.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                totalPoliciesEarningPremiumBar.style("opacity", 1);
                // eslint-disable-next-line no-restricted-globals
                const mousePos = d3.pointer(event, d3.select(rnBar.current).select(".y0.axis").node());
                // eslint-disable-next-line no-restricted-globals
                const minusMouse = d3.pointer(event, totalPoliciesEarningPremiumBar.node());
                const leftLineData = [
                    {
                        x:
                            mousePos[0] +
                            margin.left +
                            parseFloat(totalPoliciesEarningPremiumBar.attr("width")) -
                            minusMouse[0],
                        y: totalPoliciesEarningPremiumBar.attr("y")
                    },
                    { x: margin.left, y: totalPoliciesEarningPremiumBar.attr("y") }
                ];
                d3.select(rnBar.current)
                    .append("path")
                    .attr("class", "leftLine")
                    .attr("d", lineGenerator(leftLineData))
                    .attr("stroke", color1)
                    .attr("stroke-width", parseFloat(totalPoliciesEarningPremiumBar.attr("width")) / 2)
                    .attr("fill", "none");
            }
        };
        const totalPoliciesEarningPremiumText = (totalPoliciesEarningPremiumBar, state) => {
            const leftTextContent = `Total Policies Earning Premium: $${ToDollarString(
                totalPoliciesEarningPremiumBar.data()[0].totalPoliciesEarningPremium,
                0
            )}`;
            const leftText = d3
                .select(rnBar.current)
                .append("text")
                .style("font-size", "0.81rem")
                .attr("x", -1000)
                .attr("y", -1000)
                .text(leftTextContent);
            const leftBox = leftText.node().getBBox();
            leftText.remove();
            d3.select(rnBar.current)
                .append("rect")
                .attr("class", "leftInfo")
                .attr("id", `${state}LeftInfo`)
                .attr("x", margin.left)
                .attr("y", totalPoliciesEarningPremiumBar.attr("y") - InfoGap * 2 - leftBox.height)
                .attr("width", leftBox.width + textPadding * 2)
                .attr("height", leftBox.height + textPadding)
                .attr("fill", color1)
                .attr("rx", 3)
                .attr("ry", 3);
            d3.select(rnBar.current)
                .append("text")
                .attr("x", margin.left + textPadding)
                .attr("y", totalPoliciesEarningPremiumBar.attr("y") - InfoGap * 2)
                .attr("class", "leftText")
                .attr("id", `${state}LeftText`)
                .text(leftTextContent)
                .style("font-size", "0.81rem")
                .style("fill", "white");
        };
        const x0 = d3.scaleBand().range([0, graphWidth]).paddingInner(0.4).paddingOuter(0.4);
        const x1 = d3.scaleBand();
        const y0 = d3.scaleLinear().range([graphHeight, 0]);
        const y1 = d3.scaleLinear().range([graphHeight, 0]);
        const xAxis = d3.axisBottom(x0).ticks(5).tickSizeOuter(0);
        const yAxisLeft = d3
            .axisLeft(y0)
            .ticks(10)
            .tickFormat(function (d) {
                return `$${ShortFormat(parseInt(d, 10))}`;
            })
            .tickSizeOuter(0);
        const yAxisRight = d3
            .axisRight(y1)
            .tickFormat(function (d) {
                return ShortFormat(parseInt(d, 10));
            })
            .tickSizeOuter(0);
        x0.domain(
            data.map(function (d) {
                return d.state;
            })
        );
        x1.domain(["totalPoliciesEarningPremium", "totalIndemnitiesInDollars"]).range([0, x0.bandwidth()]);
        y0.domain([
            0,
            d3.max(data, function (d) {
                return d.totalPoliciesEarningPremium * 1.11;
            })
        ]);
        y1.domain([
            0,
            d3.max(data, function (d) {
                return d.totalIndemnitiesInDollars * 1.11;
            })
        ]);
        d3.select(rnBar.current).attr("width", width).attr("height", height).append("g");
        const x_axis = d3
            .select(rnBar.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin.left},${topSpace + graphHeight + margin.top})`)
            .call(xAxis);
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        d3.select(rnBar.current)
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
            .text("Total Policies Earning Premium ($)")
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rnBar.current)
            .select(".y0.axis")
            .selectAll(".tick")
            .style("fill", color1)
            .style("font-size", "0.7rem");
        d3.select(rnBar.current)
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
            .text("Total Indemnities ($)")
            .style("font-weight", "400")
            .style("font-size", "0.785rem");
        d3.select(rnBar.current)
            .select(".y1.axis")
            .selectAll(".tick")
            .style("fill", color2)
            .style("font-size", "0.7rem");
        const base = d3
            .select(rnBar.current)
            .selectAll(null)
            .data(data)
            .enter()
            .append("g")
            .attr("class", "barChart")
            .attr("transform", function (d) {
                return `translate(${x0(d.state) + margin.left},0)`;
            });
        const totalPoliciesEarningPremiums = base
            .append("rect")
            .attr("class", (d) => d.state)
            .attr("id", (d) => `${d.state}Blue`)
            .attr("width", x1.bandwidth())
            .attr("x", function (d) {
                return x1("totalPoliciesEarningPremium");
            })
            .attr("y", function (d) {
                return y0(d.totalPoliciesEarningPremium) + topSpace + margin.top;
            })
            .attr("height", function (d) {
                return graphHeight - y0(d.totalPoliciesEarningPremium);
            })
            .style("fill", function (d) {
                return color("totalPoliciesEarningPremium");
            });
        if (status === 3 || status === 4) {
            totalPoliciesEarningPremiums
                .on("mouseover", function (e) {
                    totalPoliciesEarningPremiumLabel(d3.select(this), d3.select(this).data()[0].state);
                    totalPoliciesEarningPremiumText(d3.select(this), d3.select(this).data()[0].state);
                })
                .on("mouseleave", function (e) {
                    barColorRecover();
                });
        }
        const totalIndemnitiesInDollarss = base
            .append("rect")
            .attr("class", (d) => d.state)
            .attr("id", (d) => `${d.state}Purple`)
            .attr("width", x1.bandwidth())
            .attr("x", function (d) {
                return x1("totalIndemnitiesInDollars");
            })
            .attr("y", function (d) {
                return y1(d.totalIndemnitiesInDollars) + topSpace + margin.top;
            })
            .attr("height", function (d) {
                return graphHeight - y1(d.totalIndemnitiesInDollars);
            })
            .style("fill", function (d) {
                return color("totalIndemnitiesInDollars");
            });
        if (status === 3 || status === 5) {
            totalIndemnitiesInDollarss
                .on("mouseover", function (e) {
                    totalIndemnitiesInDollarsLabel(d3.select(this), d3.select(this).data()[0].state);
                    totalIndemnitiesInDollarsText(d3.select(this), d3.select(this).data()[0].state);
                })
                .on("mouseleave", function (e) {
                    barColorRecover();
                });
        }
        d3.select(rnBar.current)
            .select(".x.axis")
            .selectAll(".tick")
            .on("mouseover", function (e) {
                d3.select(rnBar.current).selectAll(".barChart").selectAll("rect").style("opacity", 0.1);
                const state = d3.select(this).data();
                if (status === 3 || status === 4) {
                    totalPoliciesEarningPremiumLabel(d3.select(rnBar.current).selectAll(`#${state}Blue`), state);
                }
                if (status === 3 || status === 5) {
                    totalIndemnitiesInDollarsLabel(d3.select(rnBar.current).selectAll(`#${state}Purple`), state);
                }
                if (status === 3 || status === 4) {
                    d3.select(rnBar.current).selectAll(`#${state}Blue`).style("opacity", 1);
                    totalPoliciesEarningPremiumText(d3.select(rnBar.current).selectAll(`#${state}Blue`), state);
                }
                if (status === 3 || status === 5) {
                    totalIndemnitiesInDollarsText(d3.select(rnBar.current).selectAll(`#${state}Purple`), state);
                }
            })
            .on("mouseleave", function () {
                barColorRecover();
            });
        barColorRecover();
    };
    return (
        <div>
            <Styles>
                <svg ref={rnBar} id="CropInsuranceBarChart" />
            </Styles>
        </div>
    );
}
