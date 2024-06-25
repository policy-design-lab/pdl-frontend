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
    const [eqipSummaryData, setEqipSummaryData] = React.useState({});
    const [eqipPracticeNames, setEqipPracticeNames] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [zeroCategories, setZeroCategories] = React.useState([]);
    const [totalAcep, setTotalAcep] = React.useState(0);
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

        // eqip IRA data
        const eqip_statedistribution_url = `${config.apiUrl}/titles/title-ii/programs/eqip-ira/state-distribution`;
        getJsonDataFromUrl(eqip_statedistribution_url).then((response) => {
            setEqipStateDistributionData(response);
        });
        const eqip_summary_url = `${config.apiUrl}/titles/title-ii/programs/eqip-ira/summary`;
        getJsonDataFromUrl(eqip_summary_url).then((response) => {
            setEqipSummaryData(response);
        });
        const eqip_practicenames_url = `${config.apiUrl}/titles/title-ii/programs/eqip-ira/practice-names`;
        getJsonDataFromUrl(eqip_practicenames_url).then((response) => {
            setEqipPracticeNames(response);
        });

        // csp IRA data

        // rccp IRA data

        // acep IRA data
    }, []);

    // Modal
    React.useEffect(() => {
        setModalOpen(true);
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
            {/* <Box>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: "#242424",
                        mt: 4.5,
                        textAlign: "center"
                    }}
                >
                    Inflation Reduction Act
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "0.875rem",
                        color: "#00000099",
                        mb: 4.5,
                        textAlign: "center"
                    }}
                >
                    Prediction from 2018 to 2022
                </Typography>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{ backgroundColor: "#2F7164", color: "white", borderRadius: 1, mb: 4.5 }}
                    >
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            On August 16, 2022, President Biden signed the Inflation Reduction Act (IRA) into law,
                            marking one of the largest investments in the American economy, energy security, and climate
                            that Congress has made in the nation&apos;s history.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid
                        container
                        xs={12}
                        md={8}
                        sx={{
                            color: "#000000B2 !important",
                            backgroundColor: "white",
                            borderRadius: 1,
                            mb: 4.5,
                            px: 3,
                            py: 3
                        }}
                    >
                        <Grid item md={6}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, pt: 1, pb: 0.5 }}>
                                Background
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                                As I stepped onto the narrow trail, the ground yielded beneath my boots, each step
                                sinking into the rich loam. Shafts of light danced upon the forest floor, illuminating
                                delicate ferns and wildflowers that clung to life in the shadowed realm. The trees stood
                                sentinel, their gnarled roots intertwining like old lovers, secrets whispered through
                                the ages. And as I followed the winding path deeper into the heart of the forest, I
                                wondered what mysteries awaited me—the ancient guardians, the forgotten ruins, or
                                perhaps something more elusive, hidden just beyond sight
                            </Typography>
                        </Grid>
                        <Grid item md={6} sx={{ borderLeft: "1px solid #0000001F" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.125rem", px: 3, pt: 1, pb: 3 }}>
                                Explanation
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                In the heart of the ancient forest, where sunlight filtered through a canopy of emerald
                                leaves, a hidden path beckoned to those who dared to venture. The air was thick with the
                                scent of moss and damp earth, and the distant calls of unseen birds echoed like
                                forgotten memories.
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Box> */}
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
                            {Object.keys(eqipStateDistributionData).length > 0 &&
                            Object.keys(stateCodesData).length > 0 ? (
                                <span>
                                    <TabPanel
                                        v={value}
                                        index={0}
                                        title="EQIP"
                                        stateDistributionData={eqipStateDistributionData}
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
