import React, { useState, useMemo } from "react";
import { CircularProgress } from "@mui/material";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import * as d3 from "d3";
import { config } from "../../../app.config";
import { useStyles, tooltipBkgColor } from "../MapTooltip";
import "../../../styles/map.css";
import DrawLegend from "../DrawLegend";
import {
    getPracticeTotal,
    calculateNationalTotalMap,
    getPracticeCategories,
    getPracticeData,
    getCustomScale,
    computeTooltipContent
} from "./PracticeMethods";
import { PracticeMapProps } from "./Interface";
import PracticeNameMatch from "./PracticeNameMatch";

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
                                                ? "#D2D2D2"
                                                : colorScale(practiceTotal)
                                        }
                                        stroke="#FFF"
                                        style={{
                                            default: { stroke: "#FFFFFF", strokeWidth: 0.75, outline: "none" },
                                            hover: { stroke: "#232323", strokeWidth: 2, outline: "none" },
                                            pressed: { fill: "#345feb", outline: "none" }
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
    onPracticeChange
}: PracticeMapProps) => {
    const [content, setContent] = useState("");
    const [statePerformance, setStatePerformance] = useState(initialStatePerformance);
    const classes = useStyles();
    const [selectedPractices, setSelectedPractices] = useState<string[]>(["All Practices"]);
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
    const fetchStatePerformanceData = async (selectedPracticeNames: string[]) => {
        if (selectedPracticeNames.includes("All Practices")) {
            setStatePerformance(initialStatePerformance);
            return;
        }
        setIsLoading(true);
        try {
            const selectedCodes = selectedPracticeNames
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
            setStatePerformance(data);
        } catch (error) {
            console.error("Error fetching state performance data:", error);
            setStatePerformance(initialStatePerformance);
        } finally {
            setIsLoading(false);
        }
    };
    const handlePracticeChange = (event) => {
        const value = event.target.value;
        let newSelected = typeof value === "string" ? value.split(",") : value;
        if (newSelected.includes("All Practices") && !selectedPractices.includes("All Practices")) {
            newSelected = ["All Practices"];
        } else if (newSelected.length > 1 && newSelected.includes("All Practices")) {
            newSelected = newSelected.filter((p) => p !== "All Practices");
        } else if (newSelected.length === 0) {
            newSelected = ["All Practices"];
        }

        setSelectedPractices(newSelected);
        if (onPracticeChange) {
            onPracticeChange(newSelected);
        }
        fetchStatePerformanceData(newSelected);
    };
    const practiceData = useMemo(() => {
        return getPracticeData(statePerformance, year, selectedPractices);
    }, [statePerformance, year, selectedPractices]);
    const maxValue = useMemo(() => Math.max(...practiceData, 0), [practiceData]);
    const customScale = useMemo(() => {
        return getCustomScale(practiceData, `Total ${programName}`);
    }, [practiceData]);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const getNationalTotal = React.useCallback(
        (practices: string[]) => {
            return calculateNationalTotalMap(statePerformance, practices, year);
        },
        [statePerformance, year]
    );
    const handleChipDelete = (practiceToDelete) => {
        let newSelected;
        if (selectedPractices.length === 1) {
            newSelected = ["All Practices"];
        } else {
            newSelected = selectedPractices.filter((p) => p !== practiceToDelete);
        }
        setSelectedPractices(newSelected);
        if (onPracticeChange) {
            onPracticeChange(newSelected);
        }
        fetchStatePerformanceData(newSelected);
    };
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
                    <DrawLegend
                        key={selectedPractices.join(",")}
                        colorScale={colorScale}
                        title={titleElement(programName, selectedPractices, year)}
                        programData={practiceData}
                        prepColor={mapColor}
                        isRatio={false}
                        notDollar={false}
                        emptyState={[]}
                    />
                ) : (
                    <div>
                        {titleElement(programName, selectedPractices, year)}
                        <Box display="flex" justifyContent="center">
                            <Typography sx={{ color: "#CCC", fontWeight: 700 }}>
                                Please select at least one practice category.
                            </Typography>
                        </Box>
                    </div>
                )}
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" pt={4}>
                <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            "mr": 2,
                            "minWidth": "5em",
                            "fontWeight": "bold",
                            "fontSize": "1.25rem",
                            "color": "rgba(47, 113, 100, 1)",
                            "&.Mui-focused": { color: "rgba(47, 113, 100, 1) !important" }
                        }}
                    >
                        Select Practice
                    </FormLabel>
                    <Select
                        multiple
                        value={selectedPractices}
                        onChange={handlePracticeChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip
                                        key={value}
                                        label={value}
                                        onDelete={() => handleChipDelete(value)}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        sx={{
                                            borderRadius: 1,
                                            borderColor: "lightgray",
                                            color: "rgba(47, 113, 100, 1)"
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                        sx={{ minWidth: 300 }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 500,
                                    overflowY: "auto",
                                    position: "absolute",
                                    border: "1px solid lightgray",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                    bgcolor: "background.paper"
                                    // extra style for menu since the length of the list is long
                                }
                            }
                        }}
                    >
                        {practiceCategories.map((practice) => (
                            <MenuItem
                                key={typeof practice === "string" ? practice : practice.practiceCode}
                                value={practice}
                            >
                                {typeof practice === "string" ? practice : practice.practiceName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

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
            <Typography style={{ fontSize: "0.5em", color: "#AAA", textAlign: "center" }}>
                <i>Gray states indicate no available data</i>
            </Typography>
        </Box>
    );
};

export default TitleIIPracticeMap;
