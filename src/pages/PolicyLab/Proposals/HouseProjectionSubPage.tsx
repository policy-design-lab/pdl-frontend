import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import React from "react";
import { config } from "../../../app.config";
import HouseOutlayMap from "../../../components/policylab/HouseOutlayMap";
import { convertAllState, getJsonDataFromUrl } from "../../../utils/apiutil";
import { houseProjectionMenu } from "./Menu";
import { Sidebar } from "./SideBar";
import HouseOutlayTable from "../../../components/policylab/HouseOutlayTable";
import ExpandableDescription from "../../../components/shared/ExplainationDescription";

export default function HouseProjectionSubPageProps({ v, index }: { v: number; index: number }): JSX.Element {
    const [statePerformance, setStatePerformance] = React.useState({});
    const [practiceNames, setPracticeNames] = React.useState({});
    const [metaData, setMetaData] = React.useState({
        allStates: {},
        stateCodesData: {},
        stateCodesArray: []
    });
    const [loadingStates, setLoadingStates] = React.useState({
        metadata: true,
        practices: true,
        performance: true
    });
    const [selectedItem, setSelectedItem] = React.useState("0-0-0");
    const [selectedPractices, setSelectedPractices] = React.useState(["All Practices"]);
    const handlePracticeChange = (practices) => {
        setSelectedPractices(practices);
    };
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [allStatesResponse, stateCodesResponse] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/states`),
                    getJsonDataFromUrl(`${config.apiUrl}/statecodes`)
                ]);
                const converted_json = convertAllState(stateCodesResponse);
                setMetaData({
                    allStates: allStatesResponse,
                    stateCodesData: converted_json,
                    stateCodesArray: stateCodesResponse
                });
                setLoadingStates((prev) => ({ ...prev, metadata: false }));

                const practiceNamesResponse = await getJsonDataFromUrl(
                    `${config.apiUrl}/titles/title-ii/proposals/2024/house/eqip/practice-names`
                );
                setPracticeNames(practiceNamesResponse);
                setLoadingStates((prev) => ({ ...prev, practices: false }));

                const statePerformanceResponse = await getJsonDataFromUrl(
                    `${config.apiUrl}/titles/title-ii/proposals/2024/house/eqip/predicted`
                );
                setStatePerformance(statePerformanceResponse);
                setLoadingStates((prev) => ({ ...prev, performance: false }));
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoadingStates({ metadata: false, practices: false, performance: false });
            }
        };
        fetchData();
    }, []);
    const handleMenuSelect = (value: string) => {
        setSelectedItem(value);
    };
    const isLoading = Object.values(loadingStates).some((state) => state);

    return (
        <Box role="tabpanel" hidden={v !== index && !isLoading}>
            <Grid container spacing={2} sx={{ my: 4.5 }}>
                <Grid item xs={12} md={1} />
                <Grid item xs={12} md={10}>
                    <Box
                        sx={{
                            backgroundColor: "#2F7164",
                            color: "white",
                            borderRadius: 1,
                            mb: 5
                        }}
                    >
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            In this space, a variety of policy design proposals will be evaluated and analyzed. Some
                            analysis is of existing or previous bills in Congress, as well as modifications or
                            alternatives to proposed or existing policies. Overall, the goal is to provide a space for
                            policy design analysis to further creativity and innovation. Interactive maps and other
                            visualizations accompany the various proposals, providing analysis and perspectives on
                            policy design.
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                        <Box
                            sx={{
                                flexShrink: 0,
                                borderRadius: "4px 0 0 4px",
                                overflow: "hidden",
                                boxShadow: "1px 0 2px rgba(0, 0, 0, 0.05)",
                                height: "auto",
                                display: "flex",
                                backgroundColor: "white"
                            }}
                        >
                            <Sidebar
                                menu={houseProjectionMenu}
                                selectedItem={selectedItem}
                                onMenuSelect={handleMenuSelect}
                            />
                        </Box>
                        <Box
                            sx={{
                                "flex": 1,
                                "minWidth": 0,
                                "flexDirection": "column",
                                "gap": 3,
                                "overflow": "hidden",
                                "width": "100%",
                                "& .house-outlay-map": {
                                    "width": "100%",
                                    "& > div": {
                                        "width": "100%",
                                        "& svg": {
                                            maxWidth: "100%"
                                        }
                                    }
                                }
                            }}
                        >
                            {isLoading ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        p: 4,
                                        backgroundColor: "white",
                                        borderRadius: 1
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <ExpandableDescription
                                        shortDescription="The following visualizations provide projections and analysis of the proposal in the House Ag Committee’s 2024 Farm Bill "
                                        longDescription="to rescind Inflation Reduction Act appropriations and reinvest a portion of them in Farm Bill conservation baseline."
                                    />
                                    <Box
                                        sx={{
                                            backgroundColor: "white",
                                            borderRadius: 1,
                                            p: 3
                                        }}
                                    >
                                        <HouseOutlayMap
                                            practiceNames={practiceNames}
                                            year={
                                                Object.keys(statePerformance)[0]
                                                    ? Object.keys(statePerformance)[0]
                                                    : "2025-2033"
                                            }
                                            initialStatePerformance={statePerformance}
                                            allStates={metaData.allStates}
                                            stateCodes={metaData.stateCodesData}
                                            selectedPractices={selectedPractices}
                                            onPracticeChange={handlePracticeChange}
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: "white",
                            borderRadius: 1,
                            p: 3,
                            width: "100%"
                        }}
                    >
                        <HouseOutlayTable
                            programName=""
                            statePerformance={statePerformance}
                            year={Object.keys(statePerformance)[0] ? Object.keys(statePerformance)[0] : "2025-2033"}
                            stateCodes={metaData.stateCodesArray}
                            selectedPractices={selectedPractices}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={1} />
            </Grid>
        </Box>
    );
}
