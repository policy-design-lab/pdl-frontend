import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/CSP/CSPTotalTable";
import CSPTotalMap from "../components/CSP/CSPTotalMap";
import chartData from "../data/CSP/csp_practice_categories_data.json";
import CategoryTable from "../components/CSP/CategoryTable";
import CategoryMap from "../components/CSP/CategoryMap";

export default function CSPPage(): JSX.Element {
    const [checked, setChecked] = React.useState(0);

    const defaultTheme = createTheme();
    let landManagementTotal = 0;
    let otherImprovementTotal = 0;
    let vegetativeTotal = 0;
    let forestManagementTotal = 0;
    let soilRemediationTotal = 0;
    let structuralTotal = 0;

    let croplandTotal = 0;
    let rangelandTotal = 0;
    let pasturelandTotal = 0;
    let NIPFTotal = 0;
    let pasturedCroplandTotal = 0;

    let otherPaymentsTotal = 0;
    let bundlesTotal = 0;

    // eslint-disable-next-line
    const cur1 = chartData.statutes.find((s) => s.statuteName === '(6)(A) Practices');
    const cur2 = chartData.statutes.find((s) => s.statuteName === "2014 CSP");
    const cur3 = chartData.statutes.find((s) => s.statuteName === "Other");
    const sixATotal = cur1.totalPaymentInDollars;
    const old2014Total = cur2.totalPaymentInDollars;
    const otherTotal = cur3.totalPaymentInDollars;
    const ACur = cur1.practiceCategories;
    const BCur = cur2.practiceCategories;
    const CCur = cur3.practiceCategories;

    const landManagementCur = ACur.find((s) => s.practiceCategoryName === "Land management");
    const otherImprovementCur = ACur.find((s) => s.practiceCategoryName === "Other improvement");
    const vegetativeCur = ACur.find((s) => s.practiceCategoryName === "Vegetative");
    const forestManagementCur = ACur.find((s) => s.practiceCategoryName === "Forest management");
    const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === "Soil remediation");
    const structuralCur = ACur.find((s) => s.practiceCategoryName === "Structural");

    const croplandCur = BCur.find((s) => s.practiceCategoryName === "Cropland");
    const rangelandCur = BCur.find((s) => s.practiceCategoryName === "Rangeland");
    const pasturelandCur = BCur.find((s) => s.practiceCategoryName === "Pastureland");
    const NIPFCur = BCur.find((s) => s.practiceCategoryName === "NIPF");
    const pasturedCroplandCur = BCur.find((s) => s.practiceCategoryName === "Pastured Cropland");

    const otherPaymentsCur = CCur.find((s) => s.practiceCategoryName === "Other Payments");
    const bundlesCur = CCur.find((s) => s.practiceCategoryName === "Bundles");

    landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
    otherImprovementTotal += Number(otherImprovementCur.totalPaymentInDollars);
    vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
    forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
    soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
    structuralTotal += Number(structuralCur.totalPaymentInDollars);

    croplandTotal += Number(croplandCur.totalPaymentInDollars);
    rangelandTotal += Number(rangelandCur.totalPaymentInDollars);
    pasturelandTotal += Number(pasturelandCur.totalPaymentInDollars);
    NIPFTotal += Number(NIPFCur.totalPaymentInDollars);
    pasturedCroplandTotal += Number(pasturedCroplandCur.totalPaymentInDollars);

    otherPaymentsTotal += Number(otherPaymentsCur.totalPaymentInDollars);
    bundlesTotal += Number(bundlesCur.totalPaymentInDollars);

    const sixAChartData = [
        { name: "Land management", value: landManagementTotal, color: "#2F7164" },
        { name: "Other Improvement", value: otherImprovementTotal, color: "#4D847A" },
        { name: "Vegetative", value: vegetativeTotal, color: "#749F97" },
        { name: "Forest management", value: forestManagementTotal, color: "#9CBAB4" },
        { name: "Soil remediation", value: soilRemediationTotal, color: "#B9CDC9" },
        { name: "Structural", value: structuralTotal, color: "#CDDBD8" }
    ];

    const old2014ChartData = [
        { name: "Cropland", value: croplandTotal, color: "#2F7164" },
        { name: "Rangeland", value: rangelandTotal, color: "#4D847A" },
        { name: "Pastureland", value: pasturelandTotal, color: "#749F97" },
        { name: "NIPF", value: NIPFTotal, color: "#9CBAB4" },
        { name: "Pastured Cropland", value: pasturedCroplandTotal, color: "#B9CDC9" }
    ];

    const otherChartData = [
        { name: "Other Payments", value: otherPaymentsTotal, color: "#2F7164" },
        { name: "Bundles", value: bundlesTotal, color: "#4D847A" }
    ];

    const totalChartData = [
        { name: "6 (A)", value: sixATotal, color: "#2F7164" },
        { name: "2014 CSP", value: old2014Total, color: "#9CBAB4" },
        { name: "Other", value: otherTotal, color: "#749F97" }
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                    <NavBar />
                </Box>
                <Drawer setCSPChecked={setChecked} setEQIPChecked={null} />
                <Box sx={{ pl: 50, pr: 20 }}>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 0 ? "none" : "block" }}>
                        <CSPTotalMap />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 1 ? "none" : "block" }}>
                        <CategoryMap category="Land management" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 2 ? "none" : "block" }}>
                        <CategoryMap category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 3 ? "none" : "block" }}>
                        <CategoryMap category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 4 ? "none" : "block" }}>
                        <CategoryMap category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 5 ? "none" : "block" }}>
                        <CategoryMap category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 6 ? "none" : "block" }}>
                        <CategoryMap category="Structural" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 7 ? "none" : "block" }}>
                        <CategoryMap category="Cropland" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 8 ? "none" : "block" }}>
                        <CategoryMap category="Rangeland" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 9 ? "none" : "block" }}>
                        <CategoryMap category="Pastureland" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 10 ? "none" : "block" }}>
                        <CategoryMap category="NIPF" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 11 ? "none" : "block" }}>
                        <CategoryMap category="Pastured Cropland" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 12 ? "none" : "block" }}>
                        <CategoryMap category="Other Payments" />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 13 ? "none" : "block" }}>
                        <CategoryMap category="Bundles" />
                    </Box>
                    <Box display="flex" justifyContent="center" flexDirection="column" sx={{ mt: 10, mb: 2 }}>
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h5">
                                <strong>CSP: State Performance by Category of Practices</strong>
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 2 }}>
                            CSP provides five-year annual contract payments to farmers in return for increasing,
                            improving or advancing conservation across the entire farm operation.
                        </Typography>
                    </Box>
                    <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                        <SemiDonutChart
                            data={totalChartData}
                            label1={(sixATotal + old2014Total + otherTotal).toString()}
                            label2="CSP TOTAL BENEFITS"
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked >= 1 && checked <= 6 ? "block" : "none" }}>
                        <SemiDonutChart
                            data={sixAChartData}
                            label1={sixATotal.toString()}
                            label2="6(A) TOTAL BENEFITS"
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked >= 7 && checked <= 11 ? "block" : "none" }}>
                        <SemiDonutChart
                            data={old2014ChartData}
                            label1={old2014Total.toString()}
                            label2="2014 CSP TOTAL BENEFITS"
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked >= 12 ? "block" : "none" }}>
                        <SemiDonutChart
                            data={otherChartData}
                            label1={otherTotal.toString()}
                            label2="Other TOTAL BENEFITS"
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
                        <CategoryTable category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                        <CategoryTable category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                        <CategoryTable category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                        <CategoryTable category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                        <CategoryTable category="Structural" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 7 ? "none" : "block" }}>
                        <CategoryTable category="Cropland" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 8 ? "none" : "block" }}>
                        <CategoryTable category="Rangeland" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 9 ? "none" : "block" }}>
                        <CategoryTable category="Pastureland" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 10 ? "none" : "block" }}>
                        <CategoryTable category="NIPF" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 11 ? "none" : "block" }}>
                        <CategoryTable category="Pastured Cropland" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 12 ? "none" : "block" }}>
                        <CategoryTable category="Other Payments" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 13 ? "none" : "block" }}>
                        <CategoryTable category="Bundles" />
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
