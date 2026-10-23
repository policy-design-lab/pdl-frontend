import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Box, Button } from "@mui/material";
import { ComposableMap, Geographies, ZoomableGroup } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import CloseIcon from "@mui/icons-material/Close";
import { useStyles, tooltipBkgColor } from "../MapTooltip";
import MapLoadingOverlay from "../MapLoadingOverlay";
import { CountyGeographyLayer, StateBoundaryLayer, StateLabelLayer } from "./CountyMapLayers";
import {
    COUNTY_TOPOJSON_URL,
    STATE_TOPOJSON_URL,
    clampCountyMapCenter,
    getCountyMapPosition,
    getStateFipsFromName,
    getStateViewport,
    loadCountyAndStateTopoJson,
    normalizeCountyFips
} from "../../../utils/countyGeo";
import { BRAND_GREEN, BRAND_GREEN_10, BRAND_GREEN_50, BRAND_GREEN_90, TEXT_FAINT, WHITE_90 } from "../colors";

export interface CountyTooltipContext {
    geo: any;
    countyFips: string;
    countyData: any;
    value: number | undefined;
    classes: Record<string, string>;
}

interface CountyChoroplethMapProps {
    countyData: any;
    year: string;
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedState: string;
    onStateChange: (state: string) => void;
    valueAccessor: (county: any) => number;
    colorScale: (value: number) => string;
    renderTooltip: (context: CountyTooltipContext) => React.ReactNode;
    legendComponent: (context: { quantizeArray: number[]; zeroPoints: string[] }) => React.ReactNode;
    controlsComponent?: React.ReactNode;
    tooltipId?: string;
    loadingLabel?: string;
    noDataFill?: string;
    zeroFill?: string;
}

const CountyChoroplethMap = ({
    countyData,
    year,
    stateCodes,
    allStates,
    selectedState,
    onStateChange,
    valueAccessor,
    colorScale,
    renderTooltip,
    legendComponent,
    controlsComponent = null,
    tooltipId = "county-map-tooltip",
    loadingLabel = "Rendering county map...",
    noDataFill = "#EEE",
    zeroFill = TEXT_FAINT
}: CountyChoroplethMapProps): JSX.Element => {
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
        if (countyData && countyData[year]) {
            countyData[year].forEach((county: any) => {
                const stateName = stateCodes[county.state] || county.state;
                if (selectedState !== "All States" && stateName !== selectedState) {
                    return;
                }
                const countyFips = normalizeCountyFips(county.countyFips);
                if (!countyFips) {
                    return;
                }
                map[countyFips] = county;
                const value = Number(valueAccessor(county));
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
    }, [countyData, year, selectedState, stateCodes, valueAccessor]);

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
        return () => {
            clearTimeout(timer);
        };
    }, [selectedState, year, valueAccessor]);

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
            if (value === undefined) return noDataFill;
            if (value === 0) return zeroFill;
            return colorScale(value);
        },
        [countyValueMap, colorScale, noDataFill, zeroFill]
    );

    const handleMouseEnter = useCallback(
        (geo: any, countyFIPS: string) => {
            if (hoveredCountyRef.current === countyFIPS) {
                return;
            }
            hoveredCountyRef.current = countyFIPS;
            scheduleTooltipContent(
                renderTooltip({
                    geo,
                    countyFips: countyFIPS,
                    countyData: countyDataMap[countyFIPS],
                    value: countyValueMap[countyFIPS],
                    classes
                })
            );
        },
        [countyDataMap, countyValueMap, classes, scheduleTooltipContent, renderTooltip]
    );

    const handleMouseLeave = useCallback(() => {
        hoveredCountyRef.current = null;
        scheduleTooltipContent("");
    }, [scheduleTooltipContent]);

    return (
        <div>
            <Box display="flex" justifyContent="center">
                {legendComponent({ quantizeArray, zeroPoints })}
            </Box>
            {controlsComponent}
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
                                "bgcolor": BRAND_GREEN_90,
                                "color": "white",
                                "border": "2px solid white",
                                "boxShadow": "0 2px 10px rgba(0,0,0,0.2)",
                                "&:hover": {
                                    bgcolor: BRAND_GREEN,
                                    transform: "scale(1.05)"
                                }
                            }}
                        >
                            Return to US Map
                        </Button>
                    </Box>
                )}
                {!interactionReady && <MapLoadingOverlay label={loadingLabel} zIndex={1600} />}
                <div data-tip="" data-for={tooltipId} style={{ pointerEvents: interactionReady ? "auto" : "none" }}>
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
                            backgroundColor: WHITE_90,
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
                            backgroundColor: WHITE_90,
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
                                "borderColor": BRAND_GREEN_50,
                                "color": BRAND_GREEN,
                                "&:hover": {
                                    borderColor: BRAND_GREEN,
                                    backgroundColor: BRAND_GREEN_10
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
                                "borderColor": BRAND_GREEN_50,
                                "color": BRAND_GREEN,
                                "&:hover": {
                                    borderColor: BRAND_GREEN,
                                    backgroundColor: BRAND_GREEN_10
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
                                "borderColor": BRAND_GREEN_50,
                                "color": BRAND_GREEN,
                                "&:hover": {
                                    borderColor: BRAND_GREEN,
                                    backgroundColor: BRAND_GREEN_10
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
                    id={tooltipId}
                >
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default React.memo(CountyChoroplethMap);
