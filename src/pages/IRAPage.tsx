import { Box, Typography, Grid, Tabs, Button, Modal, IconButton } from "@mui/material";
import * as React from "react";
import InfoIcon from "@mui/icons-material/Info";
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
                    eqipPracticeNamesResponse
                ] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/states`),
                    getJsonDataFromUrl(`${config.apiUrl}/statecodes`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/state-distribution`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/predicted`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/summary`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip-ira/practice-names`)
                ]);
                setAllStatesData(allStatesResponse);
                setStateCodesArray(stateCodesResponse);
                setStateCodesData(convertAllState(stateCodesResponse));
                setEqipStateDistributionData(eqipStateDistributionResponse);
                setEqipPredictedData(eqipPredictedResponse);
                setEqipSummaryData(eqipSummaryResponse);
                setEqipPracticeNames(eqipPracticeNamesResponse);
                setIsDataReady(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Modal
    React.useEffect(() => {
        // setModalOpen(true); // #306: Block the model to be auto-opened due to the size of iframe
    }, []);
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
                        <Box sx={{ width: "100%", mt: 5 }}>
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
                                    {/* <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>CSP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>RCPP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>ACEP</Box>} customSx={tabStyle} selectedSX={selectedStyle} /> */}
                                    <IconButton color="primary" onClick={handleOpen}>
                                        <InfoIcon sx={{ color: "#2F7164", fontSize: 30 }} />
                                    </IconButton>
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
                                    {/* <TabPanel v={value} index={2} title="CSP" stateDistributionData={{}} />
                    <TabPanel v={value} index={4} title="RCPP" stateDistributionData={{}} />
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
