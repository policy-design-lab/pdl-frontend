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
import Title1SubtitleMap from "../components/title1/Title1SubtitleMap";
import NavSearchBar from "../components/shared/NavSearchBar";
import Title1TreeMap from "../components/title1/Title1TreeMap";
import Title1ProgramTable from "../components/title1/Title1ProgramTable";
import SideBar from "../components/title1/sideBar/SideBar";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";
import "../styles/subpage.css";
import Title1TotalMap from "../components/title1/Title1TotalMap";
import DataTable from "../components/title1/Title1TotalTable";
import MapTableWithLevelSwitch from "../components/shared/MapTableWithLevelSwitch";
import Title1CountyMap from "../components/title1/Title1CountyMap";
import Title1CountyTable from "../components/title1/Title1CountyTable";
import { title1MapIdByChecked } from "../utils/linkUtil";
import { useMapUrlState } from "../utils/useMapUrlState";
import countyFipsToName from "../files/maps/fips_county_mapping.json";
import fipsToState from "../files/maps/fipsToStateMap";
import {
    title1CountyEndpointByKey,
    Title1CountyColumnConfig,
    Title1CountyDatasetKey,
    Title1CountySelector
} from "../components/title1/title1County";

const title1CheckedByMapId = Object.entries(title1MapIdByChecked).reduce(
    (acc, [checked, mapId]) => {
        acc[mapId] = checked;
        return acc;
    },
    {} as Record<string, string>
);

const title1MapIds = Object.values(title1MapIdByChecked);
const title1DefaultMapId = title1MapIdByChecked["0"];

interface Title1CountyViewConfig extends Title1CountySelector {
    datasetKey: Title1CountyDatasetKey;
    title: string;
    tableTitle: string;
    columns: Title1CountyColumnConfig[];
}

const countyColumnsByChecked: Record<string, Title1CountyColumnConfig[]> = {
    0: [{ accessor: "totalPaymentInDollars", header: "TOTAL TITLE I BENEFITS", type: "currency" }],
    1: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" }
    ],
    2: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "averageAreaInAcres", header: "AVG. BASE ACRES", type: "number" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" }
    ],
    20: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageAreaInAcres", header: "AVG. BASE ACRES", type: "number" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" }
    ],
    21: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageAreaInAcres", header: "AVG. BASE ACRES", type: "number" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" }
    ],
    3: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "averageAreaInAcres", header: "AVG. BASE ACRES", type: "number" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" }
    ],
    4: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        }
    ],
    5: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        }
    ],
    50: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        },
        {
            accessor: "averageRecipientCountInPercentageWithinState",
            header: "AVG. RECIPIENTS PCT. WITHIN STATE",
            type: "percent"
        }
    ],
    51: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        },
        {
            accessor: "averageRecipientCountInPercentageWithinState",
            header: "AVG. RECIPIENTS PCT. WITHIN STATE",
            type: "percent"
        }
    ],
    52: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        },
        {
            accessor: "averageRecipientCountInPercentageWithinState",
            header: "AVG. RECIPIENTS PCT. WITHIN STATE",
            type: "percent"
        }
    ],
    53: [
        { accessor: "totalPaymentInDollars", header: "PAYMENT", type: "currency" },
        { accessor: "totalPaymentInPercentageNationwide", header: "PAYMENT PCT. NATIONWIDE", type: "percent" },
        { accessor: "totalPaymentInPercentageWithinState", header: "PAYMENT PCT. WITHIN STATE", type: "percent" },
        { accessor: "averageRecipientCount", header: "AVG. RECIPIENTS", type: "number" },
        {
            accessor: "averageRecipientCountInPercentageNationwide",
            header: "AVG. RECIPIENTS PCT. NATIONWIDE",
            type: "percent"
        },
        {
            accessor: "averageRecipientCountInPercentageWithinState",
            header: "AVG. RECIPIENTS PCT. WITHIN STATE",
            type: "percent"
        }
    ]
};

const emptyCountyDatasetState = {
    titleI: {},
    subtitleA: {},
    subtitleD: {},
    subtitleE: {}
};

const emptyCountyLoadingState = {
    titleI: false,
    subtitleA: false,
    subtitleD: false,
    subtitleE: false
};

