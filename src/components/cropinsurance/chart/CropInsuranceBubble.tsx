import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import ReactDOMServer from "react-dom/server";
import { ToDollarString } from "../../shared/ConvertionFormats";
import { DownloadIcon } from "../../shared/DownloadIcon";

export default function CropInsuranceBubble({ originalData, initChartWidthRatio, stateCodesData, startYear, endYear }): JSX.Element {
    const rn = React.useRef(null);
    const baseColor = "#00000099";
    const lightGreen = "#66BB6A33";
    const darkGreen = "#205026";
    const lightBrown = "#DCC9B9";
    const darkBrown = "#412813";
    const Styles = styled.div`
        svg {
            font-family: "Roboto", sans-serif;
        }
        .y.axis path,
        .y.axis line,
        .x.axis path,
        .x.axis line {
            stroke: #000;
            opacity: 10%;
        }

        .x.axis text,
        .y.axis text {
            color: ${baseColor};
        }

        .x.axis .tick line,
        .y.axis .tick line {
            visibility: hidden;
        }
    `;
    const margin = 30;
    const tipWidth = 300;
    const tipHeight = 200;
    const data = originalData.map((obj) => ({ ...obj }));
    const [width, setWidth] = React.useState(window.innerWidth * initChartWidthRatio);
    const [height, setHeight] = React.useState((window.innerWidth * initChartWidthRatio) / 2);
    const graphWidth = width - margin * 4;
    const graphHeight = height - margin * 4;
    const [bubbleStatus, setBubbleStatus] = React.useState(0);
    const [stateCodes, setStateCodes] = React.useState(stateCodesData);
    const handleResize: () => void = () => {
        setWidth(window.innerWidth * initChartWidthRatio);
        setHeight((window.innerWidth * initChartWidthRatio) / 2);
    };
    const switchBubbleStatus = (event, selectItem) => {
        if (selectItem !== null) {
            setBubbleStatus(selectItem);
        }
    };
    React.useEffect(() => {
        renderBubble(bubbleStatus);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });
    const scaling = (value, maxCut, minCut, max, min) => {
        const temp = (value - min) / (max - min);
        return value === 0 ? 0 : temp * (maxCut - minCut) + minCut;
    };
    const renderBubble = (zoneSelection) => {
        d3.select(rn.current).selectAll("*").remove();
        data.forEach((d) => {
            d.SqrtResult = Math.sqrt(Math.abs(d.OriginalNetFarmerBenefit));
            d.OriginalTotalFarmerPaidPremium = d.TotalFarmerPaidPremium;
            d.OriginalTotalIndemnities = d.TotalIndemnities;
            d.TotalFarmerPaidPremium =
                Math.sqrt(Math.abs(d.TotalFarmerPaidPremium)) * Math.sign(d.TotalFarmerPaidPremium);
            d.TotalIndemnities = Math.sqrt(Math.abs(d.TotalIndemnities)) * Math.sign(d.TotalIndemnities);
        });
        let maxNetFarmerBenefit = d3.max(data, function (d) {
            return d.SqrtResult;
        });
        const minNetFarmerBenefit = d3.min(data, function (d) {
            return d.SqrtResult;
        });
        data.forEach((d) => {
            d.NetFarmerBenefit = scaling(d.SqrtResult, 10000, 100, maxNetFarmerBenefit, minNetFarmerBenefit);
        });
        const z = d3
            .scaleLinear()
            .domain([
                d3.min(data, function (d) {
                    return d.NetFarmerBenefit;
                }),
                d3.max(data, function (d) {
                    return d.NetFarmerBenefit;
                })
            ])
            .range([5, 60]);

        maxNetFarmerBenefit = d3.max(data, function (d) {
            return d.NetFarmerBenefit;
        });
        const x = d3
            .scaleLinear()
            .range([0, graphWidth])
            .domain([
                0,
                d3.max(data, function (d) {
                    return d.TotalIndemnities;
                }) * 1.1
            ]);
        const y = d3
            .scaleLinear()
            .range([graphHeight, 0])
            .domain([
                0,
                d3.max(data, function (d) {
                    return d.TotalFarmerPaidPremium;
                }) * 1.1
            ]);
        const xAxis = d3
            .axisBottom(x)
            .ticks(15)
            .tickSizeOuter(0)
            .tickValues(x.ticks().filter((value) => value !== 0))
            .tickFormat((d) => {
                return ToDollarString(String(d ** 2 * Math.sign(d)), 6);
            });
        const yAxis = d3
            .axisLeft(y)
            .ticks(10)
            .tickSizeOuter(0)
            .tickFormat((d) => {
                return ToDollarString(String(d ** 2 * Math.sign(d)), 6);
            });
        d3.select(rn.current).attr("width", width).attr("height", height).append("g");

        const x_axis = d3
            .select(rn.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin * 2},${margin * 2 + graphHeight})`)
            .call(xAxis)
            .append("text")
            .attr("x", graphWidth / 2)
            .attr("y", 16 + margin)
            .style("text-anchor", "start")
            .style("fill", baseColor)
            .text("Total Indemnities ($)")
            .style("font-weight", "400")
            .style("font-size", "1.2em");
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        const y_axis = d3
            .select(rn.current)
            .append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .attr("transform", `translate(${margin * 2}, ${margin * 2})`)
            .append("text")
            .attr("x", -1 * margin)
            .attr("y", -16 - margin / 2)
            .style("text-anchor", "start")
            .style("fill", baseColor)
            .text("Farmer Paid Premium ($)")
            .style("font-weight", "400")
            .style("font-size", "1.2em");
        const base = d3.select(rn.current).selectAll("dot").data(data).enter();

        const maxY = d3.max(data, function (d) {
            return d.TotalFarmerPaidPremium;
        });
        const lineData = [
            { x: 0, y: 0 },
            { x: maxY * 1.1, y: maxY * 1.1 }
        ];
        const lineG = d3
            .line()
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.y);
            });
        if (Number(zoneSelection) === 1) {
            const point1 = `${(margin * 2).toString()},${(margin * 2 + graphHeight).toString()}`;
            const point2 = `${(margin * 2 + x(maxY * 1.1)).toString()},${(y(maxY * 1.1) + margin * 2).toString()}`;
            const point3 = `${(margin + graphWidth + margin).toString()},${(margin * 2).toString()}`;
            const point4 = `${(margin + graphWidth + margin).toString()},${(margin * 2 + graphHeight).toString()}`;
            base.append("polygon")
                .attr("id", "greenBackground")
                .attr("points", `${point1} ${point2} ${point3} ${point4}`)
                .attr("fill", "#66BB6A")
                .attr("opacity", 0.01);
        }

        if (Number(zoneSelection) === 2) {
            const point1 = `${(margin * 2).toString()},${(margin * 2 + graphHeight).toString()}`;
            const point2 = `${(margin * 2).toString()},${(y(maxY * 1.1) + margin * 2).toString()}`;
            const point3 = `${(margin * 2 + x(maxY * 1.1)).toString()},${(y(maxY * 1.1) + margin * 2).toString()}`;
            base.append("polygon")
                .attr("id", "brownBackground")
                .attr("points", `${point1} ${point2} ${point3}`)
                .attr("fill", "#A2632F")
                .attr("opacity", 0.01);
        }
        const cutLine = d3
            .select(rn.current)
            .append("path")
            .attr("class", "cutLine")
            .attr("d", lineG(lineData))
            .attr("stroke", baseColor)
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .attr("stroke-dasharray", "4,4")
            .attr("transform", `translate(${margin * 2}, ${margin * 2})`);
        const cutLineLabel = d3
            .select(rn.current)
            .append("text")
            .attr("class", "cutLineLabel")
            .attr("x", x(maxY) + margin * 2 - 16)
            .attr("y", y(maxY) + margin * 2 - 16)
            .text("$0")
            .style("fill", baseColor)
            .style("font-size", "0.9em")
            .style("font-weight", "400")
            .attr("transform", `translate(${margin * 2}, ${margin * -2})`);
        const bubbles = base
            .append("circle")
            .attr("class", (d) => {
                return d.TotalIndemnities > d.TotalFarmerPaidPremium ? "bubbles greenBubble" : "bubbles brownBubble";
            })
            .attr("id", (d) => {
                return `bubble-${d.State}`;
            })
            .attr("cx", function (d) {
                return x(d.TotalIndemnities) + margin * 2;
            })
            .attr("cy", function (d) {
                return y(d.TotalFarmerPaidPremium) + margin * 2;
            })
            .attr("r", (d) => {
                return z(d.NetFarmerBenefit);
            })
            .style("fill", (d) => {
                return d.TotalIndemnities > d.TotalFarmerPaidPremium ? lightGreen : lightBrown;
            })
            .style("fill-opacity", 0.5)
            .style("stroke", (d) => {
                return d.TotalIndemnities > d.TotalFarmerPaidPremium ? darkGreen : darkBrown;
            })
            .style("stroke-opacity", 1);

        const states = base
            .append("text")
            .attr("class", "states")
            .attr("id", (d) => {
                return `state-${d.State}`;
            })
            .attr("x", function (d) {
                return x(d.TotalIndemnities) - 5 + margin * 2;
            })
            .attr("y", function (d) {
                return y(d.TotalFarmerPaidPremium) + 5 + margin * 2;
            })
            .text(function (d) {
                return d.State;
            })
            .style("fill", "#000")
            .style("font-size", "0.5em");
        bubbles
            .on("mouseover", function (d) {
                removeHoverEffect();
                const state = d3.select(this).data()[0].State;
                const stateElement = d3.select(rn.current).select(`#state-${state}`);
                drawLines(stateElement);
            })
            .on("mouseout", function (d) {
                removeHoverEffect();
            });
        states
            .on("mouseover", function (d) {
                removeHoverEffect();
                drawLines(d3.select(this));
            })
            .on("mouseout", function (d) {
                removeHoverEffect();
            });

        const drawLines = (theState) => {
            const theBubble = d3.select(rn.current).select(`#bubble-${theState.data()[0].State}`);
            d3.select(rn.current).selectAll(".bubbles").style("fill-opacity", 0.1).style("stroke-opacity", 0.1);
            d3.select(rn.current).selectAll(".states").style("fill-opacity", 0.5).style("stroke-opacity", 0.5);
            if (theBubble.data()[0].TotalIndemnities > theBubble.data()[0].TotalFarmerPaidPremium) {
                theBubble
                    .style("fill-opacity", 1)
                    .style("stroke-opacity", 1)
                    .style("fill", darkGreen)
                    .style("stroke", darkGreen);
            } else {
                theBubble
                    .style("fill-opacity", 1)
                    .style("stroke-opacity", 1)
                    .style("fill", darkBrown)
                    .style("stroke", darkBrown);
            }
            theState.style("fill-opacity", 1).style("stroke-opacity", 1).style("fill", "white");
            const lineDataVertical = [
                { x: x(theState.data()[0].TotalIndemnities), y: y(0) },
                {
                    x: x(theState.data()[0].TotalIndemnities),
                    y: y(theState.data()[0].TotalFarmerPaidPremium) + Number(theBubble.attr("r"))
                }
            ];
            const pureLineG = d3
                .line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                });
            const verticalLine = d3
                .select(rn.current)
                .append("path")
                .attr("class", "verticalLine")
                .attr("d", pureLineG(lineDataVertical))
                .attr(
                    "stroke",
                    theBubble.data()[0].TotalIndemnities > theBubble.data()[0].TotalFarmerPaidPremium
                        ? darkGreen
                        : darkBrown
                )
                .attr("stroke-width", 1)
                .attr("fill", "none")
                .attr("transform", `translate(${margin * 2}, ${margin * 2})`);
            const lineDataHorizontal = [
                { x: x(0), y: y(theState.data()[0].TotalFarmerPaidPremium) },
                {
                    x: x(theState.data()[0].TotalIndemnities) - Number(theBubble.attr("r")),
                    y: y(theState.data()[0].TotalFarmerPaidPremium)
                }
            ];
            const horizontalLine = d3
                .select(rn.current)
                .append("path")
                .attr("class", "horizontalLine")
                .attr("d", pureLineG(lineDataHorizontal))
                .attr(
                    "stroke",
                    theBubble.data()[0].TotalIndemnities > theBubble.data()[0].TotalFarmerPaidPremium
                        ? darkGreen
                        : darkBrown
                )
                .attr("stroke-width", 1)
                .attr("fill", "none")
                .attr("transform", `translate(${margin * 2}, ${margin * 2})`);

            drawTips(theState);
        };
        const drawTips = (theState) => {
            const theBubble = d3.select(rn.current).select(`#bubble-${theState.data()[0].State}`);
            let xTips = Number(theBubble.attr("cx")) + Number(theBubble.attr("r")) + 16;
            let yTips = Number(theBubble.attr("cy"));
            if (xTips + tipWidth > width) {
                xTips = xTips - Number(theBubble.attr("r")) - tipWidth - Number(theBubble.attr("r")) / 2;
                yTips = Number(theBubble.attr("cy")) + Number(theBubble.attr("r")) + 16;
            }
            if (yTips + tipHeight > height) {
                yTips -= tipHeight;
            }
            const fullName = stateCodes[theState.data()[0].State.toString()];
            const CustomLabel = () => (
                <div
                    style={{ backgroundColor: "white", width: "100%", border: "1px solid #0000001F", borderRadius: 5 }}
                >
                    <div
                        style={{
                            padding: "0.5em 1em",
                            textAlign: "left",
                            fontSize: "0.9em",
                            borderRight: "2px solid #0000001F"
                        }}
                    >
                        <b>{fullName}</b>
                    </div>
                    <table
                        style={{
                            backgroundColor: "#0000001F",
                            width: "100%",
                            fontSize: "0.8em",
                            color: "#00000099",
                            borderCollapse: "collapse"
                        }}
                    >
                        <tbody>
                            <tr>
                                <td style={{ padding: "1em 0 0.5em 1em", margin: 0 }}>Total Indemnities: </td>
                                <td
                                    style={{
                                        textAlign: "right",
                                        padding: "1em 1em 0.5em 0",
                                        margin: 0,
                                        borderRight: "none"
                                    }}
                                >{`$${ToDollarString(theState.data()[0].OriginalTotalIndemnities, 6)}`}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0.5em 0 1em 1em" }}>Farmer Paid Premium:</td>
                                <td
                                    style={{
                                        textAlign: "right",
                                        padding: "0.5em 1em 1em 0",
                                        margin: 0,
                                        borderLeft: "none"
                                    }}
                                >{`-$${ToDollarString(theState.data()[0].OriginalTotalFarmerPaidPremium, 6)}`}</td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        padding: "1em 0 1em 1em",
                                        margin: 0,
                                        borderTop: "0.1em solid #00000099",
                                        color: "black",
                                        borderRight: "none"
                                    }}
                                >
                                    Net Farmer Benefit:{" "}
                                </td>
                                <td
                                    style={{
                                        textAlign: "right",
                                        padding: "1em 1em 1em 0",
                                        margin: 0,
                                        borderTop: "0.1em solid #00000099",
                                        color: "black",
                                        borderLeft: "none"
                                    }}
                                >{`$${ToDollarString(theState.data()[0].OriginalNetFarmerBenefit, 6)}`}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
            const html = ReactDOMServer.renderToString(<CustomLabel />);
            const label = d3
                .select(rn.current)
                .append("foreignObject")
                .attr("class", "hoverLabel")
                .attr("width", tipWidth)
                .attr("height", tipHeight)
                .attr("x", xTips)
                .attr("y", yTips)
                .html(html);
        };
        const removeHoverEffect = () => {
            d3.select(rn.current)
                .selectAll(".greenBubble")
                .style("fill-opacity", 1)
                .style("stroke-opacity", 1)
                .style("opacity", 1)
                .style("fill", lightGreen)
                .style("stroke", darkGreen);
            d3.select(rn.current)
                .selectAll(".brownBubble")
                .style("fill-opacity", 1)
                .style("stroke-opacity", 1)
                .style("opacity", 1)
                .style("fill", lightBrown)
                .style("stroke", darkBrown);
            d3.select(rn.current)
                .selectAll(".states")
                .style("fill-opacity", 1)
                .style("stroke-opacity", 1)
                .style("fill", "black");
            d3.select(rn.current).selectAll(".hoverBackground").remove();
            d3.select(rn.current).selectAll(".hoverLabel").remove();
            d3.select(rn.current).selectAll(".horizontalLine").remove();
            d3.select(rn.current).selectAll(".verticalLine").remove();
        };
    };
    return (
        <div style={{ marginBottom: 160 }}>
            <Grid
                container
                columns={{ xs: 12 }}
                sx={{
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <Grid item xs={6} md={7} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                    <Typography
                        id="snapBarHeader"
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            paddingLeft: 0,
                            fontSize: "1.2em",
                            color: "#212121"
                        }}
                    >
                        How is the <b>Net Farmer Benefits</b> calculated ({startYear} - {endYear})?
                    </Typography>
                    <DownloadIcon
                        sx={{
                            paddingLeft: 1,
                            paddingTop: 1.5,
                            fontSize: "2.5em",
                            color: "#212121",
                            cursor: "pointer",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            downloadSVG(true);
                        }}
                    />
                </Grid>

                <Grid item xs={6} md={5} justifyContent="flex-end" sx={{ display: "flex", width: "100%" }}>
                    <RadioGroup
                        row
                        className="BubbleColorToggle"
                        defaultValue={0}
                        onChange={switchBubbleStatus}
                        aria-label="CropInsurance toggle button group"
                        sx={{ justifyContent: "flex-end" }}
                    >
                        <FormControlLabel id="both" value={0} control={<Radio />} label="Both" sx={{ color: "#000" }} />
                        <FormControlLabel
                            id="positiveNetFarmerBenefit"
                            value={1}
                            control={<Radio sx={{ color: lightGreen }} />}
                            label="Positive Net Farmer Benefit"
                            sx={{ color: darkGreen }}
                        />
                        <FormControlLabel
                            id="negativeNetFarmerBenefit"
                            value={2}
                            control={<Radio sx={{ color: lightBrown }} />}
                            label="Negative Net Farmer Benefit"
                            sx={{ marginRight: 0, color: darkBrown }}
                        />
                    </RadioGroup>
                </Grid>
            </Grid>
            <Grid
                container
                columns={{ xs: 12 }}
                className="reminderContainer"
                sx={{
                    display: "flex",
                    justifyContent: "flex-start"
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 400,
                        paddingLeft: 0,
                        fontSize: "0.8em",
                        color: "rgb(163, 163, 163)"
                    }}
                >
                    Hover on the state names to see detailed data
                </Typography>
            </Grid>
            <Box display="flex" justifyContent="center" style={{ marginTop: "2em" }}>
                <Typography variant="h5" sx={{ mb: 0.5, fontSize: "1.2em" }}>
                    <strong>Net farmer benefit</strong> = Total Indemnities - Farmer Paid Premium
                </Typography>
            </Box>
            <Box display="flex" justifyContent="center">
                <Typography variant="h6" sx={{ mb: 4, fontSize: "0.9em" }}>
                    <i>(If Total Indemnities = Farmer Paid Premium, Net Farmer Benefits = $0)</i>
                </Typography>
            </Box>
            <Styles>
                <svg ref={rn} className="CropInsuranceBubble" />
            </Styles>
        </div>
    );
}
