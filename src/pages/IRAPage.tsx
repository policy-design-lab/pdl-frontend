import { Box, Typography, Grid, Tabs, Button, Divider } from "@mui/material";
import * as React from "react";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavBar from "../components/NavBar";
import TabPanel from "../components/ira/TabPanel";
import { CustomTab } from "../components/shared/CustomTab";
import IRAModal from "../components/ira/IRAModal";

export default function IRAPage(): JSX.Element {
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const tabStyle = { fontSize: "1.5em" };
    const selectedStyle = { color: "#2F7164 !important", fontWeight: 600 };
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Fetching Data
    const [eqipStateDistributionData, setEqipStateDistributionData] = React.useState({});
    const [eqipPredictedData, setEqipPredictedData] = React.useState({});
    const [eqipSummaryData, setEqipSummaryData] = React.useState({});
    const [eqipPracticeNames, setEqipPracticeNames] = React.useState({});
    const [cspStateDistributionData, setCspStateDistributionData] = React.useState({});
    const [cspPredictedData, setCspPredictedData] = React.useState({});
    const [cspSummaryData, setCspSummaryData] = React.useState({});
    const [cspPracticeNames, setCspPracticeNames] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [zeroCategories, setZeroCategories] = React.useState([]);
    const [totalAcep, setTotalAcep] = React.useState(0);
    const [isDataReady, setIsDataReady] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    allStatesResponse,
                    stateCodesResponse,
                    eqipStateDistributionResponse,
                    eqipPredictedResponse,
                    eqipSummaryResponse,
                    eqipPracticeNamesResponse,
                    cspStateDistributionResponse,
                    cspPredictedResponse,
                    cspSummaryResponse,
                    cspPracticeNamesResponse
                ] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/states`),
                    getJsonDataFromUrl(`${config.apiUrl}/statecodes`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/state-distribution`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/predicted`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/summary`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/practice-names`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/csp-ira/state-distribution`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/csp-ira/predicted`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/csp-ira/summary`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/csp-ira/practice-names`)
                ]);
                setAllStatesData(allStatesResponse);
                setStateCodesArray(stateCodesResponse);
                setStateCodesData(convertAllState(stateCodesResponse));
                setEqipStateDistributionData(eqipStateDistributionResponse);
                setEqipPredictedData(eqipPredictedResponse);
                setEqipSummaryData(eqipSummaryResponse);
                setEqipPracticeNames(eqipPracticeNamesResponse);
                setCspStateDistributionData(cspStateDistributionResponse);
                setCspPredictedData(cspPredictedResponse);
                setCspSummaryData(cspSummaryResponse);
                setCspPracticeNames(cspPracticeNamesResponse);
                setIsDataReady(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Modal
    const handleOpen = () => {
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
    };
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(47, 113, 100, 1)" ftColor="rgba(255, 255, 255, 1)" logo="dark" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <Box>
                <Grid container spacing={2}>
                    <Grid xs={12}>
                        <Box sx={{ width: "100%", mt: 10 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={2} />
                                <Grid item xs={12} md={8} sx={{ backgroundColor: "#ECF0EE", borderRadius: 1, mb: 4.5 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: "1.125rem",
                                            px: 3,
                                            py: 0.25,
                                            textAlign: "center"
                                        }}
                                    >
                                        <b>Inflation Reduction Act Conservation; Policy Design Lab</b>
                                    </Typography>
                                    <Typography sx={{ px: 3, py: 3 }}>
                                        On August 16, 2022, President Joe Biden signed into law the Inflation Reduction
                                        Act of 2022 (P.L.
                                        <a
                                            target="_blank"
                                            href="https://www.congress.gov/bill/117th-congress/house-bill/5376/text"
                                            rel="noreferrer"
                                        >
                                            117-169
                                        </a>
                                        ). Among other things, the Inflation Reduction Act (IRA) included an $18 billion
                                        investment of additional funds appropriated to four Farm Bill Conservation
                                        programs: Environmental Quality Incentives Program (
                                        <a
                                            target="_blank"
                                            href="https://farmdocdaily.illinois.edu/2023/04/a-view-of-the-farm-bill-through-policy-design-part-1-eqip.html"
                                            rel="noreferrer"
                                        >
                                            EQIP
                                        </a>
                                        ); Conservation Stewardship Program (
                                        <a
                                            target="_blank"
                                            href="https://farmdocdaily.illinois.edu/2023/05/a-view-of-the-farm-bill-through-policy-design-part-2-csp.html"
                                            rel="noreferrer"
                                        >
                                            CSP
                                        </a>
                                        ); Agricultural Conservation Easement Program (
                                        <a
                                            target="_blank"
                                            href="https://farmdocdaily.illinois.edu/2023/10/a-view-of-the-farm-bill-through-policy-design-part-7-acep-and-rcpp.html"
                                            rel="noreferrer"
                                        >
                                            ACEP
                                        </a>
                                        ); and Regional Conservation Partnership Program (
                                        <a
                                            target="_blank"
                                            href="https://farmdocdaily.illinois.edu/2023/10/a-view-of-the-farm-bill-through-policy-design-part-7-acep-and-rcpp.html"
                                            rel="noreferrer"
                                        >
                                            RCPP
                                        </a>
                                        )...
                                        <Button onClick={handleOpen} sx={{ padding: 0, ml: "1rem" }}>
                                            <Typography
                                                sx={{
                                                    color: "#2F7164"
                                                }}
                                            >
                                                Learn More
                                            </Typography>
                                        </Button>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid xs={12}>
                        <Box sx={{ width: "100%", my: 2 }}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                sx={{ borderBottom: 1, borderColor: "divider", mx: 6 }}
                            >
                                <Tabs
                                    variant="scrollable"
                                    value={value}
                                    onChange={handleChange}
                                    scrollButtons="auto"
                                    sx={{ mb: 1 }}
                                >
                                    <CustomTab label={<Box>EQIP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                                    <CustomTab label={<Box>CSP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                                    {/* <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>RCPP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>ACEP</Box>} customSx={tabStyle} selectedSX={selectedStyle} /> */}
                                    <IRAModal open={isModalOpen} handleClose={handleClose} />
                                </Tabs>
                            </Box>
                            {/* NOTE: Because of divider, the index are increased by 2 */}
                            {isDataReady ? (
                                <span>
                                    <TabPanel
                                        v={value}
                                        index={0}
                                        title="EQIP"
                                        stateDistributionData={eqipStateDistributionData}
                                        predictedData={eqipPredictedData}
                                        predictedYear={Object.keys(eqipPredictedData)[0]}
                                        practiceNames={eqipPracticeNames}
                                        stateCodes={stateCodesData}
                                        allStates={allStatesData}
                                        summaryData={eqipSummaryData}
                                    />
                                    <TabPanel
                                        v={value}
                                        index={2}
                                        title="CSP"
                                        stateDistributionData={cspStateDistributionData}
                                        predictedData={cspPredictedData}
                                        predictedYear={Object.keys(cspPredictedData)[0]}
                                        stateCodes={stateCodesData}
                                        allStates={allStatesData}
                                        practiceNames={cspPracticeNames}
                                        summaryData={cspSummaryData}
                                    />
                                    {/* <TabPanel v={value} index={4} title="RCPP" stateDistributionData={{}} />
                    <TabPanel v={value} index={6} title="ACEP" stateDistributionData={{}} /> */}
                                </span>
                            ) : (
                                <Box sx={{ display: "flex", justifyContent: "center", mx: 10, my: 3 }}>
                                    <Typography variant="h6">Loading IRA Data...</Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
