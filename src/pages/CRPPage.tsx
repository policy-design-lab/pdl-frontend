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
    const year = "2018-2022";
    const attribute = "paymentInDollars";
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

        const statedistribution_url = `${config.apiUrl}/programs/conservation/crp/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });

        const chartData_url = `${config.apiUrl}/programs/conservation/crp/subprograms`;
        getJsonDataFromUrl(chartData_url).then((response) => {
            processData(response);
        });
    }, []);

    const processData = (chartData) => {
        if (chartData.programs === undefined) return;

        const cur1 = chartData.programs.find((s) => s.programName === "Total CRP");
        const cur2 = chartData.programs.find((s) => s.programName === "Total General Sign-Up");
        const cur3 = chartData.programs.find((s) => s.programName === "Total Continuous");
        let cur4;
        let cur5;
        let cur6;
        const cur7 = chartData.programs.find((s) => s.programName === "Grassland");
        const subCurs = cur3.subPrograms;

        if (subCurs !== undefined) {
            subCurs.forEach((value) => {
                if (value.programName === "CREP Only") {
                    cur4 = value;
                } else if (value.programName === "Continuous Non-CREP") {
                    cur5 = value;
                } else if (value.programName === "Farmable Wetland") {
                    cur6 = value;
                }
            });

            totalCRPPaymentInDollars = cur1.paymentInDollars;
            setTotalCrp(totalCRPPaymentInDollars);
            if (totalCRPPaymentInDollars === 0) zeroCategory.push("Total CRP");
            generalSignUpPaymentInDollars = cur2.paymentInDollars;
            if (generalSignUpPaymentInDollars === 0) zeroCategory.push("Total General Sign-Up");
            continuousSingUpPaymentInDollars = cur3.paymentInDollars;
            if (continuousSingUpPaymentInDollars === 0) zeroCategory.push("Total Continuous");
            setTotalSub(continuousSingUpPaymentInDollars);
            crepPaymentInDollars = cur4.paymentInDollars;
            if (crepPaymentInDollars === 0) zeroCategory.push("CREP Only");
            nocCrepPaymentInDollars = cur5.paymentInDollars;
            if (nocCrepPaymentInDollars === 0) zeroCategory.push("Continuous Non-CREP");
            wetlandPaymentInDollars = cur6.paymentInDollars;
            if (wetlandPaymentInDollars === 0) zeroCategory.push("Farmable Wetland");
            grasslandPyamentInDollars = cur7.paymentInDollars;
            if (grasslandPyamentInDollars === 0) zeroCategory.push("Grassland");

            setZeroCategories(zeroCategory);

            setTotalChartData([
                { name: "Total General Sign-Up", value: generalSignUpPaymentInDollars, color: "#2F7164" },
                { name: "Total Continuous", value: continuousSingUpPaymentInDollars, color: "#869397" },
                { name: "Grassland", value: grasslandPyamentInDollars, color: "#9CBAB4" }
            ]);

            setSubChartData([
                { name: "CREP Only", value: crepPaymentInDollars, color: "#2F7164" },
                { name: "Continuous Non-CREP", value: nocCrepPaymentInDollars, color: "#869397" },
                { name: "Farmable Wetland", value: wetlandPaymentInDollars, color: "#9CBAB4" }
            ]);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            {Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 ? (
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
                                category="Total General Sign-Up"
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
                                category="Total Continuous Sign-Up"
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
                                    label1={totalSub.toString()}
                                    label2="CRP TOTAL CONTINUOS BENEFITS"
                                />
                            </Box>
                        </div>

                        <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                            <Typography variant="h5">
                                <strong>Overall Performance of States</strong>
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
                                category="Total General Sign-Up"
                                statePerformance={stateDistributionData}
                                year={year}
                                stateCodes={stateCodesArray}
                            />
                        </Box>
                        <Box component="div" sx={{ display: checked !== 2 ? "none" : "block" }}>
                            <CategoryTable
                                category="Total Continuous Sign-Up"
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
