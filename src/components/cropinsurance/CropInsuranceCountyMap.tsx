import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useStyles, tooltipBkgColor } from "../shared/MapTooltip";
import { ShortFormat } from "../shared/ConvertionFormats";
import DrawLegend from "../shared/DrawLegend";
import { getCountyPercentiles } from "../../utils/countyLegendConfig";

const geoCountyUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const geoStateUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const lossRatioThresholds = [0.6, 0.8, 1.0001, 1.5]; // PI requests the loss ratio to have specific thresholds that are different from the value-based attributes

const getLossRatioColors = (mapColor: [string, string, string, string, string]): string[] => [
    mapColor[4],
    mapColor[3],
    "#E8C9A3",
    "#B65700",
    "#662500"
];

const stateViewSettings = {
    "Alabama": { center: [-86.8, 32.7], zoom: 5 },
    "Alaska": { center: [-150, 63], zoom: 3 },
    "Arizona": { center: [-111.5, 34.5], zoom: 4.5 },
    "Arkansas": { center: [-92.5, 35], zoom: 5 },
    "California": { center: [-119, 37], zoom: 4 },
    "Colorado": { center: [-105.5, 39], zoom: 5 },
    "Connecticut": { center: [-72.7, 41.5], zoom: 7 },
    "Delaware": { center: [-75.5, 39], zoom: 7 },
    "Florida": { center: [-83, 28], zoom: 5 },
    "Georgia": { center: [-83.5, 32.5], zoom: 5 },
    "Hawaii": { center: [-157, 20], zoom: 6 },
    "Idaho": { center: [-114, 44.5], zoom: 5 },
    "Illinois": { center: [-89, 40], zoom: 5 },
    "Indiana": { center: [-86, 40], zoom: 5 },
    "Iowa": { center: [-93.5, 42], zoom: 5 },
    "Kansas": { center: [-98, 38.5], zoom: 5 },
    "Kentucky": { center: [-85, 37.5], zoom: 5 },
    "Louisiana": { center: [-92, 31], zoom: 5 },
    "Maine": { center: [-69, 45], zoom: 5 },
    "Maryland": { center: [-77, 39], zoom: 6 },
    "Massachusetts": { center: [-71.5, 42], zoom: 6 },
    "Michigan": { center: [-85, 44.5], zoom: 5 },
    "Minnesota": { center: [-94, 46], zoom: 5 },
    "Mississippi": { center: [-89.5, 33], zoom: 5 },
    "Missouri": { center: [-92.5, 38.5], zoom: 5 },
    "Montana": { center: [-110, 47], zoom: 5 },
    "Nebraska": { center: [-99.5, 41.5], zoom: 5 },
    "Nevada": { center: [-117, 39], zoom: 5 },
    "New Hampshire": { center: [-71.5, 43.5], zoom: 6 },
    "New Jersey": { center: [-74.5, 40], zoom: 6 },
    "New Mexico": { center: [-106, 34], zoom: 5 },
    "New York": { center: [-75.5, 43], zoom: 5 },
    "North Carolina": { center: [-79.5, 35.5], zoom: 5 },
    "North Dakota": { center: [-100.5, 47.5], zoom: 5 },
    "Ohio": { center: [-82.5, 40], zoom: 5 },
    "Oklahoma": { center: [-97, 35.5], zoom: 5 },
    "Oregon": { center: [-120.5, 44], zoom: 5 },
    "Pennsylvania": { center: [-77.5, 41], zoom: 5 },
    "Rhode Island": { center: [-71.5, 41.5], zoom: 7 },
    "South Carolina": { center: [-81, 34], zoom: 5 },
    "South Dakota": { center: [-100, 44.5], zoom: 5 },
    "Tennessee": { center: [-86, 36], zoom: 5 },
    "Texas": { center: [-99, 31], zoom: 4 },
    "Utah": { center: [-111.5, 39.5], zoom: 5 },
    "Vermont": { center: [-72.5, 44], zoom: 6 },
    "Virginia": { center: [-79, 37.5], zoom: 5 },
    "Washington": { center: [-120.5, 47.5], zoom: 5 },
    "West Virginia": { center: [-80.5, 39], zoom: 5 },
    "Wisconsin": { center: [-89.5, 44.5], zoom: 5 },
    "Wyoming": { center: [-107.5, 43], zoom: 5 },
    "District of Columbia": { center: [-77, 38.9], zoom: 9 }
};

