import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/ProgramDrawer";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import NavSearchBar from "../components/shared/NavSearchBar";
import Title2TotalMap from "../components/title2/Title2TotalMap";
import DataTable from "../components/title2/Title2TotalTable";

export default function TitleIIPage(): JSX.Element {
    const defaultTheme = createTheme();
    const [allStates, setAllStates] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allPrograms, setAllPrograms] = React.useState([]);
    const [summary, setSummary] = React.useState([]);
    const [stateDistributionData, setStateDistributionData] = React.useState({});

    const total_year = "2014-2023";
    React.useEffect(() => {
        // For landing page map only.
        const allprograms_url = `${config.apiUrl}/allprograms`;
        getJsonDataFromUrl(allprograms_url).then((response) => {
            setAllPrograms(response);
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

        const summary_url = `${config.apiUrl}/summary`;
        getJsonDataFromUrl(summary_url).then((response) => {
            setSummary(response);
        });

        const statedistribution_url = `${config.apiUrl}/titles/title-ii/state-distribution`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            const transformed = transformStatePerformance(response);
            setStateDistributionData(transformed);
        });
    }, []);
    const transformStatePerformance = (rawData) => {
        const years = Object.keys(rawData).filter(
            (key) => /^\d{4}$/.test(key) && Number(key) >= 2014 && Number(key) <= 2023
        );

        const summaryArray = rawData[total_year];
        if (!Array.isArray(summaryArray)) return { [total_year]: [] };

        const stateMap = {};
        // Initialize with the summary data
        summaryArray.forEach((entry) => {
            const { state, totalPaymentInDollars, totalRecipients } = entry;
            stateMap[state] = {
                state,
                totalPaymentInDollars,
                totalRecipients,
                years: {}
            };
        });

        // Add per-year breakdown
        years.forEach((year) => {
            rawData[year].forEach((entry) => {
                const { state, totalPaymentInDollars } = entry;
                if (stateMap[state]) {
                    stateMap[state].years[year] = {
                        totalPaymentInDollars
                    };
                }
            });
        });

        return {
            [total_year]: Object.values(stateMap)
        };
    };

    const isDataLoaded = React.useMemo(() => {
        return (
            allStates.length > 0 &&
            allPrograms.length > 0 &&
            summary.length > 0 &&
            stateDistributionData &&
            Object.keys(stateDistributionData).length > 0 &&
            Object.keys(stateCodesData).length > 0
        );
    }, [allStates, allPrograms, summary, stateCodesData, stateDistributionData]);

    return (
        <ThemeProvider theme={defaultTheme}>
            {isDataLoaded ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar
                            text="Conservation Programs (Title II)"
                            subtext="Total Conservation Programs (Title II)"
                        />
                    </Box>
                    <Drawer />
                    <Box sx={{ pl: 50, pr: 20 }}>
                        <Box component="div" sx={{ width: "100%", m: "auto", pt: 6 }}>
                            <Title2TotalMap
                                program="Title II: Conservation"
                                attribute="payments"
                                year={total_year}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStates}
                            />
                        </Box>
                        <Box display="flex" justifyContent="center" flexDirection="column" sx={{ mt: 10, mb: 2 }}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5">
                                    <strong>TitleII: State Performance by Category of Practices</strong>
                                </Typography>
                            </Box>
                            <Typography sx={{ mt: 2 }}>
                                TitleII provides cost-share assistance for improvements to eligible land. In the
                                statute, Congress defined seven categories of conservation practices: (1) structural
                                practices, such as for irrigation and livestock manure management or abatement; (2) land
                                management practices, such as for fencing, drainage water management, grazing,
                                prescribed burning, and wildlife habitat; (3) vegetative practices, such as planting
                                filter strips, cover crops, grassed waterways, field borders, windbreaks, and
                                shelterbelts; (4) forest management practices, which include planting trees and shrubs,
                                improving forest stands, planting riparian forest buffers, and treating residues; (5)
                                soil testing practices; (6) soil remediation practices, such as residue and tillage
                                management (no-till, mulch-till, or strip-till), and amendments for treating
                                agricultural wastes; and (7) other practices, including integrated pest management, dust
                                control, and energy improvements.
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="center" component="div" sx={{ mt: 10, mb: 2 }}>
                            <DataTable
                                TableTitle={`Total Conservation Programs (Title II) from ${total_year}`}
                                statePerformance={stateDistributionData}
                                year={total_year}
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
