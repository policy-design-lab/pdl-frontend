import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ComposableMap, Geographies, ZoomableGroup } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import DrawLegend from "../shared/DrawLegend";
import { formatCurrency, formatNumericValue } from "../shared/ConvertionFormats";
import { useStyles, tooltipBkgColor } from "../shared/MapTooltip";
import { CountyGeographyLayer, StateBoundaryLayer, StateLabelLayer } from "../shared/countyMap/CountyMapLayers";
import {
    clampCountyMapCenter,
    COUNTY_TOPOJSON_URL,
    getCountyMapPosition,
    getStateFipsFromName,
    getStateViewport,
    loadCountyAndStateTopoJson,
    normalizeCountyFips,
    STATE_TOPOJSON_URL
} from "../../utils/countyGeo";
import { getCountyPercentiles } from "../../utils/countyLegendConfig";
import {
    formatTitle1Percent,
    getTitle1CountyMetricValue,
    getTitle1CountyScopedRecord,
    Title1CountyColumnConfig,
    Title1CountySelector
} from "./title1County";

interface Title1CountyMapProps {
    title: string;
    selector: Title1CountySelector;
    tooltipColumns: Title1CountyColumnConfig[];
    year: string;
    mapColor: [string, string, string, string, string];
    countyPerformance: any;
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedState: string;
    onStateChange: (state: string) => void;
}

const formatTooltipValue = (value: number, type: Title1CountyColumnConfig["type"]): string => {
    if (type === "currency") {
        return formatCurrency(value, 0);
    }
    if (type === "percent") {
        return formatTitle1Percent(value);
    }
    return formatNumericValue(value, 0);
};