const stateFipsToName: Record<string, string> = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
    "05": "Arkansas",
    "06": "California",
    "08": "Colorado",
    "09": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming"
};

const stateNameToFips: Record<string, string> = Object.entries(stateFipsToName).reduce((acc, [fips, name]) => {
    acc[name] = fips;
    return acc;
}, {} as Record<string, string>);

const getValueFromAttrDollar = (record: any, attribute: string): string => {
    let ans = "";
    Object.keys(record).forEach((key) => {
        const match = key.match(/^(.*?)(?=\s*InDollars)/);
        const extractedKey = match ? match[1] : key;
        if (extractedKey === attribute) {
            ans = key;
        }
    });
    return ans;
};

const countyAttributeKeyMap: Record<string, string> = {
    totalNetFarmerBenefit: "totalNetFarmerBenefitInDollars",
    totalIndemnities: "totalIndemnitiesInDollars",
    totalPremium: "totalPremiumInDollars",
    totalPremiumSubsidy: "totalPremiumSubsidyInDollars",
    totalFarmerPaidPremium: "totalFarmerPaidPremiumInDollars",
    averageLiabilities: "averageLiabilitiesInDollars",
    averageInsuredAreaInAcres: "averageInsuredAreaInAcres",
    totalPoliciesEarningPremium: "totalPoliciesEarningPremium",
    lossRatio: "lossRatio"
};

const resolveCountyAttributeKey = (record: any, attribute: string): string => {
    const mappedKey = countyAttributeKeyMap[attribute];
    if (mappedKey && Object.prototype.hasOwnProperty.call(record, mappedKey)) {
        return mappedKey;
    }
    const matchedKey = getValueFromAttrDollar(record, attribute);
    return matchedKey !== "" ? matchedKey : attribute;
};

interface CropInsuranceCountyMapProps {
    attribute: string;
    year: string;
    mapColor: [string, string, string, string, string];
    countyPerformance: any;
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedState: string;
    onStateChange: (state: string) => void;
}

interface CountyGeographyLayerProps {
    geographies: any[];
    selectedStateFips: string | null;
    getCountyFillColor: (countyFIPS: string) => string;
    onMouseEnter: (geo: any, countyFIPS: string) => void;
    onMouseLeave: () => void;
    onGeographiesReady: () => void;
}

const CountyGeographyLayerComponent = ({
    geographies,
    selectedStateFips,
    getCountyFillColor,
    onMouseEnter,
    onMouseLeave,
    onGeographiesReady
}: CountyGeographyLayerProps): JSX.Element => {
    const readyNotifiedRef = useRef(false);

    useEffect(() => {
        if (!readyNotifiedRef.current && geographies.length > 0) {
            readyNotifiedRef.current = true;
            onGeographiesReady();
        }
    }, [geographies.length, onGeographiesReady]);

    const visibleGeographies = useMemo(
        () =>
            selectedStateFips === null
                ? geographies
                : geographies.filter((geo) => String(geo.id || "").startsWith(selectedStateFips)),
        [geographies, selectedStateFips]
    );

    return (
        <>
            {visibleGeographies.map((geo) => {
                const countyFIPS = String(geo.id || "");
                if (!countyFIPS) return null;
                return (
                    <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => onMouseEnter(geo, countyFIPS)}
                        onMouseLeave={onMouseLeave}
                        fill={getCountyFillColor(countyFIPS)}
                        stroke="#FFFFFF"
                        strokeWidth={0.15}
                        style={{
                            default: {
                                outline: "none"
                            },
                            hover: {
                                stroke: "#232323",
                                strokeWidth: 0.5,
                                outline: "none"
                            },
                            pressed: { outline: "none" }
                        }}
                    />
                );
            })}
        </>
    );
};

const CountyGeographyLayer = React.memo(CountyGeographyLayerComponent);

interface StateGeographyLayerProps {
    geographies: any[];
    selectedState: string;
    stateAbbrevByVal: Record<string, string>;
    onGeographiesReady: () => void;
}

