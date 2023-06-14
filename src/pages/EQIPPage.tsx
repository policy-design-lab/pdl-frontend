import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import NavSearchBar from "../components/shared/NavSearchBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/eqip/EQIPTotalTable";
import EqipTotalMap from "../components/eqip/EQIPTotalMap";
import chartData from "../data/EQIP/EQIP_STATUTE_PERFORMANCE_DATA.json";
import CategoryTable from "../components/eqip/CategoryTable";
import CategoryMap from "../components/eqip/CategoryMap";

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

    // eslint-disable-next-line
    const cur1 = chartData.statutes.find((s) => s.statuteName === "(6)(A) Practices");
    const cur2 = chartData.statutes.find((s) => s.statuteName === "(6)(B) Practices");
    const sixATotal = cur1.totalPaymentInDollars;
    const sixBTotal = cur2.totalPaymentInDollars;
    const ACur = cur1.practiceCategories;
    const BCur = cur2.practiceCategories;

    const structuralCur = ACur.find((s) => s.practiceCategoryName === "Structural");
    const landManagementCur = ACur.find((s) => s.practiceCategoryName === "Land management");
    const vegetativeCur = ACur.find((s) => s.practiceCategoryName === "Vegetative");
    const forestManagementCur = ACur.find((s) => s.practiceCategoryName === "Forest management");
    const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === "Soil remediation");
    const other6ACur = ACur.find((s) => s.practiceCategoryName === "Other improvement");
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
    landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
    vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
    forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
    soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
    other6ATotal += Number(other6ACur.totalPaymentInDollars);
    soilTestingTotal += Number(soilTestingCur.totalPaymentInDollars);

    otherPlanningTotal += Number(otherPlanningCur.totalPaymentInDollars);
    conservationPlanningAssessmentTotal += Number(conservationPlanningAssessmentCur.totalPaymentInDollars);
    comprehensiveNutrientMgtTotal += Number(comprehensiveNutrientMgtCur.totalPaymentInDollars);
    resourceConservingCropRotationTotal += Number(resourceConservingCropRotationCur.totalPaymentInDollars);
    soilHealthTotal += Number(soilHealthCur.totalPaymentInDollars);

    const sixAChartData = [
        { name: "Structural", value: structuralTotal, color: "#2F7164" },
        { name: "Land management", value: landManagementTotal, color: "#4D847A" },
        { name: "Vegetative", value: vegetativeTotal, color: "#749F97" },
        { name: "Forest management", value: forestManagementTotal, color: "#9CBAB4" },
        { name: "Other improvement", value: other6ATotal, color: "#B9CDC9" },
        { name: "Soil remediation; Soil testing", value: soilRemediationTotal + soilTestingTotal, color: "#CDDBD8" }
    ];

    const sixBChartData = [
        { name: "Other planning", value: otherPlanningTotal, color: "#2F7164" },
        { name: "Conservation planning assessment", value: conservationPlanningAssessmentTotal, color: "#4D847A" },
        { name: "Comprehensive Nutrient Mgt.", value: comprehensiveNutrientMgtTotal, color: "#749F97" },
        {
            name: "Resource-conserving crop rotation; Soil health",
            value: resourceConservingCropRotationTotal + soilHealthTotal,
            color: "#9CBAB4"
        }
    ];

    const totalChartData = [
        { name: "6 (A)", value: sixATotal, color: "#2F7164" },
        { name: "6 (B)", value: sixBTotal, color: "#9CBAB4" }
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                    <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                    <NavSearchBar text="Conservation Programs (Title II)" subtext="Environmental Quality Incentives Program (EQIP)"/>
                </Box>
                <Drawer setEQIPChecked={setChecked} setCSPChecked={undefined} />
                <Box sx={{ pl: 50, pr: 20 }}>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 0 ? "none" : "block" }}>
                        <EqipTotalMap />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 1 ? "none" : "block" }}>
                        <CategoryMap category="Land management" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 2 ? "none" : "block" }}>
                        <CategoryMap category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 3 ? "none" : "block" }}>
                        <CategoryMap category="Structural" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 4 ? "none" : "block" }}>
                        <CategoryMap category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 5 ? "none" : "block" }}>
                        <CategoryMap category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 6 ? "none" : "block" }}>
                        <CategoryMap category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 7 ? "none" : "block" }}>
                        <CategoryMap category="Soil testing" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 8 ? "none" : "block" }}>
                        <CategoryMap category="Other planning" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 9 ? "none" : "block" }}>
                        <CategoryMap category="Conservation planning assessment" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 10 ? "none" : "block" }}>
                        <CategoryMap category="Resource-conserving crop rotation" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 11 ? "none" : "block" }}>
                        <CategoryMap category="Soil health" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 12 ? "none" : "block" }}>
                        <CategoryMap category="Comprehensive Nutrient Mgt." />
                    </Box>
                    <Box display="flex" justifyContent="center" flexDirection="column" sx={{ mt: 10, mb: 2 }}>
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h5">
                                <strong>EQIP: State Performance by Category of Practices</strong>
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 2 }}>
                            EQIP provides cost-share assistance for improvements to eligible land. In the statute,
                            Congress defined seven categories of conservation practices: (1) structural practices, such
                            as for irrigation and livestock manure management or abatement; (2) land management
                            practices, such as for fencing, drainage water management, grazing, prescribed burning, and
                            wildlife habitat; (3) vegetative practices, such as planting filter strips, cover crops,
                            grassed waterways, field borders, windbreaks, and shelterbelts; (4) forest management
                            practices, which include planting trees and shrubs, improving forest stands, planting
                            riparian forest buffers, and treating residues; (5) soil testing practices; (6) soil
                            remediation practices, such as residue and tillage management (no-till, mulch-till, or
                            strip-till), and amendments for treating agricultural wastes; and (7) other practices,
                            including integrated pest management, dust control, and energy improvements.
                        </Typography>
                    </Box>
                    <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                        <SemiDonutChart
                            data={totalChartData}
                            label1={(sixATotal + sixBTotal).toString()}
                            label2="EQIP TOTAL BENEFITS"
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked >= 1 && checked <= 7 ? "block" : "none" }}>
                        <SemiDonutChart
                            data={sixAChartData}
                            label1={sixATotal.toString()}
                            label2="6(A) TOTAL BENEFITS"
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked >= 8 ? "block" : "none" }}>
                        <SemiDonutChart
                            data={sixBChartData}
                            label1={sixBTotal.toString()}
                            label2="6(B) TOTAL BENEFITS"
                        />
                    </Box>
                    <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                        <Typography variant="h5">
                            <strong>Performance by State</strong>
                        </Typography>
                    </Box>
                    <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                        <DataTable />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 1 ? "none" : "block" }}>
                        <CategoryTable category="Land management" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                        <CategoryTable category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                        <CategoryTable category="Structural" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                        <CategoryTable category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                        <CategoryTable category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                        <CategoryTable category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 7 ? "none" : "block" }}>
                        <CategoryTable category="Soil testing" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 8 ? "none" : "block" }}>
                        <CategoryTable category="Other planning" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 9 ? "none" : "block" }}>
                        <CategoryTable category="Conservation planning assessment" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 10 ? "none" : "block" }}>
                        <CategoryTable category="Resource-conserving crop rotation" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 11 ? "none" : "block" }}>
                        <CategoryTable category="Soil health" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 12 ? "none" : "block" }}>
                        <CategoryTable category="Comprehensive Nutrient Mgt." />
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