const Title1CountyMap = ({
    title,
    selector,
    tooltipColumns,
    year,
    mapColor,
    countyPerformance,
    stateCodes,
    allStates,
    selectedState,
    onStateChange
}: Title1CountyMapProps): JSX.Element => {
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
        const dataMap: Record<string, any> = {};
        const valueMap: Record<string, number> = {};
        const values: number[] = [];
        const zeros: string[] = [];
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
                dataMap[countyFips] = county;
                const paymentValue = getTitle1CountyMetricValue(county, selector, "totalPaymentInDollars");
                if (paymentValue === null) {
                    return;
                }
                valueMap[countyFips] = paymentValue;
                values.push(paymentValue);
                if (paymentValue === 0) {
                    zeros.push(countyFips);
                }
            });
        }
        return { countyDataMap: dataMap, countyValueMap: valueMap, quantizeArray: values, zeroPoints: zeros };
    }, [countyPerformance, year, selectedState, selector, stateCodes]);

    const countyPercentiles = getCountyPercentiles("default");
    const quantileScale = useMemo(() => {
        if (quantizeArray.length === 0) {
            return null;
        }
        const nonZeroData = quantizeArray.filter((value) => value !== 0);
        if (nonZeroData.length < 5) {
            return null;
        }
        const sorted = [...nonZeroData].sort((a, b) => a - b);
        const percentile = (values: number[], pct: number) => {
            const index = (pct / 100) * (values.length - 1);
            const low = Math.floor(index);
            const high = Math.ceil(index);
            if (low === high) {
                return values[low];
            }
            const lowValue = values[low] * (1 - (index - low));
            const highValue = values[high] * (index - low);
            return lowValue + highValue;
        };
        return countyPercentiles.map((pct) => percentile(sorted, pct));
    }, [countyPercentiles, quantizeArray]);

    const customScale = quantileScale || [0, 1000000, 5000000, 10000000];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
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
        return () => clearTimeout(timer);
    }, [selectedState, selector, year]);

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
            if (finished || !mountedRef.current) {
                return;
            }
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
        if (!mountedRef.current) {
            return;
        }
        setUserZoomLevel((currentZoomLevel) => Math.min(currentZoomLevel * 1.2, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        if (!mountedRef.current) {
            return;
        }
        setUserZoomLevel((currentZoomLevel) => Math.max(currentZoomLevel / 1.2, 0.5));
    }, []);

    const handleResetZoom = useCallback(() => {
        if (!mountedRef.current) {
            return;
        }
        setUserZoomLevel(1);
        setPosition(getBasePosition(1));
    }, [getBasePosition]);

    const handleCloseStateView = useCallback(() => {
        if (!mountedRef.current) {
            return;
        }
        onStateChange("All States");
        setUserZoomLevel(1);
        setPosition(getCountyMapPosition("All States", 1));
    }, [onStateChange]);

    const handleMoveEnd = useCallback(
        (positionObj: { coordinates: number[]; zoom: number }) => {
            if (!mountedRef.current) {
                return;
            }
            if (selectedState === "All States") {
                const clamped = clampCountyMapCenter(positionObj.coordinates);
                setPosition({ coordinates: clamped, zoom: positionObj.zoom });
                return;
            }
            const stateView = getStateViewport(selectedState);
            if (!stateView) {
                return;
            }
            const [centerLon, centerLat] = stateView.center;
            if (positionObj.coordinates[0] !== centerLon || positionObj.coordinates[1] !== centerLat) {
                setPosition({ coordinates: stateView.center, zoom: positionObj.zoom });
            }
        },
        [selectedState]
    );

    const getCountyFillColor = useCallback(
        (countyFips: string) => {
            const value = countyValueMap[countyFips];
            if (value === undefined) {
                return "#EEE";
            }
            if (value === 0) {
                return "#CCC";
            }
            return colorScale(value);
        },
        [countyValueMap, colorScale]
    );

    const handleMouseEnter = useCallback(
        (geo: any, countyFips: string) => {
            if (hoveredCountyRef.current === countyFips) {
                return;
            }
            hoveredCountyRef.current = countyFips;
            const countyData = countyDataMap[countyFips];
            if (!countyData) {
                scheduleTooltipContent("");
                return;
            }
            const scopedRecord = getTitle1CountyScopedRecord(countyData, selector);
            if (!scopedRecord) {
                scheduleTooltipContent("");
                return;
            }
            const stateName = stateCodes[countyData.state] || countyData.state;
            const visibleColumns = tooltipColumns.filter((column) => {
                const value = Number(scopedRecord[column.accessor]);
                return Number.isFinite(value);
            });

            const tooltipContent = (
                <div className="map_tooltip">
                    <div className={classes.tooltip_header}>
                        <b>
                            {countyData.countyName || geo.properties?.name || "Unknown County"}, {stateName}
                        </b>
                    </div>
                    <table className={classes.tooltip_table}>
                        <tbody>
                            {visibleColumns.map((column, index) => {
                                const value = Number(scopedRecord[column.accessor]);
                                const leftClassName =
                                    index === 0 ? classes.tooltip_topcell_left : classes.tooltip_regularcell_left;
                                const rightClassName =
                                    index === 0 ? classes.tooltip_topcell_right : classes.tooltip_regularcell_right;
                                return (
                                    <tr key={column.accessor}>
                                        <td className={leftClassName}>{column.header}:</td>
                                        <td className={rightClassName}>{formatTooltipValue(value, column.type)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            scheduleTooltipContent(tooltipContent);
        },
        [classes, countyDataMap, scheduleTooltipContent, selector, stateCodes, tooltipColumns]
    );

    const handleMouseLeave = useCallback(() => {
        hoveredCountyRef.current = null;
        scheduleTooltipContent("");
    }, [scheduleTooltipContent]);

    const titleElement = (): JSX.Element => (
        <Typography noWrap variant="h6">
            <strong>{title}</strong> from <strong>{year}</strong>
            {selectedState !== "All States" && <span> - {selectedState}</span>}
        </Typography>
    );

    return (
        <div>
            <Box display="flex" justifyContent="center">
                {quantizeArray.length > 0 ? (
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
                ) : (
                    <div>
                        {titleElement()}
                        <Box display="flex" justifyContent="center">
                            <Typography sx={{ color: "#CCC", fontWeight: 700 }}>
                                County payment data in {year} is unavailable.
                            </Typography>
                        </Box>
                    </div>
                )}
            </Box>
            <Box sx={{ position: "relative", width: "100%" }}>
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
                    data-for="title1-county-map-tooltip"
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
                    id="title1-county-map-tooltip"
                >
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default React.memo(Title1CountyMap);
