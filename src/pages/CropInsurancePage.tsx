import Box from "@mui/material/Box";
import * as React from "react";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import {
    CircularProgress,
    createTheme,
    FormControlLabel,
    Grid,
    MenuItem,
    RadioGroup,
    SvgIcon,
    ThemeProvider,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import NavBar from "../components/NavBar";
import CropInsuranceMap from "../components/cropInsurance/CropInsuranceMap";
import NavSearchBar from "../components/shared/NavSearchBar";
import CropInsuranceProgramTable from "../components/cropInsurance/CropInsuranceTable";
import SideBar from "../components/cropInsurance/sideBar/ShortSideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import data from "../data/test.json";
import local_statecodes from "../data/statecodes.json";
import local_allstates from "../data/states.json";
import testData from "../data/ci_test_only.json";
import "../styles/subpage.css";
import CropInsuranceBubble from "../components/cropinsurance/chart/CropInsuranceBubble";

export default function CropInsurancePage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [initChartWidthRatio, setChartMapWidthRatio] = React.useState(0.9);
    const [chartData, setChartData] = React.useState({});
    const cropInsuranceDiv = React.useRef(null);
    const [checked, setChecked] = React.useState("0");
    const mapColor = ["#A1622F", "#DCC287", "#E3E3E3", "#89CBC1", "#2C8472"];

    React.useEffect(() => {
        // const allstates_url = `${config.apiUrl}/states`;
        // getJsonDataFromUrl(allstates_url).then((response) => {
        //     setAllStatesData(response);
        //     console.log(allStatesData);
        // });
        setAllStatesData(local_allstates);
        // const statecode_url = `${config.apiUrl}/statecodes`;
        // getJsonDataFromUrl(statecode_url).then((response) => {
        //     const converted_json = convertAllState(response);
        //     setStateCodesData(converted_json);
        // });
        setStateCodesData(convertAllState(local_statecodes));
        setStateDistributionData(testData);
        // const subprograms_url = `${config.apiUrl}/programs/commodities/subprograms`;
        // getJsonDataFromUrl(subprograms_url).then((response) => {
        //     setChartData(response);
        // });
        // const statedistribution_url = `${config.apiUrl}/programs/commodities/state-distribution`;
        // getJsonDataFromUrl(statedistribution_url).then((response) => {
        //     setStateDistributionData(response);
        // });dd
        if (window.innerWidth >= 1920) {
            // initTreeMapWidthRatio = 0.7;
        }
    }, []);

    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const defaultTheme = createTheme();
    //Need Object
    // 2018-2022
    // :
    // Array(50)
    // 0
    // :
    // {state: 'TX', programs: Array(4), totalPaymentInPercentageNationwide: 11.33, totalPaymentInDollars: 2945702780.86}
    // 1
    // :
    // {state: 'AR', programs: Array(4), totalPaymentInPercentageNationwide: 6.57, totalPaymentInDollars: 1708889835.63}
    // 2
    // :
    // {state: 'KS', programs: Array(4), totalPaymentInPercentageNationwide: 6.44, totalPaymentInDollars: 1675067481.78}

    // Real!
    // {2018-2022: Array(50)}
    // 2018-2022
    // :
    // Array(50)
    // 0
    // :
    // programs
    // :
    // Array(1)
    // 0
    // :
    // {programName: 'Crop Insurance', totalIndemnitiesInDollars: 5237837748, totalPremiumInDollars: 4123284822, totalPremiumSubsidyInDollars: 2773200473, totalFarmerPaidPremiumInDollars: 1350084349, …}
    // length
    // :
    // 1
    // [[Prototype]]
    // :
    // Array(0)
    // state
    // :
    // "AL"

    function prepData(program, attribute, data, year) {
        const organizedData: Record<string, unknown>[] = [];
        const originalData: Record<string, unknown>[] = [];
        data[year].forEach((stateData) => {
            const state = stateData.state;
            const programData = stateData.programs.filter((p) => {
                return p.programName.toString() === program;
            });
            const attributeData = programData[0][attribute];
            organizedData.push({
                state,
                attribute: attributeData
            });
            originalData.push({
                state,
                attribute: attributeData
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
                        <NavSearchBar text="Crop Insurance" />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    <SideBar setCropInsuranceChecked={setChecked} />
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "0" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalIndemnities"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                        <Box
                            className="chartArea"
                            component="div"
                            ref={cropInsuranceDiv}
                            sx={{
                                width: "100%",
                                m: "auto"
                            }}
                        >
                            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                                <Typography className="stateTitle" variant="h4">
                                    Comparison by States
                                </Typography>
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="SNAP toggle button group"
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <ToggleButton value={0}>
                                        <InsertChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <TableChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                container
                                columns={{ xs: 12 }}
                                sx={{
                                    paddingTop: 6,
                                    justifyContent: "center"
                                }}
                            >
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 0 ? "none" : "div" }}
                                >
                                    <CropInsuranceBubble originalData={data} initChartWidthRatio={initChartWidthRatio}/>
                                </Box>
                                <Box
                                    className="cropInsuranceTableContainer"
                                    sx={{ display: tab !== 1 ? "none" : "div" }}
                                >
                                    <CropInsuranceProgramTable
                                        tableTitle="Total Net farmer Benefits and Total Indemnities and Farmer Paid Premium (2018-2022)"
                                        program="Crop Insurance"
                                        attributes={[
                                            "totalNetFarmerBenefitInDollars",
                                            "totalIndemnitiesInDollars",
                                            "totalFarmerPaidPremiumInDollars"
                                        ]}
                                        skipColumns={[]}
                                        stateCodes={stateCodesData}
                                        CropInsuranceData={stateDistributionData}
                                        year="2018-2022"
                                        colors={[]}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "1" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "2" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPremiumSubsidy"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "3" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalFarmerPaidPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "4" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalNetFarmerBenefit"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "5" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalPoliciesEarningPremium"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "6" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="totalLiabilities"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                    <Box
                        component="div"
                        className="halfWidthMainContent"
                        sx={{ display: checked !== "7" ? "none" : "block" }}
                    >
                        <Box
                            className="mapArea"
                            component="div"
                            sx={{
                                width: "85%",
                                m: "auto"
                            }}
                        >
                            <CropInsuranceMap
                                program="Crop Insurance"
                                attribute="averageLossRatio"
                                year="2018-2022"
                                mapColor={mapColor}
                                statePerformance={stateDistributionData}
                                stateCodes={stateCodesData}
                                allStates={allStatesData}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: 50
                            }}
                        />
                    </Box>
                </Box>
            ) : (
                <div className="dataLoading">
                    <CircularProgress />
                    Loading data...
                </div>
            )}
        </ThemeProvider>
    );
}
