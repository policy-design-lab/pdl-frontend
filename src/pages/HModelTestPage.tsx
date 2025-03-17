import * as React from "react";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import "../styles/issueWhitePaper.css";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import CountyCommodityMap from "../components/hModel/CountyCommodityMap";

export default function HModelTestPage(): JSX.Element {
    const [hModelDistributionData, setHModelDistributionData] = React.useState({});
    const [hModelDistributionProposedData, setHModelDistributionProposedData] = React.useState({});
    const [isDataReady, setIsDataReady] = React.useState(false);
    const [availableCommodities, setAvailableCommodities] = React.useState<string[]>([]);
    const [availablePrograms, setAvailablePrograms] = React.useState<string[]>([]);
    const [availableYears, setAvailableYears] = React.useState<string[]>([]);
    const [allStates, setAllStates] = React.useState([]);
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState<{ code: string; name: string }[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    hModelDistributionResponse,
                    hModelDistributionProposedResponse,
                    allStatesResponse,
                    stateCodesResponse
                ] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/current`),
                    getJsonDataFromUrl(
                        `${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/proposed`
                    ),
                    getJsonDataFromUrl(`${config.apiUrl}/states`),
                    getJsonDataFromUrl(`${config.apiUrl}/statecodes`)
                ]);
                setHModelDistributionData(hModelDistributionResponse);
                setHModelDistributionProposedData(hModelDistributionProposedResponse);
                setAllStates(allStatesResponse);
                setStateCodesArray(stateCodesResponse);
                const convertedStateCodes = convertAllState(stateCodesResponse);
                setStateCodesData(convertedStateCodes);
                const years = Object.keys(hModelDistributionResponse).sort();
                setAvailableYears(years.length > 0 ? years : ["2024"]);
                const commoditiesSet = new Set<string>();
                const programsSet = new Set<string>();
                if (years.length > 0) {
                    const firstYearData = hModelDistributionResponse[years[0]] || [];

                    firstYearData.forEach((state) => {
                        state.counties.forEach((county) => {
                            county.scenarios.forEach((scenario) => {
                                scenario.commodities.forEach((commodity) => {
                                    commoditiesSet.add(commodity.commodityName);

                                    commodity.programs.forEach((program) => {
                                        programsSet.add(program.programName);
                                    });
                                });
                            });
                        });
                    });
                }
                setAvailableCommodities(Array.from(commoditiesSet).sort());
                setAvailablePrograms(Array.from(programsSet).sort());
                setIsDataReady(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="#2F7164" ftColor="#FFFFFF" logo="dark" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <Box sx={{ width: "100%", mt: 10 }}>
                <Grid container>
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
                                ARC-PLC County Payments Visualization
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                borderRadius: 1,
                                p: 3,
                                mt: 3
                            }}
                        >
                            {isDataReady ? (
                                <CountyCommodityMap
                                    countyData={hModelDistributionData}
                                    countyDataProposed={hModelDistributionProposedData}
                                    stateCodesData={stateCodesData}
                                    allStates={allStates}
                                    availableCommodities={availableCommodities}
                                    availablePrograms={availablePrograms}
                                    availableYears={availableYears}
                                    isLoading={!isDataReady}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        minHeight: "400px"
                                    }}
                                >
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>Loading commodity data...</Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={1} />
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2} sx={{ backgroundColor: "#ECF0EE", mt: 0.01 }}>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            textAlign: "center",
                            py: "1rem"
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", px: 3, py: 0.5, color: "#2F7164" }}>
                            Related Paper:
                        </Typography>

                        <Typography sx={{ fontWeight: 400, fontSize: "1.125rem", color: "#333333" }}>
                            <a href="#" target="blank" style={{ color: "#333333" }}>
                                Paper Name
                            </a>{" "}
                            By Author
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
