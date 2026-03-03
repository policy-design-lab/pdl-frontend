import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { ComposableMap, Geographies, ZoomableGroup } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useStyles, tooltipBkgColor } from "../shared/MapTooltip";
import { ShortFormat } from "../shared/ConvertionFormats";
import DrawLegend from "../shared/DrawLegend";
import { getCountyPercentiles } from "../../utils/countyLegendConfig";
import { CountyGeographyLayer, StateBoundaryLayer, StateLabelLayer } from "../shared/countyMap/CountyMapLayers";
import {
    COUNTY_TOPOJSON_URL,
    STATE_TOPOJSON_URL,
    clampCountyMapCenter,
    getCountyMapPosition,
    getStateFipsFromName,
    getStateViewport,
    loadCountyAndStateTopoJson,
    normalizeCountyFips
} from "../../utils/countyGeo";

const lossRatioThresholds = [0.6, 0.8, 1.0001, 1.5]; // PI requests the loss ratio to have specific thresholds that are different from the value-based attributes

const getLossRatioColors = (mapColor: [string, string, string, string, string]): string[] => [
    mapColor[4],
    mapColor[3],
    "#E8C9A3",
    "#B65700",
    "#662500"
];

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
    const [position, setPosition] = useState(getCountyMapPosition("All States", 1));
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    const [countyTopoReady, setCountyTopoReady] = useState(false);
    const [stateTopoReady, setStateTopoReady] = useState(false);
    const [countyTopology, setCountyTopology] = useState<Record<string, unknown> | null>(null);
    const [stateTopology, setStateTopology] = useState<Record<string, unknown> | null>(null);
    const [topologyLoadAttempted, setTopologyLoadAttempted] = useState(false);
    const [mapDrawSettled, setMapDrawSettled] = useState(false);
    const [interactionReady, setInteractionReady] = useState(false);
    const mountedRef = useRef(true);
    const hoveredCountyRef = useRef<string | null>(null);
    const tooltipFrameRef = useRef<number | null>(null);
    const pendingTooltipContentRef = useRef<React.ReactNode>("");
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
                const countyFips = normalizeCountyFips(county.countyFips);
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
    const countyGeographySource = countyTopology || (topologyLoadAttempted ? COUNTY_TOPOJSON_URL : null);
    const stateGeographySource = stateTopology || (topologyLoadAttempted ? STATE_TOPOJSON_URL : null);
    const mapIsReady =
        countyGeographySource !== null &&
        stateGeographySource !== null &&
        countyTopoReady &&
        stateTopoReady &&
        mapDrawSettled;
    const selectedStateFips = selectedState === "All States" ? null : getStateFipsFromName(selectedState);

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
        mountedRef.current = true;
        loadCountyAndStateTopoJson()
            .then(([countyTopo, stateTopo]) => {
                if (!mountedRef.current) {
                    return;
                }
                setCountyTopology(countyTopo);
                setStateTopology(stateTopo);
            })
            .catch(() => undefined)
            .finally(() => {
                if (mountedRef.current) {
                    setTopologyLoadAttempted(true);
                }
            });

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
        (zoomLevel: number) => getCountyMapPosition(selectedState, zoomLevel),
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

    const handleCloseStateView = useCallback(() => {
        if (mountedRef.current) {
            onStateChange("All States");
            setUserZoomLevel(1);
            setPosition(getCountyMapPosition("All States", 1));
        }
    }, [onStateChange]);

    const handleMoveEnd = useCallback(
        (positionObj: { coordinates: number[]; zoom: number }) => {
            if (!mountedRef.current) return;
            if (selectedState === "All States") {
                const clamped = clampCountyMapCenter(positionObj.coordinates);
                setPosition({ coordinates: clamped, zoom: positionObj.zoom });
            } else {
                const stateView = getStateViewport(selectedState);
                if (stateView) {
                    const [centerLon, centerLat] = stateView.center;
                    if (positionObj.coordinates[0] !== centerLon || positionObj.coordinates[1] !== centerLat) {
                        setPosition({ coordinates: stateView.center, zoom: positionObj.zoom });
                    }
                }
            }
        },
        [selectedState]
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

        if (attribute === "totalNetFarmerBenefit") {
            return (
                <div>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Typography
                            noWrap
                            variant="subtitle2"
                            sx={{
                                color: "#2F7164",
                                backgroundColor: "rgba(47, 113, 100, 0.12)",
                                border: "1px solid rgba(47, 113, 100, 0.28)",
                                borderRadius: "999px",
                                px: 1.25,
                                py: 0.35,
                                fontWeight: 400
                            }}
                        >
                            <b>Net farmer benefit = Total Indemnities - Farmer Paid Premium</b> (If Total Indemnities =
                            Farmer Paid Premium, Net Farmer Benefits = $0)
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Typography noWrap variant="h6">
                            <strong>{displayAttribute}</strong> from <strong>{year}</strong>
                            {selectedState !== "All States" && <span> - {selectedState}</span>}
                        </Typography>
                    </Box>
                </div>
            );
        }

        if (attribute === "lossRatio") {
            return (
                <div>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Typography
                            noWrap
                            variant="subtitle2"
                            sx={{
                                color: "#2F7164",
                                backgroundColor: "rgba(47, 113, 100, 0.12)",
                                border: "1px solid rgba(47, 113, 100, 0.28)",
                                borderRadius: "999px",
                                px: 1.25,
                                py: 0.35,
                                fontWeight: 600
                            }}
                        >
                            Loss Ratio = Total Indemnities / Total Premium
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Typography noWrap variant="h6">
                            <strong>{displayAttribute}</strong> from <strong>{year}</strong>
                            {selectedState !== "All States" && <span> - {selectedState}</span>}
                        </Typography>
                    </Box>
                </div>
            );
        }

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
                        grayAreasSuffix="for acreage-based policies"
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
                                grayAreasSuffix="for acreage-based policies"
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
                                grayAreasSuffix="for acreage-based policies"
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
                            {countyGeographySource && (
                                <Geographies geography={countyGeographySource}>
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
                            )}
                            {stateGeographySource && (
                                <Geographies geography={stateGeographySource}>
                                    {({ geographies }) => (
                                        <>
                                            <StateBoundaryLayer
                                                geographies={geographies}
                                                onGeographiesReady={handleStateTopoReady}
                                            />
                                            <StateLabelLayer
                                                geographies={geographies}
                                                selectedState={selectedState}
                                                stateAbbrevByVal={stateAbbrevByVal}
                                            />
                                        </>
                                    )}
                                </Geographies>
                            )}
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