const StateGeographyLayerComponent = ({
    geographies,
    selectedState,
    stateAbbrevByVal,
    onGeographiesReady
}: StateGeographyLayerProps): JSX.Element => {
    const readyNotifiedRef = useRef(false);

    useEffect(() => {
        if (!readyNotifiedRef.current && geographies.length > 0) {
            readyNotifiedRef.current = true;
            onGeographiesReady();
        }
    }, [geographies.length, onGeographiesReady]);

    return (
        <>
            {geographies.map((geo) => (
                <Geography
                    key={`state-${geo.rsmKey}`}
                    geography={geo}
                    fill="none"
                    stroke="#000"
                    strokeWidth={0.5}
                    style={{
                        default: { outline: "none", pointerEvents: "none" },
                        hover: { outline: "none", pointerEvents: "none" },
                        pressed: { outline: "none", pointerEvents: "none" }
                    }}
                />
            ))}
            {selectedState === "All States" &&
                geographies.map((geo) => {
                    const centroid = geoCentroid(geo);
                    const stateAbbrev = stateAbbrevByVal[String(geo.id)];
                    if (!stateAbbrev || centroid[0] < -160 || centroid[0] > -67) {
                        return null;
                    }
                    return (
                        <g key={`${geo.rsmKey}-name`}>
                            <Marker coordinates={centroid}>
                                <rect
                                    x="-10"
                                    y="-6"
                                    width="20"
                                    height="14"
                                    fill="white"
                                    opacity="0.7"
                                    style={{ pointerEvents: "none" }}
                                />
                                <text
                                    y="2"
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill="#555"
                                    style={{ fontWeight: "bold", pointerEvents: "none" }}
                                >
                                    {stateAbbrev}
                                </text>
                            </Marker>
                        </g>
                    );
                })}
        </>
    );
};

const StateGeographyLayer = React.memo(StateGeographyLayerComponent);

