import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/csp/CSPTotalTable";
import CSPTotalMap from "../components/csp/CSPTotalMap";
import CategoryTable from "../components/csp/CategoryTable";
import CategoryMap from "../components/csp/CategoryMap";
import { config } from "../app.config";
import { getJsonDataFromUrl } from "../utils/apiutil";

export default function CSPPage(): JSX.Element {
    const [checked, setChecked] = React.useState(0);
    const [statePerformance, setStatePerformance] = React.useState([]);
    const [allStates, setAllStates] = React.useState([]);
    const [totalChartData, setTotalChartData] = React.useState([{}]);
    const [old2014ChartData, setOld2014ChartData] = React.useState([{}]);
    const [sixAChartData, setSixAChartData] = React.useState([{}]);
    const [firstTotal, setFirstATotal] = React.useState(0);
    const [secondTotal, setSecondTotal] = React.useState(0);
    const defaultTheme = createTheme();
    let landManagementTotal = 0;
    let otherImprovementTotal = 0;
    let vegetativeTotal = 0;
    let forestManagementTotal = 0;
    let soilRemediationTotal = 0;
    let existingAPTotal = 0;
    let structuralTotal = 0;
    let croplandTotal = 0;
    let rangelandTotal = 0;
    let bundlesTotal = 0;
    let NIPFTotal = 0;
    let pasturelandTotal = 0;
    let SAOTotal = 0;
    let pasturedCroplandTotal = 0;
    let sixATotal = 0;
    let old2014Total = 0;

    React.useEffect(() => {
        const chartData_url = `${config.apiUrl}/programs/conservation/csp/practice-categories`;
        const allprograms_url = `${config.apiUrl}/programs/conservation/csp/state-distribution`;

        getJsonDataFromUrl(allprograms_url).then((response) => {
            setStatePerformance(response);
        });
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStates(response);
        });

        getJsonDataFromUrl(chartData_url).then((response) => {
            processData(response);
        });
    }, []);

    const processData = (chartData) => {
        if (chartData.statutes === undefined) return;

        // eslint-disable-next-line
        const cur1 = chartData.statutes.find((s) => s.statuteName === "2018 Practices");
        const cur2 = chartData.statutes.find((s) => s.statuteName === "2014 Eligible Land");
        sixATotal = cur1.totalPaymentInDollars;
        old2014Total = cur2.totalPaymentInDollars;
        setFirstATotal(sixATotal);
        setSecondTotal(old2014Total);
        const ACur = cur1.practiceCategories;
        const BCur = cur2.practiceCategories;

        const landManagementCur = ACur.find((s) => s.practiceCategoryName === "Land management");
        const otherImprovementCur = ACur.find((s) => s.practiceCategoryName === "Other improvement");
        const existingAPCur = ACur.find((s) => s.practiceCategoryName === "Existing activity payments");
        const vegetativeCur = ACur.find((s) => s.practiceCategoryName === "Vegetative");
        const forestManagementCur = ACur.find((s) => s.practiceCategoryName === "Forest management");
        const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === "Soil remediation");
        const structuralCur = ACur.find((s) => s.practiceCategoryName === "Structural");
        const bundlesCur = ACur.find((s) => s.practiceCategoryName === "Bundles");

        const croplandCur = BCur.find((s) => s.practiceCategoryName === "Cropland");
        const rangelandCur = BCur.find((s) => s.practiceCategoryName === "Rangeland");
        const pasturelandCur = BCur.find((s) => s.practiceCategoryName === "Pastureland");
        const SAOCur = BCur.find((s) => s.practiceCategoryName === "Other: supplemental, adjustment & other");
        const NIPFCur = BCur.find((s) => s.practiceCategoryName === "Non-industrial private forestland");
        const pasturedCroplandCur = BCur.find((s) => s.practiceCategoryName === "Pastured Cropland");

        landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
        otherImprovementTotal += Number(otherImprovementCur.totalPaymentInDollars);
        existingAPTotal += Number(existingAPCur.totalPaymentInDollars);
        vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
        forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
        soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
        structuralTotal += Number(structuralCur.totalPaymentInDollars);
        bundlesTotal += Number(bundlesCur.totalPaymentInDollars);

        croplandTotal += Number(croplandCur.totalPaymentInDollars);
        rangelandTotal += Number(rangelandCur.totalPaymentInDollars);
        pasturelandTotal += Number(pasturelandCur.totalPaymentInDollars);
        SAOTotal += Number(SAOCur.totalPaymentInDollars);
        if (pasturedCroplandCur !== undefined)
            pasturedCroplandTotal += Number(pasturedCroplandCur.totalPaymentInDollars);
        NIPFTotal += Number(NIPFCur.totalPaymentInDollars);

        setSixAChartData([
            { name: "Land management", value: landManagementTotal, color: "#2F7164" },
            { name: "Other Improvement", value: otherImprovementTotal, color: "#4D847A" },
            { name: "Existing activity payments", value: existingAPTotal, color: "#869397" },
            { name: "Vegetative", value: vegetativeTotal, color: "#749F97" },
            { name: "Forest management", value: forestManagementTotal, color: "#9CBAB4" },
            { name: "Soil remediation", value: soilRemediationTotal, color: "#B9CDC9" },
            { name: "Structural", value: structuralTotal, color: "#CDDBD8" },
            { name: "Bundles", value: structuralTotal, color: "#C3C5C4" }
        ]);

        setOld2014ChartData([
            { name: "Cropland", value: croplandTotal, color: "#2F7164" },
            { name: "Rangeland", value: rangelandTotal, color: "#4D847A" },
            { name: "Pastureland", value: pasturelandTotal, color: "#749F97" },
            { name: "Other: supplemental, adjustment & other", value: SAOTotal, color: "#869397" },
            { name: "Non-industrial private forestland", value: NIPFTotal, color: "#9CBAB4" },
            { name: "Pastured Cropland", value: pasturedCroplandTotal, color: "#B9CDC9" }
        ]);

        setTotalChartData([
            { name: "2018 Practices", value: sixATotal, color: "#2F7164" },
            { name: "2014 Eligible Land", value: old2014Total, color: "#9CBAB4" }
        ]);
    };
    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                    <NavBar bkColor="rgba(47, 113, 100, 1)" ftColor="rgba(255, 255, 255, 1)" logo="dark" />
                </Box>
                <Drawer setCSPChecked={setChecked} setEQIPChecked={null} />
                {allStates.length > 0 && statePerformance.Alabama !== undefined ? (
                <Box sx={{ pl: 50, pr: 20 }}>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 0 ? "none" : "block" }}>
                        <CSPTotalMap />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 1 ? "none" : "block" }}>
                        <CategoryMap
                            category="Land management"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 2 ? "none" : "block" }}>
                        <CategoryMap
                            category="Other improvement"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 3 ? "none" : "block" }}>
                        <CategoryMap
                            category="Existing activity payments"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 4 ? "none" : "block" }}>
                        <CategoryMap category="Vegetative" statePerformance={statePerformance} allStates={allStates} />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 5 ? "none" : "block" }}>
                        <CategoryMap
                            category="Forest management"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 6 ? "none" : "block" }}>
                        <CategoryMap
                            category="Soil remediation"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 7 ? "none" : "block" }}>
                        <CategoryMap category="Structural" statePerformance={statePerformance} allStates={allStates} />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 8 ? "none" : "block" }}>
                        <CategoryMap category="Bundles" statePerformance={statePerformance} allStates={allStates} />
                    </Box>

                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 9 ? "none" : "block" }}>
                        <CategoryMap category="Cropland" statePerformance={statePerformance} allStates={allStates} />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 10 ? "none" : "block" }}>
                        <CategoryMap category="Rangeland" statePerformance={statePerformance} allStates={allStates} />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 11 ? "none" : "block" }}>
                        <CategoryMap category="Pastureland" statePerformance={statePerformance} allStates={allStates} />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 12 ? "none" : "block" }}>
                        <CategoryMap
                            category="Other: supplemental, adjustment & other"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 13 ? "none" : "block" }}>
                        <CategoryMap
                            category="Non-industrial private forestland"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
                    </Box>
                    <Box component="div" sx={{ width: "85%", m: "auto", display: checked !== 14 ? "none" : "block" }}>
                        <CategoryMap
                            category="Pastured cropland"
                            statePerformance={statePerformance}
                            allStates={allStates}
                        />
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

                    {firstTotal >= 0 || secondTotal >= 0 ? (
                        <div>
                            <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                                <SemiDonutChart
                                    data={totalChartData}
                                    label1={(firstTotal + secondTotal).toString()}
                                    label2="CSP TOTAL BENEFITS"
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked >= 1 && checked <= 8 ? "block" : "none" }}>
                                <SemiDonutChart
                                    data={sixAChartData}
                                    label1={firstTotal.toString()}
                                    label2="2018 CSP TOTAL BENEFITS"
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked >= 9 && checked <= 14 ? "block" : "none" }}>
                                <SemiDonutChart
                                    data={old2014ChartData}
                                    label1={secondTotal.toString()}
                                    label2="2014 Eligible Land"
                                />
                            </Box>
                        </div>
                    ) : (
                        <Typography variant="h5">Loading Data...</Typography>
                    )}

                    <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                        <Typography variant="h5">
                            <strong>Performance by State</strong>
                        </Typography>
                    </Box>
                    <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                        <DataTable />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 1 ? "none" : "block" }}>
                        <CategoryTable category="Land management" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                        <CategoryTable category="Other improvement" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                        <CategoryTable category="Existing activity payments" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                        <CategoryTable category="Vegetative" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                        <CategoryTable category="Forest management" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                        <CategoryTable category="Soil remediation" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 7 ? "none" : "block" }}>
                        <CategoryTable category="Structural" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 8 ? "none" : "block" }}>
                        <CategoryTable category="Bundles" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 9 ? "none" : "block" }}>
                        <CategoryTable category="Cropland" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 10 ? "none" : "block" }}>
                        <CategoryTable category="Rangeland" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 11 ? "none" : "block" }}>
                        <CategoryTable category="Pastureland" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 12 ? "none" : "block" }}>
                        <CategoryTable
                            category="Other: supplemental, adjustment & other"
                            statePerformance={statePerformance}
                        />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 13 ? "none" : "block" }}>
                        <CategoryTable category="Non-industrial private forestland" statePerformance={statePerformance} />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 14 ? "none" : "block" }}>
                        <CategoryTable category="Pastured Cropland" statePerformance={statePerformance} />
                    </Box>
                </Box>):(<h1>Loading data...</h1>)}
            </Box>
        </ThemeProvider>
    );
}
