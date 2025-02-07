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
    const [selectedItem, setSelectedItem] = React.useState("0");
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
            <Box>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: "#242424",
                        my: 4.5,
                        textAlign: "center"
                    }}
                >
                    Page Title
                </Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={2} />
                <Grid item xs={12} md={8}>
                    <Box
                        sx={{
                            backgroundColor: "#2F7164",
                            color: "white",
                            borderRadius: 1,
                            mb: 5
                        }}
                    >
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            Overall description. Lorem Ipsum is simply dummy text of the printing and typesetting
                            industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when
                            an unknown printer took a galley of type and scrambled it to make a type specimen book. It
                            has survived not only five centuries, but also the leap into electronic typesetting,
                            remaining essentially unchanged. It was popularised in the 1960s with the release of
                            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                            software like Aldus PageMaker including versions of Lorem Ipsum.
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
                                        shortDescription="Lorem Ipsum is simply dummy text of the printing and typesetting industry "
                                        longDescription=" Long description. Lorem Ipsum is simply dummy text of the printing and typesetting. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when"
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
                            programName="House EQIP Projection"
                            statePerformance={statePerformance}
                            year="2024-2033"
                            stateCodes={metaData.stateCodesArray}
                            selectedPractices={selectedPractices}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={2} />
            </Grid>
        </Box>
    );
}
