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
import Title1SubtitleMap from "../components/title1/Title1SubtitleMap";
import NavSearchBar from "../components/shared/NavSearchBar";
import Title1TreeMap from "../components/title1/Title1TreeMap";
import Title1ProgramTable from "../components/title1/Title1ProgramTable";
import SideBar from "../components/title1/sideBar/SideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import "../styles/subpage.css";
import Title1TotalMap from "../components/title1/Title1TotalMap";
import DataTable from "../components/title1/Title1TotalTable";

export default function TitleIPage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [subtitleADistributionData, setSubtitleADistributionData] = React.useState({});
    const [subtitleEStateDistributionData, setSubtitleEStateDistributionData] = React.useState({});
    const [subtitleDStateDistributionData, setSubtitleDStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);

    const title1Div = React.useRef(null);
    const [checked, setChecked] = React.useState("0");
    const mapColor = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];
    const initTreeMapWidthRatio = 0.55;

    // years
    const start_year = 2014;
    const end_year = 2023;
    const total_year = `${start_year}-${end_year}`;
    React.useEffect(() => {
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStatesData(response);
        });
        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            setStateCodesArray(response);
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });
        const statedistribution_url = `${config.apiUrl}/titles/title-i/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            const transformed = transformStatePerformance(response);
            setStateDistributionData(transformed);
        });
        const subtitleA_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-a/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleA_url).then((response) => {
            setSubtitleADistributionData(response);
        });

        const subtitleD_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-d/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleD_url).then((response) => {
            setSubtitleDStateDistributionData(response);
        });
        const subtitleE_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-e/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleE_url).then((response) => {
            setSubtitleEStateDistributionData(response);
        });
    }, []);

    const transformStatePerformance = (rawData) => {
        const years = Object.keys(rawData).filter(
            (key) => /^\d{4}$/.test(key) && Number(key) >= 2014 && Number(key) <= 2023
        );

        const summaryArray = rawData[total_year];
        if (!Array.isArray(summaryArray)) return { [total_year]: [] };

        const stateMap = {};
        // Initialize with the summary data
        summaryArray.forEach((entry) => {
            const { state, totalPaymentInDollars, totalRecipients } = entry;
            stateMap[state] = {
                state,
                totalPaymentInDollars,
                totalRecipients,
                years: {}
            };
        });

        // Add per-year breakdown
        years.forEach((year) => {
            rawData[year].forEach((entry) => {
                const { state, totalPaymentInDollars } = entry;
                if (stateMap[state]) {
                    stateMap[state].years[year] = {
                        totalPaymentInDollars
                    };
                }
            });
        });

        return {
            [total_year]: Object.values(stateMap)
        };
    };

    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const defaultTheme = createTheme();
    function prepData(program, subprogram, data, year) {
        const organizedData: Record<string, unknown>[] = [];
        const originalData: Record<string, unknown>[] = [];
        data[year].forEach((stateData) => {
            const state = stateData.state;
            const programData = stateData.programs.filter((p) => {
                return p.programName.toString() === program;
            });
            if (subprogram !== undefined) {
                const subProgramData = programData[0].subPrograms.filter((p) => {
                    return p.subProgramName.toString() === subprogram;
                });
                organizedData.push({
                    state,
                    baseAcres: subProgramData[0].averageAreaInAcres,
                    payments: subProgramData[0].totalPaymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: subProgramData[0].averageAreaInAcres,
                    payments: subProgramData[0].totalPaymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
            } else {
                organizedData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].totalPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].totalPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
            }
        });
        return [organizedData, originalData];
    }
    const subtextMatch = {
        0: "Total Commodities Programs (Title I)",
        1: "Total Commodities Programs, Subtitle A",
        2: "Agriculture Risk Coverage (ARC)",
        20: "Agriculture Risk Coverage County Option (ARC-CO)",
        21: "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
        3: "Price Loss Coverage (PLC)",
        4: "Dairy Margin Coverage, Subtitle D",
        5: "Supplemental Agricultural Disaster Assistance, Subtitle E",
        50: "Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)",
        51: "Livestock Forage Program (LFP)",
        52: "Livestock Indemnity Payments (LIP)",
        53: "Tree Assistance Program (TAP)"
    };

    const isDataLoaded = React.useMemo(() => {
        return (
            Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 &&
            Object.keys(subtitleADistributionData).length > 0 &&
            Object.keys(subtitleEStateDistributionData).length > 0 &&
            Object.keys(subtitleDStateDistributionData).length > 0
        );
    }, [
        stateCodesData,
        allStatesData,
        stateDistributionData,
        subtitleADistributionData,
        subtitleEStateDistributionData,
        subtitleDStateDistributionData
    ]);

    return (
        <ThemeProvider theme={defaultTheme}>
            {isDataLoaded ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Commodities Programs (Title I)" subtext={subtextMatch[checked]} />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    <SideBar setTitle1Checked={setChecked} />
                    <Box
                        component="div"
                        className="halfWidthMainContent"
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
                            <Title1TotalMap
                                program="Title I: Commodities"
                                attribute="payments"
                                year={total_year}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                                mapColor={mapColor}
                            />
                        </Box>
                        <Box
                            className="chartArea"
                            component="div"
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <DataTable
                                    TableTitle={`Total Commodities Programs (Title I) from ${total_year}`}
                                    statePerformance={stateDistributionData}
                                    year={total_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
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
                            <Title1SubtitleMap
                                subtitle="Total Commodities Programs, Subtitle A"
                                program={undefined}
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleADistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    tableTitle={`Comparison of Total Payments for these Commodities Programs and the State's Percentage of that Total (${total_year})`}
                                    subtitle="Total Commodities Programs, Subtitle A"
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleADistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
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
                            <Title1SubtitleMap
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleADistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="SNAP toggle button group"
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
                                <Box className="title1TableContainer" sx={{ display: tab !== 0 ? "none" : "div" }}>
                                    <Title1TreeMap
                                        program="Agriculture Risk Coverage (ARC)"
                                        TreeMapData={prepData(
                                            "Agriculture Risk Coverage (ARC)",
                                            undefined,
                                            subtitleADistributionData,
                                            total_year
                                        )}
                                        stateCodes={stateCodesData}
                                        year={total_year}
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2800}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        subtitle="Total Commodities Programs, Subtitle A"
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram={undefined}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        Title1Data={subtitleADistributionData}
                                        year={total_year}
                                        color1="#F6EEEA"
                                        color2="#EAF8EA"
                                        color3="#F7F0F8"
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "20" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleADistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="SNAP toggle button group"
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
                                <Box sx={{ display: tab !== 0 ? "none" : "div" }}>
                                    <Title1TreeMap
                                        program="Agriculture Risk Coverage County Option (ARC-CO)"
                                        TreeMapData={prepData(
                                            "Agriculture Risk Coverage (ARC)",
                                            "Agriculture Risk Coverage County Option (ARC-CO)",
                                            subtitleADistributionData,
                                            total_year
                                        )}
                                        stateCodes={stateCodesData}
                                        year={total_year}
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2800}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC-CO Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        skipColumns={[]}
                                        subtitle="Total Commodities Programs, Subtitle A"
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                        stateCodes={stateCodesData}
                                        Title1Data={subtitleADistributionData}
                                        year={total_year}
                                        color1="#F6EEEA"
                                        color2="#EAF8EA"
                                        color3="#F7F0F8"
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "21" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleADistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="SNAP toggle button group"
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
                                <Box sx={{ display: tab !== 0 ? "none" : "div" }}>
                                    <Title1TreeMap
                                        program="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                        TreeMapData={prepData(
                                            "Agriculture Risk Coverage (ARC)",
                                            "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
                                            subtitleADistributionData,
                                            total_year
                                        )}
                                        stateCodes={stateCodesData}
                                        year={total_year}
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2300}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC-IC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        skipColumns={[]}
                                        subtitle="Total Commodities Programs, Subtitle A"
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                        stateCodes={stateCodesData}
                                        Title1Data={subtitleADistributionData}
                                        year={total_year}
                                        color1="#F6EEEA"
                                        color2="#EAF8EA"
                                        color3="#F7F0F8"
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
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
                            <Title1SubtitleMap
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Price Loss Coverage (PLC)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleADistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="SNAP toggle button group"
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
                                <Box className="title1TableContainer" sx={{ display: tab !== 0 ? "none" : "div" }}>
                                    <Title1TreeMap
                                        program="Price Loss Coverage (PLC)"
                                        TreeMapData={prepData(
                                            "Price Loss Coverage (PLC)",
                                            undefined,
                                            subtitleADistributionData,
                                            total_year
                                        )}
                                        stateCodes={stateCodesData}
                                        year={total_year}
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2300}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing PLC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        subtitle="Total Commodities Programs, Subtitle A"
                                        program="Price Loss Coverage (PLC)"
                                        subprogram={undefined}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        Title1Data={subtitleADistributionData}
                                        year={total_year}
                                        color1="#F6EEEA"
                                        color2="#EAF8EA"
                                        color3="#F7F0F8"
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
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
                            <Title1SubtitleMap
                                subtitle="Dairy Margin Coverage, Subtitle D"
                                program={undefined}
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleDStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Dairy Margin Coverage (${total_year})`}
                                    subtitle="Dairy Margin Coverage, Subtitle D"
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleDStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    {/* SADA */}
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "5" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program={undefined}
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleEStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Supplemental Agricultural Disaster Assistance (${total_year})`}
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "50" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleEStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP) (${total_year})`}
                                    program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "51" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Livestock Forage Program (LFP)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleEStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Forage Program (LFP) (${total_year})`}
                                    program="Livestock Forage Program (LFP)"
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "52" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Livestock Indemnity Payments (LIP)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleEStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Indemnity Payments (LIP) (${total_year})`}
                                    subprogram={undefined}
                                    program="Livestock Indemnity Payments (LIP)"
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "53" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1SubtitleMap
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Tree Assistance Program (TAP)"
                                subprogram={undefined}
                                year={total_year}
                                mapColor={mapColor}
                                statePerformance={subtitleEStateDistributionData}
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
                            ref={title1Div}
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Performance by States
                                </Typography>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Title1ProgramTable
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Tree Assistance Program (TAP) (${total_year})`}
                                    subprogram={undefined}
                                    program="Tree Assistance Program (TAP)"
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={total_year}
                                    color1="#F6EEEA"
                                    color2="#EAF8EA"
                                    color3="#F7F0F8"
                                />
                            </Grid>
                        </Box>
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
