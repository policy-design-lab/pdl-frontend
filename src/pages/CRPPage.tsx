import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/crp/CRPTotalTable";
import CRPTotalMap from "../components/crp/CRPTotalMap";
import CategoryTable from "../components/crp/CategoryTable";
import CategoryMap from "../components/crp/CategoryMap";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";

export default function CRPPage(): JSX.Element {
    const year = "2014-2023";
    const attribute = "totalPaymentInDollars";
    const [checked, setChecked] = React.useState(0);

    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [totalChartData, setTotalChartData] = React.useState([{}]);
    const [subChartData, setSubChartData] = React.useState([{}]);
    const [zeroCategories, setZeroCategories] = React.useState([]);
    const [totalCrp, setTotalCrp] = React.useState(0);
    const [totalSub, setTotalSub] = React.useState(0);

    const defaultTheme = createTheme();
    const zeroCategory = [];
    let totalCRPPaymentInDollars = 0;
    let generalSignUpPaymentInDollars = 0;
    let continuousSingUpPaymentInDollars = 0;
    let crepPaymentInDollars = 0;
    let nocCrepPaymentInDollars = 0;
    let wetlandPaymentInDollars = 0;
    let grasslandPyamentInDollars = 0;

    React.useEffect(() => {
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStatesData(response);
        });

        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            setStateCodesArray(response);
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });

        const statedistribution_url = `${config.apiUrl}/titles/title-ii/programs/crp/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });

        const chartData_url = `${config.apiUrl}/titles/title-ii/programs/crp/summary`;
        getJsonDataFromUrl(chartData_url).then((response) => {
            processData(response);
        });
    }, []);

    const processData = (chartData) => {
        if (chartData.subPrograms === undefined) return;

        const cur1 = chartData.subPrograms.find((s) => s.subProgramName === "General Sign-up");
        const cur2 = chartData.subPrograms.find((s) => s.subProgramName === "Continuous Sign-up");
        const cur3 = chartData.subPrograms.find((s) => s.subProgramName === "Grassland");
        let cur4;
        let cur5;
        let cur6;
        const subCurs = cur2.subSubPrograms;
        if (subCurs !== undefined) {
            subCurs.forEach((value) => {
                if (value.subSubProgramName === "CREP Only") {
                    cur4 = value;
                } else if (value.subSubProgramName === "Continuous Non-CREP") {
                    cur5 = value;
                } else if (value.subSubProgramName === "Farmable Wetland") {
                    cur6 = value;
                }
            });

            totalCRPPaymentInDollars = chartData.totalPaymentInDollars;
            setTotalCrp(totalCRPPaymentInDollars);
            if (totalCRPPaymentInDollars === 0) zeroCategory.push("Total CRP");
            generalSignUpPaymentInDollars = cur1.totalPaymentInDollars;
            if (generalSignUpPaymentInDollars === 0) zeroCategory.push("General Sign-up");
            continuousSingUpPaymentInDollars = cur2.totalPaymentInDollars;
            if (continuousSingUpPaymentInDollars === 0) zeroCategory.push("Continuous Sign-up");
            setTotalSub(continuousSingUpPaymentInDollars);
            crepPaymentInDollars = cur4.totalPaymentInDollars;
            if (crepPaymentInDollars === 0) zeroCategory.push("CREP Only");
            nocCrepPaymentInDollars = cur5.totalPaymentInDollars;
            if (nocCrepPaymentInDollars === 0) zeroCategory.push("Continuous Non-CREP");
            wetlandPaymentInDollars = cur6.totalPaymentInDollars;
            if (wetlandPaymentInDollars === 0) zeroCategory.push("Farmable Wetland");
            grasslandPyamentInDollars = cur3.totalPaymentInDollars;
            if (grasslandPyamentInDollars === 0) zeroCategory.push("Grassland");

            if (zeroCategory.length > 0) setZeroCategories(zeroCategory);
            else setZeroCategories(["None"]);

            setTotalChartData([
                { name: "General Sign-up", value: generalSignUpPaymentInDollars, color: "#2F7164" },
                { name: "Continuous Sign-up", value: continuousSingUpPaymentInDollars, color: "#9CBAB4" },
                { name: "Grassland", value: grasslandPyamentInDollars, color: "#CDDBD8" }
            ]);

            setSubChartData([
                { name: "CREP Only", value: crepPaymentInDollars, color: "#2F7164" },
                { name: "Continuous Non-CREP", value: nocCrepPaymentInDollars, color: "#9CBAB4" },
                { name: "Farmable Wetland", value: wetlandPaymentInDollars, color: "#CDDBD8" }
            ]);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            {Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 &&
            zeroCategories.length >= 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar
                            text="Conservation Programs (Title II)"
                            subtext="Conversation Reserve Program (CRP)"
                        />
                    </Box>
                    <Drawer
                        setCRPChecked={setChecked}
                        setCSPChecked={undefined}
                        setEQIPChecked={undefined}
                        zeroCategories={zeroCategories}
                    />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 0 ? "none" : "block" }}
                        >
                            <CRPTotalMap
                                program="Total CRP"
                                attribute={attribute}
                                year={year}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 1 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="General Sign-up"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 2 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="Continuous Sign-up"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 3 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="CREP Only"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 4 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="Continuous Non-CREP"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 5 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="Farmable Wetland"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 6 ? "none" : "block" }}
                        >
                            <CategoryMap
                                year={year}
                                category="Grassland"
                                attribute={attribute}
                                statePerformance={stateDistributionData}
                                allStates={allStatesData}
                                stateCodes={stateCodesData}
                            />
                        </Box>

                        <Box
                            display="flex"
                            justifyContent="center"
                            flexDirection="column"
                            sx={{ mt: 10, mb: 2, display: checked !== 0 ? "none" : "block" }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>CRP: Category of Practice Performance</strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            display="flex"
                            justifyContent="center"
                            flexDirection="column"
                            sx={{
                                mt: 10,
                                mb: 2,
                                display: checked === 1 || checked === 2 || checked === 6 ? "block" : "none"
                            }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>CRP: Category of Practice Performance</strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            display="flex"
                            justifyContent="center"
                            flexDirection="column"
                            sx={{
                                mt: 10,
                                mb: 2,
                                display: checked > 2 && checked < 6 ? "block" : "none"
                            }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>CRP Total Continuous: Sub-Category of Practice Performance</strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography sx={{ mt: 2 }}>
                                CRP provides annual rental payments to landowners in return for conservation practices
                                that remove the acres from production and implements conservation cover (e.g., grasses
                                and/or trees). CRP contracts are for 10 or 15 years and enrolled land can be an entire
                                field or portions of a field (e.g., grass waterways or buffers). CRP spending will be
                                visualized using the following categories.
                            </Typography>
                        </Box>

                        <div>
                            <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                                <SemiDonutChart
                                    data={totalChartData}
                                    label1={totalCrp.toString()}
                                    label2="CRP TOTAL BENEFITS"
                                />
                            </Box>
                            <Box
                                component="div"
                                sx={{ display: checked === 1 || checked === 2 || checked === 6 ? "block" : "none" }}
                            >
                                <SemiDonutChart
                                    data={totalChartData}
                                    label1={totalCrp.toString()}
                                    label2="CRP TOTAL BENEFITS"
                                />
                            </Box>
                            <Box component="div" sx={{ display: checked > 2 && checked < 6 ? "block" : "none" }}>
                                <SemiDonutChart
                                    data={subChartData}
                                    label1={totalSub}
                                    label2="CRP TOTAL CONTINUOS BENEFITS"
                                />
                            </Box>
                        </div>

                        <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                            <Typography variant="h5">
                                <strong>Performance by States</strong>
                            </Typography>
                        </Box>
                        <Box component="div" sx={{ display: checked !== 0 ? "none" : "block" }}>
                            <DataTable
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 1 ? "none" : "block" }}>
                            <CategoryTable
                                category="General Sign-up"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                            <CategoryTable
                                category="Continuous Sign-up"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 3 ? "none" : "block" }}>
                            <CategoryTable
                                category="CREP Only"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 4 ? "none" : "block" }}>
                            <CategoryTable
                                category="Continuous Non-CREP"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 5 ? "none" : "block" }}>
                            <CategoryTable
                                category="Farmable Wetland"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 6 ? "none" : "block" }}>
                            <CategoryTable
                                category="Grassland"
                                statePerformance={stateDistributionData}
                                year={year}
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