const CropInsuranceCountyMap = ({
    attribute,
    year,
    mapColor,
    countyPerformance,
    stateCodes,
    allStates,
    selectedState,
    onStateChange
}: CropInsuranceCountyMapProps): JSX.Element => {
    const classes = useStyles();
    const [content, setContent] = useState<React.ReactNode>("");
    const [position, setPosition] = useState({ coordinates: [-95, 40], zoom: 1 });
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    const [countyTopoReady, setCountyTopoReady] = useState(false);
    const [stateTopoReady, setStateTopoReady] = useState(false);
    const [mapDrawSettled, setMapDrawSettled] = useState(false);
    const [interactionReady, setInteractionReady] = useState(false);
    const mountedRef = useRef(true);
    const hoveredCountyRef = useRef<string | null>(null);
    const tooltipFrameRef = useRef<number | null>(null);
    const pendingTooltipContentRef = useRef<React.ReactNode>("");
    const defaultCenter: [number, number] = [-95, 40];
    const mapBounds = { minLon: -170, maxLon: -60, minLat: 15, maxLat: 75 };

    const { countyDataMap, countyValueMap, quantizeArray, zeroPoints } = useMemo(() => {
        const map: Record<string, any> = {};
        const valueMap: Record<string, number> = {};
        const qArray: number[] = [];
        const zPoints: string[] = [];
        if (countyPerformance && countyPerformance[year]) {
            countyPerformance[year].forEach((county: any) => {
                const stateName = stateCodes[county.state] || county.state;
                if (selectedState !== "All States" && stateName !== selectedState) {
                    return;
                }
                const countyFips = String(county.countyFips || "");
                if (!countyFips) {
                    return;
                }
                map[countyFips] = county;
                const key = resolveCountyAttributeKey(county, attribute);
                const value = Number(county[key]);
                if (!Number.isFinite(value)) {
                    return;
                }
                valueMap[countyFips] = value;
                qArray.push(value);
                if (value === 0) {
                    zPoints.push(countyFips);
                }
            });
        }
        return { countyDataMap: map, countyValueMap: valueMap, quantizeArray: qArray, zeroPoints: zPoints };
    }, [countyPerformance, year, attribute, selectedState, stateCodes]);

    const countyPercentiles = getCountyPercentiles(attribute);

    const quantileScale = useMemo(() => {
        if (quantizeArray.length === 0) return null;
        const nonZeroData = quantizeArray.filter((v) => v !== 0);
        if (nonZeroData.length < 5) return null;
        const sorted = [...nonZeroData].sort((a, b) => a - b);
        const p = (arr: number[], pct: number) => {
            const idx = (pct / 100) * (arr.length - 1);
            const lo = Math.floor(idx);
            const hi = Math.ceil(idx);
            if (lo === hi) return arr[lo];
            return arr[lo] * (1 - (idx - lo)) + arr[hi] * (idx - lo);
        };
        const thresholds = countyPercentiles.map((pct) => p(sorted, pct));
        const hasNeg = quantizeArray.some((d) => d < 0);
        const hasPos = quantizeArray.some((d) => d > 0);
        if (hasNeg && hasPos && !thresholds.includes(0)) {
            const negThresholds = thresholds.filter((v) => v < 0);
            const posThresholds = thresholds.filter((v) => v > 0);
            if (negThresholds.length > 0 && posThresholds.length > 0) {
                const closestNegIdx = thresholds.indexOf(Math.max(...negThresholds));
                const closestPosIdx = thresholds.indexOf(Math.min(...posThresholds));
                const closestNeg = Math.abs(thresholds[closestNegIdx]);
                const closestPos = Math.abs(thresholds[closestPosIdx]);
                if (closestNeg <= closestPos) {
                    thresholds[closestNegIdx] = 0;
                } else {
                    thresholds[closestPosIdx] = 0;
                }
            } else if (negThresholds.length > 0) {
                thresholds[thresholds.indexOf(Math.max(...negThresholds))] = 0;
            } else {
                thresholds[thresholds.indexOf(Math.min(...posThresholds))] = 0;
            }
        }
        return thresholds;
    }, [quantizeArray, countyPercentiles]);

    const isLossRatio = attribute === "lossRatio";
    const lossRatioColors = getLossRatioColors(mapColor);
    const customScale = quantileScale || [0, 1000000, 5000000, 10000000];
    const colorScale = d3.scaleThreshold(
        isLossRatio ? lossRatioThresholds : customScale,
        isLossRatio ? lossRatioColors : mapColor
    );
    const mapIsReady = countyTopoReady && stateTopoReady && mapDrawSettled;
    const selectedStateFips = selectedState === "All States" ? null : stateNameToFips[selectedState] || null;

    const stateAbbrevByVal = useMemo(() => {
        const mapped: Record<string, string> = {};
        allStates.forEach((state: any) => {
            if (state?.val !== undefined && state?.id) {
                mapped[String(state.val)] = state.id;
            }
        });
        return mapped;
    }, [allStates]);

    let attr = 0;
    if (attribute === "lossRatio") attr = 1;
    if (attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium") attr = 2;

    useEffect(() => {
        fetch(geoCountyUrl).catch(() => undefined);
        fetch(geoStateUrl).catch(() => undefined);
        return () => {
            mountedRef.current = false;
            if (tooltipFrameRef.current !== null) {
                window.cancelAnimationFrame(tooltipFrameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setMapDrawSettled(false);
        setInteractionReady(false);
        const timer = setTimeout(() => {
            if (mountedRef.current) {
                setMapDrawSettled(true);
            }
        }, 220);
        return () => {
            clearTimeout(timer);
        };
    }, [selectedState, attribute, year]);

    useEffect(() => {
        if (!mapIsReady) {
            setInteractionReady(false);
            return undefined;
        }

        let rafA: number | null = null;
        let rafB: number | null = null;
        let idleId: number | null = null;
        let fallbackTimeoutId: number | null = null;
        let finished = false;

        const finish = () => {
            if (finished || !mountedRef.current) return;
            finished = true;
            if (fallbackTimeoutId !== null) {
                clearTimeout(fallbackTimeoutId);
            }
            setInteractionReady(true);
        };

        fallbackTimeoutId = window.setTimeout(finish, 1200);
        const scheduleViaRaf = () => {
            rafA = window.requestAnimationFrame(() => {
                rafB = window.requestAnimationFrame(finish);
            });
        };
        const windowWithIdle = window as Window & {
            requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (handle: number) => void;
        };

        // Fallback to double requestAnimationFrame for a similar effect if requestIdleCallback is not supported.
        if (typeof windowWithIdle.requestIdleCallback === "function") {
            idleId = windowWithIdle.requestIdleCallback(
                () => {
                    scheduleViaRaf();
                },
                { timeout: 900 }
            );
        } else {
            scheduleViaRaf();
        }

        // Noticed that in some cases the pop-up of the county map still need extra time to make sure the mouse transition is smooth without getting stuck,
        // So extra loading buffer in case the county map is still not fully interactive after the above timers
        return () => {
            if (rafA !== null) {
                window.cancelAnimationFrame(rafA);
            }
            if (rafB !== null) {
                window.cancelAnimationFrame(rafB);
            }
            if (idleId !== null && typeof windowWithIdle.cancelIdleCallback === "function") {
                windowWithIdle.cancelIdleCallback(idleId);
            }
            if (fallbackTimeoutId !== null) {
                clearTimeout(fallbackTimeoutId);
            }
        };
    }, [mapIsReady]);

    const getBasePosition = useCallback(
        (zoomLevel: number) => {
            if (selectedState === "All States") {
                return { coordinates: defaultCenter, zoom: zoomLevel };
            }
            if (stateViewSettings[selectedState]) {
                const { center, zoom } = stateViewSettings[selectedState];
                return { coordinates: center, zoom: zoom * zoomLevel };
            }
            return { coordinates: defaultCenter, zoom: zoomLevel };
        },
        [selectedState]
    );

    useEffect(() => {
        setPosition(getBasePosition(userZoomLevel));
    }, [getBasePosition, userZoomLevel]);

    const handleCountyTopoReady = useCallback(() => {
        if (mountedRef.current) {
            setCountyTopoReady(true);
        }
    }, []);

    const handleStateTopoReady = useCallback(() => {
        if (mountedRef.current) {
            setStateTopoReady(true);
        }
    }, []);

    const scheduleTooltipContent = useCallback((nextContent: React.ReactNode) => {
        pendingTooltipContentRef.current = nextContent;
        if (tooltipFrameRef.current !== null) {
            return;
        }
        tooltipFrameRef.current = window.requestAnimationFrame(() => {
            tooltipFrameRef.current = null;
            setContent(pendingTooltipContentRef.current);
        });
    }, []);

    const handleZoomIn = useCallback(() => {
        if (!mountedRef.current) return;
        const newZoomLevel = Math.min(userZoomLevel * 1.2, 3);
        setUserZoomLevel(newZoomLevel);
    }, [userZoomLevel]);

    const handleZoomOut = useCallback(() => {
        if (!mountedRef.current) return;
        const newZoomLevel = Math.max(userZoomLevel / 1.2, 0.5);
        setUserZoomLevel(newZoomLevel);
    }, [userZoomLevel]);

    const handleResetZoom = useCallback(() => {
        if (!mountedRef.current) return;
        setUserZoomLevel(1);
        setPosition(getBasePosition(1));
    }, [getBasePosition]);

    const clampCenter = useCallback((coordinates: number[]) => {
        const [lon, lat] = coordinates;
        return [
            Math.min(mapBounds.maxLon, Math.max(mapBounds.minLon, lon)),
            Math.min(mapBounds.maxLat, Math.max(mapBounds.minLat, lat))
        ];
    }, []);

    const handleCloseStateView = useCallback(() => {
        if (mountedRef.current) {
            onStateChange("All States");
            setUserZoomLevel(1);
            setPosition({ coordinates: defaultCenter, zoom: 1 });
        }
    }, [onStateChange]);

    const handleMoveEnd = useCallback(
        (positionObj: { coordinates: number[]; zoom: number }) => {
            if (!mountedRef.current) return;
            if (selectedState === "All States") {
                const clamped = clampCenter(positionObj.coordinates);
                setPosition({ coordinates: clamped, zoom: positionObj.zoom });
            } else if (stateViewSettings[selectedState]) {
                const { center } = stateViewSettings[selectedState];
                if (positionObj.coordinates[0] !== center[0] || positionObj.coordinates[1] !== center[1]) {
                    setPosition({ coordinates: center, zoom: positionObj.zoom });
                }
            }
        },
        [selectedState, clampCenter]
    );

    const getCountyFillColor = useCallback(
        (countyFIPS: string) => {
            const value = countyValueMap[countyFIPS];
            if (value === undefined) return "#EEE";
            if (value === 0) return "#CCC";
            return colorScale(value);
        },
        [countyValueMap, colorScale]
    );

    const handleMouseEnter = useCallback(
        (geo: any, countyFIPS: string) => {
            if (hoveredCountyRef.current === countyFIPS) {
                return;
            }
            hoveredCountyRef.current = countyFIPS;
            const countyData = countyDataMap[countyFIPS];
            if (!countyData) {
                const tooltipContent = (
                    <div className="map_tooltip">
                        <div className={classes.tooltip_header}>
                            <b>{geo.properties?.name || "Unknown County"}</b>
                        </div>
                        <table className={classes.tooltip_table}>
                            <tbody>
                                <tr>
                                    <td className={classes.tooltip_topcell_left}>No data available</td>
                                    <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
                scheduleTooltipContent(tooltipContent);
                return;
            }

            const value = countyValueMap[countyFIPS] || 0;
            const stateName = stateCodes[countyData.state] || countyData.state;

            const tooltipContent = (
                <div className="map_tooltip">
                    <div className={classes.tooltip_header}>
                        <b>
                            {countyData.countyName}, {stateName}
                        </b>
                    </div>
                    {attr === 1 ? (
                        <table className={classes.tooltip_table}>
                            <tbody>
                                <tr>
                                    <td className={classes.tooltip_topcell_left}>
                                        {Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 })}
                                    </td>
                                    <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <table className={classes.tooltip_table}>
                            <tbody>
                                {attr === 2 ? (
                                    <tr>
                                        <td className={classes.tooltip_topcell_left}>{ShortFormat(value)}</td>
                                        <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td className={classes.tooltip_topcell_left}>${ShortFormat(value)}</td>
                                        <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            );
            scheduleTooltipContent(tooltipContent);
        },
        [countyDataMap, countyValueMap, stateCodes, classes, attr, scheduleTooltipContent]
    );

    const handleMouseLeave = useCallback(() => {
        hoveredCountyRef.current = null;
        scheduleTooltipContent("");
    }, [scheduleTooltipContent]);

    const titleElement = (): JSX.Element => {
        const displayAttribute = attribute
            .replace(/([A-Z])/g, " $1")
            .trim()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        if (attribute === "averageInsuredAreaInAcres") {
            return (
                <div>
                    <Box display="flex" justifyContent="center">
                        <Typography noWrap variant="h6">
                            <strong>{displayAttribute}</strong> from <strong>{year}</strong>
                            {selectedState !== "All States" && <span> - {selectedState}</span>}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Typography noWrap variant="subtitle2" sx={{ color: "#AAA" }}>
                            (Average acres includes acres insured by Pasture, Rangeland, and Forage (PRF) policies)
                        </Typography>
                    </Box>
                </div>
            );
        }
        return (
            <Typography noWrap variant="h6">
                <strong>{displayAttribute}</strong> from <strong>{year}</strong>
                {selectedState !== "All States" && <span> - {selectedState}</span>}
            </Typography>
        );
    };

    return (
        <div>
            <Box display="flex" justifyContent="center">
                {attribute === "lossRatio" ? (
                    <DrawLegend
                        isRatio
                        ratioAsPercent={false}
                        colorScale={colorScale}
                        title={titleElement()}
                        programData={quantizeArray}
                        prepColor={lossRatioColors}
                        emptyState={zeroPoints}
                    />
                ) : (
                    <div>
                        {attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium" ? (
                            <DrawLegend
                                isRatio={false}
                                notDollar
                                colorScale={colorScale}
                                title={titleElement()}
                                programData={quantizeArray}
                                prepColor={mapColor}
                                emptyState={zeroPoints}
                                useQuantileSpread
                                quantilePercentiles={countyPercentiles}
                            />
                        ) : (
                            <DrawLegend
                                isRatio={false}
                                colorScale={colorScale}
                                title={titleElement()}
                                programData={quantizeArray}
                                prepColor={mapColor}
                                emptyState={zeroPoints}
                                useQuantileSpread
                                quantilePercentiles={countyPercentiles}
                            />
                        )}
                    </div>
                )}
            </Box>
            <Box
                sx={{
                    position: "relative",
                    width: "100%"
                }}
            >
                {selectedState !== "All States" && (
                    <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2000 }}>
                        <Button
                            onClick={handleCloseStateView}
                            aria-label="return to US map"
                            variant="contained"
                            startIcon={<CloseIcon />}
                            sx={{
                                "bgcolor": "rgba(47, 113, 100, 0.9)",
                                "color": "white",
                                "border": "2px solid white",
                                "boxShadow": "0 2px 10px rgba(0,0,0,0.2)",
                                "&:hover": {
                                    bgcolor: "rgba(47, 113, 100, 1)",
                                    transform: "scale(1.05)"
                                }
                            }}
                        >
                            Return to US Map
                        </Button>
                    </Box>
                )}
                {!interactionReady && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            zIndex: 1600,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1.5
                        }}
                    >
                        <CircularProgress size={36} />
                        <Typography variant="body2" sx={{ color: "#2F7164" }}>
                            Rendering county map...
                        </Typography>
                    </Box>
                )}
                <div
                    data-tip=""
                    data-for="county-map-tooltip"
                    style={{ pointerEvents: interactionReady ? "auto" : "none" }}
                >
                    <ComposableMap projection="geoAlbersUsa">
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMoveEnd}
                            minZoom={0.5}
                            maxZoom={3}
                        >
                            <Geographies geography={geoCountyUrl}>
                                {({ geographies }) => (
                                    <CountyGeographyLayer
                                        geographies={geographies}
                                        selectedStateFips={selectedStateFips}
                                        getCountyFillColor={getCountyFillColor}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        onGeographiesReady={handleCountyTopoReady}
                                    />
                                )}
                            </Geographies>
                            <Geographies geography={geoStateUrl}>
                                {({ geographies }) => (
                                    <StateGeographyLayer
                                        geographies={geographies}
                                        selectedState={selectedState}
                                        stateAbbrevByVal={stateAbbrevByVal}
                                        onGeographiesReady={handleStateTopoReady}
                                    />
                                )}
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        zIndex: 500,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 1
                    }}
                >
                    <Box
                        sx={{
                            fontSize: "11px",
                            color: "#666",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        Map Zoom Controls
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "8px",
                            padding: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        <Button
                            onClick={handleZoomOut}
                            size="small"
                            variant="outlined"
                            sx={{
                                "minWidth": "auto",
                                "width": "32px",
                                "height": "32px",
                                "borderColor": "rgba(47, 113, 100, 0.5)",
                                "color": "#2F7164",
                                "&:hover": {
                                    borderColor: "#2F7164",
                                    backgroundColor: "rgba(47, 113, 100, 0.1)"
                                }
                            }}
                        >
                            −
                        </Button>
                        <Button
                            onClick={handleResetZoom}
                            size="small"
                            variant="outlined"
                            sx={{
                                "fontSize": "11px",
                                "borderColor": "rgba(47, 113, 100, 0.5)",
                                "color": "#2F7164",
                                "&:hover": {
                                    borderColor: "#2F7164",
                                    backgroundColor: "rgba(47, 113, 100, 0.1)"
                                }
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleZoomIn}
                            size="small"
                            variant="outlined"
                            sx={{
                                "minWidth": "auto",
                                "width": "32px",
                                "height": "32px",
                                "borderColor": "rgba(47, 113, 100, 0.5)",
                                "color": "#2F7164",
                                "&:hover": {
                                    borderColor: "#2F7164",
                                    backgroundColor: "rgba(47, 113, 100, 0.1)"
                                }
                            }}
                        >
                            +
                        </Button>
                    </Box>
                </Box>
            </Box>
            <div className="tooltip-container">
                <ReactTooltip
                    className={`${classes.customized_tooltip} tooltip`}
                    backgroundColor={tooltipBkgColor}
                    id="county-map-tooltip"
                >
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default React.memo(CropInsuranceCountyMap);
