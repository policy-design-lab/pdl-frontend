import { Box, Typography, Grid, CircularProgress, Link } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../../../app.config";
import { convertAllState, getJsonDataFromUrl } from "../../../utils/apiutil";
import { reconciliationMenu } from "./Menu";
import CountyCommodityMap from "../../../components/hModel/CountyCommodityMap";
import CountyCommodityTable from "../../../components/hModel/CountyCommodityTable";
import PolicyComparisonSection from "../../../components/hModel/PolicyComparisonSection";
import { HorizontalMenu } from "./HorizontalMenu";

export default function ReconciliationSubPage({
    v,
    index,
    subtab
}: {
    v: number;
    index: number;
    subtab?: string;
}): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [metaData, setMetaData] = useState({
        allStates: {},
        stateCodesData: {},
        stateCodesArray: [] as { code: string; name: string }[]
    });
    const [loadingStates, setLoadingStates] = useState({
        metadata: true,
        practices: true,
        performance: true
    });
    const [selectedItem, setSelectedItem] = useState("");
    const [hModelDistributionData, setHModelDistributionData] = useState({});
    const [hModelDistributionProposedData, setHModelDistributionProposedData] = useState({});
    const [hModelDataReady, setHModelDataReady] = useState(false);
    const [hModelLoading, setHModelLoading] = useState(false);
    const [menuSwitchLoading, setMenuSwitchLoading] = useState(false);
    const [availableCommodities, setAvailableCommodities] = useState<string[]>([]);
    const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [selectedCommodities, setSelectedCommodities] = useState<string[]>(["All Commodities"]);
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>(["All Programs"]);
    const [selectedState, setSelectedState] = useState("All States");
    const [viewMode, setViewMode] = useState("current");
    const [showMeanValues, setShowMeanValues] = useState(true);
    const [yearAggregation, setYearAggregation] = useState(0);
    const [aggregationEnabled, setAggregationEnabled] = useState(false);
    const [showReconciliationIntro, setShowReconciliationIntro] = useState(true);
    const [showARCPLCPayments, setShowARCPLCPayments] = useState(false);
    const initializedRef = React.useRef(false);

    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath === "/policy-lab/2025-reconciliation-farm-bill") {
            setShowReconciliationIntro(true);
            setShowARCPLCPayments(false);
            setSelectedItem("");
        } else if (currentPath.endsWith("/arc-plc-payments")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-0");
        } else if (currentPath.includes("/title-i") && !currentPath.endsWith("/title-i")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-0");
        } else if (currentPath.endsWith("/title-i")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-0");
        } else if (
            currentPath.startsWith("/policy-lab/2025-reconciliation-farm-bill") &&
            subtab === "arc-plc-payments"
        ) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-0");
        } else if (currentPath.startsWith("/policy-lab/2025-reconciliation-farm-bill") && subtab === "title-i") {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-0");
        } else {
            setShowReconciliationIntro(true);
            setShowARCPLCPayments(false);
            setSelectedItem("");
        }
    }, [subtab, location.pathname]);

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
                setLoadingStates((prev) => ({ ...prev, practices: false }));
                setLoadingStates((prev) => ({ ...prev, performance: false }));
                setHModelLoading(true);
                const hModelDistributionResponse = await getJsonDataFromUrl(
                    `${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/obbba`
                );
                setHModelDistributionData(hModelDistributionResponse);
                const emptyProposedData = {};
                Object.keys(hModelDistributionResponse).forEach((year) => {
                    emptyProposedData[year] = [];
                });
                setHModelDistributionProposedData(emptyProposedData);
                const years = Object.keys(hModelDistributionResponse).sort();
                setAvailableYears(years.length > 0 ? years : ["2025"]);
                setSelectedYear(years.length > 0 ? years[0] : "2025");
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
                setHModelLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoadingStates({ metadata: false, practices: false, performance: false });
                setHModelLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const [topIndex, midIndex] = selectedItem.split("-").map(Number);
        setShowReconciliationIntro(false);
        setShowARCPLCPayments(false);
        if (selectedItem === "") {
            setShowReconciliationIntro(true);
        } else if (topIndex === 0 && midIndex === 0) {
            setShowARCPLCPayments(true);
        }
    }, [selectedItem]);

    const handleMenuSelect = (value: string) => {
        const [topIndex, midIndex] = value.split("-").map(Number);

        if (topIndex === 0 && midIndex === 0 && !hModelDataReady) {
            setMenuSwitchLoading(true);
            setTimeout(() => setMenuSwitchLoading(false), 1500);
        } else if (topIndex === 0 && midIndex === 0) {
            setMenuSwitchLoading(true);
            setTimeout(() => setMenuSwitchLoading(false), 800);
        }

        setSelectedItem(value);

        if (topIndex === 0 && midIndex === 0) {
            navigate("/policy-lab/2025-reconciliation-farm-bill/title-i/arc-plc-payments");
        }
    };

    const handleMapUpdate = (year, commodities, programs, state, mode = "current") => {
        if (!initializedRef.current && availableYears.length > 0) {
            initializedRef.current = true;
            if (Array.isArray(year)) {
                setSelectedYears(year);
                setSelectedYear(year.length > 0 ? year[year.length - 1] : "");
            } else {
                setSelectedYear(year);
                setSelectedYears([year]);
            }
            setSelectedCommodities(commodities);
            setSelectedPrograms(programs);
            setSelectedState(state);
            setViewMode(mode);
            return;
        }
        const yearChanged = Array.isArray(year)
            ? JSON.stringify(year) !== JSON.stringify(selectedYears)
            : year !== selectedYear;
        const commoditiesChanged = JSON.stringify(commodities) !== JSON.stringify(selectedCommodities);
        const programsChanged = JSON.stringify(programs) !== JSON.stringify(selectedPrograms);
        const stateChanged = state !== selectedState;
        const modeChanged = mode !== viewMode;
        if (yearChanged || commoditiesChanged || programsChanged || stateChanged || modeChanged) {
            if (Array.isArray(year)) {
                setSelectedYears(year);
                setSelectedYear(year.length > 0 ? year[year.length - 1] : "");
            } else {
                setSelectedYear(year);
                setSelectedYears([year]);
            }
            if (commoditiesChanged) {
                setSelectedCommodities(commodities);
            }
            if (programsChanged) {
                setSelectedPrograms(programs);
            }
            if (stateChanged) {
                setSelectedState(state);
            }
            if (modeChanged) {
                setViewMode(mode);
            }
        }
    };
    const isLoading = Object.values(loadingStates).some((state) => state);
    const shouldShowLoading = () => {
        if (showReconciliationIntro) {
            return false;
        }
        if (showARCPLCPayments) {
            return isLoading || hModelLoading || !hModelDataReady || menuSwitchLoading;
        }
        return false;
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
                                        menu={reconciliationMenu}
                                        selectedItem={selectedItem}
                                        onMenuSelect={handleMenuSelect}
                                    />
                                </Box>
                                {showReconciliationIntro && (
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="h5" sx={{ mb: 3, color: "#2F7164", fontWeight: 600 }}>
                                            Introduction: 2025 Reconciliation/Farm Bill Analysis
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
                                                One goal of the Policy Design Lab is to provide useful visualizations of
                                                alternative policy designs, including proposals pending in Congress.
                                                Such visualizations are intended to advance understanding of policies
                                                and the impacts of different designs. The visualizations consist
                                                primarily of interactive maps built using complex modeling, a variety of
                                                data sources, and legislative textual analysis. Early developments will
                                                visualize the distribution of benefits, and changes in distribution,
                                                projected to result from changes in policy designs; later developments
                                                will build upon the distributional projections to include estimates of
                                                other outcomes, benefits, or impacts of policy designs, including the
                                                application of ecosystem or biophysical models and other science and
                                                research.
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 4, p: 3, backgroundColor: "white", borderRadius: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: "#2F7164" }}>
                                                The visualizations of policy designs are grouped relative to the timing
                                                and authorship of proposed changes to policies. Each visualization will
                                                include background information on the modeling and data, as well as
                                                links to more detailed explanations including doctorate dissertations or
                                                other academic outputs.
                                            </Typography>
                                            <Typography paragraph>
                                                Summary discussions and analysis using the work visualized will also be
                                                available on{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    farmdoc daily
                                                </a>
                                                .
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                {showARCPLCPayments && (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: "1.1rem",
                                            color: "#000000B2 !important",
                                            lineHeight: 1.5
                                        }}
                                    >
                                        Analysis of proposed changes to the Agriculture Risk Coverage (ARC) and Price
                                        Loss Coverage (PLC) programs under the 2025 reconciliation framework. The
                                        visualizations below show projected impacts on program payments, distribution
                                        patterns, and policy effectiveness across different regions and commodity types.
                                    </Typography>
                                )}
                            </Box>
                            {shouldShowLoading() ? (
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
                                    {showARCPLCPayments && (
                                        <>
                                            <Box
                                                sx={{
                                                    mb: 3
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        backgroundColor: "white",
                                                        borderRadius: 1,
                                                        px: 3,
                                                        pt: 3,
                                                        pb: 1
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: "1.5rem",
                                                            color: "#2F7164",
                                                            mb: 0,
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        Interactive Map & Data Analysis: Projected Payment Amounts and
                                                        Payment Rates (per base acre)
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.875rem",
                                                            color: "#666",
                                                            fontStyle: "italic",
                                                            mb: 1,
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        Use controls to filter data and interact with the map for
                                                        detailed county information
                                                    </Typography>
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
                                                        enableScenarioSwitching={false}
                                                        stateCodeToName={metaData.stateCodesArray.reduce(
                                                            (acc, curr) => {
                                                                acc[curr.code] = curr.name;
                                                                return acc;
                                                            },
                                                            {}
                                                        )}
                                                    />
                                                </Box>
                                                <Box
                                                    sx={{
                                                        backgroundColor: "white",
                                                        borderRadius: 1,
                                                        p: 3,
                                                        width: "100%",
                                                        borderTop: "1px solid #e0e0e0"
                                                    }}
                                                >
                                                    <CountyCommodityTable
                                                        countyData={hModelDistributionData}
                                                        countyDataProposed={hModelDistributionProposedData}
                                                        selectedYear={
                                                            aggregationEnabled && selectedYears.length > 1
                                                                ? selectedYears
                                                                : selectedYear
                                                        }
                                                        viewMode="current"
                                                        selectedCommodities={selectedCommodities}
                                                        selectedPrograms={selectedPrograms}
                                                        selectedState={selectedState}
                                                        stateCodesData={metaData.stateCodesData}
                                                        showMeanValues={showMeanValues}
                                                        yearAggregation={yearAggregation}
                                                        aggregationEnabled={aggregationEnabled}
                                                        enableScenarioSwitching={false}
                                                    />
                                                </Box>
                                            </Box>
                                            {hModelDataReady && Object.keys(hModelDistributionData).length > 0 && (
                                                <Box
                                                    sx={{
                                                        border: "2px solid rgba(47, 113, 100, 0.3)",
                                                        borderRadius: 2,
                                                        overflow: "visible"
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            backgroundColor: "white",
                                                            borderRadius: 1,
                                                            px: 3,
                                                            pt: 3,
                                                            pb: 1
                                                        }}
                                                    >
                                                        <PolicyComparisonSection
                                                            currentData={hModelDistributionData}
                                                            proposedData={hModelDistributionData}
                                                            title="Policy Analysis: OBBBA Scenario Budgetary Impacts"
                                                            subTitle="Projected Spending on a Fiscal Year Basis; 10-year Budget Window."
                                                            tooltip={
                                                                "Projected costs for the OBBBA scenario are produced on a federal fiscal year basis for 10 fiscal years. The information in this section is presented in a format relevant to CBO projections. \n\n Note: farm programs are designed by Congress to include a 'timing shift' for CBO purposes that push payments out a fiscal year; for example, payments for the 2025 crop year are made after October 1, 2026, which is fiscal year 2027. In the chart and table, the policy costs for crop years 2025 to 2034 are projected for fiscal years 2027 to 2036."
                                                            }
                                                            enableScenarioSwitching={false}
                                                        />
                                                    </Box>
                                                </Box>
                                            )}
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
