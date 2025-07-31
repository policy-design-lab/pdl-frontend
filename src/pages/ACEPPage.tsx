import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, Grid, ThemeProvider, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import ACEPTotalMap from "../components/acep/ACEPTotalMap";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";
import DataTable from "../components/acep/ACEPTotalTable";
import "../styles/subpage.css";
import { formatCurrency } from "../components/shared/ConvertionFormats";

export default function ACEPPage(): JSX.Element {
    const year = "2014-2023";
    const [checked, setChecked] = React.useState(0);

    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [zeroCategories, setZeroCategories] = React.useState([]);
    const [totalAcep, setTotalAcep] = React.useState(0);
    const [tab, setTab] = React.useState(0);

    const defaultTheme = createTheme();
    const zeroCategory = [];
    let totalACEPPaymentInDollars = 0;
    let totalContracts = 0;
    let totalAreaInAcres = 0;

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

        const statedistribution_url = `${config.apiUrl}/titles/title-ii/programs/acep/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });

        const chartData_url = `${config.apiUrl}/titles/title-ii/programs/acep/summary`;
        getJsonDataFromUrl(chartData_url).then((response) => {
            processData(response);
        });
    }, []);

    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const processData = (chartData) => {
        if (chartData === undefined) return;
        const cur1 = chartData;
        totalACEPPaymentInDollars = cur1.totalPaymentInDollars;
        setTotalAcep(totalACEPPaymentInDollars);
        if (totalACEPPaymentInDollars === 0) zeroCategory.push("ACEP");
        totalContracts = cur1.totalContracts;
        if (totalContracts === 0) zeroCategory.push("Total Contracts");
        totalAreaInAcres = cur1.totalAreaInAcres;
        if (totalAreaInAcres === 0) zeroCategory.push("Total Acres");
        setZeroCategories(zeroCategory);
    };
    function prepData(program, subprogram, data, dataYear) {
        const organizedData: Record<string, unknown>[] = [];
        const originalData: Record<string, unknown>[] = [];
        data[dataYear].forEach((stateData) => {
            const state = stateData.state;
            const programData = stateData;
            organizedData.push({
                state,
                acres: programData.totalAreaInAcres,
                payments: programData.totalPaymentInDollars,
                contracts: programData.totalContracts
            });
            originalData.push({
                state,
                acres: programData.totalAreaInAcres,
                payments: programData.totalPaymentInDollars,
                contracts: programData.totalContracts
            });
        });
        return [organizedData, originalData];
    }
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
                            subtext="Conversation Reserve Program (ACEP)"
                        />
                    </Box>
                    <Drawer
                        setACEPChecked={setChecked}
                        setCSPChecked={undefined}
                        setEQIPChecked={undefined}
                        zeroCategories={zeroCategories}
                    />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        <Box
                            component="div"
                            sx={{ width: "85%", m: "auto", display: checked !== 0 ? "none" : "block" }}
                        >
                            <ACEPTotalMap
                                program="ACEP"
                                attribute="payments"
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
                            sx={{ mt: 10, mb: 2, display: "block" }}
                        >
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>ACEP: Agriculture Conservation Easement Program</strong>
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h6" sx={{ my: 2 }}>
                                    Total Benefits ({year}):
                                    <strong>{formatCurrency(totalAcep, 0)}</strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography sx={{ mt: 2 }}>
                                A conservation easement is a permanent (or long term) property right in agricultural
                                land for conservation of natural resources. Agricultural Land Easements (ALE) limit
                                non-agricultural uses of eligible land, including grazing land, to protect farmland from
                                development or other pressures and works through land trusts or other entities such as
                                state and local governments. Wetland Reserve Easements (WRE) protect, restore, and
                                enhance wetlands that have been previously degraded due to agricultural uses. In the
                                Agricultural Act of 2014, Congress combined existing conservation easement programs into
                                a single program.
                            </Typography>
                        </Box>
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
                    </Box>
                </Box>
            ) : (
                <h1>Loading data...</h1>
            )}
        </ThemeProvider>
    );
}
