import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/shared/titleii/TitleIIPracticeTable";
import CategoryTable from "../components/eqip/CategoryTable";
import CategoryMap from "../components/eqip/CategoryMap";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";
import { PracticeName } from "../components/shared/titleii/Interface";
import TitleIIPracticeMap from "../components/shared/titleii/TitleIIPracticeMap";
import MapTableWithLevelSwitch from "../components/shared/MapTableWithLevelSwitch";
import EQIPCountyMap from "../components/eqip/EQIPCountyMap";
import EQIPCountyTable from "../components/eqip/EQIPCountyTable";
import { EQIP_CATEGORIES, EQIP_TOTAL_CATEGORY, formatPracticeSelection } from "../components/eqip/EQIPCategoryMethods";
import FullPageLoadingOverlay from "../components/shared/FullPageLoadingOverlay";
import PracticeSelector from "../components/shared/titleii/PracticeSelector";
import { getPracticeCategories } from "../components/shared/titleii/PracticeMethods";
import useEQIPCountyPractices from "../components/eqip/useEQIPCountyPractices";
import { BRAND_GREEN, WHITE } from "../components/shared/colors";

export default function EQIPPage(): JSX.Element {
    const [checked, setChecked] = React.useState(0);

    const defaultTheme = createTheme();
    let structuralTotal = 0;
    let landManagementTotal = 0;
    let vegetativeTotal = 0;
    let forestManagementTotal = 0;
    let soilRemediationTotal = 0;
    let other6ATotal = 0;
    let soilTestingTotal = 0;
    let otherPlanningTotal = 0;
    let conservationPlanningAssessmentTotal = 0;
    let comprehensiveNutrientMgtTotal = 0;
    let resourceConservingCropRotationTotal = 0;
    let soilHealthTotal = 0;
    const zeroCategory: string[] = [];

    const [statePerformance, setStatePerformance] = React.useState({});
    const [allStates, setAllStates] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState<{ code: string; name: string }[]>([]);
    const [totalChartData, setTotalChartData] = React.useState([{}]);
    const [sixAChartData, setSixAChartData] = React.useState([{}]);
    const [sixBChartData, setSixBChartData] = React.useState([{}]);
    const [aTotal, setATotal] = React.useState(0);
    const [bTotal, setBTotal] = React.useState(0);
    const [zeroCategories, setZeroCategories] = React.useState<string[]>([]);
    const [isDataReady, setIsDataReady] = React.useState(false);

    const [selectedPractices, setSelectedPractices] = React.useState<string[]>(["All Practices"]);
    const [eqipPracticeNames, setEqipPracticeNames] = React.useState<PracticeName[]>([]);
    const handlePracticeChange = (practices: string[]) => {
        setSelectedPractices(practices);
    };
    const eqip_year = "2014-2023";

    const [level, setLevel] = React.useState<"state" | "county">("state");
    const [selectedCountyState, setSelectedCountyState] = React.useState("All States");
    const {
        selectedPractices: selectedCountyPractices,
        setSelectedPractices: setSelectedCountyPractices,
        countyData: countyDistributionData,
        isLoading: countyDataLoading,
        hasLoaded: countyDataLoaded,
        requestCountyData: fetchCountyData
    } = useEQIPCountyPractices(`eqip_countyData_${eqip_year}::`);

    const countyPracticeOptions = React.useMemo(
        () => getPracticeCategories(eqipPracticeNames[eqip_year]),
        [eqipPracticeNames]
    );

    const renderCategorySection = (category: string, index: number) => {
        const isTotal = category === EQIP_TOTAL_CATEGORY;
        return (
            <Box
                key={category}
                component="div"
                sx={{ width: "100%", m: "auto", display: checked !== index ? "none" : "block" }}
            >
                <MapTableWithLevelSwitch
                    stateMapComponent={
                        isTotal ? (
                            <TitleIIPracticeMap
                                programName="EQIP"
                                initialStatePerformance={statePerformance}
                                allStates={allStates}
                                year={eqip_year}
                                stateCodes={stateCodesData}
                                practiceNames={eqipPracticeNames[eqip_year]}
                                onPracticeChange={handlePracticeChange}
                            />
                        ) : (
                            <CategoryMap
                                category={category}
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={eqip_year}
                                stateCodes={stateCodesData}
                            />
                        )
                    }
                    countyMapComponent={
                        <EQIPCountyMap
                            category={category}
                            year={eqip_year}
                            countyData={countyDistributionData}
                            stateCodes={stateCodesData}
                            allStates={Array.isArray(allStates) ? allStates : []}
                            selectedState={selectedCountyState}
                            onStateChange={setSelectedCountyState}
                            selectedPractices={isTotal ? selectedCountyPractices : []}
                            controlsComponent={
                                isTotal ? (
                                    <PracticeSelector
                                        practices={countyPracticeOptions}
                                        selected={selectedCountyPractices}
                                        onChange={setSelectedCountyPractices}
                                        disabled={countyDataLoading}
                                    />
                                ) : null
                            }
                        />
                    }
                    stateContentComponent={null}
                    countyTableComponent={
                        <EQIPCountyTable
                            category={category}
                            tableTitle={`${isTotal ? "Total EQIP" : category} Benefits by County (${eqip_year})${
                                isTotal && formatPracticeSelection(selectedCountyPractices)
                                    ? ` - ${formatPracticeSelection(selectedCountyPractices)}`
                                    : ""
                            }`}
                            stateCodes={stateCodesData}
                            countyData={countyDistributionData}
                            year={eqip_year}
                            selectedState={selectedCountyState}
                            onStateChange={setSelectedCountyState}
                            selectedPractices={isTotal ? selectedCountyPractices : []}
                        />
                    }
                    countyDataLoading={countyDataLoading}
                    onCountyDataRequest={fetchCountyData}
                    hasCountyData={countyDataLoaded}
                    level={level}
                    onLevelChange={setLevel}
                    mapAreaWidth="100%"
                />
            </Box>
        );
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    statePerformanceResponse,
                    allStatesResponse,
                    stateCodesResponse,
                    chartDataResponse,
                    eqipPracticeNameResponse
                ] = await Promise.all([
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip/state-distribution`),
                    getJsonDataFromUrl(`${config.apiUrl}/states`),
                    getJsonDataFromUrl(`${config.apiUrl}/statecodes`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip/summary`),
                    getJsonDataFromUrl(`${config.apiUrl}/titles/title-ii/programs/eqip/practice-names`)
                ]);
                setStatePerformance(statePerformanceResponse);
                setAllStates(allStatesResponse);
                setStateCodesArray(stateCodesResponse);
                const converted_json = convertAllState(stateCodesResponse);
                setStateCodesData(converted_json);
                processData(chartDataResponse);
                setEqipPracticeNames(eqipPracticeNameResponse);
                setIsDataReady(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const processData = (chartData) => {
        if (chartData.statutes === undefined) return;

        const cur1 = chartData.statutes.find((s) => s.statuteName === "(6)(A) Practices");
        const cur2 = chartData.statutes.find((s) => s.statuteName === "(6)(B) Practices");
        const sixATotal = cur1.totalPaymentInDollars;
        const sixBTotal = cur2.totalPaymentInDollars;
        setATotal(sixATotal);
        setBTotal(sixBTotal);
        const ACur = cur1.practiceCategories;
        const BCur = cur2.practiceCategories;

        const structuralCur = ACur.find((s) => s.practiceCategoryName === "Structural");
        const landManagementCur = ACur.find((s) => s.practiceCategoryName === "Land management");
        const vegetativeCur = ACur.find((s) => s.practiceCategoryName === "Vegetative");
        const forestManagementCur = ACur.find((s) => s.practiceCategoryName === "Forest management");
        const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === "Soil remediation");
        const other6ACur = ACur.find((s) => s.practiceCategoryName === "Other improvements");
        const soilTestingCur = ACur.find((s) => s.practiceCategoryName === "Soil testing");

        const otherPlanningCur = BCur.find((s) => s.practiceCategoryName === "Other planning");
        const conservationPlanningAssessmentCur = BCur.find(
            (s) => s.practiceCategoryName === "Conservation planning assessment"
        );
        const comprehensiveNutrientMgtCur = BCur.find((s) => s.practiceCategoryName === "Comprehensive Nutrient Mgt.");
        const resourceConservingCropRotationCur = BCur.find(
            (s) => s.practiceCategoryName === "Resource-conserving crop rotation"
        );
        const soilHealthCur = BCur.find((s) => s.practiceCategoryName === "Soil health");

        structuralTotal += Number(structuralCur.totalPaymentInDollars);
        if (structuralTotal === 0) zeroCategory.push("Structural");
        landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
        if (landManagementTotal === 0) zeroCategory.push("Land management");
        vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
        if (vegetativeTotal === 0) zeroCategory.push("Vegetative");
        forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
        if (forestManagementTotal === 0) zeroCategory.push("Forest management");
        soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
        if (soilRemediationTotal === 0) zeroCategory.push("Soil remediation");
        other6ATotal += Number(other6ACur.totalPaymentInDollars);
        if (other6ATotal === 0) zeroCategory.push("Other improvements");
        soilTestingTotal += Number(soilTestingCur.totalPaymentInDollars);
        if (soilTestingTotal === 0) zeroCategory.push("Soil testing");

        otherPlanningTotal += Number(otherPlanningCur.totalPaymentInDollars);
        if (otherPlanningTotal === 0) zeroCategory.push("Other planning");
        conservationPlanningAssessmentTotal += Number(conservationPlanningAssessmentCur.totalPaymentInDollars);
        if (conservationPlanningAssessmentTotal === 0) zeroCategory.push("Conservation planning assessment");
        comprehensiveNutrientMgtTotal += Number(comprehensiveNutrientMgtCur.totalPaymentInDollars);
        if (comprehensiveNutrientMgtTotal === 0) zeroCategory.push("Comprehensive Nutrient Mgt.");
        resourceConservingCropRotationTotal += Number(resourceConservingCropRotationCur.totalPaymentInDollars);
        if (resourceConservingCropRotationTotal === 0) zeroCategory.push("Resource-conserving crop rotation");
        soilHealthTotal += Number(soilHealthCur.totalPaymentInDollars);
        if (soilHealthTotal === 0) zeroCategory.push("Soil health");

        setSixAChartData([
            { name: "Structural", value: structuralTotal, color: BRAND_GREEN },
            { name: "Land management", value: landManagementTotal, color: "#4D847A" },
            { name: "Vegetative", value: vegetativeTotal, color: "#749F97" },
            { name: "Forest management", value: forestManagementTotal, color: "#9CBAB4" },
            { name: "Other improvements", value: other6ATotal, color: "#B9CDC9" },
            { name: "Soil remediation; Soil testing", value: soilRemediationTotal + soilTestingTotal, color: "#CDDBD8" }
        ]);

        setSixBChartData([
            { name: "Other planning", value: otherPlanningTotal, color: BRAND_GREEN },
            { name: "Conservation planning assessment", value: conservationPlanningAssessmentTotal, color: "#4D847A" },
            { name: "Comprehensive Nutrient Mgt.", value: comprehensiveNutrientMgtTotal, color: "#749F97" },
            {
                name: "Resource-conserving crop rotation; Soil health",
                value: resourceConservingCropRotationTotal + soilHealthTotal,
                color: "#9CBAB4"
            }
        ]);

        setTotalChartData([
            { name: "6 (A)", value: sixATotal, color: BRAND_GREEN },
            { name: "6 (B)", value: sixBTotal, color: "#9CBAB4" }
        ]);

        if (zeroCategory.length > 0) setZeroCategories(zeroCategory);
        else setZeroCategories(["None"]);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            {countyDataLoading && (
                <FullPageLoadingOverlay
                    label="Loading county data..."
                    detail="This may take longer the first time. Subsequent loads will be faster."
                />
            )}
            {isDataReady ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor={WHITE} ftColor={BRAND_GREEN} logo="light" />
                        <NavSearchBar
                            text="Conservation Programs (Title II)"
                            subtext="Environmental Quality Incentives Program (EQIP)"
                        />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    <Drawer setEQIPChecked={setChecked} setCSPChecked={undefined} zeroCategories={zeroCategories} />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        {EQIP_CATEGORIES.map((category, index) => renderCategorySection(category, index))}
                        <Box
                            display={level === "county" ? "none" : "flex"}
                            justifyContent="center"
                            flexDirection="column"
                            sx={{ mt: 10, mb: 2 }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>EQIP: State Performance by Category of Practices</strong>
                                </Typography>
                            </Box>
                            <Typography sx={{ mt: 2 }}>
                                EQIP provides cost-share assistance for improvements to eligible land. In the statute,
                                Congress defined seven categories of conservation practices: (1) structural practices,
                                such as for irrigation and livestock manure management or abatement; (2) land management
                                practices, such as for fencing, drainage water management, grazing, prescribed burning,
                                and wildlife habitat; (3) vegetative practices, such as planting filter strips, cover
                                crops, grassed waterways, field borders, windbreaks, and shelterbelts; (4) forest
                                management practices, which include planting trees and shrubs, improving forest stands,
                                planting riparian forest buffers, and treating residues; (5) soil testing practices; (6)
                                soil remediation practices, such as residue and tillage management (no-till, mulch-till,
                                or strip-till), and amendments for treating agricultural wastes; and (7) other
                                practices, including integrated pest management, dust control, and energy improvements.
                            </Typography>
                        </Box>
                        {(aTotal >= 0 || bTotal >= 0) && level !== "county" ? (
                            <div>
                                <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                                    <SemiDonutChart
                                        data={totalChartData}
                                        label1={(aTotal + bTotal).toString()}
                                        label2="EQIP TOTAL BENEFITS"
                                    />
                                </Box>
                                <Box component="div" sx={{ display: checked >= 1 && checked <= 7 ? "block" : "none" }}>
                                    <SemiDonutChart
                                        data={sixAChartData}
                                        label1={aTotal.toString()}
                                        label2="6(A) TOTAL BENEFITS"
                                    />
                                </Box>
                                <Box component="div" sx={{ display: checked >= 8 ? "block" : "none" }}>
                                    <SemiDonutChart
                                        data={sixBChartData}
                                        label1={bTotal.toString()}
                                        label2="6(B) TOTAL BENEFITS"
                                    />
                                </Box>
                            </div>
                        ) : null}
                        <Box sx={{ display: level === "county" ? "none" : "block" }}>
                            <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                                <Typography variant="h5">
                                    <strong>Performance by States</strong>
                                </Typography>
                            </Box>
                            <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                                <DataTable
                                    programName="EQIP"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                    selectedPractices={selectedPractices}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 1 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Land management"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Forest management"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Structural"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Soil remediation"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Vegetative"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Other improvements"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 7 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Soil testing"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 8 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Other planning"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 9 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Conservation planning assessment"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 10 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Resource-conserving crop rotation"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 11 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Soil health"
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked !== 12 ? "none" : "block" }}>
                                <CategoryTable
                                    category="Comprehensive Nutrient Mgt."
                                    statePerformance={statePerformance}
                                    year={eqip_year}
                                    stateCodes={stateCodesArray}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <h1>Loading data...</h1>
            )}
        </ThemeProvider>
    );
}
