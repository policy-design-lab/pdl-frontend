import React, { useState, useMemo } from "react";
import { CircularProgress } from "@mui/material";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { config } from "../../../app.config";
import { useStyles, tooltipBkgColor } from "../MapTooltip";
import "../../../styles/map.css";
import StateMapLegend from "../StateMapLegend";
import { buildCountyColorScale, QUINTILE_PERCENTILES } from "../../../utils/countyColorScale";
import {
    getPracticeTotal,
    calculateNationalTotalMap,
    getPracticeCategories,
    getStatePracticeTotals,
    computeTooltipContent
} from "./PracticeMethods";
import { PracticeMapProps } from "./Interface";
import PracticeNameMatch from "./PracticeNameMatch";
import PracticeSelector, { ALL_PRACTICES } from "./PracticeSelector";
import { ACCENT_BLUE, NO_DATA_GRAY, TEXT_DARKER, TEXT_DIM, TEXT_FAINT, TITLE_II_MAP_COLOR, WHITE } from "../colors";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const offsets = {
    VT: [50, -8],
    NH: [34, 2],
    MA: [30, -1],
    RI: [28, 2],
    CT: [35, 10],
    NJ: [34, 1],
    DE: [33, 0],
    MD: [47, 10],
    DC: [49, 21]
};

