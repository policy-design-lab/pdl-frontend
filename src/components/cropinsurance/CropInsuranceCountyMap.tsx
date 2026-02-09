import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Box, Button } from "@mui/material";
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
    const [content, setContent] = useState("");
    const [position, setPosition] = useState({ coordinates: [-95, 40], zoom: 1 });
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    const mountedRef = useRef(true);
    const defaultCenter: [number, number] = [-95, 40];
    const mapBounds = { minLon: -170, maxLon: -60, minLat: 15, maxLat: 75 };

    const countyDataMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        if (countyPerformance && countyPerformance[year]) {
            countyPerformance[year].forEach((county: any) => {
                map[county.countyFips] = county;
            });
        }
        return map;
    }, [countyPerformance, year]);

    const { quantizeArray, zeroPoints } = useMemo(() => {
        const qArray: number[] = [];
        const zPoints: string[] = [];
        if (countyPerformance && countyPerformance[year]) {
            countyPerformance[year].forEach((value: any) => {
                let key = getValueFromAttrDollar(value, attribute);
                key = key !== "" ? key : attribute;
                const val = value[key] || 0;
                qArray.push(val);
                if (val === 0) zPoints.push(value.countyFips);
            });
        }
        return { quantizeArray: qArray, zeroPoints: zPoints };
    }, [countyPerformance, year, attribute]);

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

    const customScale = quantileScale || [0, 1000000, 5000000, 10000000];
    const colorScale = d3.scaleThreshold(customScale, mapColor);

    let attr = 0;
    if (attribute === "lossRatio") attr = 1;
    if (attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium") attr = 2;

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

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
        (countyData: any) => {
            if (!countyData) return "#EEE";
            let key = getValueFromAttrDollar(countyData, attribute);
            key = key !== "" ? key : attribute;
            const value = countyData[key] || 0;
            if (value === 0) return "#CCC";
            return colorScale(value);
        },
        [attribute, colorScale]
    );

    const handleMouseEnter = useCallback(
        (geo: any, countyFIPS: string) => {
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
                setContent(tooltipContent as any);
                return;
            }

            let key = getValueFromAttrDollar(countyData, attribute);
            key = key !== "" ? key : attribute;
            const value = countyData[key] || 0;
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
                                        {Number(value * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
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
            setContent(tooltipContent as any);
        },
        [countyDataMap, attribute, stateCodes, classes, attr]
    );

    const handleMouseLeave = useCallback(() => {
        setContent("");
    }, []);

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
                <div data-tip="" data-for="county-map-tooltip">
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
                                    <>
                                        {geographies.map((geo) => {
                                            const countyFIPS = geo.id;
                                            if (!countyFIPS) return null;
                                            const stateFips = countyFIPS.substring(0, 2);
                                            const stateName = stateFipsToName[stateFips];

                                            if (selectedState !== "All States" && stateName !== selectedState) {
                                                return null;
                                            }

                                            const countyData = countyDataMap[countyFIPS];
                                            const fillColor = getCountyFillColor(countyData);

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    onMouseEnter={() => handleMouseEnter(geo, countyFIPS)}
                                                    onMouseLeave={handleMouseLeave}
                                                    fill={fillColor}
                                                    stroke="#FFFFFF"
                                                    strokeWidth={0.15}
                                                    style={{
                                                        default: {
                                                            outline: "none",
                                                            transition:
                                                                "fill 160ms ease, stroke 160ms ease, stroke-width 160ms ease"
                                                        },
                                                        hover: {
                                                            stroke: "#232323",
                                                            strokeWidth: 0.5,
                                                            outline: "none",
                                                            transition:
                                                                "fill 160ms ease, stroke 160ms ease, stroke-width 160ms ease"
                                                        },
                                                        pressed: { outline: "none" }
                                                    }}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </Geographies>
                            <Geographies geography={geoStateUrl}>
                                {({ geographies: stateGeographies }) =>
                                    stateGeographies.map((geo) => (
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
                                    ))
                                }
                            </Geographies>
                            {selectedState === "All States" && (
                                <Geographies geography={geoStateUrl}>
                                    {({ geographies: labelGeographies }) =>
                                        labelGeographies.map((geo) => {
                                            const centroid = geoCentroid(geo);
                                            const cur = allStates.find((s) => s.val === geo.id);
                                            if (!cur || centroid[0] < -160 || centroid[0] > -67) {
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
                                                            {cur.id}
                                                        </text>
                                                    </Marker>
                                                </g>
                                            );
                                        })
                                    }
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

export default CropInsuranceCountyMap;
