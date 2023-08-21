import Box from "@mui/material/Box";
import * as React from "react";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import {
    CircularProgress,
    createTheme,
    FormControlLabel,
    Grid,
    MenuItem,
    RadioGroup,
    SvgIcon,
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
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    // const [initTreeMapWidthRatio, setInitTreeMapWidthRatio] = React.useState(0.5);
    const [chartData, setChartData] = React.useState({});
    const title1Div = React.useRef(null);
    const [checked, setChecked] = React.useState("0");
    const mapColor = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];
    let initTreeMapWidthRatio = 0.6;

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
        const subprograms_url = `${config.apiUrl}/programs/commodities/subprograms`;
        getJsonDataFromUrl(subprograms_url).then((response) => {
            setChartData(response);
        });
        const statedistribution_url = `${config.apiUrl}/programs/commodities/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });
        if (window.innerWidth >= 1920) {
            initTreeMapWidthRatio = 0.7;
        }
    }, []);

    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const defaultTheme = createTheme();
    // }
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
            Object.keys(chartData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 ? (
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
                                program="Total Commodities Programs"
                                year="2014-2021"
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
                                    program="Total Commodities Programs"
                                    subprogram={undefined}
                                    skipColumns={[]}
                                    stateCodes={stateCodesData}
                                    Title1Data={stateDistributionData}
                                    year="2014-2021"
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
                                program="Agriculture Risk Coverage (ARC)"
                                year="2014-2021"
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
                                            stateDistributionData,
                                            "2014-2021"
                                        )}
                                        stateCodes={stateCodesData}
                                        year="2014-2021"
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={3000}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram={undefined}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        Title1Data={stateDistributionData}
                                        year="2014-2021"
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
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                year="2014-2021"
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
                                            stateDistributionData,
                                            "2014-2021"
                                        )}
                                        stateCodes={stateCodesData}
                                        year="2014-2021"
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2800}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC-CO Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        skipColumns={[]}
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                        stateCodes={stateCodesData}
                                        Title1Data={stateDistributionData}
                                        year="2014-2021"
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
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                year="2014-2021"
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
                                            stateDistributionData,
                                            "2014-2021"
                                        )}
                                        stateCodes={stateCodesData}
                                        year="2014-2021"
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2300}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing ARC-IC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        skipColumns={[]}
                                        program="Agriculture Risk Coverage (ARC)"
                                        subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                        stateCodes={stateCodesData}
                                        Title1Data={stateDistributionData}
                                        year="2014-2021"
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
                                program="Price Loss Coverage (PLC)"
                                year="2014-2021"
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
                                            stateDistributionData,
                                            "2014-2021"
                                        )}
                                        stateCodes={stateCodesData}
                                        year="2014-2021"
                                        svgW={window.innerWidth * initTreeMapWidthRatio}
                                        svgH={2300}
                                    />
                                </Box>
                                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Title1ProgramTable
                                        tableTitle="Comparing PLC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                        program="Price Loss Coverage (PLC)"
                                        subprogram={undefined}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        Title1Data={stateDistributionData}
                                        year="2014-2021"
                                        color1="#F6EEEA"
                                        color2="#EAF8EA"
                                        color3="#F7F0F8"
                                    />
                                </Box>
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
