import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import { Label } from "recharts";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/rcpp/RCPPTotalTable";
import RCPPTotalMap from "../components/rcpp/RCPPTotalMap";
// import CategoryTable from "../components/rcpp/CategoryTable";
// import CategoryMap from "../components/rcpp/CategoryMap";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";

export default function RCPPPage(): JSX.Element {
    const year = "2018-2022";
    const attribute = "assistancePaymentInDollars";
    const [checked, setChecked] = React.useState(0);

    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [totalChartData, setTotalChartData] = React.useState([{}]);
    const [zeroCategories, setZeroCategories] = React.useState([]);
    const [totalRcpp, setTotalRcpp] = React.useState(0);
    const [totalBenefit, setTotalBenefit] = React.useState("");

    const defaultTheme = createTheme();
    const zeroCategory = [];
    let totalRCPPPaymentInDollars = 0;
    let totalContracts = 0;
    let totalAcres = 0;
    let assistancePayments = 0;
    let reimbursePayments = 0;
    let techPayments = 0;

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

        const statedistribution_url = `${config.apiUrl}/programs/conservation/rcpp/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });

        const chartData_url = `${config.apiUrl}/programs/conservation/rcpp/subprograms`;
        getJsonDataFromUrl(chartData_url).then((response) => {
            processData(response);
        });
    }, []);

    const processData = (chartData) => {
        if (chartData.programs === undefined) return;

        const cur1 = chartData.programs.find((s) => s.programName === "RCPP");

        totalRCPPPaymentInDollars = cur1.paymentInDollars;
        setTotalRcpp(totalRCPPPaymentInDollars);
        if (totalRCPPPaymentInDollars === 0) zeroCategory.push("RCPP");
        totalContracts = cur1.totalContracts;
        totalAcres = cur1.totalAcres;
        assistancePayments = cur1.assistancePaymentInDollars;
        reimbursePayments = cur1.reimbursePaymentInDollars;
        techPayments = cur1.techPaymentInDollars;

        setZeroCategories(zeroCategory);

        setTotalChartData([
            { name: "Total Financial Assistance Payments", value: assistancePayments, color: "#2F7164" },
            { name: "Total Reimbursable Payments", value: reimbursePayments, color: "#869397" },
            { name: "Total Techinical Assistance Payments", value: techPayments, color: "#9CBAB4" }
        ]);

        setTotalBenefit(
            // total benefit should be financial assistance payment
            assistancePayments.toLocaleString(undefined, { minimumFractionDigits: 2 }).toString().split(".")[0]
        );
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
                            subtext="Regional Conservation Partnership Program (RCPP)"
                        />
                    </Box>
                    <Drawer
                        setRCPPChecked={setChecked}
                        setCRPChecked={undefined}
                        setCSPChecked={undefined}
                        setEQIPChecked={undefined}
                        zeroCategories={zeroCategories}
                    />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        <Box component="div" sx={{ width: "85%", m: "auto", display: "block" }}>
                            <RCPPTotalMap
                                program="RCPP"
                                attribute={attribute}
                                year={year}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            display="flex"
                            justifyContent="center"
                            flexDirection="column"
                            sx={{
                                mt: 10,
                                mb: 2,
                                display: "block"
                            }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>RCPP: Regional Conservation Partnership Program</strong>
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h6" sx={{ my: 2 }}>
                                    Total Benefits ({year}):
                                    <strong> ${totalBenefit} </strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography sx={{ mt: 2 }}>
                                RCPP assists with the conservation, protection, restoration, and sustainable uses of
                                soil, water, wildlife, and related natural resources on a regional or watershed scale
                                and combines federal funding with private partner funding and other contributions. RCPP
                                works across multiple farms (or nonindustrial private forest operations) through
                                multiple conservation practices to achieve greater conservation outcomes, encourage
                                flexibility in program operation, and leverage private resources. Congress created the
                                RCPP in the Agricultural Act of 2014 and revised the program in the Agricultural
                                Improvement Act of 2018.
                            </Typography>
                        </Box>

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
                    </Box>
                </Box>
            ) : (
                <h1>Loading data...</h1>
            )}
        </ThemeProvider>
    );
}
