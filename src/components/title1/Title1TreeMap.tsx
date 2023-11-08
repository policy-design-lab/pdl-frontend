import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { Checkbox, FormControlLabel, FormGroup, Grid, IconButton, SvgIcon, Typography } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import TreeMapSquares from "./TreeMapSquares";
import { DownloadIcon } from "../shared/DownloadIcon";

const Styles = styled.div`
    ".muibuttonbase-root, muicheckbox-root:hover": {
        background: "none";
    }
`;
const sortDataByAttribute = (data, attr) => {
    data.sort((a, b) => {
        if (a[attr] < b[attr]) {
            return 1;
        }
        if (a[attr] > b[attr]) {
            return -1;
        }
        return 0;
    });
    return data;
};
const scaling = (value, scaling_factor, base, max, min, maxCut, minCut) => {
    let temp = Math.min(Math.max(value, minCut), maxCut);
    temp = Math.log(temp * (base ** scaling_factor - 1) + 1) / (Math.log(base) * scaling_factor);
    return value === 0 ? 0 : temp * (max - min) + min;
};
const transform = (data) => {
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
        const transformedJson = {
            baseAcres: 0,
            payments: 0,
            recipients: 0,
            state: ""
        };
        transformedJson.baseAcres =
            stateData.baseAcres === 0 ? 0 : (stateData.baseAcres - minbaseAcres) / (maxbaseAcres - minbaseAcres);
        transformedJson.payments =
            stateData.payments === 0 ? 0 : (stateData.payments - minpayments) / (maxpayments - minpayments);
        transformedJson.recipients =
            stateData.recipients === 0 ? 0 : (stateData.recipients - minrecipients) / (maxrecipients - minrecipients);
        transformedJson.state = stateData.state;
        return transformedJson;
    });
    const res2 = res.map((stateData) => {
        const transformedJson = {
            baseAcres: 0,
            payments: 0,
            recipients: 0,
            state: ""
        };
        transformedJson.baseAcres = scaling(stateData.baseAcres, 1, 10, 0.9, 0.2, 1, 0);
        transformedJson.payments = scaling(stateData.payments, 1, 10, 1, 0.1, 1, 0);
        transformedJson.recipients = scaling(stateData.recipients, 1, 10, 0.7, 0.05, 1, 0);
        transformedJson.state = stateData.state;
        return transformedJson;
    });
    return res2;
};
export default function Title1TreeMap({ program, TreeMapData, year, stateCodes, svgW, svgH }): JSX.Element {
    const paymentsColor = "#FBB650";
    const baseAcresColor = "#5BBD5F";
    const recipientsColor = "#990570";
    const stCodes = stateCodes;
    const rn = React.useRef(null);
    const title1Div = React.useRef(null);
    const [sortPaymentButtonColor, setPaymentSortButtonColor] = React.useState(paymentsColor);
    const [sortBaseAcresButtonColor, setSortBaseAcresButtonColor] = React.useState("#CCC");
    const [sortRecipientsButtonColor, setSortRecipientsButtonColor] = React.useState("#CCC");
    const [Title1TreeMapIllustration, setTitle1TreeMapIllustration] = React.useState(window.innerWidth * 0.06);
    const [chartData, setChartData] = React.useState(sortDataByAttribute(transform(TreeMapData[1]), "payments"));
    const [availableAttributes, setAvailableAttributes] = React.useState(["payments", "baseAcres", "recipients"]);
    const [svgWidth, setSvgWidth] = React.useState(svgW);
    const [svgHeight, setSvgHeight] = React.useState(svgH);
    const [checkedState, setCheckedState] = React.useState({
        paymentsChecked: true,
        baseAcresChecked: true,
        recipientsChecked: true
    });
    const { paymentsChecked, baseAcresChecked, recipientsChecked } = checkedState;
    let widthPercentage = 0.7;
    const heightPercentage = 0.8;
    if (window.innerWidth <= 1440) {
        widthPercentage = 0.6;
    }
    const handleResize: () => void = () => {
        setSvgWidth(window.innerWidth * widthPercentage);
        setSvgHeight(window.innerHeight * heightPercentage);
        setTitle1TreeMapIllustration(window.innerWidth * 0.05);
    };
    React.useEffect(() => {
        window.addEventListener("resize", handleResize);
        drawIllustration();
        return () => window.removeEventListener("resize", handleResize);
    });
    const handleSortClick = (e, attr) => {
        setPaymentSortButtonColor("#CCC");
        setSortBaseAcresButtonColor("#CCC");
        setSortRecipientsButtonColor("#CCC");
        Array.from(document.querySelectorAll(".sortIcon")).forEach((el) => {
            if (el.parentElement === e.currentTarget) {
                if (el.classList.contains("sortPayments")) {
                    setPaymentSortButtonColor(paymentsColor);
                    setChartData(sortDataByAttribute(transform(TreeMapData[1]), "payments"));
                }
                if (el.classList.contains("sortBaseAcres")) {
                    setSortBaseAcresButtonColor(baseAcresColor);
                    setChartData(sortDataByAttribute(transform(TreeMapData[1]), "baseAcres"));
                }
                if (el.classList.contains("sortRecipients")) {
                    setSortRecipientsButtonColor(recipientsColor);
                    setChartData(sortDataByAttribute(transform(TreeMapData[1]), "recipients"));
                }
            }
        });
    };
    const handleSquareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checkedList: string[] = [];
        const temp = {
            ...checkedState,
            [event.target.name]: event.target.checked
        };
        if (temp.baseAcresChecked === true) checkedList.push("baseAcres");
        if (temp.paymentsChecked === true) checkedList.push("payments");
        if (temp.recipientsChecked === true) checkedList.push("recipients");
        setCheckedState(temp);
        setAvailableAttributes(checkedList);
    };
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
    function drawIllustration() {
        if (chartData[0].payments !== 0) {
            d3.select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", Title1TreeMapIllustration)
                .attr("height", Title1TreeMapIllustration)
                .attr("fill", paymentsColor);
        }
        if (chartData[0].baseAcres !== 0) {
            d3.select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", Title1TreeMapIllustration * 0.3)
                .attr("width", Title1TreeMapIllustration * 0.7)
                .attr("height", Title1TreeMapIllustration * 0.7)
                .attr("fill", baseAcresColor);
        }
        if (chartData[0].recipients !== 0) {
            d3.select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", Title1TreeMapIllustration * 0.6)
                .attr("width", Title1TreeMapIllustration * 0.4)
                .attr("height", Title1TreeMapIllustration * 0.4)
                .attr("fill", recipientsColor);
        }
    }
    /* eslint-disable */
    return (
        <Styles>
            <Grid
                container
                className="stateChartTableContainer"
                sx={{
                    display: "flex",
                    justifyContent: "space-between"
                    // marginLeft: 3
                }}
            >
                <Grid container xs={6} xl={6} justifyContent="flex-start" sx={{ display: "flex", alignItems: "end" }}>
                    <Grid item xs={12}>
                        <Typography
                            sx={{
                                fontWeight: 400,
                                paddingLeft: 0,
                                fontSize: "0.7em",
                                color: "rgb(163, 163, 163)"
                            }}
                        >
                            <i>
                                The payments,base acres and payment recipients are calculated as the total of the data
                                from 2014-2021. 2022 payments for Title I have not yet been paid.
                            </i>
                        </Typography>
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
                                      )} Payments, Avg. Payment Recipients and Avg. Base Acres`
                                : `Comparing ${program} Payments, Avg. Payment Recipients and Avg. Base Acres`}
                            <DownloadIcon
                                sx={{
                                    paddingLeft: 1,
                                    paddingTop: 1.5,
                                    fontSize: "2.5em",
                                    color: "#212121",
                                    cursor: "pointer",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "inline-flex",
                                    verticalAlign: "middle"
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    downloadSVG(true);
                                }}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {" "}
                        <Typography
                            sx={{
                                fontWeight: 400,
                                paddingLeft: 0,
                                fontSize: "0.8em",
                                color: "rgb(163, 163, 163)"
                            }}
                        >
                            <b>Hover over the squares to view detailed data.</b>
                            <br />
                            The size differences of the squares represent the differences in relative amount{" "}
                            <i>within the same category</i>. For example, a larger purple square indicate a higher
                            number of avg. recipients compared to another smaller purple square, but it does not
                            necessarily indicate a greater number of avg. recipients compared to a smaller yellow square
                            representing payments.
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xl={true}></Grid>
                <Grid container xs={6} xl={5} justifyContent="flex-end" sx={{ display: "flex", alignItems: "center" }}>
                    <Grid container justifyContent="flex-end" xs={7} alignItems="center">
                        <Grid item xs={2} justifyContent="flex-end" alignItems="center">
                            <FormGroup>
                                {chartData[0].payments !== 0 ? (
                                    <IconButton
                                        aria-label="add"
                                        onClick={(event) => handleSortClick(event, "payments")}
                                        sx={{
                                            borderRadius: "2px"
                                        }}
                                    >
                                        <SortIcon
                                            className="sortIcon sortPayments"
                                            sx={{ color: sortPaymentButtonColor }}
                                        />
                                    </IconButton>
                                ) : null}
                                {chartData[0].baseAcres !== 0 ? (
                                    <IconButton
                                        aria-label="add"
                                        onClick={(event) => handleSortClick(event, "baseAcres")}
                                        sx={{
                                            borderRadius: "2px"
                                        }}
                                    >
                                        <SortIcon
                                            className="sortIcon sortBaseAcres"
                                            sx={{ color: sortBaseAcresButtonColor }}
                                        />
                                    </IconButton>
                                ) : null}
                                {chartData[0].recipients !== 0 ? (
                                    <IconButton
                                        aria-label="add"
                                        onClick={(event) => handleSortClick(event, "recipients")}
                                        sx={{
                                            borderRadius: "2px"
                                        }}
                                    >
                                        <SortIcon
                                            className="sortIcon sortRecipients"
                                            sx={{ color: sortRecipientsButtonColor }}
                                        />
                                    </IconButton>
                                ) : null}
                            </FormGroup>
                        </Grid>
                        <Grid item xs={10} justifyContent="flex-end" alignItems="center">
                            <FormGroup>
                                {chartData[0].payments !== 0 ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                className="showSquare"
                                                checked={paymentsChecked}
                                                onChange={handleSquareChange}
                                                name="paymentsChecked"
                                                style={{ color: paymentsColor }}
                                            />
                                        }
                                        label="Total Payments ($)"
                                        sx={{ color: paymentsColor }}
                                    />
                                ) : null}
                                {chartData[0].baseAcres !== 0 ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                className="showSquare"
                                                checked={baseAcresChecked}
                                                onChange={handleSquareChange}
                                                name="baseAcresChecked"
                                                style={{ color: baseAcresColor }}
                                            />
                                        }
                                        label="Avg. Base Acres (ac)"
                                        sx={{ color: baseAcresColor }}
                                    />
                                ) : null}
                                {chartData[0].recipients !== 0 ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                className="showSquare"
                                                checked={recipientsChecked}
                                                onChange={handleSquareChange}
                                                name="recipientsChecked"
                                                style={{ color: recipientsColor }}
                                            />
                                        }
                                        label="Avg. Recipients (pers.)"
                                        sx={{ color: recipientsColor }}
                                    />
                                ) : null}
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid item xs={5} justifyContent="flex-start" alignItems="center">
                        <svg
                            ref={rn}
                            id="Title1TreeMapIllustration"
                            width={Title1TreeMapIllustration}
                            height={Title1TreeMapIllustration}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography
                            sx={{
                                fontWeight: 400,
                                fontSize: "0.8em",
                                color: "rgb(163, 163, 163)",
                                marginTop: 1,
                                paddingLeft: "1em"
                            }}
                        >
                            Click the <SortIcon className="sortIcon sortRecipients" sx={{ fontSize: "1em" }} /> buttons
                            above to sort squares by payments, avg. base acres or avg. recipients.
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} id="title1BarContainer" sx={{ display: "flex" }} ref={title1Div}>
                    <TreeMapSquares
                        svgWidth={svgWidth}
                        svgHeight={svgHeight}
                        stateCodes={stCodes}
                        originalData={TreeMapData[0]}
                        chartData={chartData}
                        color={{ baseAcres: baseAcresColor, payments: paymentsColor, recipients: recipientsColor }}
                        availableAttributes={availableAttributes}
                        program={program}
                    />
                </Grid>
            </Grid>
        </Styles>
    );
    /* eslint-enable */
}
