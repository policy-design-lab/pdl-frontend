import { Box, Typography, Grid, CircularProgress, Link } from "@mui/material";
import React, { useState, useEffect } from "react";
import { config } from "../../../app.config";
import HouseOutlayMap from "../../../components/policylab/HouseOutlayMap";
import { convertAllState, getJsonDataFromUrl } from "../../../utils/apiutil";
import { houseProjectionMenu } from "./Menu";
import HouseOutlayTable from "../../../components/policylab/HouseOutlayTable";
import CountyCommodityMap from "../../../components/hModel/CountyCommodityMap";
import CountyCommodityTable from "../../../components/hModel/CountyCommodityTable";
import { HorizontalMenu } from "./HorizontalMenu";

export default function HouseProjectionSubPageProps({ v, index }: { v: number; index: number }): JSX.Element {
    const [statePerformance, setStatePerformance] = useState({});
    const [practiceNames, setPracticeNames] = useState({});
    const [metaData, setMetaData] = useState({
        allStates: {},
        stateCodesData: {},
        stateCodesArray: []
    });
    const [loadingStates, setLoadingStates] = useState({
        metadata: true,
        practices: true,
        performance: true
    });
    const [selectedItem, setSelectedItem] = useState("0-0");
    const [selectedPractices, setSelectedPractices] = useState(["All Practices"]);

    const [hModelDistributionData, setHModelDistributionData] = useState({});
    const [hModelDistributionProposedData, setHModelDistributionProposedData] = useState({});
    const [hModelDataReady, setHModelDataReady] = useState(false);
    const [availableCommodities, setAvailableCommodities] = useState<string[]>([]);
    const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedCommodities, setSelectedCommodities] = useState<string[]>(["All Commodities"]);
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>(["All Programs"]);
    const [selectedState, setSelectedState] = useState("All States");
    const [viewMode, setViewMode] = useState("current");

    const [showMeanValues, setShowMeanValues] = useState(false);
    const [yearAggregation, setYearAggregation] = useState(0);
    const [aggregationEnabled, setAggregationEnabled] = useState(false);

    const [showEQIPProjection, setShowEQIPProjection] = useState(false);
    const [showARCPLCPayments, setShowARCPLCPayments] = useState(false);
    const [showHouseAgCommittee, setShowHouseAgCommittee] = useState(true);

    const handlePracticeChange = (practices) => {
        setSelectedPractices(practices);
    };

    useEffect(() => {
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

                const [hModelDistributionResponse, hModelDistributionProposedResponse] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/current`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/proposed`)
                ]);

                setHModelDistributionData(hModelDistributionResponse);
                setHModelDistributionProposedData(hModelDistributionProposedResponse);

                const years = Object.keys(hModelDistributionResponse).sort();
                setAvailableYears(years.length > 0 ? years : ["2024"]);
                setSelectedYear(years.length > 0 ? years[0] : "2024");

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
                setHModelDataReady(true);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoadingStates({ metadata: false, practices: false, performance: false });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const [topIndex, midIndex] = selectedItem.split("-").map(Number);
        setShowHouseAgCommittee(false);
        setShowEQIPProjection(false);
        setShowARCPLCPayments(false);
        if (topIndex === 0 && selectedItem === "0-0") {
            setShowHouseAgCommittee(true);
        } else if (topIndex === 1 && midIndex === 0) {
            setShowEQIPProjection(true);
        } else if (topIndex === 1 && midIndex === 1) {
            setShowARCPLCPayments(true);
        }
    }, [selectedItem]);

    const handleMenuSelect = (value: string) => {
        setSelectedItem(value);
    };

    const handleMapUpdate = (year, commodities, programs, state, mode) => {
        setSelectedYear(year);
        setSelectedCommodities(commodities);
        setSelectedPrograms(programs);
        setSelectedState(state);
        setViewMode(mode);
    };

    const isLoading = Object.values(loadingStates).some((state) => state);

    const getDescriptionContent = (description: string, author: string, link: string) => {
        return (
            <>
                {description}
                <br />
                Details of model can by found by{" "}
                <Link href={link} target="_blank" rel="noopener" style={{ color: "#2F7164" }}>
                    Link
                </Link>
                , authored by {author}.
            </>
        );
    };

    return (
        <Box sx={{ width: "100%" }}>
            {v === index && (
                <Box>
                    <Grid container spacing={2} sx={{ my: 4.5 }}>
                        <Grid item xs={12} md={1} />
                        <Grid item xs={12} md={10}>
                            <Box
                                sx={{
                                    backgroundColor: "#ECF0EE",
                                    borderRadius: 1,
                                    mb: 4,
                                    px: 3,
                                    py: 2,
                                    color: "#000000B2"
                                }}
                            >
                                <Box sx={{ mb: 2 }}>
                                    <HorizontalMenu
                                        menu={houseProjectionMenu}
                                        selectedItem={selectedItem}
                                        onMenuSelect={handleMenuSelect}
                                    />
                                </Box>

                                {showHouseAgCommittee && (
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="h5" sx={{ mb: 3, color: "#2F7164", fontWeight: 600 }}>
                                            Overall Introduction Section
                                        </Typography>
                                        <Box
                                            sx={{
                                                backgroundColor: "#2F7164",
                                                color: "white",
                                                borderRadius: 1,
                                                mb: 2,
                                                p: 3
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "1.125rem" }}>
                                                In this space, a variety of policy design proposals will be evaluated
                                                and analyzed. Some analysis is of existing or previous bills in
                                                Congress, as well as modifications or alternatives to proposed or
                                                existing policies. Overall, the goal is to provide a space for policy
                                                design analysis to further creativity and innovation. Interactive maps
                                                and other visualizations accompany the various proposals, providing
                                                analysis and perspectives on policy design.
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 4, p: 3, backgroundColor: "white", borderRadius: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: "#2F7164" }}>
                                                What we can put here?
                                            </Typography>
                                            <Typography paragraph>
                                                A description of every model: Yifan's model, Henrique's model, Tosh's
                                                Model, etc
                                            </Typography>
                                            <Typography paragraph>
                                                Or description of each year's proposal, depends on the content of the
                                                submenu
                                            </Typography>
                                            <Typography paragraph>Or anything else.</Typography>
                                        </Box>
                                    </Box>
                                )}

                                {(showEQIPProjection || showARCPLCPayments) && (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: "1.1rem",
                                            color: "#000000B2 !important",
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {getDescriptionContent(
                                            showEQIPProjection
                                                ? "The following visualizations provide projections and analysis of the proposal in the House Ag Committee's 2024 Farm Bill to rescind Inflation Reduction Act appropriations and reinvest a portion of them in Farm Bill conservation baseline."
                                                : "The following visualizations provide analysis of ARC-PLC County Payments comparing current policy to proposed 2025 Farm Bill changes.",
                                            showEQIPProjection ? "A" : "B",
                                            showEQIPProjection
                                                ? "https://www.congress.gov/119/bills/hconres10/BILLS-119hconres10enr.htm"
                                                : "https://www.congress.gov/119/bills/hconres10/BILLS-119hconres10enr.htm"
                                        )}
                                    </Typography>
                                )}
                            </Box>

                            {isLoading || (showARCPLCPayments && !hModelDataReady) ? (
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
                                <Box sx={{ position: "relative", zIndex: 1000 }}>
                                    {showEQIPProjection && (
                                        <>
                                            <Box
                                                sx={{
                                                    backgroundColor: "white",
                                                    borderRadius: 1,
                                                    p: 3,
                                                    mb: 3
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
                                                    year={
                                                        Object.keys(statePerformance)[0]
                                                            ? Object.keys(statePerformance)[0]
                                                            : "2025-2033"
                                                    }
                                                    stateCodes={metaData.stateCodesArray}
                                                    selectedPractices={selectedPractices}
                                                />
                                            </Box>
                                        </>
                                    )}

                                    {showARCPLCPayments && (
                                        <>
                                            <Box
                                                sx={{
                                                    backgroundColor: "white",
                                                    borderRadius: 1,
                                                    mb: 3
                                                }}
                                            >
                                                <CountyCommodityMap
                                                    countyData={hModelDistributionData}
                                                    countyDataProposed={hModelDistributionProposedData}
                                                    stateCodesData={metaData.stateCodesData}
                                                    allStates={metaData.allStates}
                                                    availableCommodities={availableCommodities}
                                                    availablePrograms={availablePrograms}
                                                    availableYears={availableYears}
                                                    isLoading={!hModelDataReady}
                                                    onMapUpdate={handleMapUpdate}
                                                    showMeanValues={showMeanValues}
                                                    setShowMeanValues={setShowMeanValues}
                                                    yearAggregation={yearAggregation}
                                                    setYearAggregation={setYearAggregation}
                                                    aggregationEnabled={aggregationEnabled}
                                                    setAggregationEnabled={setAggregationEnabled}
                                                    // transfer stateCodesArray like [{
                                                    // "code": "AL",
                                                    // "name": "Alabama"
                                                    // },... to something like {"AL": "Alabama", "AK": "Alaska", ...}
                                                    stateCodeToName={metaData.stateCodesArray.reduce((acc, curr) => {
                                                        acc[curr.code] = curr.name;
                                                        return acc;
                                                    }, {})}
                                                />
                                            </Box>
                                            <Box
                                                sx={{
                                                    backgroundColor: "white",
                                                    borderRadius: 1,
                                                    p: 3,
                                                    width: "100%"
                                                }}
                                            >
                                                <CountyCommodityTable
                                                    countyData={hModelDistributionData}
                                                    countyDataProposed={hModelDistributionProposedData}
                                                    selectedYear={selectedYear}
                                                    viewMode={viewMode}
                                                    selectedCommodities={selectedCommodities}
                                                    selectedPrograms={selectedPrograms}
                                                    selectedState={selectedState}
                                                    stateCodesData={metaData.stateCodesData}
                                                    showMeanValues={showMeanValues}
                                                    yearAggregation={yearAggregation}
                                                    aggregationEnabled={aggregationEnabled}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} md={1} />
                    </Grid>
                </Box>
            )}
        </Box>
    );
}
