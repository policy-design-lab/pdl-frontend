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
const knownCountyNames = {
    "AL": ["Autauga", "Baldwin", "Barbour", "Bibb", "Blount", "Bullock", "Butler", "Calhoun", 
           "Chambers", "Cherokee", "Chilton", "Choctaw", "Clarke", "Clay", "Cleburne", "Coffee",
           "Colbert", "Conecuh", "Coosa", "Covington", "Crenshaw", "Cullman", "Dale", "Dallas",
           "DeKalb", "Elmore", "Escambia", "Etowah", "Fayette", "Franklin", "Geneva", "Greene",
           "Hale", "Henry", "Houston", "Jackson", "Jefferson", "Lamar", "Lauderdale", "Lawrence",
           "Lee", "Limestone", "Lowndes", "Macon", "Madison", "Marengo", "Marion", "Marshall",
           "Mobile", "Monroe", "Montgomery", "Morgan", "Perry", "Pickens", "Pike", "Randolph",
           "Russell", "St. Clair", "Shelby", "Sumter", "Talladega", "Tallapoosa", "Tuscaloosa", 
           "Walker", "Washington", "Wilcox", "Winston"],
    "GA": ["Appling", "Atkinson", "Bacon", "Baker", "Baldwin", "Banks", "Barrow", "Bartow",
           "Ben Hill", "Berrien", "Bibb", "Bleckley", "Brantley", "Brooks", "Bryan", "Bulloch"],
    "AZ": ["Apache", "Cochise", "Coconino", "Gila", "Graham", "Greenlee", "La Paz", "Maricopa",
           "Mohave", "Navajo", "Pima", "Pinal", "Santa Cruz", "Yavapai", "Yuma"]
};
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
            const matchingKey = Object.keys(counties).find(key => 
                key.endsWith(countyPart) || key === countyPart
            );
            if (matchingKey) {
                countyData = counties[matchingKey];
                usedKey = matchingKey;
            }
        }
    }
    if (debug && !countyData) {
        console.log(`County data not found for FIPS ${countyFIPS}. Available keys:`, 
            Object.keys(counties).slice(0, 20));
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
        if (Object.keys(stateCodesData).length > 0) {
            const stateCodeEntries = Object.entries(stateCodesData);
            const georgiaEntry = stateCodeEntries.find(([code, name]) => name === "Georgia");
            const numericStateCodeMap = {
                "GA": "13"
            };
            if (georgiaEntry) {
                const [stateCode, stateName] = georgiaEntry;
                const numericFIPS = numericStateCodeMap[stateCode];
                if (numericFIPS && !stateCodeEntries.some(([code]) => code === numericFIPS)) {
                    console.log("Georgia state code mismatch detected. Adding numeric mapping:", {
                        alphaCode: stateCode,
                        numericFIPS,
                        stateName
                    });
                    stateCodesData["13"] = "Georgia";
                }
            }
            Object.entries(stateCodesData).forEach(([code, name]) => {
                if (code.length === 2 && /^[A-Z]{2}$/.test(code)) {
                    const numericCodeMap = {
                        "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
                        "CO": "08", "CT": "09", "DE": "10", "FL": "12", "GA": "13",
                        "HI": "15", "ID": "16", "IL": "17", "IN": "18", "IA": "19",
                        "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24",
                        "MA": "25", "MI": "26", "MN": "27", "MS": "28", "MO": "29",
                        "MT": "30", "NE": "31", "NV": "32", "NH": "33", "NJ": "34",
                        "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
                        "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45",
                        "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VT": "50",
                        "VA": "51", "WA": "53", "WV": "54", "WI": "55", "WY": "56",
                        "DC": "11"
                    };
                    if (numericCodeMap[code] && !stateCodesData[numericCodeMap[code]]) {
                        stateCodesData[numericCodeMap[code]] = name;
                    }
                }
            });
            console.log("State codes mapping check:", {
                totalStateCount: stateCodeEntries.length,
                georgiaInfo: georgiaEntry,
                hasNumericCode: stateCodeEntries.some(([code]) => code === "13"),
                reverseLookup: stateCodeEntries.filter(([code, name]) => 
                    name === "Georgia" || code === "13" || code === "GA"
                )
            });
        }
        if (selectedState === "All States") {
            setPosition({ coordinates: [-95, 40], zoom: 1 });
        } else if (stateViewSettings[selectedState]) {
            const { center, zoom } = stateViewSettings[selectedState];
            setPosition({ coordinates: center, zoom });
            console.log(`Zooming to ${selectedState}: center=${center}, zoom=${zoom}`);
            console.log("Counties data for selected state:", {
                selectedState,
                countiesCount: Object.keys(mapData.counties).length,
                firstFewCounties: Object.entries(mapData.counties).slice(0, 5),
                sampleKeys: Object.keys(mapData.counties).slice(0, 10)
            });
            if (Object.keys(mapData.counties).length === 0) {
                console.log("WARNING: No county data available. Check the following:");
                console.log("1. mapData object:", mapData);
                console.log("2. Is data being filtered out for this state?");
                fetch(geoCountyUrl)
                    .then(response => response.json())
                    .then(data => {
                        console.log("GeoJSON counties loaded:", data);
                        const georgiaCounties = data.objects?.counties?.geometries?.filter(geo => {
                            return geo.id && geo.id.toString().startsWith('13');
                        });
                        console.log("Georgia counties in GeoJSON:", {
                            count: georgiaCounties?.length || 0,
                            counties: georgiaCounties?.slice(0, 5)
                        });
                    })
                    .catch(error => console.error("Error loading county data:", error));
            }
        }
    }, [selectedState, mapData, stateCodesData]);
    const handleMouseEnter = useCallback((geo, countyFIPS) => {
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
        const stateName = stateFIPS ? (stateCodesData[stateFIPS] || "Unknown State") : "Unknown State";
        const { countyData, usedKey } = findCountyData(mapData.counties, localCountyFIPS);
        const isSyntheticCounty = countyData && countyData.name && 
                                 typeof countyData.name === 'string' &&
                                 selectedState !== "All States" &&
                                 !countyData.name.includes(" - ") &&
                                 (countyData.name.startsWith('County ') || 
                                  knownCountyNames[selectedState]?.some(name => name === countyData.name));
        const isGeorgiaCounty = stateFIPS === "13" || stateName === "Georgia";
        if (!countyData) {
            const isFallbackMode = selectedState !== "All States" && 
                                  Object.keys(mapData.counties).length === 0;
            let tooltipHtml;
            if (isGeorgiaCounty && selectedState === "Georgia") {
                tooltipHtml = `
                    <div>
                        <h3>${countyName}, Georgia</h3>
                        <p>FIPS Code: ${localCountyFIPS || 'Unknown'}</p>
                        <p style="color: #666;">No payment data is available for Georgia counties in this dataset.</p>
                        <p style="color: #666; font-size: 0.9em;">County is displayed for geographical reference only.</p>
                    </div>
                `;
            } else if (isFallbackMode) {
                tooltipHtml = `
                    <div>
                        <h3>${countyName}, ${stateName}</h3>
                        <p>FIPS Code: ${localCountyFIPS || 'Unknown'}</p>
                        <p style="color: #666;">No payment data is available for this county.</p>
                        <p style="color: #666; font-size: 0.9em;">Displaying fallback county outlines for ${selectedState}.</p>
                    </div>
                `;
            } else {
                tooltipHtml = `
                    <div>
                        <h3>${countyName}, ${stateName}</h3>
                        <p>FIPS Code: ${localCountyFIPS || 'Unknown'}</p>
                        <p>No payment data available for this county.</p>
                    </div>
                `;
            }
            onTooltipChange(tooltipHtml);
            return;
        }
        if (isSyntheticCounty) {
            const countyDataWithNote = {
                ...countyData,
                isSyntheticData: true 
            };
            const tooltipHtml = CountyTooltipContent({
                countyData: countyDataWithNote,
                countyFIPS: localCountyFIPS,
                viewMode,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                yearAggregation
            });
            onTooltipChange(tooltipHtml);
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
        onTooltipChange(tooltipHtml);
    }, [mapData, onTooltipChange, selectedCommodities, selectedPrograms, classes, showMeanValues, viewMode, yearAggregation, selectedState, stateCodesData]);
    const handleMouseLeave = useCallback(() => {
        onTooltipChange("");
    }, [onTooltipChange]);
    const handleCloseStateView = useCallback(() => {
        setSelectedState("All States");
    }, [setSelectedState]);
    const handleMoveEnd = useCallback((positionObj) => {
        setPosition(positionObj);
    }, []);
    const getCountyFillColor = useCallback((countyData) => {
        if (!countyData) return "#EEE"; 
        const isSyntheticCounty = countyData.name && 
                                  typeof countyData.name === 'string' &&
                                  selectedState !== "All States" &&
                                  !countyData.name.includes(" - ") &&
                                  (countyData.name.startsWith('County ') || 
                                   knownCountyNames[selectedState]?.some(name => name === countyData.name));
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
        return valueToUse === 0 ? "#CCC" : colorScale(valueToUse);
    }, [showMeanValues, selectedPrograms, viewMode, colorScale, selectedState]);
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
                            bgcolor: "rgba(255, 255, 255, 0.8)", 
                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" } 
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            )}
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
                        <ZoomableGroup 
                            center={position.coordinates}
                            zoom={position.zoom}
                            onMoveEnd={handleMoveEnd}
                            minZoom={position.zoom}
                            maxZoom={position.zoom}
                            translateExtent={[
                                [position.coordinates[0] - 0.001, position.coordinates[1] - 0.001],
                                [position.coordinates[0] + 0.001, position.coordinates[1] + 0.001]
                            ]}
                        >
                            {}
                            <Geographies geography={geoCountyUrl}>
                                {({ geographies }) => {
                                    if (selectedState !== "All States") {
                                        if (selectedState === "Georgia") {
                                            const georgiaCounties = geographies.filter(geo => {
                                                const fips = geo.id;
                                                return fips && fips.startsWith("13"); 
                                            });
                                            console.log(`Found ${georgiaCounties.length} Georgia counties in topology.`);
                                            if (georgiaCounties.length > 0) {
                                                console.log("Sample Georgia counties:", 
                                                    georgiaCounties.slice(0, 5).map(g => ({
                                                        id: g.id,
                                                        name: g.properties?.name
                                                    }))
                                                );
                                            }
                                        }
                                        const filteredGeos = geographies.filter(geo => {
                                            const countyFIPS = geo.id;
                                            if (!countyFIPS) return false;
                                            const stateId = countyFIPS.substring(0, 2);
                                            if (selectedState === "Georgia" && stateId === "13") {
                                                return true;
                                            }
                                            return stateCodesData[stateId] === selectedState;
                                        });
                                        const georgiaFipsCode = Object.entries(stateCodesData)
                                            .find(([code, name]) => name === "Georgia")?.[0];
                                        console.log(`Found ${filteredGeos.length} counties in ${selectedState} (via stateCodesData). First few:`, 
                                            filteredGeos.slice(0, 3).map(g => ({ 
                                                id: g.id, 
                                                name: g.properties?.name,
                                                hasData: !!mapData.counties[g.id]
                                            }))
                                        );
                                        if (selectedState === "Georgia") {
                                            console.log("Georgia specific debug:", {
                                                georgiaCode: georgiaFipsCode,
                                                stateCodesForGeorgia: Object.entries(stateCodesData)
                                                    .filter(([_, name]) => name === "Georgia")
                                                    .map(([code]) => code),
                                                filteredCountyCount: filteredGeos.length,
                                                countyDataKeys: Object.keys(mapData.counties).filter(fips => fips.startsWith(georgiaFipsCode || "13"))
                                            });
                                        }
                                    }
                                    return (
                                    <>
                                        {geographies.map((geo) => {
                                            const countyFIPS = geo.id;
                                            if (!countyFIPS) return null;
                                            const stateId = countyFIPS.substring(0, 2);
                                            if (selectedState !== "All States") {
                                                let stateName = stateCodesData[stateId];
                                                const isGeorgiaCounty = (selectedState === "Georgia" && stateId === "13");
                                                if (!isGeorgiaCounty && stateName !== selectedState) {
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
                                                } else {
                                                    const isSyntheticCounty = countyData.name && 
                                                                             typeof countyData.name === 'string' &&
                                                                             selectedState !== "All States" &&
                                                                             !countyData.name.includes(" - ") &&
                                                                             (countyData.name.startsWith('County ') || 
                                                                              knownCountyNames[selectedState]?.some(name => name === countyData.name));
                                                    if (isSyntheticCounty && countyData.value) {
                                                        fillColor = getCountyFillColor(countyData);
                                                    } else {
                                                        fillColor = getCountyFillColor(countyData);
                                                    }
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
                                            }
                                            const { countyData } = findCountyData(
                                                mapData.counties, 
                                                countyFIPS
                                            );
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
                                                        hover: { stroke: "#232323", strokeWidth: 0.5, outline: "none" },
                                                        pressed: { fill: "#345feb", outline: "none" }
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
                >
                    {tooltipContent}
                </ReactTooltip>
            </Box>
        </Box>
    );
};
export default CountyMap;