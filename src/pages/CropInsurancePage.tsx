import Box from "@mui/material/Box";
import * as React from "react";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import {
    CircularProgress,
    createTheme,
    Grid,
    ThemeProvider,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import NavBar from "../components/NavBar";
import CropInsuranceMap from "../components/cropinsurance/CropInsuranceMap";
import NavSearchBar from "../components/shared/NavSearchBar";
import CropInsuranceProgramTable from "../components/cropinsurance/CropInsuranceTable";
import SideBar from "../components/cropinsurance/sideBar/ShortSideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import "../styles/subpage.css";

import "../styles/cropinsurance.css";
import CropInsuranceBubble from "../components/cropinsurance/chart/CropInsuranceBubble";
import CropInsuranceBars from "../components/cropinsurance/chart/CropInsuranceBars";
import CropInsuranceCountySection from "../components/cropinsurance/CropInsuranceCountySection";
import { loadCropInsuranceCountyData } from "../components/cropinsurance/cropSelection/loadCropInsuranceCountyData";
import { useMapUrlState } from "../utils/useMapUrlState";
import { cropInsuranceMapIdByChecked } from "../utils/linkUtil";

const cropInsuranceCheckedByMapId = Object.entries(cropInsuranceMapIdByChecked).reduce(
    (acc, [checked, mapId]) => {
        acc[mapId] = checked;
        return acc;
    },
    {} as Record<string, string>
);

const cropInsuranceMapIds = Object.values(cropInsuranceMapIdByChecked);
const cropInsuranceDefaultMapId = cropInsuranceMapIdByChecked["0"];

export default function CropInsurancePage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const { mapId, level, setMapId, setMapAndLevel } = useMapUrlState({
        mapIds: cropInsuranceMapIds,
        defaultMapId: cropInsuranceDefaultMapId,
        defaultLevel: "state"
    });
    const [checked, setChecked] = React.useState(() => cropInsuranceCheckedByMapId[mapId] ?? "0");
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [countyDistributionData, setCountyDistributionData] = React.useState({});
    const [countyDataLoading, setCountyDataLoading] = React.useState(false);
    const [countyDataLoaded, setCountyDataLoaded] = React.useState(false);
    const [selectedCountyState, setSelectedCountyState] = React.useState("All States");
    const [countyViewUpdating, setCountyViewUpdating] = React.useState(false);
    const countyStateUpdateTimerRef = React.useRef<number | null>(null);
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);
    const [initChartWidthRatio] = React.useState(0.9);
    const cropInsuranceDiv = React.useRef(null);
    const mapColor: [string, string, string, string, string] = ["#C26C06", "#CCECE6", "#66C2A4", "#238B45", "#005C24"];
    const startYear = 2014;
    const endYear = 2024;

    React.useEffect(() => {
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStatesData(response);
        });
        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });
        const statedistribution_url = `${config.apiUrl}/titles/title-xi/programs/crop-insurance/state-distribution?start_year=${startYear}&end_year=${endYear}`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            setStateDistributionData(response);
        });
    }, []);

    React.useEffect(() => {
        try {
            sessionStorage.removeItem(`cropInsurance_countyData_${startYear}_${endYear}`);
        } catch {
            // ignore
        }
    }, []);

    const countyRequestSeqRef = React.useRef(0);

    const fetchCountyData = React.useCallback((years: string[]) => {
        const requested = Array.from(new Set(years)).sort();
        if (requested.length === 0) return;
        countyRequestSeqRef.current += 1;
        const requestSeq = countyRequestSeqRef.current;
        setCountyDataLoading(true);
        loadCropInsuranceCountyData(requested)
            .then((response) => {
                if (requestSeq !== countyRequestSeqRef.current) return;
                setCountyDistributionData(response);
                setCountyDataLoaded(true);
            })
            .catch((error) => {
                console.error("error loading crop insurance county data", error);
            })
            .finally(() => {
                if (requestSeq === countyRequestSeqRef.current) {
                    setCountyDataLoading(false);
                }
            });
    }, []);

    React.useEffect(
        () => () => {
            if (countyStateUpdateTimerRef.current !== null) {
                clearTimeout(countyStateUpdateTimerRef.current);
            }
        },
        []
    );

    const handleCountyStateChange = React.useCallback(
        (nextState: string) => {
            if (nextState === selectedCountyState) {
                return;
            }
            if (countyStateUpdateTimerRef.current !== null) {
                clearTimeout(countyStateUpdateTimerRef.current);
            }
            setCountyViewUpdating(true);
            countyStateUpdateTimerRef.current = window.setTimeout(() => {
                setSelectedCountyState(nextState);
                countyStateUpdateTimerRef.current = window.setTimeout(() => {
                    setCountyViewUpdating(false);
                    countyStateUpdateTimerRef.current = null;
                }, 220);
            }, 0);
        },
        [selectedCountyState]
    );

    React.useEffect(() => {
        const nextChecked = cropInsuranceCheckedByMapId[mapId] ?? "0";
        if (nextChecked !== checked) {
            setChecked(nextChecked);
        }
    }, [mapId, checked]);

    const handleCheckedChange = React.useCallback(
        (value: string) => {
            setChecked(value);
            setMapId(cropInsuranceMapIdByChecked[value] ?? cropInsuranceDefaultMapId);
        },
        [setMapId]
    );

    const switchChartTable = (_event: React.MouseEvent<HTMLElement>, newTab: number | null) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const defaultTheme = createTheme();

    const setBubbleData = (year: string) => {
        const res: any[] = [];
        stateDistributionData[year].forEach((stateData: any) => {
            const initObject = {
                State: stateData.state,
                TotalIndemnities: stateData.totalIndemnitiesInDollars,
                TotalFarmerPaidPremium: stateData.totalFarmerPaidPremiumInDollars,
                OriginalNetFarmerBenefit: stateData.totalNetFarmerBenefitInDollars,
                NetFarmerBenefit: 0
            };
            res.push(initObject);
        });
        return res;
    };

    const subtextMatch = {
        "0": "Total Net Farmer Benefits",
        "01": "Total Farmer Paid Premium",
        "00": "Total Indemnities",
        "02": "Total Premium",
        "03": "Total Premium Subsidy",
        "1": "Loss Ratio",
        "2": "Average Liabilities",
        "3": "Total Policies Earning Premium",
        "4": "Average Acres Insured"
    };

    const renderStateChartTableContent = (
        showBubble: boolean,
        checkedMenu: string,
        tableTitle: string,
        attributes: string[]
    ) => (
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
                <Typography className="stateTitle" variant="h6">
                    Performance by States
                </Typography>
                <ToggleButtonGroup
                    className="ChartTableToggle"
                    value={tab}
                    exclusive
                    onChange={switchChartTable}
                    aria-label="CropInsurance toggle button group"
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
                <Box className="cropInsuranceTableContainer" sx={{ display: tab !== 0 ? "none" : "div" }}>
                    {showBubble && (
                        <CropInsuranceBubble
                            originalData={setBubbleData(`${startYear}-${endYear}`)}
                            stateCodesData={stateCodesData}
                            initChartWidthRatio={initChartWidthRatio}
                            startYear={startYear}
                            endYear={endYear}
                        />
                    )}
                    <CropInsuranceBars
                        stateDistributionData={stateDistributionData}
                        checkedMenu={checkedMenu}
                        initChartWidthRatio={initChartWidthRatio}
                        yearKey={`${startYear}-${endYear}`}
                    />
                </Box>
                <Box className="cropInsuranceTableContainer" sx={{ display: tab !== 1 ? "none" : "div" }}>
                    <CropInsuranceProgramTable
                        tableTitle={tableTitle}
                        program="Crop Insurance"
                        attributes={attributes}
                        skipColumns={[]}
                        stateCodes={stateCodesData}
                        CropInsuranceData={stateDistributionData}
                        year={`${startYear}-${endYear}`}
                        colors={[]}
                    />
                </Box>
            </Grid>
        </Box>
    );

    const renderStateTableOnlyContent = (tableTitle: string, attributes: string[]) => (
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Box
                    className="chartArea narrowChartArea"
                    component="div"
                    ref={cropInsuranceDiv}
                    sx={{
                        width: "100%",
                        m: "auto"
                    }}
                >
                    <CropInsuranceProgramTable
                        tableTitle={tableTitle}
                        program="Crop Insurance"
                        attributes={attributes}
                        skipColumns={[]}
                        stateCodes={stateCodesData}
                        CropInsuranceData={stateDistributionData}
                        year={`${startYear}-${endYear}`}
                        colors={[]}
                    />
                </Box>
            </Grid>
        </Grid>
    );

    const renderStateMap = (attribute: string) => (
        <CropInsuranceMap
            program="Crop Insurance"
            attribute={attribute}
            year={`${startYear}-${endYear}`}
            mapColor={mapColor}
            statePerformance={stateDistributionData}
            stateCodes={stateCodesData}
            allStates={allStatesData}
        />
    );

    const commonSectionProps = {
        mapColor,
        countyDistributionData,
        stateCodesData,
        allStatesData,
        selectedCountyState,
        onCountyStateChange: handleCountyStateChange,
        countyDataLoading,
        onCountyDataRequest: fetchCountyData,
        hasCountyData: countyDataLoaded,
        level
    };

    const benefitAttributes = [
        "totalNetFarmerBenefitInDollars",
        "totalIndemnitiesInDollars",
        "totalFarmerPaidPremiumInDollars",
        "totalPremiumSubsidyInDollars"
    ];
    const benefitStateTitle = `Total Net Farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy (${startYear}-${endYear})`;
    const benefitCountyTitle = `Total Net Farmer Benefits, Total Indemnities, Total Farmer Paid Premium and Premium Subsidy by County (${startYear}-${endYear})`;

    return (
        <ThemeProvider theme={defaultTheme}>
            {countyDataLoading && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ color: "#2F7164" }}>
                        Loading county data...
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                        This may take longer the first time. Subsequent loads will be faster.
                    </Typography>
                </Box>
            )}
            {!countyDataLoading && countyViewUpdating && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.72)",
                        zIndex: 9998,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <CircularProgress size={44} />
                    <Typography variant="h6" sx={{ color: "#2F7164" }}>
                        Updating county map and table...
                    </Typography>
                </Box>
            )}
            {Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Crop Insurance" subtext={subtextMatch[checked]} />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    <SideBar setCropInsuranceChecked={handleCheckedChange} selectedValue={checked} />
                    {/* Net Farmer Premium Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "0" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalNetFarmerBenefit"
                            metricLabel="Total Net Farmer Benefits"
                            isVisible={checked === "0"}
                            stateMapComponent={renderStateMap("totalNetFarmerBenefit")}
                            stateContentComponent={renderStateChartTableContent(
                                true,
                                checked,
                                benefitStateTitle,
                                benefitAttributes
                            )}
                            countyTableTitle={benefitCountyTitle}
                            countyTableAttributes={benefitAttributes}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["0"], nextLevel)}
                        />
                    </Box>
                    {/* Total Farmer Paid Premium Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "01" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalFarmerPaidPremium"
                            metricLabel="Total Farmer Paid Premium"
                            isVisible={checked === "01"}
                            stateMapComponent={renderStateMap("totalFarmerPaidPremium")}
                            stateContentComponent={renderStateChartTableContent(
                                true,
                                checked,
                                benefitStateTitle,
                                benefitAttributes
                            )}
                            countyTableTitle={benefitCountyTitle}
                            countyTableAttributes={benefitAttributes}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["01"], nextLevel)}
                        />
                    </Box>
                    {/* Total Indemnities Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "00" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalIndemnities"
                            metricLabel="Total Indemnities"
                            isVisible={checked === "00"}
                            stateMapComponent={renderStateMap("totalIndemnities")}
                            stateContentComponent={renderStateChartTableContent(
                                true,
                                checked,
                                benefitStateTitle,
                                benefitAttributes
                            )}
                            countyTableTitle={benefitCountyTitle}
                            countyTableAttributes={benefitAttributes}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["00"], nextLevel)}
                        />
                    </Box>
                    {/* Total Premium Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "02" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalPremium"
                            metricLabel="Total Premium"
                            isVisible={checked === "02"}
                            stateMapComponent={renderStateMap("totalPremium")}
                            stateContentComponent={renderStateChartTableContent(
                                true,
                                checked,
                                benefitStateTitle,
                                benefitAttributes
                            )}
                            countyTableTitle={benefitCountyTitle}
                            countyTableAttributes={benefitAttributes}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["02"], nextLevel)}
                        />
                    </Box>
                    {/* Total Premium Subsidy Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "03" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalPremiumSubsidy"
                            metricLabel="Total Premium Subsidy"
                            isVisible={checked === "03"}
                            stateMapComponent={renderStateMap("totalPremiumSubsidy")}
                            stateContentComponent={renderStateChartTableContent(
                                true,
                                checked,
                                benefitStateTitle,
                                benefitAttributes
                            )}
                            countyTableTitle={benefitCountyTitle}
                            countyTableAttributes={benefitAttributes}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["03"], nextLevel)}
                        />
                    </Box>
                    {/* Loss Ratio Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "1" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="lossRatio"
                            metricLabel="Loss Ratio"
                            isVisible={checked === "1"}
                            stateMapComponent={renderStateMap("lossRatio")}
                            stateContentComponent={renderStateTableOnlyContent(`Loss Ratio (${startYear}-${endYear})`, [
                                "lossRatio"
                            ])}
                            countyTableTitle={`Loss Ratio by County (${startYear}-${endYear})`}
                            countyTableAttributes={["lossRatio"]}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["1"], nextLevel)}
                        />
                    </Box>
                    {/* Liabilities Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "2" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="averageLiabilities"
                            metricLabel="Average Liabilities"
                            isVisible={checked === "2"}
                            stateMapComponent={renderStateMap("averageLiabilities")}
                            stateContentComponent={renderStateTableOnlyContent(
                                `Average Liabilities (${startYear}-${endYear})`,
                                ["averageLiabilitiesInDollars"]
                            )}
                            countyTableTitle={`Average Liabilities by County (${startYear}-${endYear})`}
                            countyTableAttributes={["averageLiabilitiesInDollars"]}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["2"], nextLevel)}
                        />
                    </Box>
                    {/* Policy Earning Premium Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "3" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="totalPoliciesEarningPremium"
                            metricLabel="Total Policies Earning Premium"
                            isVisible={checked === "3"}
                            stateMapComponent={renderStateMap("totalPoliciesEarningPremium")}
                            stateContentComponent={
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
                                        <Typography className="stateTitle" variant="h6">
                                            Performance by States
                                        </Typography>
                                        <ToggleButtonGroup
                                            className="ChartTableToggle"
                                            value={tab}
                                            exclusive
                                            onChange={switchChartTable}
                                            aria-label="CropInsurance toggle button group"
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
                                            <CropInsuranceBars
                                                stateDistributionData={stateDistributionData}
                                                checkedMenu="totalPoliciesEarningPremium"
                                                initChartWidthRatio={initChartWidthRatio}
                                                yearKey={`${startYear}-${endYear}`}
                                            />
                                        </Box>
                                        <Box
                                            className="cropInsuranceTableContainer"
                                            sx={{ display: tab !== 1 ? "none" : "div" }}
                                        >
                                            <CropInsuranceProgramTable
                                                tableTitle={`Total Policies Earning Premium and Total Indemnities (${startYear}-${endYear})`}
                                                program="Crop Insurance"
                                                attributes={[
                                                    "totalPoliciesEarningPremium",
                                                    "totalIndemnitiesInDollars"
                                                ]}
                                                skipColumns={[]}
                                                stateCodes={stateCodesData}
                                                CropInsuranceData={stateDistributionData}
                                                year={`${startYear}-${endYear}`}
                                                colors={[]}
                                            />
                                        </Box>
                                    </Grid>
                                </Box>
                            }
                            countyTableTitle={`Total Policies Earning Premium and Total Indemnities by County (${startYear}-${endYear})`}
                            countyTableAttributes={["totalPoliciesEarningPremium", "totalIndemnitiesInDollars"]}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["3"], nextLevel)}
                        />
                    </Box>
                    {/* Average Acres Insured Section */}
                    <Box
                        component="div"
                        className="fullWidthMainContent"
                        sx={{ display: checked !== "4" ? "none" : "block" }}
                    >
                        <CropInsuranceCountySection
                            {...commonSectionProps}
                            attribute="averageInsuredAreaInAcres"
                            metricLabel="Average Insured Area in Acres"
                            isVisible={checked === "4"}
                            stateMapComponent={renderStateMap("averageInsuredAreaInAcres")}
                            stateContentComponent={renderStateTableOnlyContent(
                                `Average Insured Area in Acres (${startYear}-${endYear})`,
                                ["averageInsuredAreaInAcres"]
                            )}
                            countyTableTitle={`Average Insured Area in Acres by County (${startYear}-${endYear})`}
                            countyTableAttributes={["averageInsuredAreaInAcres"]}
                            onLevelChange={(nextLevel) => setMapAndLevel(cropInsuranceMapIdByChecked["4"], nextLevel)}
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