type Title1CountyDataset = {
    __title1Formatted?: boolean;
    [key: string]: any;
};

function transformTitleICountySummary(rawData, totalYear) {
    if (Array.isArray(rawData?.[totalYear])) {
        return {
            [totalYear]: rawData[totalYear]
                .map((countyRecord: any) => {
                    const countyFips = String(countyRecord.countyFips || "").padStart(5, "0");
                    const stateFips = countyFips.slice(0, 2);
                    return {
                        ...countyRecord,
                        countyFips,
                        countyName: countyRecord.countyName || countyFipsToName[countyFips] || countyFips,
                        state: countyRecord.state || fipsToState[stateFips] || ""
                    };
                })
                .sort((left: any, right: any) => {
                    return Number(right.totalPaymentInDollars) - Number(left.totalPaymentInDollars);
                })
        };
    }
    const summaryMap = new Map<string, any>();
    Object.entries(rawData || {}).forEach(([yearKey, countyRows]) => {
        if (!/^\d{4}$/.test(yearKey) || !Array.isArray(countyRows)) {
            return;
        }
        countyRows.forEach((countyRecord: any) => {
            const countyFips = String(countyRecord.countyFips || "").padStart(5, "0");
            if (!countyFips) {
                return;
            }
            const stateFips = countyFips.slice(0, 2);
            const existing = summaryMap.get(countyFips) || {
                countyFips,
                countyName: countyRecord.countyName || countyFipsToName[countyFips] || countyFips,
                state: countyRecord.state || fipsToState[stateFips] || "",
                totalPaymentInDollars: 0,
                totalRecipientCount: 0
            };
            existing.totalPaymentInDollars += Number(countyRecord.totalPaymentInDollars) || 0;
            existing.totalRecipientCount += Number(countyRecord.totalRecipientCount) || 0;
            summaryMap.set(countyFips, existing);
        });
    });
    return {
        [totalYear]: Array.from(summaryMap.values()).sort((left, right) => {
            return Number(right.totalPaymentInDollars) - Number(left.totalPaymentInDollars);
        })
    };
}

function formatTitleICountyDataset(rawData: Title1CountyDataset, totalYear: string): Title1CountyDataset {
    if (rawData?.__title1Formatted) {
        return rawData;
    }
    return {
        ...transformTitleICountySummary(rawData, totalYear),
        __title1Formatted: true
    };
}

