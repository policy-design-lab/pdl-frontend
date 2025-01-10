import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import * as React from "react";
import { config } from "../../app.config";
import HouseOutlayMap from "../../components/policylab/HouseOutlayMap";
import { convertAllState, getJsonDataFromUrl } from "../../utils/apiutil";

export default function HouseProjectionSubPage({
    styleClass,
    v,
    index
}: {
    styleClass: any;
    v: any;
    index: any;
}): JSX.Element {
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
    const isLoading = Object.values(loadingStates).some((state) => state);
    return (
        <Box role="tabpanel" hidden={v !== index && !isLoading}>
            <Box>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: "#242424",
                        mt: 4.5,
                        textAlign: "center"
                    }}
                >
                    House Outlay Projection
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
                    Some description
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
                        <Typography sx={{ fontWeight: 500, fontSize: "1.25rem", px: 3, py: 0.5 }}>A title</Typography>
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry &apos; s standard dummy text ever since the 1500s, when an unknown printer
                            took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially
                            unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
                            Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
                            PageMaker including versions of Lorem Ipsum.
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
                        {isLoading ? (
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    py: 4
                                }}
                            >
                                <CircularProgress sx={{ mb: 2 }} />
                                <Typography>
                                    {" "}
                                    {(() => {
                                        if (loadingStates.metadata) return "Loading basic data...";
                                        if (loadingStates.practices) return "Loading practice information...";
                                        return "Loading performance data...";
                                    })()}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ width: "100%" }}>
                                {" "}
                                <HouseOutlayMap
                                    practiceNames={practiceNames}
                                    initialStatePerformance={statePerformance}
                                    allStates={metaData.allStates}
                                    stateCodes={metaData.stateCodesData}
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid xs={12} md={8}>
                        <div className={styleClass.iframeContainer} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
