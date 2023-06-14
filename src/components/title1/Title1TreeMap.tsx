import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { ShortFormat } from "../shared/ConvertionFormats";
import { Checkbox, FormControlLabel, FormGroup, Grid, SvgIcon, Typography } from "@mui/material";

const sortDataByAttribute = (data, attr) => {
    data.sort((a, b) => {
        if (a[attr] < b[attr]) {
            return 1;
        } else if (a[attr] > b[attr]) {
            return -1;
        } else {
            return 0;
        }
    });
    return data;
};

const scaling = (value, scaling_factor, base, max, min, maxCut, minCut) => {
    let temp = Math.min(Math.max(value, minCut), maxCut);
    temp = Math.log(temp * (base ** scaling_factor - 1) + 1) / (Math.log(base) * scaling_factor);
    return value === 0 ? 0 : temp * (max - min) + min;
};
let oldD: any, newD: any;
export default function Title1TreeMap({
    program,
    TreeMapData,
    year,
    svgWidth = 1200,
    svgHeight = 2100,
    stateCodes
}): JSX.Element {
    const paymentsColor = "#FBB650";
    const baseArcesColor = "#5BBD5F";
    const recipientsColor = "#990570";
    const rn = React.useRef(null);
    // const [oldD, setOldD] = React.useState(null);
    // const [newD, setNewD] = React.useState(null);
    const [max, setMax] = React.useState(0);
    const [min, setMin] = React.useState(0);
    const title1Div = React.useRef(null);
    const [state, setState] = React.useState({
        paymentsChecked: true,
        baseAcresChecked: true,
        recipientsChecked: true
    });
    const { paymentsChecked, baseAcresChecked, recipientsChecked } = state;
    // let paymentsChecked = true, baseAcresChecked= true, recipientsChecked= true;
    const matchingList = {
        paymentsChecked: "payments",
        baseAcresChecked: "baseAcres",
        recipientsChecked: "recipients"
    };
    const handleSquareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.name + " " + event.target.checked);
        setState({ 
            ...state,
            [event.target.name]: event.target.checked
        });
        const checkedList: string[] = [];
        console.log(state);
        state.baseAcresChecked? checkedList.push("baseAcres"): null;
        state.paymentsChecked? checkedList.push("payments"): null;
        state.recipientsChecked? checkedList.push("recipients"): null;
        //pending to change the 'payments'
        renderTreemap("payments", checkedList);
    };
    React.useEffect(() => {
        oldD = TreeMapData[0];
        newD = transform(TreeMapData[1]);
        renderTreemap("payments", ["payments", "baseAcres", "recipients"]);

        //PENDING: Resize treemap
        // function handleResize() {
        //   setWidth(window.innerWidth * widthPercentage),
        //     setHeight(window.innerWidth * heightPercentage);
        // }
        // window.addEventListener("resize", handleResize);
        // return () => window.removeEventListener("resize", handleResize);
    });
    const downloadSVG = (status) => {
        if (title1Div.current !== undefined && status) {
            const svgElement = title1Div.current.querySelector("#Title1TreeMap");
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "title1-treemap.svg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    const DownloadIcon = (props) => {
        return (
            <SvgIcon {...props}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-download"
                    viewBox="0 0 16 16"
                >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                </svg>
            </SvgIcon>
        );
    };
    const Styles = styled.div`
        #Title1TreeMap {
            font-family: "Roboto", sans-serif;
        }
    `;
    function transform(data) {
        let minbaseAcres = Infinity;
        let maxbaseAcres = -Infinity;
        let minpayments = Infinity;
        let maxpayments = -Infinity;
        let minrecipients = Infinity;
        let maxrecipients = -Infinity;
        data.forEach((stateData) => {
            minbaseAcres = Math.min(minbaseAcres, stateData.baseAcres);
            maxbaseAcres = Math.max(maxbaseAcres, stateData.baseAcres);
            minpayments = Math.min(minpayments, stateData.payments);
            maxpayments = Math.max(maxpayments, stateData.payments);
            minrecipients = Math.min(minrecipients, stateData.recipients);
            maxrecipients = Math.max(maxrecipients, stateData.recipients);
        });
        const res = data.map((stateData) => {
            const transformedJson = { baseAcres: 0, payments: 0, recipients: 0, state: "" };
            transformedJson.baseAcres =
                stateData.baseAcres === 0 ? 0 : (stateData.baseAcres - minbaseAcres) / (maxbaseAcres - minbaseAcres);
            transformedJson.payments =
                stateData.payments === 0 ? 0 : (stateData.payments - minpayments) / (maxpayments - minpayments);
            transformedJson.recipients =
                stateData.recipients === 0
                    ? 0
                    : (stateData.recipients - minrecipients) / (maxrecipients - minrecipients);
            transformedJson.state = stateData.state;
            return transformedJson;
        });
        const res2 = res.map((stateData) => {
            const transformedJson = { baseAcres: 0, payments: 0, recipients: 0, state: "" };
            transformedJson.baseAcres = scaling(stateData.baseAcres, 1, 10, 0.9, 0.2, 1, 0);
            transformedJson.payments = scaling(stateData.payments, 1, 10, 1, 0.1, 1, 0);
            transformedJson.recipients = scaling(stateData.recipients, 1, 10, 0.7, 0.05, 1, 0);
            transformedJson.state = stateData.state;
            return transformedJson;
        });
        setMin(
            Math.min.apply(null, [
                Math.min.apply(
                    null,
                    res2.map((stateData) => Number(stateData.baseAcres))
                ),
                Math.min.apply(
                    null,
                    res2.map((stateData) => stateData.payments)
                ),
                Math.min.apply(
                    null,
                    res2.map((stateData) => stateData.recipients)
                )
            ])
        );
        setMax(
            Math.max.apply(null, [
                Math.max.apply(
                    null,
                    res2.map((stateData) => Number(stateData.baseAcres))
                ),
                Math.max.apply(
                    null,
                    res2.map((stateData) => stateData.payments)
                ),
                Math.max.apply(
                    null,
                    res2.map((stateData) => stateData.recipients)
                )
            ])
        );

        return res2;
    }
    const renderTreemap = (sortedAttribute, allowedAttributes) => {
        d3.select("#Title1TreeMap").selectAll(".base").remove();
        const sortedData = sortDataByAttribute(newD, sortedAttribute);
        //const sortedData = sortDataByAttribute(newData, "recipients");
        draftSquares(
            oldD,
            sortedData,
            { baseAcres: baseArcesColor, payments: paymentsColor, recipients: recipientsColor },
            allowedAttributes
        );
    };

    const draftSquares = (originalData, chartData, color, availableAttributes) => {
        const base = d3.select(rn.current).append("g").attr("class", "base");
        const margin = 35;
        const lineMargin = 80;
        let rowTrack = 0;
        let largestSquare = 250;
        let yTrack = largestSquare + lineMargin;

        //{state, baseAcres, payments, recipients}
        chartData
            .filter((stateData) => stateData.baseAcres !== 0 || stateData.payments !== 0 || stateData.recipients !== 0)
            .forEach((stateData, index) => {
                if (
                    rowTrack + margin <=
                    svgWidth - largestSquare * Math.max(stateData.baseAcres, stateData.payments, stateData.recipients)
                ) {
                    const squareGroup = base.append("g").attr("class", "squareGroup");
                    const re_sorted = [stateData.baseAcres, stateData.payments, stateData.recipients].sort(
                        (a, b) => b - a
                    );
                    const maxInLine = re_sorted[0];
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
                    re_sorted.forEach((value, index) => {
                        Object.values(stateData).forEach((v) => {
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
                                    // Only add label to the first two rows
                                    if (yTrack <= (largestSquare + lineMargin) * 2) {
                                        const inSquareText = squareGroup
                                            .append("text")
                                            .attr("id", `inSquareText${value}`)
                                            .text(collectedOriginalData[key])
                                            .style("font-size", "0.8em")
                                            .style("fill", "white");
                                        const textLength = inSquareText.node().getComputedTextLength();
                                        inSquareText
                                            .attr("x", rowTrack + value * largestSquare - textLength - 10)
                                            .attr("y", yTrack - value * largestSquare + 18);
                                    }
                                }
                                return;
                            }
                        });
                    });
                    squareGroup
                        .on("mouseover", function (e) {
                            base.selectAll(".TreeMapSquareTip").remove();
                            const mousePos = d3.pointer(event, squareGroup.node());
                            const tipGroup = base.append("g").attr("class", "TreeMapSquareTip");
                            tipGroup
                                .append("rect")
                                .attr("x", mousePos[0])
                                .attr("y", mousePos[1])
                                .attr("width", 200)
                                .attr("height", 60)
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("fill", "#CCC");
                            tipGroup
                                .append("text")
                                .text(`baseAcres: ${baseArcesOriginalData}`)
                                .attr("x", mousePos[0] + 2)
                                .attr("y", mousePos[1] + 15)
                                .style("font-size", "0.8em")
                                .style("fill", "white");
                            tipGroup
                                .append("text")
                                .text(`payments:  ${paymentsOriginalData}`)
                                .attr("x", mousePos[0] + 2)
                                .attr("y", mousePos[1] + 30)
                                .style("font-size", "0.8em")
                                .style("fill", "white");
                            tipGroup
                                .append("text")
                                .text(`recipients:  ${recipientsOriginalData}`)
                                .attr("x", mousePos[0] + 2)
                                .attr("y", mousePos[1] + 45)
                                .style("font-size", "0.8em")
                                .style("fill", "white");
                        })
                        .on("mouseleave", function (e) {
                            base.selectAll(".TreeMapSquareTip").remove();
                        });
                    const stateName = squareGroup
                        .append("text")
                        .text(
                            stateCodes[Object.keys(stateCodes).filter((stateCode) => stateCode === stateData.state)[0]]
                        );
                    const textLength = stateName.node().getComputedTextLength();
                    stateName
                        .attr("x", rowTrack + (maxInLine * largestSquare) / 2 - textLength / 2)
                        .attr("y", yTrack + 16)
                        .style("font-size", "0.9em");
                    rowTrack = rowTrack + maxInLine * largestSquare + margin * 2;
                } else {
                    // adjust line height so that the bottom rows will have bit short gap with the top rows
                    yTrack = yTrack + largestSquare + lineMargin - index * 4;
                    rowTrack = 0;
                }
            });
        // check if see if any of state has all zeros
        chartData
            .filter((stateData) => stateData.baseAcres === 0 && stateData.payments === 0 && stateData.recipients === 0)
            .forEach((stateData, index) => {
                if (stateData) {
                    base.append("rect")
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr("x", rowTrack + index * margin)
                        .attr("y", yTrack - 20)
                        .attr("fill", "#DDD");

                    base.append("text")
                        .text(stateData.state)
                        .attr("x", rowTrack + index * margin)
                        .attr("y", yTrack + 16)
                        .style("font-size", "0.8em");
                }
            });
        //base.selectAll(".squareGroup").raise();
    };
    return (
        <div>
            <Grid
                container
                columns={{ xs: 12 }}
                className="stateChartTableContainer"
                sx={{
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <Grid item xs={8} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                    <Typography
                        id="title1BarHeader"
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            paddingLeft: 0,
                            fontSize: "1.2em",
                            color: "#212121"
                        }}
                    >
                        {program.includes("(")
                            ? `Comparing ${program
                                  .match(/\((.*?)\)/g)
                                  .map((match) =>
                                      match.slice(1, -1)
                                  )} Payments, Payment Recipients and Base Acres (${year})`
                            : `Comparing ${program} Payments, Payment Recipients and Base Acres (${year})`}
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
                <Grid item xs={2} justifyContent="flex-start" sx={{ display: "flex" }}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    className="showSquare"
                                    checked={paymentsChecked}
                                    onChange={handleSquareChange}
                                    name="paymentsChecked"
                                    sx={{ color: paymentsColor }}
                                />
                            }
                            label="Total Payments($)"
                            sx={{ color: paymentsColor }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    className="showSquare"
                                    checked={baseAcresChecked}
                                    onChange={handleSquareChange}
                                    name="baseAcresChecked"
                                />
                            }
                            label="Base Acres(ac)"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    className="showSquare"
                                    checked={recipientsChecked}
                                    onChange={handleSquareChange}
                                    name="recipientsChecked"
                                />
                            }
                            label="Recipients(pers.)"
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={2} justifyContent="flex-start" sx={{ display: "flex" }}>
                    Illustration...
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
                    Hover on squares to see detailed data
                </Typography>
            </Grid>
            <Grid container columns={{ xs: 12 }}>
                <Grid container item xs={12} id="title1BarContainer" sx={{ display: "flex" }} ref={title1Div}>
                    <Styles>
                        <svg ref={rn} id="Title1TreeMap" width={svgWidth} height={svgHeight} />
                    </Styles>
                </Grid>
            </Grid>
        </div>
    );
}
