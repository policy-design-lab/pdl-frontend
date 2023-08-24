import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import {
    ToggleButton,
    Box,
    ToggleButtonGroup,
    createTheme,
    ThemeProvider,
    Typography,
    CardMedia,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    SvgIcon
} from "@mui/material";
import CropInsuranceBar from "./CropInsuranceBar";
import { DownloadIcon } from "../../shared/DownloadIcon";

export default function CropInsuranceBars({
    stateDistributionData,
    checkedMenu,
    initChartWidthRatio
}: {
    stateDistributionData: any;
    checkedMenu: string;
    initChartWidthRatio: number;
}): JSX.Element {
    const cropinsuranceDiv = React.useRef(null);
    // Bar-related parameters
    const [barStatus, setBarStatus] = React.useState(0);
    const [secondarybarStatus, setSecondaryBarStatus] = React.useState(3);
    const yearKey = "2018-2022";
    const widthPercentage = initChartWidthRatio;
    const heightPercentage = 0.4;
    const paddingLR = 60;
    const paddingTB = 40;
    const color1 = "#B65700";
    const color2 = "#D3AA3D";
    const [whichBar, setWhichBar] = React.useState(checkedMenu);
    const defaultTheme = createTheme({
        spacing: 8
    });
    const downloadSVG = (status) => {
        if (cropinsuranceDiv.current !== undefined && status) {
            const svgElement = cropinsuranceDiv.current.querySelector("#CropInsuranceBarChart");
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "cropinsurance-bar.svg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    const switchBarStatus = (event) => {
        if (event.target.value !== null && ["0", "00", "01", "02", "03"].includes(whichBar)) {
            setBarStatus(event.target.value);
        } else if (event.target.value !== null) {
            setSecondaryBarStatus(event.target.value);
        }
    };
    React.useEffect(() => {
        setWhichBar(checkedMenu);
    });
    return (
        <ThemeProvider theme={defaultTheme}>
            {["0", "00", "01", "02", "03"].includes(whichBar) ? (
                <div>
                    {" "}
                    <Grid
                        container
                        columns={{ xs: 12 }}
                        className="stateBarTableContainer"
                        sx={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <Grid item xs={7} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                            <Typography
                                id="cropinsuranceBarHeader"
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121"
                                }}
                            >
                                How is the <b>Farmer Paid Premium</b> Calculated?
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
                        <Grid item xs={5} justifyContent="flex-end" sx={{ display: "flex", width: "100%" }}>
                            <RadioGroup
                                row
                                className="BarColorToggle"
                                defaultValue={0}
                                aria-label="CropInsurance toggle button group"
                                sx={{ justifyContent: "flex-end" }}
                                onChange={switchBarStatus}
                                value={barStatus}
                            >
                                <FormControlLabel
                                    id="totalPremium"
                                    value={0}
                                    control={<Radio />}
                                    label="Total Premium"
                                    sx={{ color: "#672500" }}
                                />
                                <FormControlLabel
                                    id="farmerPaidPremium"
                                    value={1}
                                    control={<Radio sx={{ color: color1 }} />}
                                    label="Farmer Paid Premium"
                                    sx={{ color: color1 }}
                                />
                                <FormControlLabel
                                    id="premiumSubsidy"
                                    value={2}
                                    control={<Radio sx={{ color: color2 }} />}
                                    label="Premium Subsidy"
                                    sx={{ marginRight: 0, color: color2 }}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="center" style={{ marginTop: "2em" }}>
                        <Typography variant="h5" sx={{ mb: 3, fontSize: "1.2em" }}>
                            Total Premium = <strong>Farmer Paid Premium</strong> + Premium Subsidy
                        </Typography>
                    </Box>
                    <Grid container columns={{ xs: 12 }}>
                        <Grid
                            container
                            item
                            xs={12}
                            id="cropinsuranceBarContainer"
                            sx={{ display: "flex" }}
                            ref={cropinsuranceDiv}
                        >
                            {stateDistributionData ? (
                                <CropInsuranceBar
                                    CIData={stateDistributionData}
                                    status={Number(barStatus)}
                                    yearKey={yearKey}
                                    barKeyAttr={whichBar}
                                    margin={{
                                        top: paddingTB,
                                        right: paddingLR,
                                        bottom: paddingTB,
                                        left: paddingLR
                                    }}
                                    topSpace={40}
                                    w={window.innerWidth * widthPercentage}
                                    h={window.innerWidth * heightPercentage}
                                    color1={color1}
                                    color2={color2}
                                    widthPercentage={widthPercentage}
                                    heightPercentage={heightPercentage}
                                />
                            ) : (
                                <p>Loading Bar Chart...</p>
                            )}
                        </Grid>
                    </Grid>
                </div>
            ) : (
                <div>
                    <Grid
                        container
                        columns={{ xs: 12 }}
                        className="stateBarTableContainer"
                        sx={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <Grid item xs={7} justifyContent="flex-start" alignItems="center" sx={{ display: "flex" }}>
                            <Typography
                                id="cropinsuranceBarHeader"
                                variant="h6"
                                sx={{
                                    fontWeight: 400,
                                    paddingLeft: 0,
                                    fontSize: "1.2em",
                                    color: "#212121"
                                }}
                            >
                                Total Policies Earning Premium and Total Indemnities ({yearKey})
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
                        <Grid item xs={5} justifyContent="flex-end" sx={{ display: "flex", width: "100%" }}>
                            <RadioGroup
                                row
                                className="BarColorToggle"
                                defaultValue={3}
                                onChange={switchBarStatus}
                                aria-label="CropInsurance toggle button group"
                                sx={{ justifyContent: "flex-end" }}
                                value={secondarybarStatus}
                            >
                                <FormControlLabel
                                    className="bars2"
                                    id="bothBar"
                                    value={3}
                                    control={<Radio />}
                                    label="Both"
                                    sx={{ color: "#672500" }}
                                />
                                <FormControlLabel
                                    className="bars2"
                                    id="totalPoliciesEarningPremium"
                                    value={4}
                                    control={<Radio sx={{ color: color1 }} />}
                                    label="Total Policies Earning Premium"
                                    sx={{ color: color1 }}
                                />
                                <FormControlLabel
                                    className="bars2"
                                    id="totalIndemnities"
                                    value={5}
                                    control={<Radio sx={{ color: color2 }} />}
                                    label="Total Indemnities"
                                    sx={{ marginRight: 0, color: color2 }}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                    <Grid container columns={{ xs: 12 }}>
                        <Grid
                            container
                            item
                            xs={12}
                            id="cropinsuranceBarContainer"
                            sx={{ display: "flex" }}
                            ref={cropinsuranceDiv}
                        >
                            {stateDistributionData ? (
                                <CropInsuranceBar
                                    CIData={stateDistributionData}
                                    status={Number(secondarybarStatus)}
                                    yearKey={yearKey}
                                    barKeyAttr={whichBar}
                                    margin={{
                                        top: paddingTB,
                                        right: paddingLR,
                                        bottom: paddingTB,
                                        left: paddingLR
                                    }}
                                    topSpace={40}
                                    w={window.innerWidth * widthPercentage}
                                    h={window.innerWidth * heightPercentage}
                                    color1={color1}
                                    color2={color2}
                                    widthPercentage={widthPercentage}
                                    heightPercentage={heightPercentage}
                                />
                            ) : (
                                <p>Loading Bar Chart...</p>
                            )}
                        </Grid>
                    </Grid>
                </div>
            )}
        </ThemeProvider>
    );
}