const MapChart = ({
    getNationalTotal,
    setReactTooltipContent,
    maxValue,
    allStates,
    statePerformance,
    year,
    stateCodes,
    colorScale,
    selectedPractices,
    classes
}) => {
    const handleMouseEnter = React.useCallback(
        (geo, record) => {
            const tooltipContent = computeTooltipContent(geo, record, selectedPractices, classes, getNationalTotal);
            setReactTooltipContent(tooltipContent);
        },
        [selectedPractices, classes, getNationalTotal]
    );
    const handleMouseLeave = React.useCallback(() => {
        setReactTooltipContent("");
    }, []);

    return (
        <div data-tip="" data-for="map-tooltip">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const record = statePerformance[year]?.find(
                                    (v) => stateCodes[v.state] === geo.properties.name
                                );
                                let practiceTotal = 0;
                                if (selectedPractices.includes("All Practices")) {
                                    practiceTotal = record?.totalPaymentInDollars || 0;
                                } else {
                                    selectedPractices.forEach((practice) => {
                                        practiceTotal += getPracticeTotal(record, practice);
                                    });
                                }
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => handleMouseEnter(geo, record)}
                                        onMouseLeave={handleMouseLeave}
                                        fill={
                                            !practiceTotal || practiceTotal === 0
                                                ? NO_DATA_GRAY
                                                : colorScale(practiceTotal)
                                        }
                                        stroke="#FFF"
                                        style={{
                                            default: { stroke: WHITE, strokeWidth: 0.75, outline: "none" },
                                            hover: { stroke: TEXT_DARKER, strokeWidth: 2, outline: "none" },
                                            pressed: { fill: ACCENT_BLUE, outline: "none" }
                                        }}
                                    />
                                );
                            })}
                            {geographies.map((geo) => {
                                const centroid = geoCentroid(geo);
                                const cur = allStates.find((s) => s.val === geo.id);
                                return (
                                    <g key={`${geo.rsmKey}-name`}>
                                        {cur &&
                                            centroid[0] > -160 &&
                                            centroid[0] < -67 &&
                                            (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                                                <Marker coordinates={centroid}>
                                                    <text y="2" fontSize={14} textAnchor="middle">
                                                        {cur.id}
                                                    </text>
                                                </Marker>
                                            ) : (
                                                <Annotation
                                                    subject={centroid}
                                                    dx={offsets[cur.id][0]}
                                                    dy={offsets[cur.id][1]}
                                                >
                                                    <text x={4} fontSize={14} alignmentBaseline="middle">
                                                        {cur.id}
                                                    </text>
                                                </Annotation>
                                            ))}
                                    </g>
                                );
                            })}
                        </>
                    )}
                </Geographies>
            </ComposableMap>
        </div>
    );
};
const TitleIIPracticeMap = ({
    programName,
    initialStatePerformance,
    allStates,
    year,
    stateCodes,
    practiceNames,
    selectedPractices,
    onPracticeChange
}: PracticeMapProps) => {
    const [content, setContent] = useState("");
    const [statePerformance, setStatePerformance] = useState(initialStatePerformance);
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    // help tooltip style to load without lag
    React.useEffect(() => {
        if (content) {
            ReactTooltip.hide();
            ReactTooltip.rebuild();
            setTooltipVisible(true);
        } else {
            setTooltipVisible(false);
        }
    }, [content]);
    React.useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            .__react_component_tooltip {
                padding: 0 !important;
                margin: 0 !important;
                opacity: 1 !important;
            }
            .__react_component_tooltip.show {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            ReactTooltip.hide();
            document.head.removeChild(style);
        };
    }, []);
    const setTooltipContent = React.useCallback((newContent) => {
        setContent(newContent);
    }, []);

    const practiceCategories = useMemo(() => {
        return getPracticeCategories(practiceNames);
    }, [practiceNames]);
    React.useEffect(() => {
        let isCurrent = true;
        const fetchStatePerformanceData = async () => {
            if (selectedPractices.includes(ALL_PRACTICES)) {
                setStatePerformance(initialStatePerformance);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const selectedCodes = selectedPractices
                    .map((practiceName) => {
                        const match = PracticeNameMatch(practiceName);
                        if (match === null) {
                            console.error(`Could not match practice name: ${practiceName}`);
                            return null;
                        }
                        return match;
                    })
                    .filter((code) => code !== null);
                if (selectedCodes.length === 0) {
                    setStatePerformance(initialStatePerformance);
                    return;
                }
                const encodedCodes = selectedCodes.map((code) => encodeURIComponent(code)).join("|");
                const url = `${
                    config.apiUrl
                }/titles/title-ii/programs/${programName.toLowerCase()}/state-distribution?practice_code=${encodedCodes}`;
                const response = await fetch(url);
                const data = await response.json();
                if (isCurrent) {
                    setStatePerformance(data);
                }
            } catch (error) {
                console.error("Error fetching state performance data:", error);
                if (isCurrent) {
                    setStatePerformance(initialStatePerformance);
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };
        fetchStatePerformanceData();
        return () => {
            isCurrent = false;
        };
    }, [selectedPractices, initialStatePerformance, programName]);
    const stateValues = useMemo(() => {
        return getStatePracticeTotals(statePerformance, year, selectedPractices);
    }, [statePerformance, year, selectedPractices]);
    const maxValue = useMemo(() => Math.max(...stateValues.map(({ value }) => value), 0), [stateValues]);
    const { colorScale, highlightColor } = useMemo(() => {
        return buildCountyColorScale(
            stateValues.map(({ value }) => value),
            QUINTILE_PERCENTILES,
            TITLE_II_MAP_COLOR
        );
    }, [stateValues]);
    const getNationalTotal = React.useCallback(
        (practices: string[]) => {
            return calculateNationalTotalMap(statePerformance, practices, year);
        },
        [statePerformance, year]
    );
    const tooltipComponent = useMemo(
        () => (
            <ReactTooltip
                id="map-tooltip"
                className={`${classes.customized_tooltip} tooltip`}
                backgroundColor={tooltipBkgColor}
                effect="float"
                html
                getContent={() => (tooltipVisible ? content : null)}
                overridePosition={({ left, top }, _e, _t, node) => {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    if (!node) return { left, top };
                    const tooltipRect = node.getBoundingClientRect();

                    let updatedLeft = left;
                    let updatedTop = top;

                    if (left + tooltipRect.width > viewportWidth) {
                        updatedLeft = viewportWidth - tooltipRect.width - 10;
                    }
                    if (top + tooltipRect.height > viewportHeight) {
                        updatedTop = viewportHeight - tooltipRect.height - 10;
                    }

                    return { left: updatedLeft, top: updatedTop };
                }}
            />
        ),
        [classes, content, tooltipVisible]
    );

    const shouldShowLoading = isLoading && !selectedPractices.includes("All Practices");
    const hasValidData = statePerformance && statePerformance[year] && statePerformance[year].length > 0;
    if (!hasValidData && !shouldShowLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography>No data available</Typography>
            </Box>
        );
    }
    return (
        <Box>
            <Box display="flex" justifyContent="center" sx={{ pt: 30 }}>
                {selectedPractices.length > 0 ? (
                    <StateMapLegend
                        key={selectedPractices.join(",")}
                        stateValues={stateValues}
                        stateCodes={stateCodes}
                        highlightColor={highlightColor}
                        colorScale={colorScale}
                        title={titleElement(programName, selectedPractices, year)}
                        prepColor={TITLE_II_MAP_COLOR}
                        emptyState={[]}
                    />
                ) : (
                    <div>
                        {titleElement(programName, selectedPractices, year)}
                        <Box display="flex" justifyContent="center">
                            <Typography sx={{ color: TEXT_FAINT, fontWeight: 700 }}>
                                Please select at least one practice category.
                            </Typography>
                        </Box>
                    </div>
                )}
            </Box>
            <PracticeSelector practices={practiceCategories} selected={selectedPractices} onChange={onPracticeChange} />

            {shouldShowLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                hasValidData && (
                    <>
                        <MapChart
                            getNationalTotal={getNationalTotal}
                            setReactTooltipContent={setTooltipContent}
                            maxValue={maxValue}
                            allStates={allStates}
                            statePerformance={statePerformance}
                            year={year}
                            stateCodes={stateCodes}
                            colorScale={colorScale}
                            selectedPractices={selectedPractices}
                            classes={classes}
                        />
                        {tooltipComponent}
                    </>
                )
            )}
        </Box>
    );
};

const titleElement = (programName, practices: string[], year: string): JSX.Element => {
    const practiceLabel = practices.length > 0 ? practices.join(", ") : "No practices selected";
    return (
        <Box>
            <Typography variant="h6" textAlign="center">
                <strong>{practiceLabel === "All Practices" ? `Total ${programName}` : "Selected Practices"}</strong>{" "}
                Benefits from <strong>{year}</strong>
            </Typography>
            <Typography style={{ fontSize: "0.5em", color: TEXT_DIM, textAlign: "center" }}>
                <i>Gray states indicate no available data</i>
            </Typography>
        </Box>
    );
};

export default TitleIIPracticeMap;
