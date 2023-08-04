import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { on } from "@ngrx/store";

export default function CropInsuranceBubble({ originalData, initChartWidthRatio }): JSX.Element {
    const rn = React.useRef(null);
    const Styles = styled.div`
        svg {
            font-family: "Roboto", sans-serif;
        }
    `;
    const margin = 20;
    const data = originalData.map((obj) => ({ ...obj }));
    const [width, setWidth] = React.useState(window.innerWidth * initChartWidthRatio);
    const [height, setHeight] = React.useState((window.innerWidth * initChartWidthRatio) / 2);
    const handleResize: () => void = () => {
        setWidth(window.innerWidth * initChartWidthRatio);
        setHeight((window.innerWidth * initChartWidthRatio) / 2);
    };
    React.useEffect(() => {
        renderBar();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });
    const scaling = (value, maxCut, minCut, max, min) => {
        let temp = (value - min) / (max - min);
        return value === 0 ? 0 : temp * (maxCut - minCut) + minCut;
    };
    const renderBar = () => {
        d3.select(rn.current).selectAll("*").remove();
        data.forEach((d) => {
            d.SqrtResult = Math.sqrt(Math.abs(d.OriginalNetFarmerBenefit));
            // d.OriginalNetFarmerBenefit = Math.abs(d.OriginalNetFarmerBenefit);
            d.TotalFarmerPaidPremium =
                Math.sqrt(Math.abs(d.TotalFarmerPaidPremium)) * Math.sign(d.TotalFarmerPaidPremium);
            d.TotalIndemnities = Math.sqrt(Math.abs(d.TotalIndemnities)) * Math.sign(d.TotalIndemnities);
        });
        let maxNetFarmerBenefit = d3.max(data, function (d) {
            return d.SqrtResult;
        });
        let minNetFarmerBenefit = d3.min(data, function (d) {
            return d.SqrtResult;
        });
        data.forEach((d) => {
            d.NetFarmerBenefit = scaling(d.SqrtResult, 10000, 200, maxNetFarmerBenefit, minNetFarmerBenefit);
        });
        let graphWidth = width - margin * 4;
        let graphHeight = height - margin * 4;

        const aspectRatio = width / height;

        // Determine the maximum range value for x and y scales
        var maxRange = Math.max(graphWidth, graphHeight);

        // Calculate the adjusted width and height based on the aspect ratio
        if (aspectRatio > 1) {
            graphWidth = maxRange;
            graphHeight = maxRange / aspectRatio;
        } else {
            graphWidth = maxRange * aspectRatio;
            graphHeight = maxRange;
        }
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
            .range([7, 70]);

        maxNetFarmerBenefit = d3.max(data, function (d) {
            return d.NetFarmerBenefit;
        });
        const x = d3.scaleLinear().range([0, graphWidth]);
        const y = d3.scaleLinear().range([graphHeight, 0]);
        const xAxis = d3.axisBottom(x).ticks(20).tickSizeOuter(0);
        const yAxis = d3.axisLeft(y).ticks(10).tickSizeOuter(0);
        x.domain([
            0,
            d3.max(data, function (d) {
                return d.TotalIndemnities;
            }) +
                d3.max(data, function (d) {
                    return d.NetFarmerBenefit;
                })
        ]);
        y.domain([
            0,
            d3.max(data, function (d) {
                return d.TotalFarmerPaidPremium;
            }) +
                d3.max(data, function (d) {
                    return d.NetFarmerBenefit;
                })
        ]);
        d3.select(rn.current).attr("width", width).attr("height", height).append("g");

        const x_axis = d3
            .select(rn.current)
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin * 2},${margin + graphHeight})`)
            .call(xAxis);
        x_axis.selectAll(".tick").attr("class", (d) => `tick x-${d}`);
        const y_axis = d3
            .select(rn.current)
            .append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .attr("transform", `translate(${margin * 2}, ${margin})`)
            .append("text")
            .attr("x", 0 - margin)
            .attr("y", -margin)
            .attr("dy", "0.1em")
            .style("text-anchor", "start")
            .style("fill", "#DDD")
            .text("Farmer Paid Premium")
            .style("font-weight", "400")
            .style("font-size", "0.1em");
        y_axis.selectAll(".tick").style("fill", "#DDD").style("font-size", "0.1em");
        const base = d3.select(rn.current).selectAll("dot").data(data).enter();
        var maxRange = Math.max(graphWidth, graphHeight);
        const maxY = d3.max(data, function (d) {
            return d.TotalFarmerPaidPremium;
        });
        const lineData = [
            { x: 0, y: 0 },
            { x: maxY + maxNetFarmerBenefit, y: maxY + maxNetFarmerBenefit }
        ];
        let lineG = d3
            .line()
            .x(function (d) {
                return x(d.x) + margin * 2;
            })
            .y(function (d) {
                return y(d.y) + margin;
            });
        // ADD DASH Style
        const cutLine = d3
            .select(rn.current)
            .append("path")
            .attr("class", "cutLine")
            .attr("d", lineG(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none");
        const cutLineLabel = d3
            .select(rn.current)
            .append("text")
            .attr("class", "cutLineLabel")
            .attr("x", x(maxY + maxNetFarmerBenefit) + margin * 2)
            .attr("y", y(maxY + maxNetFarmerBenefit) + margin)
            .text("$0")
            .style("font-size", "0.9em")
            .style("font-weight", "400");

        const bubbles = base
            .append("circle")
            .attr("class", "bubbles")
            .attr("id", (d) => {
                return `bubble-${d.State}`;
            })
            .attr("cx", function (d) {
                return x(d.TotalIndemnities) + margin * 2;
            })
            .attr("cy", function (d) {
                return y(d.TotalFarmerPaidPremium) + margin;
            })
            .attr("r", (d) => {
                return z(d.NetFarmerBenefit);
            })
            .style("fill", (d) => {
                return d.TotalIndemnities > d.TotalFarmerPaidPremium ? "#66BB6A" : "#DCC9B9";
            })
            .style("fill-opacity", 0.5)
            .style("stroke", (d) => {
                return d.TotalIndemnities > d.TotalFarmerPaidPremium ? "#66BB6A" : "#DCC9B9";
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
                return y(d.TotalFarmerPaidPremium) + 5 + margin;
            })
            .text(function (d) {
                return d.State;
            })
            .style("fill", "#000")
            .style("font-size", "0.5em");
        bubbles
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 1)
                    .style("stroke-opacity", 1)
                    .style("stroke-width", 1);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 0.5)
                    .style("stroke-opacity", 1)
                    .style("stroke-width", 1);
            });
        states
            .on("mouseover", function (d) {
                const theBubble = d3.select(rn.current).select(`#bubble-${d3.select(this).data()[0].State}`);
                // Get central position of the bubble
                console.log(theBubble.attr("cx"));
                console.log(theBubble.attr("r"));
                // Draw the vertical line to x axis
                const lineData = [
                    { x: Number(theBubble.attr("cx")), y: Number(theBubble.attr("cy")) },
                    { x: Number(theBubble.attr("cx")), y: graphHeight }
                ];
                console.log(lineData);
                const verticalLine = d3
                    .select(rn.current)
                    .append("path")
                    .attr("class", "verticalLine")
                    .attr("d", lineG(lineData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");
                // Draw the horizontal line to y axis

                // Generate the pop-over

                // Highlight the bubble
                theBubble
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 1)
                    .style("stroke-opacity", 1)
                    .style("stroke-width", 1);
            })
            .on("mouseout", function (d) {
                const theBubble = d3.select(rn.current).select(`#bubble-${d3.select(this).data()[0].State}`);
                theBubble
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 0.5)
                    .style("stroke-opacity", 1)
                    .style("stroke-width", 1);
            });
    };
    const renderTip = (stateData) => ({});
    return (
        <div>
            <h2>Bubble Test</h2>
            <Styles>
                <svg ref={rn} className="CropInsuranceBubble" />
            </Styles>
        </div>
    );
}
