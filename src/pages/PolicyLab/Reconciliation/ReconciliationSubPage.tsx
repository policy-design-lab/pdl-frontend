import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../../../app.config";
import { convertAllState, getJsonDataFromUrl } from "../../../utils/apiutil";
import { reconciliationMenu } from "./Menu";
import CountyCommodityMap from "../../../components/ProposalAnalysis/CountyCommodityMap";
import CountyCommodityTable from "../../../components/ProposalAnalysis/CountyCommodityTable";
import PolicyComparisonSection from "../../../components/ProposalAnalysis/PolicyComparisonSection";
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
    const [hModelBaselineData, setHModelBaselineData] = useState({});
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
            setSelectedItem("0-0");
        } else if (currentPath.endsWith("/arc-plc-payments")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-1");
        } else if (currentPath.includes("/title-i") && !currentPath.endsWith("/title-i")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-1");
        } else if (currentPath.endsWith("/title-i")) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-1");
        } else if (
            currentPath.startsWith("/policy-lab/2025-reconciliation-farm-bill") &&
            subtab === "arc-plc-payments"
        ) {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-1");
        } else if (currentPath.startsWith("/policy-lab/2025-reconciliation-farm-bill") && subtab === "title-i") {
            setShowReconciliationIntro(false);
            setShowARCPLCPayments(true);
            setSelectedItem("0-1");
        } else {
            setShowReconciliationIntro(true);
            setShowARCPLCPayments(false);
            setSelectedItem("0-0");
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
                const [hModelDistributionResponse, hModelBaselineResponse] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/obbba`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-i/subtitles/subtitle-a/arc-plc-payments/baseline`)
                ]);
                setHModelDistributionData(hModelDistributionResponse);
                setHModelBaselineData(hModelBaselineResponse);
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
            setShowReconciliationIntro(true);
        } else if (topIndex === 0 && midIndex === 1) {
            setShowARCPLCPayments(true);
        }
    }, [selectedItem]);

    const handleMenuSelect = (value: string) => {
        const [topIndex, midIndex] = value.split("-").map(Number);
        if (topIndex === 0 && midIndex === 1 && !hModelDataReady) {
            setMenuSwitchLoading(true);
            setTimeout(() => setMenuSwitchLoading(false), 1500);
        } else if (topIndex === 0 && midIndex === 1) {
            setMenuSwitchLoading(true);
            setTimeout(() => setMenuSwitchLoading(false), 800);
        }
        setSelectedItem(value);
        if (topIndex === 0 && midIndex === 1) {
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
                                            Introduction: 2025 Reconciliation Farm Bill Analysis
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
                                                Congress reauthorized the major mandatory programs of the Farm Bill in
                                                the budget reconciliation legislation enacted into law on July 4, 2025
                                                (P.L.{" "}
                                                <a
                                                    href="https://www.congress.gov/bill/119th-congress/house-bill/1/text"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    119-21
                                                </a>
                                                ). The reauthorizations also included significant revisions to the
                                                programs and work by the Policy Design Lab will visualize the revised
                                                policy designs, available in this tab when completed. The visualizations
                                                are intended to advance understanding of the policies and the impacts of
                                                the revisions to them with interactive resources projecting benefit
                                                distributions and other estimated outcomes or impacts. Visualizations
                                                consist primarily of interactive maps built using complex modeling, a
                                                variety of data sources, and legislative textual analysis. The maps are
                                                accompanied by charts and data tables, which are downloadable for
                                                further analysis.
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 4, p: 3, backgroundColor: "white", borderRadius: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 2, color: "#2F7164" }}>
                                                The visualizations of revised policy designs are grouped by traditional
                                                Farm Bill titles: Title I, commodities subsidies; Title II,
                                                conservation; Crop Insurance; and Supplemental Nutrition Assistance
                                                Program (SNAP).
                                            </Typography>
                                            <Typography paragraph>
                                                Visualizations include relevant background information and other
                                                explanations, as well as links to more detailed explanations and summary
                                                discussions on{" "}
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
                                        Analysis on this page contains model projections of the revisions in the design
                                        of the Agriculture Risk Coverage (ARC) and Price Loss Coverage (PLC) programs as
                                        authorized through 2031. The visualized analysis includes distribution of
                                        program payment rates and total payments for the ten-year window generally used
                                        in policy discussions. Users can select either program, individual crops, and
                                        States, as well as download the data in CSV format. The visualization begins
                                        with the total weighted average payment rates per base acre at the county level,
                                        for all ten years and all major program crops: corn, soybeans, wheat, seed
                                        cotton, sorghum, rice, and peanuts. Users can change the visualization to total
                                        payments per county.
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
                                                        Interactive Map & Data of Policy Design Analysis:
                                                        <br />
                                                        Projected Payment Rates (per base acre) and Total Payments;
                                                        County Level
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
                                                        The visualizations are an application of research, policy
                                                        analysis, and a model developed by Henrique Monaco, a PhD
                                                        candidate at the University of Illinois at Urbana-Champaign.
                                                        <br />
                                                        Upon publication, the dissertation and other information will be
                                                        available here.
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
                                                        currentPolicyTitle="Reconciliation Farm Bill"
                                                        proposedPolicyTitle="Reconciliation Farm Bill"
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
                                                        currentScenarioName="Proposed"
                                                        proposedScenarioName="Proposed"
                                                        currentPolicyTitle="Reconciliation Farm Bill"
                                                        proposedPolicyTitle="Reconciliation Farm Bill"
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
                                                            currentData={hModelBaselineData}
                                                            proposedData={hModelDistributionData}
                                                            title="Policy Analysis: Reconciliation Farm Bill Scenario Budgetary Impacts"
                                                            chartTitle="Total Projected Outlays by Commodity: Total for 10 Fiscal Years"
                                                            subTitle="Projected Spending on a Fiscal Year Basis; 10-year Budget Window."
                                                            tooltip={
                                                                "Projected costs for the Reconciliation Farm Bill scenario are produced on a federal fiscal year basis for 10 fiscal years. The information in this section is presented in a format relevant to CBO projections. \n\n Note: farm programs are designed by Congress to include a 'timing shift' for CBO purposes that push payments out a fiscal year; for example, payments for the 2025 crop year are made after October 1, 2026, which is fiscal year 2027. In the chart and table, the policy costs for crop years 2025 to 2034 are projected for fiscal years 2027 to 2036."
                                                            }
                                                            enableScenarioSwitching={false}
                                                            currentLabel="Baseline"
                                                            proposedLabel="Reconciliation Farm Bill"
                                                            chartCurrentLabel="B"
                                                            chartProposedLabel="R"
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
