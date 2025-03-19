import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import { CountyTooltipContent } from "./CountyTooltipContent";
import { useStyles, tooltipBkgColor } from "../../shared/MapTooltip";

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
const findCountyData = (counties, countyFIPS, debug = false) => {
    let countyData = counties[countyFIPS];
    let usedKey = countyFIPS;
    if (!countyData && countyFIPS) {
        if (countyFIPS.length < 5) {
            const paddedFIPS = countyFIPS.padStart(5, "0");
            countyData = counties[paddedFIPS];
            if (countyData) usedKey = paddedFIPS;
        }
        if (!countyData && countyFIPS.length === 5) {
            const countyCode = countyFIPS.substring(2);
            const paddedCountyCode = countyCode.padStart(3, "0");
            if (counties[countyCode]) {
                countyData = counties[countyCode];
                usedKey = countyCode;
            } else if (counties[paddedCountyCode]) {
                countyData = counties[paddedCountyCode];
                usedKey = paddedCountyCode;
            }
        }
        if (!countyData) {
            const numericFIPS = parseInt(countyFIPS, 10).toString();
            if (counties[numericFIPS]) {
                countyData = counties[numericFIPS];
                usedKey = numericFIPS;
            }
        }
        if (!countyData && countyFIPS.length === 5) {
            const statePrefix = countyFIPS.substring(0, 2);
            const countyPart = countyFIPS.substring(2);
            const matchingKey = Object.keys(counties).find((key) => key.endsWith(countyPart) || key === countyPart);
            if (matchingKey) {
                countyData = counties[matchingKey];
                usedKey = matchingKey;
            }
        }
    }
    return { countyData, usedKey };
};
const CountyMap = ({
    mapData,
    mapColor,
    viewMode,
    selectedState,
    stateCodesData,
    allStates,
    isLoading,
    onTooltipChange,
    tooltipContent,
    showMeanValues,
    selectedPrograms,
    yearAggregation,
    selectedCommodities,
    setSelectedState
}) => {
    const classes = useStyles();
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);
    const [position, setPosition] = useState({ coordinates: [-95, 40], zoom: 1 });
    useEffect(() => {
        let mounted = true;
        if (Object.keys(stateCodesData).length > 0) {
            Object.entries(stateCodesData).forEach(([code, name]) => {
                if (!mounted) return;
                if (code.length === 2 && /^[A-Z]{2}$/.test(code)) {
                    const numericCodeMap = {
                        AL: "01",
                        AK: "02",
                        AZ: "04",
                        AR: "05",
                        CA: "06",
                        CO: "08",
                        CT: "09",
                        DE: "10",
                        FL: "12",
                        GA: "13",
                        HI: "15",
                        ID: "16",
                        IL: "17",
                        IN: "18",
                        IA: "19",
                        KS: "20",
                        KY: "21",
                        LA: "22",
                        ME: "23",
                        MD: "24",
                        MA: "25",
                        MI: "26",
                        MN: "27",
                        MS: "28",
                        MO: "29",
                        MT: "30",
                        NE: "31",
                        NV: "32",
                        NH: "33",
                        NJ: "34",
                        NM: "35",
                        NY: "36",
                        NC: "37",
                        ND: "38",
                        OH: "39",
                        OK: "40",
                        OR: "41",
                        PA: "42",
                        RI: "44",
                        SC: "45",
                        SD: "46",
                        TN: "47",
                        TX: "48",
                        UT: "49",
                        VT: "50",
                        VA: "51",
                        WA: "53",
                        WV: "54",
                        WI: "55",
                        WY: "56",
                        DC: "11"
                    };
                    if (numericCodeMap[code] && !stateCodesData[numericCodeMap[code]]) {
                        stateCodesData[numericCodeMap[code]] = name;
                    }
                }
            });
        }
        if (mounted) {
            if (selectedState === "All States") {
                setPosition({ coordinates: [-95, 40], zoom: 1 });
            } else if (stateViewSettings[selectedState]) {
                const { center, zoom } = stateViewSettings[selectedState];
                setPosition({ coordinates: center, zoom });
            }
        }
        return () => {
            mounted = false;
        };
    }, [selectedState, mapData, stateCodesData]);
    const handleMouseEnter = useCallback(
        (geo, countyFIPS) => {
            let mounted = true;
            let localCountyFIPS = countyFIPS;
            if (!localCountyFIPS && geo.properties) {
                if (geo.properties.GEOID) {
                    localCountyFIPS = geo.properties.GEOID;
                } else if (geo.properties.id) {
                    localCountyFIPS = geo.properties.id;
                } else if (geo.properties.fips) {
                    localCountyFIPS = geo.properties.fips;
                }
            }
            const countyName = geo.properties?.name || "Unknown County";
            const stateFIPS = localCountyFIPS?.substring(0, 2);
            const stateName = stateFIPS ? stateCodesData[stateFIPS] || "Unknown State" : "Unknown State";
            const { countyData, usedKey } = findCountyData(mapData.counties, localCountyFIPS);
            if (!countyData) {
                const isFallbackMode = selectedState !== "All States" && Object.keys(mapData.counties).length === 0;
                let tooltipHtml;
                if (isFallbackMode) {
                    tooltipHtml = `
                    <div>
                        <h3>${countyName}, ${stateName}</h3>
                        <p>FIPS Code: ${localCountyFIPS || "Unknown"}</p>
                        <p style="color: #666;">No payment data is available for this county.</p>
                        <p style="color: #666; font-size: 0.9em;">Displaying fallback county outlines for ${selectedState}.</p>
                    </div>
                `;
                } else {
                    tooltipHtml = `
                    <div>
                        <h3>${countyName}, ${stateName}</h3>
                        <p>FIPS Code: ${localCountyFIPS || "Unknown"}</p>
                        <p>No payment data available for this county.</p>
                    </div>
                `;
                }
                if (mounted) {
                    onTooltipChange(tooltipHtml);
                }
                return;
            }
            const tooltipHtml = CountyTooltipContent({
                countyData,
                countyFIPS: localCountyFIPS,
                viewMode,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                yearAggregation
            });
            if (mounted) {
                onTooltipChange(tooltipHtml);
            }
            return () => {
                mounted = false;
            };
        },
        [
            mapData,
            onTooltipChange,
            selectedCommodities,
            selectedPrograms,
            classes,
            showMeanValues,
            viewMode,
            yearAggregation,
            selectedState,
            stateCodesData
        ]
    );
    const handleMouseLeave = useCallback(() => {
        onTooltipChange("");
    }, [onTooltipChange]);
    const handleCloseStateView = useCallback(() => {
        setSelectedState("All States");
    }, [setSelectedState]);
    const handleMoveEnd = useCallback(
        (positionObj) => {
            let mounted = true;
            if (selectedState === "All States") {
                if (positionObj.zoom !== 1 || positionObj.coordinates[0] !== -95 || positionObj.coordinates[1] !== 40) {
                    setPosition({ coordinates: [-95, 40], zoom: 1 });
                }
            } else if (stateViewSettings[selectedState]) {
                const { center, zoom } = stateViewSettings[selectedState];
                if (
                    positionObj.zoom !== zoom ||
                    positionObj.coordinates[0] !== center[0] ||
                    positionObj.coordinates[1] !== center[1]
                ) {
                    setPosition({ coordinates: center, zoom });
                }
            }
            return () => {
                mounted = false;
            };
        },
        [selectedState]
    );
    const getCountyFillColor = useCallback(
        (countyData) => {
            if (!countyData) return "#EEE";
            let valueToUse;
            const shouldShowMeanValues =
                showMeanValues &&
                selectedPrograms.length === 1 &&
                !selectedPrograms.includes("All Programs") &&
                (selectedPrograms[0].includes("ARC") || selectedPrograms[0].includes("PLC"));
            if (shouldShowMeanValues) {
                if (viewMode === "difference") {
                    valueToUse = countyData.meanRateDifference || 0;
                } else {
                    valueToUse = countyData.meanPaymentRateInDollarsPerAcre || 0;
                }
            } else {
                valueToUse = countyData.value || 0;
            }
            return valueToUse === 0 ? "#CCC" : colorScale(valueToUse);
        },
        [showMeanValues, selectedPrograms, viewMode, colorScale, selectedState]
    );
    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box className="county-commodity-map" sx={{ position: "relative" }}>
            {selectedState !== "All States" && (
                <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
                    <IconButton
                        onClick={handleCloseStateView}
                        aria-label="return to US map"
                        sx={{
                            "bgcolor": "rgba(255, 255, 255, 0.8)",
                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            )}
            <Box
                sx={{
                    width: "100%",
                    position: "relative"
                }}
            >
                <div
                    data-tip=""
                    data-for="map-tooltip"
                    style={{
                        width: "100%",
                        position: "relative"
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 10,
                            pointerEvents: "none"
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onMouseUp={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    />
                    <ComposableMap
                        projection="geoAlbersUsa"
                        width={800}
                        height={550}
                        style={{
                            width: "100%",
                            height: "auto",
                            touchAction: "none",
                            marginBottom: "20px"
                        }}
                    >
                        <ZoomableGroup
                            center={position.coordinates}
                            zoom={position.zoom}
                            onMoveEnd={handleMoveEnd}
                            minZoom={position.zoom}
                            maxZoom={position.zoom}
                            translateExtent={[
                                [position.coordinates[0] - 0.000001, position.coordinates[1] - 0.000001],
                                [position.coordinates[0] + 0.000001, position.coordinates[1] + 0.000001]
                            ]}
                        >
                            {}
                            <Geographies geography={geoCountyUrl}>
                                {({ geographies }) => {
                                    return (
                                        <>
                                            {geographies.map((geo) => {
                                                const countyFIPS = geo.id;
                                                if (!countyFIPS) return null;
                                                const stateId = countyFIPS.substring(0, 2);
                                                if (selectedState !== "All States") {
                                                    const stateName = stateCodesData[stateId];
                                                    if (stateName !== selectedState) {
                                                        return null;
                                                    }
                                                    const { countyData, usedKey } = findCountyData(
                                                        mapData.counties,
                                                        countyFIPS,
                                                        selectedState !== "All States"
                                                    );
                                                    let fillColor;
                                                    if (!countyData) {
                                                        fillColor = "#d9d9d9";
                                                    } else if (countyData.value) {
                                                        fillColor = getCountyFillColor(countyData);
                                                    } else {
                                                        fillColor = getCountyFillColor(countyData);
                                                    }
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
                                                                default: { outline: "none" },
                                                                hover: {
                                                                    stroke: "#232323",
                                                                    strokeWidth: 0.5,
                                                                    outline: "none"
                                                                },
                                                                pressed: {
                                                                    outline: "none",
                                                                    stroke: "#FFFFFF",
                                                                    strokeWidth: 0.15
                                                                }
                                                            }}
                                                        />
                                                    );
                                                }
                                                const { countyData } = findCountyData(mapData.counties, countyFIPS);
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
                                                            default: { outline: "none" },
                                                            hover: {
                                                                stroke: "#232323",
                                                                strokeWidth: 0.5,
                                                                outline: "none"
                                                            },
                                                            pressed: {
                                                                outline: "none",
                                                                stroke: "#FFFFFF",
                                                                strokeWidth: 0.15
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                            {}
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
                                                                default: { outline: "none" },
                                                                hover: { outline: "none" },
                                                                pressed: { outline: "none" }
                                                            }}
                                                        />
                                                    ))
                                                }
                                            </Geographies>
                                            {}
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
                                                                        {}
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
                                                                            style={{
                                                                                fontWeight: "bold",
                                                                                pointerEvents: "none"
                                                                            }}
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
                                        </>
                                    );
                                }}
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>
                <ReactTooltip
                    className={`${classes.customized_tooltip} tooltip`}
                    backgroundColor={tooltipBkgColor}
                    effect="float"
                    html
                    id="map-tooltip"
                    clickable={false}
                >
                    {tooltipContent}
                </ReactTooltip>
            </Box>
        </Box>
    );
};
export default CountyMap;
