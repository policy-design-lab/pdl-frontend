import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import { CountyTooltipContent } from "./CountyTooltipContent";
import { useStyles, tooltipBkgColor } from "../../shared/MapTooltip";

const geoCountyUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const geoStateUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

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

    const handleMouseEnter = (geo, countyFIPS) => {
        const countyData = mapData.counties[countyFIPS];
        if (!countyData) {
            // Simple tooltip for counties without data
            const countyName = geo.properties?.name || "Unknown County";
            const tooltipContent = `<div><h3>${countyName}</h3><p>No payment data available</p></div>`;
            onTooltipChange(tooltipContent);
            return;
        }

        const tooltipContent = CountyTooltipContent({
            countyData,
            countyFIPS,
            viewMode,
            selectedCommodities,
            selectedPrograms,
            classes,
            showMeanValues,
            yearAggregation
        });

        onTooltipChange(tooltipContent);
    };

    const handleMouseLeave = () => {
        onTooltipChange("");
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="county-commodity-map" sx={{ position: "relative" }}>
            <Box sx={{ width: "100%" }}>
                <div data-tip="" data-for="map-tooltip" style={{ width: "100%" }}>
                    <ComposableMap 
                        projection="geoAlbersUsa"
                        width={800}
                        height={500}
                        style={{
                            width: "100%",
                            height: "auto"
                        }}
                    >
                        {/* Render Counties */}
                        <Geographies geography={geoCountyUrl}>
                            {({ geographies }) => (
                                <>
                                    {geographies.map((geo) => {
                                        const countyFIPS = geo.id;
                                        if (!countyFIPS) return null;

                                        // Filter by state if a state is selected
                                        if (selectedState !== "All States") {
                                            const stateId = countyFIPS.substring(0, 2);
                                            const stateName = stateCodesData[stateId];
                                            if (stateName !== selectedState) return null;
                                        }

                                        const countyData = mapData.counties[countyFIPS];
                                        let fillColor = "#EEE";
                                        if (countyData) {
                                            let valueToUse;
                                            const shouldShowMeanValues =
                                                showMeanValues &&
                                                selectedPrograms.length === 1 &&
                                                !selectedPrograms.includes("All Programs") &&
                                                (selectedPrograms[0].includes("ARC") ||
                                                    selectedPrograms[0].includes("PLC"));

                                            if (shouldShowMeanValues) {
                                                if (viewMode === "difference") {
                                                    valueToUse = countyData.meanRateDifference || 0;
                                                } else {
                                                    valueToUse = countyData.meanPaymentRateInDollarsPerAcre || 0;
                                                }
                                            } else {
                                                valueToUse = countyData.value || 0;
                                            }
                                            fillColor = valueToUse === 0 ? "#CCC" : colorScale(valueToUse);
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
                                                    hover: { stroke: "#232323", strokeWidth: 0.5, outline: "none" },
                                                    pressed: { fill: "#345feb", outline: "none" }
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Add state boundaries with stronger lines */}
                                    <Geographies geography={geoStateUrl}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => (
                                                <Geography
                                                    key={`state-${geo.rsmKey}`}
                                                    geography={geo}
                                                    fill="none"
                                                    stroke="#000"
                                                    strokeWidth={0.5}
                                                />
                                            ))
                                        }
                                    </Geographies>

                                    {/* Add state labels when viewing all states */}
                                    {selectedState === "All States" && (
                                        <Geographies geography={geoStateUrl}>
                                            {({ geographies }) =>
                                                geographies.map((geo) => {
                                                    const centroid = geoCentroid(geo);
                                                    const cur = allStates.find((s) => s.val === geo.id);
                                                    if (!cur || centroid[0] < -160 || centroid[0] > -67) {
                                                        return null;
                                                    }
                                                    return (
                                                        <g key={`${geo.rsmKey}-name`}>
                                                            <Marker coordinates={centroid}>
                                                                <text
                                                                    y="2"
                                                                    fontSize={12}
                                                                    textAnchor="middle"
                                                                    fill="#555"
                                                                    style={{ 
                                                                        pointerEvents: "all",
                                                                        cursor: "pointer",
                                                                        fontWeight: "bold"
                                                                    }}
                                                                    onClick={() => {
                                                                        const stateName = stateCodesData[geo.id];
                                                                        if (stateName) {
                                                                            setSelectedState(stateName);
                                                                        }
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
                            )}
                        </Geographies>
                    </ComposableMap>
                </div>
                <ReactTooltip
                    className={`${classes.customized_tooltip} tooltip`}
                    backgroundColor={tooltipBkgColor}
                    effect="float"
                    html
                    id="map-tooltip"
                >
                    {tooltipContent}
                </ReactTooltip>
            </Box>
        </Box>
    );
};

export default CountyMap;
