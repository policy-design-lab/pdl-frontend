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
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";

export default function CSPPage(): JSX.Element {
    const [checked, setChecked] = React.useState(0);
    const [statePerformance, setStatePerformance] = React.useState({});
    const [allStates, setAllStates] = React.useState([]);
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState([]);
    const [totalChartData, setTotalChartData] = React.useState([{}]);
    const [old2014ChartData, setOld2014ChartData] = React.useState([{}]);
    const [new2018ChartData, setNew2018ChartData] = React.useState([{}]);
    const [newMiscellaneousChartData, setNewMiscellaneousChartData] = React.useState([{}]);
    const [firstTotal, setFirstTotal] = React.useState(0);
    const [secondTotal, setSecondTotal] = React.useState(0);
    const [thirdTotal, setThirdTotal] = React.useState(0);
    const [zeroCategories, setZeroCategories] = React.useState([]);

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
    let soilTestingTotal = 0;
    let NIPFTotal = 0;
    let pasturelandTotal = 0;
    let SAOTotal = 0;
    let grasslandTotal = 0;
    let new2018Total = 0;
    let old2014Total = 0;
    let miscellaneousPracticesTotal = 0;
    let miscellaneousTotal = 0;
    const zeroCategory = [];

    const csp_year = "2018-2022";

    React.useEffect(() => {
        const state_perf_url = `${config.apiUrl}/titles/title-ii/programs/csp/state-distribution`;
        getJsonDataFromUrl(state_perf_url).then((response) => {
            const converted_perf_json = response;
            setStatePerformance(converted_perf_json);
        });

        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            const converted_json = response;
            setAllStates(converted_json);
        });

        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            setStateCodesArray(response);
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });

        const chartdata_url = `${config.apiUrl}/titles/title-ii/programs/csp/summary`;
        getJsonDataFromUrl(chartdata_url).then((response) => {
            const converted_chart_json = response;
            processData(converted_chart_json);
        });
    }, []);

    const processData = (chartData) => {
        if (chartData.statutes === undefined) return;

        // eslint-disable-next-line
        const cur1 = chartData.statutes.find((s) => s.statuteName === "2018 Practices");
        const cur2 = chartData.statutes.find((s) => s.statuteName === "2014 Eligible Land");
        const cur3 = chartData.statutes.find((s) => s.statuteName === "Miscellaneous Practices");
        new2018Total = cur1.totalPaymentInDollars;
        old2014Total = cur2.totalPaymentInDollars;
        miscellaneousPracticesTotal = cur3.totalPaymentInDollars;
        setFirstTotal(new2018Total);
        setSecondTotal(old2014Total);
        setThirdTotal(miscellaneousPracticesTotal);
        const ACur = cur1.practiceCategories;
        const BCur = cur2.practiceCategories;
        const CCur = cur3.practiceCategories;
        const landManagementCur = ACur.find((s) => s.practiceCategoryName === "Land management");
        const otherImprovementCur = ACur.find((s) => s.practiceCategoryName === "Other improvement");
        const existingAPCur = ACur.find((s) => s.practiceCategoryName === "Existing activity payments");
        const vegetativeCur = ACur.find((s) => s.practiceCategoryName === "Vegetative");
        const forestManagementCur = ACur.find((s) => s.practiceCategoryName === "Forest management");
        const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === "Soil remediation");
        const structuralCur = ACur.find((s) => s.practiceCategoryName === "Structural");
        const bundlesCur = ACur.find((s) => s.practiceCategoryName === "Bundles");
        const soilTestingCur = ACur.find((s) => s.practiceCategoryName === "Soil testing");

        const croplandCur = BCur.find((s) => s.practiceCategoryName === "Cropland");
        const rangelandCur = BCur.find((s) => s.practiceCategoryName === "Rangeland");
        const pasturelandCur = BCur.find((s) => s.practiceCategoryName === "Pastureland");
        const SAOCur = BCur.find((s) => s.practiceCategoryName === "Other: supplemental, adjustment & other");
        const NIPFCur = BCur.find((s) => s.practiceCategoryName === "Non-industrial private forestland");
        const grasslandCur = BCur.find((s) => s.practiceCategoryName === "Grassland");

        const miscellaneousCur = CCur.find((s) => s.practiceCategoryName === "Miscellaneous");

        landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
        if (landManagementTotal === 0) zeroCategory.push("Land management");
        otherImprovementTotal += Number(otherImprovementCur.totalPaymentInDollars);
        if (otherImprovementTotal === 0) zeroCategory.push("Other improvement");
        existingAPTotal += Number(existingAPCur.totalPaymentInDollars);
        if (existingAPTotal === 0) zeroCategory.push("Existing activity payments");
        vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
        if (vegetativeTotal === 0) zeroCategory.push("Vegetative");
        forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
        if (forestManagementTotal === 0) zeroCategory.push("Forest management");
        soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
        if (soilRemediationTotal === 0) zeroCategory.push("Soil remediation");
        structuralTotal += Number(structuralCur.totalPaymentInDollars);
        if (structuralTotal === 0) zeroCategory.push("Structural");
        bundlesTotal += Number(bundlesCur.totalPaymentInDollars);
        if (bundlesTotal === 0) zeroCategory.push("Bundles");
        soilTestingTotal = Number(soilTestingCur.totalPaymentInDollars);
        if (soilTestingTotal === 0) zeroCategory.push("Soil testing");

        croplandTotal += Number(croplandCur.totalPaymentInDollars);
        if (croplandTotal === 0) zeroCategory.push("Cropland");
        rangelandTotal += Number(rangelandCur.totalPaymentInDollars);
        if (rangelandTotal === 0) zeroCategory.push("Rangeland");
        pasturelandTotal += Number(pasturelandCur.totalPaymentInDollars);
        if (pasturelandTotal === 0) zeroCategory.push("Pastureland");
        SAOTotal += Number(SAOCur.totalPaymentInDollars);
        if (SAOTotal === 0) zeroCategory.push("Other: supplemental, adjustment & other");
        NIPFTotal += Number(NIPFCur.totalPaymentInDollars);
        if (NIPFTotal === 0) zeroCategory.push("Non-industrial private forestland");
        if (grasslandCur !== undefined) grasslandTotal += Number(grasslandCur.totalPaymentInDollars);
        if (grasslandTotal === 0) zeroCategory.push("Grassland");

        miscellaneousTotal += Number(miscellaneousCur.totalPaymentInDollars);
        if (miscellaneousTotal === 0) zeroCategory.push("Miscellaneous");

        setNew2018ChartData([
            { name: "Land management", value: landManagementTotal, color: "#2F7164" },
            {
                name: "Other Improvement",
                value: otherImprovementTotal,
                color: "#4D847A"
            },
            {
                name: "Existing activity payments",
                value: existingAPTotal,
                color: "#749F97"
            },
            { name: "Vegetative", value: vegetativeTotal, color: "#9CBAB4" },
            {
                name: "Forest management",
                value: forestManagementTotal,
                color: "#B9CDC9"
            },
            {
                name: "Soil remediation",
                value: soilRemediationTotal,
                color: "#CDDBD8"
            },
            { name: "Structural", value: structuralTotal, color: "#E2E8E7" },
            { name: "Bundles", value: bundlesTotal, color: "#C3C5C4" },
            { name: "Soil Testing", value: soilTestingTotal, color: "#CAD4C5" }
        ]);

        setOld2014ChartData([
            { name: "Cropland", value: croplandTotal, color: "#2F7164" },
            { name: "Rangeland", value: rangelandTotal, color: "#4D847A" },
            { name: "Pastureland", value: pasturelandTotal, color: "#749F97" },
            {
                name: "Other: supplemental, adjustment & other",
                value: SAOTotal,
                color: "#9CBAB4"
            },
            {
                name: "Non-industrial private forestland",
                value: NIPFTotal,
                color: "#B9CDC9"
            },
            { name: "Grassland", value: grasslandTotal, color: "#CDDBD8" }
        ]);

        setNewMiscellaneousChartData([{ name: "Miscellaneous", value: miscellaneousTotal, color: "#2F7164" }]);
        setTotalChartData([
            { name: "2018 Practices", value: new2018Total, color: "#2F7164" },
            { name: "2014 Eligible Land", value: old2014Total, color: "#9CBAB4" },
            { name: "Miscellaneous Practices", value: miscellaneousPracticesTotal, color: "#4D847A" }
        ]);

        if (zeroCategory.length > 0) setZeroCategories(zeroCategory);
        else setZeroCategories(["None"]);
    };
    return (
        <ThemeProvider theme={defaultTheme}>
            {allStates.length > 0 &&
            statePerformance[csp_year] !== undefined &&
            zeroCategories.length > 0 &&
            stateCodesArray.length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar
                            text="Conservation Programs (Title II)"
                            subtext="Conversation Stewardship Program (CSP)"
                        />
                    </Box>
                    <Drawer setCSPChecked={setChecked} setEQIPChecked={undefined} zeroCategories={zeroCategories} />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 0 ? "none" : "block"
                            }}
                        >
                            <CSPTotalMap
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 1 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="2018 Practices"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 2 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Structural"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>

                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 3 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Vegetative"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 4 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Land management"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>

                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 5 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Forest management"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 6 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Soil remediation"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 7 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Existing activity payments"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 8 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Bundles"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 9 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Soil testing"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 10 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Other improvement"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>

                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 11 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="2014 Eligible Land"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 12 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Cropland"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 13 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Grassland"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 14 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Rangeland"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 15 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Pastureland"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 16 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Non-industrial private forestland"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 17 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Other: supplemental, adjustment & other"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 18 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Miscellaneous Practices"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto",
                                display: checked !== 19 ? "none" : "block"
                            }}
                        >
                            <CategoryMap
                                category="Miscellaneous"
                                statePerformance={statePerformance}
                                allStates={allStates}
                                year={csp_year}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box display="flex" justifyContent="center" flexDirection="column" sx={{ mt: 10, mb: 2 }}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>CSP: State Performance by Category</strong>
                                </Typography>
                            </Box>
                            <Typography sx={{ mt: 2 }}>
                                CSP provides five-year annual contract payments to farmers in return for increasing,
                                improving or advancing conservation across the entire farm operation.
                            </Typography>
                        </Box>

                        {firstTotal >= 0 || secondTotal >= 0 || thirdTotal >= 0 ? (
                            <div>
                                <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                                    <SemiDonutChart
                                        data={totalChartData}
                                        label1={(firstTotal + secondTotal).toString()}
                                        label2="CSP TOTAL BENEFITS"
                                    />
                                </Box>
                                <Box
                                    component="div"
                                    sx={{
                                        display: checked >= 1 && checked <= 10 ? "block" : "none"
                                    }}
                                >
                                    <SemiDonutChart
                                        data={new2018ChartData}
                                        label1={firstTotal.toString()}
                                        label2="2018 Practices"
                                    />
                                </Box>
                                <Box
                                    component="div"
                                    sx={{ display: checked >= 11 && checked <= 17 ? "block" : "none" }}
                                >
                                    <SemiDonutChart
                                        data={old2014ChartData}
                                        label1={secondTotal.toString()}
                                        label2="2014 Eligible Land"
                                    />
                                </Box>
                                <Box
                                    component="div"
                                    sx={{ display: checked >= 18 && checked <= 19 ? "block" : "none" }}
                                >
                                    <SemiDonutChart
                                        data={newMiscellaneousChartData}
                                        label1={thirdTotal.toString()}
                                        label2="Miscellaneous Practices"
                                    />
                                </Box>
                            </div>
                        ) : null}

                        <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                            <Typography variant="h5">
                                <strong>Performance by States</strong>
                            </Typography>
                        </Box>
                        <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                            <DataTable
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 1 ? "none" : "block" }}>
                            <CategoryTable
                                category="2018 Practices"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                            <CategoryTable
                                category="Structural"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                            <CategoryTable
                                category="Vegetative"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                            <CategoryTable
                                category="Land management"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                            <CategoryTable
                                category="Forest management"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                            <CategoryTable
                                category="Soil remediation"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 7 ? "none" : "block" }}>
                            <CategoryTable
                                category="Existing activity payments"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 8 ? "none" : "block" }}>
                            <CategoryTable
                                category="Bundles"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 9 ? "none" : "block" }}>
                            <CategoryTable
                                category="Soil testing"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 10 ? "none" : "block" }}>
                            <CategoryTable
                                category="Other improvement"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>

                        <Box component="div" sx={{ display: checked !== 11 ? "none" : "block" }}>
                            <CategoryTable
                                category="2014 Eligible Land"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 12 ? "none" : "block" }}>
                            <CategoryTable
                                category="Cropland"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>

                        <Box component="div" sx={{ display: checked !== 13 ? "none" : "block" }}>
                            <CategoryTable
                                category="Grassland"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 14 ? "none" : "block" }}>
                            <CategoryTable
                                category="Rangeland"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 15 ? "none" : "block" }}>
                            <CategoryTable
                                category="Pastureland"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 16 ? "none" : "block" }}>
                            <CategoryTable
                                category="Non-industrial private forestland"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 17 ? "none" : "block" }}>
                            <CategoryTable
                                category="Other: supplemental, adjustment & other"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 18 ? "none" : "block" }}>
                            <CategoryTable
                                category="Miscellaneous Practices"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 19 ? "none" : "block" }}>
                            <CategoryTable
                                category="Miscellaneous"
                                statePerformance={statePerformance}
                                year={csp_year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                    </Box>
                </Box>
            ) : (
                <h1>Loading data...</h1>
            )}
        </ThemeProvider>
    );
}
