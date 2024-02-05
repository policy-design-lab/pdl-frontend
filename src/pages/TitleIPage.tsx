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
import Title1Map from "../components/title1/Title1Map";
import NavSearchBar from "../components/shared/NavSearchBar";
import Title1TreeMap from "../components/title1/Title1TreeMap";
import Title1ProgramTable from "../components/title1/Title1ProgramTable";
import SideBar from "../components/title1/sideBar/SideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import "../styles/subpage.css";

export default function TitleIPage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const [subtitleADistributionData, setSubtitleADistributionData] = React.useState({});
    const [subtitleEStateDistributionData, setSubtitleEStateDistributionData] = React.useState({}); // TODO: need to be updated in API!
    const [subtitleDStateDistributionData, setSubtitleDStateDistributionData] = React.useState({}); // TODO: need to be updated in API!
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const title1Div = React.useRef(null);
    const [checked, setChecked] = React.useState("0");
    const mapColor = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];
    const initTreeMapWidthRatio = 0.55;

    // years
    const subtitleAYear = "2014-2021";
    const subtitleEYear = "2014-2021";
    const subtitleDYear = "2014-2021";

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
        const subtitleA_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-a/state-distribution`;
        getJsonDataFromUrl(subtitleA_url).then((response) => {
            setSubtitleADistributionData(response);
        });

        const subtitleD_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-d/state-distribution`;
        getJsonDataFromUrl(subtitleD_url).then((response) => {
            setSubtitleDStateDistributionData(response);
        });
        const subtitleE_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-e/state-distribution`;
        getJsonDataFromUrl(subtitleE_url).then((response) => {
            setSubtitleEStateDistributionData(response);
        });
    }, []);

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
                    payments: subProgramData[0].paymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: subProgramData[0].averageAreaInAcres,
                    payments: subProgramData[0].paymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
            } else {
                organizedData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].programPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].programPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
            }
        });
        return [organizedData, originalData];
    }
    return (
        <ThemeProvider theme={defaultTheme}>
            {Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(subtitleADistributionData).length > 0 &&
            Object.keys(subtitleEStateDistributionData).length > 0 &&
            Object.keys(subtitleDStateDistributionData).length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Commodities Programs (Title I)" />
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
                            <Title1Map
                                subtitle="Total Commodities Programs, Subtitle A"
                                program={undefined}
                                subprogram={undefined}
                                year={subtitleAYear}
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
                                    tableTitle="Comparison of Total Payments for these Commodities Programs and the State's Percentage of that Total (2014-2021)"
                                    subtitle="Total Commodities Programs, Subtitle A"
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleADistributionData}
                                    year={subtitleAYear}
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
                            <Title1Map
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram={undefined}
                                year={subtitleAYear}
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
                                            subtitleAYear
                                        )}
                                        stateCodes={stateCodesData}
                                        year={subtitleAYear}
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
                                        year={subtitleAYear}
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
                        sx={{ display: checked !== "10" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                year={subtitleAYear}
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
                                            subtitleAYear
                                        )}
                                        stateCodes={stateCodesData}
                                        year={subtitleAYear}
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
                                        year={subtitleAYear}
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
                        sx={{ display: checked !== "11" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                year={subtitleAYear}
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
                                            subtitleAYear
                                        )}
                                        stateCodes={stateCodesData}
                                        year={subtitleAYear}
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
                                        year={subtitleAYear}
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
                            <Title1Map
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Price Loss Coverage (PLC)"
                                subprogram={undefined}
                                year={subtitleAYear}
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
                                            subtitleAYear
                                        )}
                                        stateCodes={stateCodesData}
                                        year={subtitleAYear}
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
                                        year={subtitleAYear}
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
                            <Title1Map
                                subtitle="Dairy Margin Coverage, Subtitle D"
                                program={undefined}
                                subprogram={undefined}
                                year={subtitleDYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Dairy Margin Coverage (${subtitleDYear})`}
                                    subtitle="Dairy Margin Coverage, Subtitle D"
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleDStateDistributionData}
                                    year={subtitleDYear}
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
                            <Title1Map
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program={undefined}
                                subprogram={undefined}
                                year={subtitleEYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Supplemental Agricultural Disaster Assistance (${subtitleEYear})`}
                                    program={undefined}
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={subtitleEYear}
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
                        sx={{ display: checked !== "40" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                                subprogram={undefined}
                                year={subtitleEYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP) (${subtitleEYear})`}
                                    program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                                    subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={subtitleEYear}
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
                        sx={{ display: checked !== "41" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Livestock Forage Program (LFP)"
                                subprogram={undefined}
                                year={subtitleEYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Forage Program (LFP) (${subtitleEYear})`}
                                    program="Livestock Forage Program (LFP)"
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={subtitleEYear}
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
                        sx={{ display: checked !== "42" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Livestock Indemnity Payments (LIP)"
                                subprogram={undefined}
                                year={subtitleEYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Indemnity Payments (LIP) (${subtitleEYear})`}
                                    subprogram={undefined}
                                    program="Livestock Indemnity Payments (LIP)"
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={subtitleEYear}
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
                        sx={{ display: checked !== "43" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <Title1Map
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                program="Tree Assistance Program (TAP)"
                                subprogram={undefined}
                                year={subtitleEYear}
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
                                    tableTitle={`Comparing Payments and Total Payments Recipients for Tree Assistance Program (TAP) (${subtitleEYear})`}
                                    subprogram={undefined}
                                    program="Tree Assistance Program (TAP)"
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={subtitleEStateDistributionData}
                                    year={subtitleEYear}
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
