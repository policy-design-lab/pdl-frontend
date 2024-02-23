import Box from "@mui/material/Box";
import * as React from "react";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import {
    CircularProgress,
    createTheme,
    Grid,
    ThemeProvider,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import NavBar from "../components/NavBar";
import CropInsuranceMap from "../components/cropinsurance/CropInsuranceMap";
import NavSearchBar from "../components/shared/NavSearchBar";
import CropInsuranceProgramTable from "../components/cropinsurance/CropInsuranceTable";
import SideBar from "../components/cropinsurance/sideBar/ShortSideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import "../styles/subpage.css";

import "../styles/cropinsurance.css";
import CropInsuranceBubble from "../components/cropinsurance/chart/CropInsuranceBubble";
import CropInsuranceBars from "../components/cropinsurance/chart/CropInsuranceBars";

export default function CropInsurancePage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [initChartWidthRatio, setChartMapWidthRatio] = React.useState(0.9);
    const cropInsuranceDiv = React.useRef(null);
    const [checked, setChecked] = React.useState("0");
    const mapColor = ["#C26C06", "#CCECE6", "#66C2A4", "#238B45", "#005C24"];

    React.useEffect(() => {
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStatesData(response);
        });
        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });
        const statedistribution_url = `${config.apiUrl}/titles/title-xi/programs/crop-insurance/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });
    }, []);

    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const defaultTheme = createTheme();
    /**
     * Derive TotalIndemnities, TotalFarmerPaidPremium, OriginalNetFarmerBenefit for the bubble chart
     Set NetFarmerBenefit as 0. The post processing will be done in CropInsuranceBubble.tsx
     */
    const setBubbleData = (year) => {
        const res: any[] = [];
        stateDistributionData[year].forEach((stateData) => {
            const initObject = {
                State: stateData.state,
                TotalIndemnities: stateData.programs[0].totalIndemnitiesInDollars,
                TotalFarmerPaidPremium: stateData.programs[0].totalFarmerPaidPremiumInDollars,
                OriginalNetFarmerBenefit: stateData.programs[0].totalNetFarmerBenefitInDollars,
                NetFarmerBenefit: 0
            };
            res.push(initObject);
        });
        return res;
    };
    const subtextMatch = {
        "0": "Total Net Farmer Benefits",
        "01": "Total Farmer Paid Premium",
        "00": "Total Indemnities",
        "02": "Total Premium",
        "03": "Total Premium Subsidy",
        "1": "Loss Ratio",
        "2": "Average Liabilities",
        "3": "Total Policies Earning Premium",
        "4": "Average Acres Insured"
    };
    return (
        <ThemeProvider theme={defaultTheme}>
            {Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Crop Insurance" subtext={subtextMatch[checked]} />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    {/* Net Farmer Premium Section */}
                    <SideBar setCropInsuranceChecked={setChecked} />
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "0" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalNetFarmerBenefit"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble
                                        originalData={setBubbleData("2018-2022")}
                                        stateCodesData={stateCodesData}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu={checked}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars",
                                            "totalPremiumSubsidyInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "01" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalFarmerPaidPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble
                                        originalData={setBubbleData("2018-2022")}
                                        stateCodesData={stateCodesData}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu={checked}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars",
                                            "totalPremiumSubsidyInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "00" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalIndemnities"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble
                                        originalData={setBubbleData("2018-2022")}
                                        stateCodesData={stateCodesData}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu={checked}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars",
                                            "totalPremiumSubsidyInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "02" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble
                                        originalData={setBubbleData("2018-2022")}
                                        stateCodesData={stateCodesData}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu={checked}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars",
                                            "totalPremiumSubsidyInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "03" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPremiumSubsidy"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble
                                        originalData={setBubbleData("2018-2022")}
                                        stateCodesData={stateCodesData}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu={checked}
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars",
                                            "totalPremiumSubsidyInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    {/* Loss Ratio Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "1" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="lossRatio"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Grid container justifyContent="center">
                            <Grid item xs={12}>
                                <Box
                                    className="chartArea narrowChartArea"
                                    component="div"
                                    ref={cropInsuranceDiv}
                                    sx={{
                                        width: "100%",
                                        m: "auto"
                                    }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Loss Ratio (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={["lossRatio"]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    {/* Liabilities Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "2" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="averageLiabilities"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Grid container justifyContent="center">
                            <Grid item xs={12}>
                                <Box
                                    className="chartArea narrowChartArea"
                                    component="div"
                                    ref={cropInsuranceDiv}
                                    sx={{
                                        width: "100%",
                                        m: "auto"
                                    }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Average Liabilities (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={["averageLiabilitiesInDollars"]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    {/* Policy Earning Premium Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "3" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPoliciesEarningPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h6">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="CropInsurance toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBars
                                        stateDistributionData={stateDistributionData}
                                        checkedMenu="totalPoliciesEarningPremium"
                                        initChartWidthRatio={initChartWidthRatio}
                                    />
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Policies Earning Premium and Total Indemnities (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={["totalPoliciesEarningPremium", "totalIndemnitiesInDollars"]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    {/* Average Acres Insured Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "4" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="averageInsuredAreaInAcres"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Grid container justifyContent="center">
                            <Grid item xs={12}>
                                <Box
                                    className="chartArea narrowChartArea"
                                    component="div"
                                    ref={cropInsuranceDiv}
                                    sx={{
                                        width: "100%",
                                        m: "auto"
                                    }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Average Insured Area in Acres (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={["averageInsuredAreaInAcres"]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            ) : (
                <div className="dataLoading">
                    <CircularProgress />
                    Loading data...
                </div>
            )}
        </ThemeProvider>
    );
}
