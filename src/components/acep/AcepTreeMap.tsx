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
    let minacres = Infinity;
    let maxacres = -Infinity;
    let minpayments = Infinity;
    let maxpayments = -Infinity;
    let mincontracts = Infinity;
    let maxcontracts = -Infinity;
    data.forEach((stateData) => {
        minacres = Math.min(minacres, stateData.acres);
        maxacres = Math.max(maxacres, stateData.acres);
        minpayments = Math.min(minpayments, stateData.payments);
        maxpayments = Math.max(maxpayments, stateData.payments);
        mincontracts = Math.min(mincontracts, stateData.contracts);
        maxcontracts = Math.max(maxcontracts, stateData.contracts);
    });
    const res = data.map((stateData) => {
        const transformedJson = { acres: 0, payments: 0, contracts: 0, state: "" };
        transformedJson.acres = stateData.acres === 0 ? 0 : (stateData.acres - minacres) / (maxacres - minacres);
        transformedJson.payments =
            stateData.payments === 0 ? 0 : (stateData.payments - minpayments) / (maxpayments - minpayments);
        transformedJson.contracts =
            stateData.contracts === 0 ? 0 : (stateData.contracts - mincontracts) / (maxcontracts - mincontracts);
        transformedJson.state = stateData.state;
        return transformedJson;
    });
    const res2 = res.map((stateData) => {
        const transformedJson = { acres: 0, payments: 0, contracts: 0, state: "" };
        transformedJson.acres = scaling(stateData.acres, 1, 10, 0.9, 0.2, 1, 0);
        transformedJson.payments = scaling(stateData.payments, 1, 10, 1, 0.1, 1, 0);
        transformedJson.contracts = scaling(stateData.contracts, 1, 10, 0.7, 0.05, 1, 0);
        transformedJson.state = stateData.state;
        return transformedJson;
    });
    return res2;
};
export default function AcepTreeMap({ program, TreeMapData, year, stateCodes, svgW, svgH }): JSX.Element {
    const paymentsColor = "#1F78B4";
    const acresColor = "#66BB6A";
    const contractsColor = "#C81194";
    const stCodes = stateCodes;
    const rn = React.useRef(null);
    const acepDiv = React.useRef(null);
    const [sortPaymentButtonColor, setPaymentSortButtonColor] = React.useState(paymentsColor);
    const [sortBaseAcresButtonColor, setSortBaseAcresButtonColor] = React.useState("#CCC");
    const [sortRecipientsButtonColor, setSortRecipientsButtonColor] = React.useState("#CCC");
    const [AcepTreeMapIllustration, setAcepTreeMapIllustration] = React.useState(window.innerWidth * 0.06);
    const [chartData, setChartData] = React.useState(sortDataByAttribute(transform(TreeMapData[1]), "payments"));
    const [availableAttributes, setAvailableAttributes] = React.useState(["payments", "acres", "contracts"]);
    const [svgWidth, setSvgWidth] = React.useState(svgW);
    const [svgHeight, setSvgHeight] = React.useState(svgH);
    const [checkedState, setCheckedState] = React.useState({
        paymentsChecked: true,
        acresChecked: true,
        contractsChecked: true
    });
    const { paymentsChecked, acresChecked, contractsChecked } = checkedState;
    let widthPercentage = 0.7;
    const heightPercentage = 0.8;
    if (window.innerWidth <= 1440) {
        widthPercentage = 0.6;
    }
    const handleResize: () => void = () => {
        setSvgWidth(window.innerWidth * widthPercentage);
        setSvgHeight(window.innerHeight * heightPercentage);
        setAcepTreeMapIllustration(window.innerWidth * 0.05);
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
                    setSortBaseAcresButtonColor(acresColor);
                    setChartData(sortDataByAttribute(transform(TreeMapData[1]), "acres"));
                }
                if (el.classList.contains("sortRecipients")) {
                    setSortRecipientsButtonColor(contractsColor);
                    setChartData(sortDataByAttribute(transform(TreeMapData[1]), "contracts"));
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
        if (temp.acresChecked === true) checkedList.push("acres");
        if (temp.paymentsChecked === true) checkedList.push("payments");
        if (temp.contractsChecked === true) checkedList.push("contracts");
        setCheckedState(temp);
        setAvailableAttributes(checkedList);
    };
    const downloadSVG = (status) => {
        if (acepDiv.current !== undefined && status) {
            const svgElement = acepDiv.current.querySelector("#AcepTreeMap");
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "acep-treemap.svg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    function drawIllustration() {
        d3.select(rn.current).selectAll("*").remove();
        if (chartData[0].payments !== 0) {
            const test = d3
                .select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", AcepTreeMapIllustration)
                .attr("height", AcepTreeMapIllustration)
                .attr("fill", paymentsColor);
        }
        if (chartData[0].acres !== 0) {
            d3.select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", AcepTreeMapIllustration * 0.3)
                .attr("width", AcepTreeMapIllustration * 0.7)
                .attr("height", AcepTreeMapIllustration * 0.7)
                .attr("fill", acresColor);
        }
        if (chartData[0].contracts !== 0) {
            d3.select(rn.current)
                .append("rect")
                .attr("x", 0)
                .attr("y", AcepTreeMapIllustration * 0.6)
                .attr("width", AcepTreeMapIllustration * 0.4)
                .attr("height", AcepTreeMapIllustration * 0.4)
                .attr("fill", contractsColor);
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
                <Grid container xs={6} xl={7} justifyContent="flex-start" sx={{ display: "flex", alignItems: "end" }}>
                    <Grid item xs={12}>
                        <Typography
                            id="acepBarHeader"
                            variant="h6"
                            sx={{
                                fontWeight: 400,
                                paddingLeft: 0,
                                fontSize: "1.2em",
                                color: "#212121"
                            }}
                        >
                            {program.includes("(")
                                ? `Comparing Total ${program
                                      .match(/\((.*?)\)/g)
                                      .map((match) => match.slice(1, -1))} Benefits, Acres and No. of Contracts (${year})`
                                : `Comparing Total ${program} Benefits, Acres and No. of Contracts (${year})`}
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
                            number of no. of contracts compared to another smaller purple square, but it does not
                            necessarily indicate a greater number of no. of contracts compared to a smaller green square
                            representing acres.
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item  xs={true} xl={true}></Grid>
                <Grid container xs={5} xl={4} justifyContent="flex-end" sx={{ display: "flex", alignItems: "center" }}>
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
                                {chartData[0].acres !== 0 ? (
                                    <IconButton
                                        aria-label="add"
                                        onClick={(event) => handleSortClick(event, "acres")}
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
                                {chartData[0].contracts !== 0 ? (
                                    <IconButton
                                        aria-label="add"
                                        onClick={(event) => handleSortClick(event, "contracts")}
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
                                        label="Total Benefits ($)"
                                        sx={{ color: paymentsColor }}
                                    />
                                ) : null}
                                {chartData[0].acres !== 0 ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                className="showSquare"
                                                checked={acresChecked}
                                                onChange={handleSquareChange}
                                                name="acresChecked"
                                                style={{ color: acresColor }}
                                            />
                                        }
                                        label="Acres"
                                        sx={{ color: acresColor }}
                                    />
                                ) : null}
                                {chartData[0].contracts !== 0 ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                className="showSquare"
                                                checked={contractsChecked}
                                                onChange={handleSquareChange}
                                                name="contractsChecked"
                                                style={{ color: contractsColor }}
                                            />
                                        }
                                        label="No. of Contracts"
                                        sx={{ color: contractsColor }}
                                    />
                                ) : null}
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid item xs={5} justifyContent="flex-start" alignItems="center">
                        <svg
                            ref={rn}
                            id="AcepTreeMapIllustration"
                            width={AcepTreeMapIllustration}
                            height={AcepTreeMapIllustration}
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
                            above to sort squares by total benefits, acres or no. of contracts.
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} id="acepBarContainer" sx={{ display: "flex" }} ref={acepDiv}>
                    <TreeMapSquares
                        svgWidth={svgWidth}
                        svgHeight={svgHeight}
                        stateCodes={stCodes}
                        originalData={TreeMapData[0]}
                        chartData={chartData}
                        color={{ acres: acresColor, payments: paymentsColor, contracts: contractsColor }}
                        availableAttributes={availableAttributes}
                        program={program}
                    />
                </Grid>
            </Grid>
        </Styles>
    );
    /* eslint-enable */
}