export default function TitleIPage(): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const { mapId, level, setMapId, setMapAndLevel } = useMapUrlState({
        mapIds: title1MapIds,
        defaultMapId: title1DefaultMapId,
        defaultLevel: "state"
    });
    const [checked, setChecked] = React.useState(() => title1CheckedByMapId[mapId] ?? "0");
    const [stateDistributionData, setStateDistributionData] = React.useState({});
    const [subtitleADistributionData, setSubtitleADistributionData] = React.useState({});
    const [subtitleEStateDistributionData, setSubtitleEStateDistributionData] = React.useState({});
    const [subtitleDStateDistributionData, setSubtitleDStateDistributionData] = React.useState({});
    const [countyDistributionData, setCountyDistributionData] =
        React.useState<Record<Title1CountyDatasetKey, any>>(emptyCountyDatasetState);
    const [countyDataLoading, setCountyDataLoading] =
        React.useState<Record<Title1CountyDatasetKey, boolean>>(emptyCountyLoadingState);
    const [countyDataLoaded, setCountyDataLoaded] =
        React.useState<Record<Title1CountyDatasetKey, boolean>>(emptyCountyLoadingState);
    const [selectedCountyState, setSelectedCountyState] = React.useState("All States");
    const [countyViewUpdating, setCountyViewUpdating] = React.useState(false);
    const countyStateUpdateTimerRef = React.useRef<number | null>(null);
    const [stateCodesData, setStateCodesData] = React.useState({});
    const [stateCodesArray, setStateCodesArray] = React.useState({});
    const [allStatesData, setAllStatesData] = React.useState([]);

    const title1Div = React.useRef(null);
    const mapColor: [string, string, string, string, string] = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];
    const initTreeMapWidthRatio = 0.55;
    const start_year = 2014;
    const end_year = 2023;
    const total_year = `${start_year}-${end_year}`;

    const countyViewConfigByChecked = React.useMemo<Record<string, Title1CountyViewConfig>>(
        () => ({
            0: {
                datasetKey: "titleI",
                title: "Total Commodities Programs (Title I)",
                tableTitle: `Comparing Total Title I Benefits by County (${total_year})`,
                columns: countyColumnsByChecked["0"]
            },
            1: {
                datasetKey: "subtitleA",
                title: "Total Commodities Programs, Subtitle A",
                tableTitle: `Comparing Total Payments for Subtitle A by County (${total_year})`,
                columns: countyColumnsByChecked["1"]
            },
            2: {
                datasetKey: "subtitleA",
                title: "Agriculture Risk Coverage (ARC)",
                tableTitle: `Comparing ARC Payments, Avg. Payment Recipients and Avg. Base Acres by County (${total_year})`,
                columns: countyColumnsByChecked["2"],
                program: "Agriculture Risk Coverage (ARC)"
            },
            20: {
                datasetKey: "subtitleA",
                title: "Agriculture Risk Coverage County Option (ARC-CO)",
                tableTitle: `Comparing ARC-CO Payments, Avg. Payment Recipients and Avg. Base Acres by County (${total_year})`,
                columns: countyColumnsByChecked["20"],
                program: "Agriculture Risk Coverage (ARC)",
                subprogram: "Agriculture Risk Coverage County Option (ARC-CO)"
            },
            21: {
                datasetKey: "subtitleA",
                title: "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
                tableTitle: `Comparing ARC-IC Payments, Avg. Payment Recipients and Avg. Base Acres by County (${total_year})`,
                columns: countyColumnsByChecked["21"],
                program: "Agriculture Risk Coverage (ARC)",
                subprogram: "Agriculture Risk Coverage Individual Coverage (ARC-IC)"
            },
            3: {
                datasetKey: "subtitleA",
                title: "Price Loss Coverage (PLC)",
                tableTitle: `Comparing PLC Payments, Avg. Payment Recipients and Avg. Base Acres by County (${total_year})`,
                columns: countyColumnsByChecked["3"],
                program: "Price Loss Coverage (PLC)"
            },
            4: {
                datasetKey: "subtitleD",
                title: "Dairy Margin Coverage, Subtitle D",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for Dairy Margin Coverage by County (${total_year})`,
                columns: countyColumnsByChecked["4"]
            },
            5: {
                datasetKey: "subtitleE",
                title: "Supplemental Agricultural Disaster Assistance, Subtitle E",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for Supplemental Agricultural Disaster Assistance by County (${total_year})`,
                columns: countyColumnsByChecked["5"]
            },
            50: {
                datasetKey: "subtitleE",
                title: "Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for ELAP by County (${total_year})`,
                columns: countyColumnsByChecked["50"],
                program: "Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
            },
            51: {
                datasetKey: "subtitleE",
                title: "Livestock Forage Program (LFP)",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for LFP by County (${total_year})`,
                columns: countyColumnsByChecked["51"],
                program: "Livestock Forage Program (LFP)"
            },
            52: {
                datasetKey: "subtitleE",
                title: "Livestock Indemnity Payments (LIP)",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for LIP by County (${total_year})`,
                columns: countyColumnsByChecked["52"],
                program: "Livestock Indemnity Payments (LIP)"
            },
            53: {
                datasetKey: "subtitleE",
                title: "Tree Assistance Program (TAP)",
                tableTitle: `Comparing Payments and Avg. Payment Recipients for TAP by County (${total_year})`,
                columns: countyColumnsByChecked["53"],
                program: "Tree Assistance Program (TAP)"
            }
        }),
        [total_year]
    );

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
        const statedistribution_url = `${config.apiUrl}/titles/title-i/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(statedistribution_url).then((response) => {
            const transformed = transformStatePerformance(response, total_year);
            setStateDistributionData(transformed);
        });
        const subtitleA_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-a/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleA_url).then((response) => {
            setSubtitleADistributionData(response);
        });
        const subtitleD_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-d/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleD_url).then((response) => {
            setSubtitleDStateDistributionData(response);
        });
        const subtitleE_url = `${config.apiUrl}/titles/title-i/subtitles/subtitle-e/state-distribution?start_year=${start_year}&end_year=${end_year}`;
        getJsonDataFromUrl(subtitleE_url).then((response) => {
            setSubtitleEStateDistributionData(response);
        });
    }, [end_year, start_year, total_year]);

    const fetchCountyData = React.useCallback(
        (datasetKey: Title1CountyDatasetKey) => {
            if (countyDataLoaded[datasetKey] || countyDataLoading[datasetKey]) {
                return;
            }
            setCountyDataLoading((previous) => ({ ...previous, [datasetKey]: true }));
            const cacheKey = `title1_countyData_v5_${datasetKey}_${start_year}_${end_year}`;
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    const formattedCached =
                        datasetKey === "titleI" ? formatTitleICountyDataset(parsed, total_year) : parsed;
                    if (datasetKey === "titleI" && !parsed?.__title1Formatted) {
                        sessionStorage.setItem(cacheKey, JSON.stringify(formattedCached));
                    }
                    setTimeout(() => {
                        setCountyDistributionData((previous) => ({ ...previous, [datasetKey]: formattedCached }));
                        setCountyDataLoaded((previous) => ({ ...previous, [datasetKey]: true }));
                        setCountyDataLoading((previous) => ({ ...previous, [datasetKey]: false }));
                    }, 50);
                    return;
                }
            } catch {
                sessionStorage.removeItem(cacheKey);
            }
            const endpoint = title1CountyEndpointByKey[datasetKey];
            const countyDistributionUrl = `${config.apiUrl}/${endpoint}?start_year=${start_year}&end_year=${end_year}`;
            getJsonDataFromUrl(countyDistributionUrl)
                .then((response) => {
                    const formattedResponse =
                        datasetKey === "titleI" ? formatTitleICountyDataset(response, total_year) : response;
                    setCountyDistributionData((previous) => ({ ...previous, [datasetKey]: formattedResponse }));
                    setCountyDataLoaded((previous) => ({ ...previous, [datasetKey]: true }));
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify(formattedResponse));
                    } catch {
                        console.error("error in caching");
                    }
                })
                .finally(() => {
                    setCountyDataLoading((previous) => ({ ...previous, [datasetKey]: false }));
                });
        },
        [countyDataLoaded, countyDataLoading, end_year, start_year]
    );

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
        const nextChecked = title1CheckedByMapId[mapId] ?? "0";
        if (nextChecked !== checked) {
            setChecked(nextChecked);
        }
    }, [mapId, checked]);

    const handleCheckedChange = React.useCallback(
        (value: string) => {
            setChecked(value);
            setMapId(title1MapIdByChecked[value] ?? title1DefaultMapId);
        },
        [setMapId]
    );

    const switchChartTable = (_event: React.MouseEvent<HTMLElement>, newTab: number | null) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    const defaultTheme = createTheme();

    function prepData(program, subprogram, data, year) {
        const organizedData: Record<string, unknown>[] = [];
        const originalData: Record<string, unknown>[] = [];
        data[year].forEach((stateData) => {
            const state = stateData.state;
            const programData = stateData.programs.filter((p) => {
                return p.programName.toString() === program;
            });
            if (subprogram !== undefined) {
                const subProgramData = programData[0].subPrograms.filter((p) => {
                    return p.subProgramName.toString() === subprogram;
                });
                organizedData.push({
                    state,
                    baseAcres: subProgramData[0].averageAreaInAcres,
                    payments: subProgramData[0].totalPaymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: subProgramData[0].averageAreaInAcres,
                    payments: subProgramData[0].totalPaymentInDollars,
                    recipients: subProgramData[0].averageRecipientCount
                });
            } else {
                organizedData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].totalPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
                originalData.push({
                    state,
                    baseAcres: programData[0].averageAreaInAcres,
                    payments: programData[0].totalPaymentInDollars,
                    recipients: programData[0].averageRecipientCount
                });
            }
        });
        return [organizedData, originalData];
    }

    const subtextMatch = {
        0: "Total Commodities Programs (Title I)",
        1: "Total Commodities Programs, Subtitle A",
        2: "Agriculture Risk Coverage (ARC)",
        20: "Agriculture Risk Coverage County Option (ARC-CO)",
        21: "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
        3: "Price Loss Coverage (PLC)",
        4: "Dairy Margin Coverage, Subtitle D",
        5: "Supplemental Agricultural Disaster Assistance, Subtitle E",
        50: "Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)",
        51: "Livestock Forage Program (LFP)",
        52: "Livestock Indemnity Payments (LIP)",
        53: "Tree Assistance Program (TAP)"
    };

    const isDataLoaded = React.useMemo(
        () =>
            Object.keys(stateCodesData).length > 0 &&
            Object.keys(allStatesData).length > 0 &&
            Object.keys(stateDistributionData).length > 0 &&
            Object.keys(subtitleADistributionData).length > 0 &&
            Object.keys(subtitleEStateDistributionData).length > 0 &&
            Object.keys(subtitleDStateDistributionData).length > 0,
        [
            allStatesData,
            stateCodesData,
            stateDistributionData,
            subtitleADistributionData,
            subtitleDStateDistributionData,
            subtitleEStateDistributionData
        ]
    );

    const anyCountyDataLoading = React.useMemo(
        () => Object.values(countyDataLoading).some(Boolean),
        [countyDataLoading]
    );

    const renderStateTableOnlyContent = (content: React.ReactNode) => (
        <Box
            className="chartArea"
            component="div"
            ref={title1Div}
            sx={{
                width: "85%",
                m: "auto"
            }}
        >
            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                <Typography className="stateTitle" variant="h4">
                    Performance by States
                </Typography>
            </Grid>
            <Grid
                container
                columns={{ xs: 12 }}
                sx={{
                    paddingTop: 6,
                    justifyContent: "center"
                }}
            >
                {content}
            </Grid>
        </Box>
    );

    const renderTabbedStateContent = (chartContent: React.ReactNode, tableContent: React.ReactNode) => (
        <Box
            className="chartArea"
            component="div"
            ref={title1Div}
            sx={{
                width: "85%",
                m: "auto"
            }}
        >
            <Grid container columns={{ xs: 12 }} className="stateTitleContainer">
                <Typography className="stateTitle" variant="h4">
                    Performance by States
                </Typography>
                <ToggleButtonGroup
                    className="ChartTableToggle"
                    value={tab}
                    exclusive
                    onChange={switchChartTable}
                    aria-label="Title I toggle button group"
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
                <Box className="title1TableContainer" sx={{ display: tab !== 0 ? "none" : "block" }}>
                    {chartContent}
                </Box>
                <Box className="title1TableContainer" sx={{ display: tab !== 1 ? "none" : "block" }}>
                    {tableContent}
                </Box>
            </Grid>
        </Box>
    );

    const renderSection = (
        checkedValue: string,
        stateMapComponent: React.ReactNode,
        stateContentComponent: React.ReactNode
    ) => {
        if (checked !== checkedValue) {
            return null;
        }
        const countyConfig = countyViewConfigByChecked[checkedValue];
        const datasetKey = countyConfig.datasetKey;
        const countyDataset = countyDistributionData[datasetKey];
        return (
            <Box key={checkedValue} component="div" className="halfWidthMainContent" sx={{ display: "block" }}>
                <MapTableWithLevelSwitch
                    stateMapComponent={stateMapComponent}
                    countyMapComponent={
                        <Title1CountyMap
                            title={countyConfig.title}
                            selector={countyConfig}
                            tooltipColumns={countyConfig.columns}
                            year={total_year}
                            mapColor={mapColor}
                            countyPerformance={countyDataset}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                            selectedState={selectedCountyState}
                            onStateChange={handleCountyStateChange}
                        />
                    }
                    stateContentComponent={stateContentComponent}
                    countyTableComponent={
                        <Title1CountyTable
                            tableTitle={countyConfig.tableTitle}
                            selector={countyConfig}
                            columnsConfig={countyConfig.columns}
                            stateCodes={stateCodesData}
                            countyData={countyDataset}
                            year={total_year}
                            selectedState={selectedCountyState}
                            onStateChange={handleCountyStateChange}
                        />
                    }
                    countyDataLoading={countyDataLoading[datasetKey]}
                    onCountyDataRequest={() => fetchCountyData(datasetKey)}
                    hasCountyData={countyDataLoaded[datasetKey]}
                    level={level}
                    onLevelChange={(nextLevel) =>
                        setMapAndLevel(title1MapIdByChecked[checkedValue] ?? title1DefaultMapId, nextLevel)
                    }
                />
            </Box>
        );
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            {anyCountyDataLoading && (
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
            {!anyCountyDataLoading && countyViewUpdating && (
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
            {isDataLoaded ? (
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                        <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
                        <NavSearchBar text="Commodities Programs (Title I)" subtext={subtextMatch[checked]} />
                    </Box>
                    <Box sx={{ height: "64px" }} />
                    <SideBar setTitle1Checked={handleCheckedChange} selectedValue={checked} />
                    {renderSection(
                        "0",
                        <Title1TotalMap
                            program="Title I: Commodities"
                            attribute="payments"
                            year={total_year}
                            statePerformance={stateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                            mapColor={mapColor}
                        />,
                        renderStateTableOnlyContent(
                            <DataTable
                                TableTitle={`Total Commodities Programs (Title I) from ${total_year}`}
                                statePerformance={stateDistributionData}
                                year={total_year}
                                stateCodes={stateCodesArray}
                            />
                        )
                    )}
                    {renderSection(
                        "1",
                        <Title1SubtitleMap
                            subtitle="Total Commodities Programs, Subtitle A"
                            program={undefined}
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleADistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                tableTitle={`Comparison of Total Payments for these Commodities Programs and the State's Percentage of that Total (${total_year})`}
                                subtitle="Total Commodities Programs, Subtitle A"
                                program={undefined}
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleADistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "2",
                        <Title1SubtitleMap
                            subtitle="Total Commodities Programs, Subtitle A"
                            program="Agriculture Risk Coverage (ARC)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleADistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderTabbedStateContent(
                            <Title1TreeMap
                                program="Agriculture Risk Coverage (ARC)"
                                TreeMapData={prepData(
                                    "Agriculture Risk Coverage (ARC)",
                                    undefined,
                                    subtitleADistributionData,
                                    total_year
                                )}
                                stateCodes={stateCodesData}
                                year={total_year}
                                svgW={window.innerWidth * initTreeMapWidthRatio}
                                svgH={2800}
                            />,
                            <Title1ProgramTable
                                tableTitle="Comparing ARC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleADistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "20",
                        <Title1SubtitleMap
                            subtitle="Total Commodities Programs, Subtitle A"
                            program="Agriculture Risk Coverage (ARC)"
                            subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleADistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderTabbedStateContent(
                            <Title1TreeMap
                                program="Agriculture Risk Coverage County Option (ARC-CO)"
                                TreeMapData={prepData(
                                    "Agriculture Risk Coverage (ARC)",
                                    "Agriculture Risk Coverage County Option (ARC-CO)",
                                    subtitleADistributionData,
                                    total_year
                                )}
                                stateCodes={stateCodesData}
                                year={total_year}
                                svgW={window.innerWidth * initTreeMapWidthRatio}
                                svgH={2800}
                            />,
                            <Title1ProgramTable
                                tableTitle="Comparing ARC-CO Payments, Avg. Payment Recipients and Avg. Base Acres"
                                skipColumns={[]}
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
                                stateCodes={stateCodesData}
                                Title1Data={subtitleADistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "21",
                        <Title1SubtitleMap
                            subtitle="Total Commodities Programs, Subtitle A"
                            program="Agriculture Risk Coverage (ARC)"
                            subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleADistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderTabbedStateContent(
                            <Title1TreeMap
                                program="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                TreeMapData={prepData(
                                    "Agriculture Risk Coverage (ARC)",
                                    "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
                                    subtitleADistributionData,
                                    total_year
                                )}
                                stateCodes={stateCodesData}
                                year={total_year}
                                svgW={window.innerWidth * initTreeMapWidthRatio}
                                svgH={2300}
                            />,
                            <Title1ProgramTable
                                tableTitle="Comparing ARC-IC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                skipColumns={[]}
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Agriculture Risk Coverage (ARC)"
                                subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
                                stateCodes={stateCodesData}
                                Title1Data={subtitleADistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "3",
                        <Title1SubtitleMap
                            subtitle="Total Commodities Programs, Subtitle A"
                            program="Price Loss Coverage (PLC)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleADistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderTabbedStateContent(
                            <Title1TreeMap
                                program="Price Loss Coverage (PLC)"
                                TreeMapData={prepData(
                                    "Price Loss Coverage (PLC)",
                                    undefined,
                                    subtitleADistributionData,
                                    total_year
                                )}
                                stateCodes={stateCodesData}
                                year={total_year}
                                svgW={window.innerWidth * initTreeMapWidthRatio}
                                svgH={2300}
                            />,
                            <Title1ProgramTable
                                tableTitle="Comparing PLC Payments, Avg. Payment Recipients and Avg. Base Acres"
                                subtitle="Total Commodities Programs, Subtitle A"
                                program="Price Loss Coverage (PLC)"
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleADistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "4",
                        <Title1SubtitleMap
                            subtitle="Dairy Margin Coverage, Subtitle D"
                            program={undefined}
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleDStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                tableTitle={`Comparing Payments and Total Payments Recipients for Dairy Margin Coverage (${total_year})`}
                                subtitle="Dairy Margin Coverage, Subtitle D"
                                program={undefined}
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleDStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "5",
                        <Title1SubtitleMap
                            subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                            program={undefined}
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleEStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                tableTitle={`Comparing Payments and Total Payments Recipients for Supplemental Agricultural Disaster Assistance (${total_year})`}
                                program={undefined}
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleEStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "50",
                        <Title1SubtitleMap
                            subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                            program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleEStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                tableTitle={`Comparing Payments and Total Payments Recipients for Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP) (${total_year})`}
                                program="Emergency Assistance for Livestock, Honey Bees, and Farm-Raised Fish Program (ELAP)"
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleEStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "51",
                        <Title1SubtitleMap
                            subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                            program="Livestock Forage Program (LFP)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleEStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Forage Program (LFP) (${total_year})`}
                                program="Livestock Forage Program (LFP)"
                                subprogram={undefined}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleEStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "52",
                        <Title1SubtitleMap
                            subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                            program="Livestock Indemnity Payments (LIP)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleEStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                tableTitle={`Comparing Payments and Total Payments Recipients for Livestock Indemnity Payments (LIP) (${total_year})`}
                                subprogram={undefined}
                                program="Livestock Indemnity Payments (LIP)"
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleEStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
                    {renderSection(
                        "53",
                        <Title1SubtitleMap
                            subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                            program="Tree Assistance Program (TAP)"
                            subprogram={undefined}
                            year={total_year}
                            mapColor={mapColor}
                            statePerformance={subtitleEStateDistributionData}
                            stateCodes={stateCodesData}
                            allStates={allStatesData}
                        />,
                        renderStateTableOnlyContent(
                            <Title1ProgramTable
                                subtitle="Supplemental Agricultural Disaster Assistance, Subtitle E"
                                tableTitle={`Comparing Payments and Total Payments Recipients for Tree Assistance Program (TAP) (${total_year})`}
                                subprogram={undefined}
                                program="Tree Assistance Program (TAP)"
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                Title1Data={subtitleEStateDistributionData}
                                year={total_year}
                                color1="#F6EEEA"
                                color2="#EAF8EA"
                                color3="#F7F0F8"
                            />
                        )
                    )}
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

function transformStatePerformance(rawData, totalYear) {
    const years = Object.keys(rawData).filter(
        (key) => /^\d{4}$/.test(key) && Number(key) >= 2014 && Number(key) <= 2023
    );
    const summaryArray = rawData[totalYear];
    if (!Array.isArray(summaryArray)) {
        return { [totalYear]: [] };
    }
    const stateMap = {};
    summaryArray.forEach((entry) => {
        const { state, totalPaymentInDollars, totalRecipients } = entry;
        stateMap[state] = {
            state,
            totalPaymentInDollars,
            totalRecipients,
            years: {}
        };
    });
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
        [totalYear]: Object.values(stateMap)
    };
}
