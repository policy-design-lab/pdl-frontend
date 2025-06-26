import { Box, Typography, Grid, CircularProgress, Link } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../../../app.config";
import HouseOutlayMap from "../../../components/policylab/HouseOutlayMap";
import { convertAllState, getJsonDataFromUrl } from "../../../utils/apiutil";
import { houseProjectionMenu } from "./Menu";
import HouseOutlayTable from "../../../components/policylab/HouseOutlayTable";
import CountyCommodityMap from "../../../components/hModel/CountyCommodityMap";
import CountyCommodityTable from "../../../components/hModel/CountyCommodityTable";
import PolicyComparisonSection from "../../../components/hModel/PolicyComparisonSection";
import { HorizontalMenu } from "./HorizontalMenu";

export default function HouseProjectionSubPageProps({
    v,
    index,
    subtab
}: {
    v: number;
    index: number;
    subtab?: string;
}): JSX.Element {
    const navigate = useNavigate();
    const [statePerformance, setStatePerformance] = useState({});
    const [practiceNames, setPracticeNames] = useState({});
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
    const [selectedItem, setSelectedItem] = useState("0-0");
    const [selectedPractices, setSelectedPractices] = useState(["All Practices"]);
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
    const [showMeanValues, setShowMeanValues] = useState(false);
    const [yearAggregation, setYearAggregation] = useState(0);
    const [aggregationEnabled, setAggregationEnabled] = useState(false);
    const [showEQIPProjection, setShowEQIPProjection] = useState(false);
    const [showARCPLCPayments, setShowARCPLCPayments] = useState(false);
    const [showHouseAgCommittee, setShowHouseAgCommittee] = useState(true);
    const initializedRef = React.useRef(false);
    const handlePracticeChange = (practices) => {
        setSelectedPractices(practices);
    };

    useEffect(() => {
        if (subtab === "eqip-projection") {
            setSelectedItem("0-1");
        } else if (subtab === "arc-plc-payments") {
            setSelectedItem("0-0");
        } else if (!subtab) {
            setSelectedItem("");
        }
    }, [subtab]);

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
                setHModelLoading(true);
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
        setShowHouseAgCommittee(false);
        setShowEQIPProjection(false);
        setShowARCPLCPayments(false);
        if (selectedItem === "") {
            setShowHouseAgCommittee(true);
        } else if (topIndex === 0 && midIndex === 0) {
            setShowARCPLCPayments(true);
        } else if (topIndex === 0 && midIndex === 1) {
            setShowEQIPProjection(true);
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
            navigate("/policy-lab/proposal-analysis/arc-plc-payments");
        } else if (topIndex === 0 && midIndex === 1) {
            navigate("/policy-lab/proposal-analysis/eqip-projection");
        }
    };

    const handleMapUpdate = (year, commodities, programs, state, mode) => {
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
        if (showHouseAgCommittee) {
            return false;
        }
        if (showEQIPProjection) {
            return isLoading;
        }
        if (showARCPLCPayments) {
            return isLoading || hModelLoading || !hModelDataReady || menuSwitchLoading;
        }
        return false;
    };
    const getDescriptionContent = (description: string, author?: string, link?: string) => {
        return (
            <>
                {description}
                <br />
                {link && author && (
                    <>
                        Details of model can by found by{" "}
                        <Link href={link} target="_blank" rel="noopener" style={{ color: "#2F7164" }}>
                            Link
                        </Link>
                        , authored by {author}.
                    </>
                )}
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
                                            Introduction: Proposal Analysis
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
                                            <Typography paragraph>
                                                Projected impacts of proposals can be compared to existing benefit
                                                allocations visualized on{" "}
                                                <a
                                                    href="https://policydesignlab.ncsa.illinois.edu/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    this website
                                                </a>
                                                .
                                            </Typography>
                                            <Typography paragraph>
                                                Additional resources on projected costs of policies are available from
                                                the{" "}
                                                <a
                                                    href="https://www.cbo.gov/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Congressional Budget Office
                                                </a>
                                                .
                                            </Typography>
                                            <Typography paragraph>
                                                Information about, and analysis of, legislative proposals, statutes, and
                                                Congressional debates are available from the Congressional Research
                                                Service:{" "}
                                                <a
                                                    href="https://www.congress.gov/crs-products"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Congressional Research Service
                                                </a>
                                                .
                                            </Typography>
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
                                        {showEQIPProjection ? (
                                            <>
                                                In 2024, the House Agriculture Committee considered and reported
                                                legislation to reauthorize the programs and policies in the Farm Bill.
                                                Included in that legislation were provisions to rescind the $18 billion
                                                appropriation for conservation programs Congress made in the Inflation
                                                Reduction Act of 2022, using the savings to partially offset an increase
                                                in the mandatory authorizations for the conservation programs. The
                                                visualizations below project the changes in funding allocated to each
                                                State through the Environmental Quality Incentives Program (EQIP). The
                                                projections are based on an analysis of the allocation of EQIP Farm Bill
                                                funding in recent fiscal years by practice and State. Further discussion
                                                of the proposed changes were previously reviewed on farmdoc daily:{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2024/08/policy-design-case-study-eqip-and-the-inflation-reduction-act.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    August 1, 2024
                                                </a>
                                                ;{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2024/08/back-to-policy-design-the-inflation-reduction-acts-conservation-assistance.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    August 29, 2024
                                                </a>
                                                ;{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2024/10/conservation-tradeoff-eqip-in-the-inflation-reduction-act-and-the-house-farm-bill.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    October 10, 2024
                                                </a>
                                                ;{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2024/11/taking-a-closer-look-at-the-conservation-tradeoff-issues.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    November 7, 2024
                                                </a>
                                                .
                                            </>
                                        ) : (
                                            <>
                                                In 2025, the House Agriculture Committee reported legislation for the
                                                budget reconciliation effort that reauthorized and revised many of the
                                                programs and policies traditionally reauthorized in the Farm Bill.
                                                Included in that legislation were modifications to the policy design for
                                                the Price Loss Coverage (PLC) and Agriculture Risk Coverage, county
                                                option (ARC-CO) farm payment programs. Total payments and payment rates
                                                (per base acre) are visualized below in aggregate or by county, program,
                                                program crop, and crop year. The visualizations are an application of
                                                research, policy analysis, and a model developed by{" "}
                                                <strong>Henrique Monaco</strong>, a PhD candidate at the University of
                                                Illinois at Urbana-Champaign. Upon publication, the dissertation and
                                                other information will be available here. Discussions of the House
                                                proposal are also available on farmdoc daily:{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2025/05/reviewing-the-house-agriculture-committees-reconciliation-bill.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    May 14, 2025
                                                </a>
                                                ;{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2025/05/spending-impacts-of-plc-and-arc-co-in-house-agriculture-reconciliation-bill.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    May 20, 2025
                                                </a>
                                                ;{" "}
                                                <a
                                                    href="https://farmdocdaily.illinois.edu/2025/05/reviewing-the-cbo-score-of-the-house-reconciliation-bill.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#2F7164" }}
                                                >
                                                    May 22, 2025
                                                </a>
                                                .
                                            </>
                                        )}
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
                                            </Box>
                                            {hModelDataReady &&
                                                Object.keys(hModelDistributionData).length > 0 &&
                                                Object.keys(hModelDistributionProposedData).length > 0 && (
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
                                                                proposedData={hModelDistributionProposedData}
                                                                title="Policy Analysis: Budgetary Impacts of Proposed Changes in Policy Design"
                                                                subTitle="Projected Changes in Spending on a Fiscal Year Basis; 10-year Budget Window."
                                                                tooltip={
                                                                    "Projected costs and changes in spending resulting from changes in policy design are produced by the Congressional Budget Office on a federal fiscal year basis for 10 fiscal years. The information in this section is presented in a format relevant to CBO projections. \n\n Note: farm programs are designed by Congress to include a 'timing shift' for CBO purposes that push payments out a fiscal year; for example, payments for the 2025 crop year are made after October 1, 2026, which is fiscal year 2027. In the chart and table, the policy costs for crop years 2025 to 2034 are projected for fiscal years 2027 to 2036."
                                                                }
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
