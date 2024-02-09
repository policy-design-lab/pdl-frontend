import * as React from "react";
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
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import LandingPageMap from "../components/LandingPageMap";
import SnapTable from "../components/snap/SNAPTable";
import SNAPBar from "../components/snap/SNAPBar";
import NavBar from "../components/NavBar";
import NavSearchBar from "../components/shared/NavSearchBar";
import { hexToRGB } from "../components/shared/StyleFunctions";
import "../styles/snap.css";
import "../styles/table.css";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";

export default function SNAPPage(): JSX.Element {
    const paddingLR = 40;
    const paddingTB = 40;
    const snapDiv = React.useRef(null);
    const [barStatus, setBarStatus] = React.useState(0);
    const [tab, setTab] = React.useState(0);
    const color1 = "#1f78b4";
    const color2 = "#ba68c8";
    const yearKey = "2018-2022";
    const widthPercentage = 0.8;
    const heightPercentage = 0.4;
    const [data, setData] = React.useState(null);

    // connect to api endpoint
    const [stateCodes, setStateCodes] = React.useState([]);
    const [allPrograms, setAllPrograms] = React.useState([]);
    const [allStates, setAllStates] = React.useState([]);
    const [summary, setSummary] = React.useState([]);

    React.useEffect(() => {
        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            const converted_json = convertAllState(response);
            setStateCodes(converted_json);
        });

        const allprograms_url = `${config.apiUrl}/allprograms`;
        getJsonDataFromUrl(allprograms_url).then((response) => {
            setAllPrograms(response);
        });

        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStates(response);
        });

        const summary_url = `${config.apiUrl}/summary`;
        getJsonDataFromUrl(summary_url).then((response) => {
            setSummary(response);
        });

        getJsonDataFromUrl(`${config.apiUrl}/programs/snap/state-distribution`).then((response) => {
            setData(response);
        });
    }, []);
    const defaultTheme = createTheme({
        spacing: 8
    });
    const switchBarTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const switchBarStatus = (event, selectItem) => {
        if (selectItem !== null) {
            setBarStatus(selectItem);
        }
    };
    const downloadSVG = (status) => {
        if (snapDiv.current !== undefined && status) {
            const svgElement = snapDiv.current.querySelector("#SNAPBarChart");
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "snap-bar.svg";
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
    return (
        <ThemeProvider theme={defaultTheme}>
            {Object.keys(stateCodes).length > 0 &&
            Object.keys(allStates).length > 0 &&
            Object.keys(summary).length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Supplemental Nutrition ... (SNAP)" />
                    </Box>
                    <Box
                        className="MainContent"
                        sx={{
                            position: "relative",
                            top: 0,
                            width: "80%",
                            m: "0 auto",
                            pt: 25,
                            pb: 5
                        }}
                    >
                        <div id="landingPageMapContainer">
                            <LandingPageMap
                                programTitle="Supplemental Nutrition Assistance Program (SNAP)"
                                allStates={allStates}
                                stateCodes={stateCodes}
                                allPrograms={allPrograms}
                                summary={summary}
                            />
                        </div>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box component="div" ref={snapDiv}>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                className="stateTitleContainer"
                                sx={{
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #e4ebe7",
                                    py: 2,
                                    display: "flex"
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 700, marginTop: 1 }}>
                                    Performance by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="BarTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchBarTable}
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
                                    <Grid
                                        container
                                        columns={{ xs: 12 }}
                                        className="stateBarTableContainer"
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <Grid
                                            item
                                            xs={7}
                                            justifyContent="flex-start"
                                            alignItems="center"
                                            sx={{ display: "flex" }}
                                        >
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
                                                Total SNAP Benefits and Avg. Monthly Participation (2018-2022)
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
                                        <Grid
                                            item
                                            xs={5}
                                            justifyContent="flex-end"
                                            sx={{ display: "flex", width: "100%" }}
                                        >
                                            <RadioGroup
                                                row
                                                className="BarColorToggle"
                                                defaultValue={0}
                                                onChange={switchBarStatus}
                                                aria-label="SNAP toggle button group"
                                                sx={{ justifyContent: "flex-end" }}
                                            >
                                                <FormControlLabel
                                                    id="bothRadio"
                                                    value={0}
                                                    control={<Radio />}
                                                    label="Both"
                                                    sx={{ color: "#212121" }}
                                                />
                                                <FormControlLabel
                                                    id="totalBenefitsRadio"
                                                    value={1}
                                                    control={<Radio sx={{ color: color1 }} />}
                                                    label="Total Benefits"
                                                    sx={{ color: color1 }}
                                                />
                                                <FormControlLabel
                                                    id="avgMonthlyParticipationRadio"
                                                    value={2}
                                                    control={<Radio sx={{ color: color2 }} />}
                                                    label="Avg. Monthly Participation"
                                                    sx={{ marginRight: 0, color: color2 }}
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
                                    <Grid container columns={{ xs: 12 }}>
                                        <Grid
                                            container
                                            item
                                            xs={12}
                                            id="snapBarContainer"
                                            sx={{ display: "flex" }}
                                            ref={snapDiv}
                                        >
                                            {data ? (
                                                <SNAPBar
                                                    SnapData={data}
                                                    status={Number(barStatus)}
                                                    yearKey={yearKey}
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
                                                <p>Loading...</p>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box id="snapTableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                                    <Grid
                                        container
                                        columns={{ xs: 12 }}
                                        className="stateBarTableContainer"
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <Grid
                                            item
                                            xs={7}
                                            justifyContent="flex-start"
                                            alignItems="center"
                                            sx={{ display: "flex" }}
                                        >
                                            <Box id="snapTableHeader" sx={{ width: "100%" }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        display: "flex-box",
                                                        fontWeight: 400,
                                                        paddingLeft: 0,
                                                        fontSize: "1.2em",
                                                        color: "#212121",
                                                        paddingTop: 1.5
                                                    }}
                                                >
                                                    Total SNAP Benefits and Avg. Monthly Participation (2018-2022)
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ width: "100%" }}>
                                        {data ? (
                                            <SnapTable
                                                SnapData={data}
                                                stateCodes={stateCodes}
                                                yearKey={yearKey}
                                                w={window.innerWidth * widthPercentage}
                                                h={window.innerWidth * heightPercentage}
                                                color1={hexToRGB(color1, 0.1)}
                                                color2={hexToRGB(color2, 0.1)}
                                                widthPercentage={widthPercentage}
                                                heightPercentage={heightPercentage}
                                            />
                                        ) : (
                                            <p>Loading...</p>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <p>Loading data...</p>
            )}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    height: 50
                }}
            />
        </ThemeProvider>
    );
}
