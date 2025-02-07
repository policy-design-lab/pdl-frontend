/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FormControl, Select, Chip, MenuItem, Button, FormLabel } from "@mui/material";
import DrawLegend from "./shared/DrawLegend";
import { CurrencyFormat } from "./shared/ConvertionFormats";
import { useStyles, tooltipBkgColor } from "./shared/MapTooltip";
import "../styles/map.css";

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

const MapChart = (props) => {
    const {
        setReactTooltipContent,
        title,
        stateCodes,
        allPrograms,
        allStates,
        summary,
        screenWidth,
        calculateTotal,
        selectedPrograms,
        colorScale,
        calculateNationwideTotal,
        mapColor
    } = props;
    const searchKey = "";
    const hashmap = new Map([]);
    summary.forEach((item) => {
        if (item.Title === title) {
            const state = item.State;
            if (!hashmap.has(state)) {
                hashmap.set(state, 0);
            }
            hashmap.set(state, hashmap.get(state) + item.Amount);
        }
    });
    // const customScale = legendConfig[searchKey];
    // const colorScale = d3.scaleThreshold(customScale, [color1, color2, color3, color4, color5]);
    const yearList = summary
        .map((item) => item["Fiscal Year"])
        .filter((value, index, self) => self.indexOf(value) === index);
    const zeroPoints = [];
    allPrograms.forEach((d) => {
        if (d[searchKey] === 0) zeroPoints.push(d.State);
    });
    const classes = useStyles();
    return (
        <div data-tip="">
            <Box id="TopMapContainer" display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <DrawLegend
                    key={selectedPrograms.join(",")}
                    colorScale={colorScale}
                    title={titleElement({ selectedPrograms })}
                    programData={allStates.map((state) => calculateTotal(state.id))}
                    prepColor={mapColor}
                    emptyState={[]}
                    initRatioLarge={0.75}
                    initRatioSmall={0.8}
                    screenWidth={screenWidth}
                />
            </Box>

            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const cur = allStates.find((s) => s.val === geo.id);
                                if (cur) {
                                    const total = calculateTotal(cur.id);
                                    const nationwideTotal = calculateNationwideTotal();
                                    const percentage = (total / nationwideTotal) * 100 || 0;
                                    const hoverContent = (
                                        <div className="map_tooltip">
                                            <div className={classes.tooltip_header}>
                                                <b>{stateCodes[cur.id]}</b>
                                            </div>
                                            <table className={classes.tooltip_table}>
                                                {!selectedPrograms.includes("All Programs") && (
                                                    <tbody>
                                                        {selectedPrograms.map((program, index) => (
                                                            <tr key={program}>
                                                                <td
                                                                    className={
                                                                        index === 0
                                                                            ? classes.tooltip_topcell_left
                                                                            : classes.tooltip_regularcell_left
                                                                    }
                                                                >
                                                                    {program}:
                                                                </td>
                                                                <td
                                                                    className={
                                                                        index === 0
                                                                            ? classes.tooltip_topcell_right
                                                                            : classes.tooltip_regularcell_right
                                                                    }
                                                                >
                                                                    {CurrencyFormat(
                                                                        summary
                                                                            .filter(
                                                                                (item) =>
                                                                                    item.State === cur.id &&
                                                                                    item.Title === program
                                                                            )
                                                                            .reduce((sum, item) => sum + item.Amount, 0)
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td className={classes.tooltip_footer_left}>
                                                                Total Benefits:
                                                            </td>
                                                            <td className={classes.tooltip_footer_right}>
                                                                {CurrencyFormat(total)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className={classes.tooltip_bottomcell_left}>
                                                                Total Benefits Percentage Nationwide
                                                            </td>
                                                            <td className={classes.tooltip_bottomcell_right}>
                                                                {percentage.toFixed(2)}%
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                                {selectedPrograms.includes("All Programs") && (
                                                    <tbody>
                                                        <tr>
                                                            <td className={classes.tooltip_footer_left}>
                                                                Total Benefits:
                                                            </td>
                                                            <td className={classes.tooltip_footer_right}>
                                                                {CurrencyFormat(total)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className={classes.tooltip_bottomcell_left}>
                                                                <b>Total Benefits Percentage Nationwide</b>
                                                            </td>
                                                            <td className={classes.tooltip_bottomcell_right}>
                                                                <b>{percentage.toFixed(2)}%</b>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                            </table>
                                        </div>
                                    );

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {
                                                setReactTooltipContent(hoverContent);
                                            }}
                                            onMouseLeave={() => {
                                                setReactTooltipContent("");
                                            }}
                                            fill={total ? colorScale(total) : "#D2D2D2"}
                                            stroke="#FFF"
                                            style={{
                                                default: { stroke: "#FFFFFF", strokeWidth: 0.75, outline: "none" },
                                                hover: {
                                                    stroke: "#232323",
                                                    strokeWidth: 2,
                                                    outline: "none"
                                                },
                                                pressed: {
                                                    fill: "#345feb",
                                                    outline: "none"
                                                }
                                            }}
                                        />
                                    );
                                }
                                return null;
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

MapChart.propTypes = {
    setReactTooltipContent: PropTypes.func,
    title: PropTypes.string
};

const LandingPageTotalMap = ({
    programTitle,
    allStates,
    stateCodes,
    allPrograms,
    summary,
    containerWidth = window.innerWidth
}): JSX.Element => {
    const classes = useStyles();
    const [content, setContent] = useState("");
    const [screenWidth, setScreenWidth] = useState(containerWidth);
    const mapColor = ["#FFF9D8", "#E1F2C4", "#9FD9BA", "#1B9577", "#005A45"];
    const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
    const programOptions = useMemo(() => {
        const uniquePrograms = [...new Set(summary.map((item) => item.Title))];
        return ["All Programs", ...uniquePrograms];
    }, [summary]);
    const calculateTotal = useCallback(
        (state) => {
            if (!allPrograms || !summary) return 0;
            if (selectedPrograms.includes("All Programs")) {
                const stateProgram = allPrograms.find((s) => s.State === state);
                return stateProgram ? stateProgram["18-22 All Programs Total"] : 0;
            }
            return selectedPrograms.reduce((total, program) => {
                const programTotal = summary
                    .filter((item) => item.State === state && item.Title === program)
                    .reduce((sum, item) => sum + item.Amount, 0);
                return total + programTotal;
            }, 0);
        },
        [selectedPrograms, allPrograms, summary]
    );
    const calculateNationwideTotal = useCallback(() => {
        if (selectedPrograms.includes("All Programs")) {
            return allStates.reduce((total, state) => {
                const stateProgram = allPrograms.find((s) => s.State === state.id);
                return total + (stateProgram?.["18-22 All Programs Total"] || 0);
            }, 0);
        }
        return allStates.reduce((total, state) => {
            return total + calculateTotal(state.id);
        }, 0);
    }, [selectedPrograms, allStates, allPrograms, calculateTotal]);
    const colorScale = useMemo(() => {
        const allTotals = allStates.map((state) => calculateTotal(state.id)).sort((a, b) => a - b);
        const nonZeroData = allTotals.filter((value) => value > 0);
        const numIntervals = 5;
        const intervalSize = Math.ceil(nonZeroData.length / numIntervals);
        const thresholds: number[] = [];
        for (let i = 1; i < numIntervals; i += 1) {
            const thresholdIndex = i * intervalSize - 1;
            const adjustedIndex = Math.min(thresholdIndex, nonZeroData.length - 1);
            thresholds.push(nonZeroData[adjustedIndex]);
        }
        const customScale = d3.scaleThreshold().domain(thresholds).range(mapColor);
        return customScale;
    }, [[allStates, calculateTotal, mapColor]]);

    const handleProgramChange = (event) => {
        const {
            target: { value }
        } = event;
        let selected = typeof value === "string" ? value.split(",") : value;
        const total_index = selected.findIndex((element) => element.indexOf("All Programs") !== -1);
        if (selected.includes("All Programs") && selected.length > 1 && total_index === 0) {
            selected = selected.filter((program) => program !== "All Programs");
        } else if (selected.includes("All Programs") && selected.length > 1 && total_index === selected.length - 1) {
            selected = ["All Programs"];
        } else if (selected.includes("All Programs") && selected.length === 1) {
            selected = ["All Programs"];
        } else if (selected.length === 0) {
            selected = ["All Programs"];
        }
        setSelectedPrograms(selected);
    };
    const handleRemoveProgram = (programToRemove) => {
        setSelectedPrograms((prevPractices) => {
            const newPractices = prevPractices.filter((program) => program !== programToRemove);
            return newPractices.length === 0 ? ["All Programs"] : newPractices;
        });
    };
    useEffect(() => {
        let isMounted = true;
        const handleResize = () => {
            if (isMounted) {
                setScreenWidth(window.innerWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            isMounted = false;
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    const [isDataReady, setIsDataReady] = useState(false);
    useEffect(() => {
        if (!isDataReady && allPrograms && allStates && summary) {
            const hasData = allStates.some((state) => {
                const stateProgram = allPrograms.find((s) => s.State === state.id);
                return stateProgram && stateProgram["18-22 All Programs Total"] > 0;
            });
            if (hasData) {
                setIsDataReady(true);
            }
        }
    }, [allPrograms, allStates, summary, isDataReady, selectedPrograms]);

    return (
        <div>
            <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
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
                        Select Program
                    </FormLabel>
                    <Select
                        labelId="program-select-label"
                        id="program-select"
                        multiple
                        value={selectedPrograms}
                        onChange={handleProgramChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip
                                        key={value}
                                        label={value}
                                        sx={{
                                            "borderRadius": 1,
                                            "borderColor": "lightgray",
                                            "color": "rgba(47, 113, 100, 1)",
                                            "&.Mui-focused": {
                                                color: "rgba(47, 113, 100, 1) !important"
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 600
                                }
                            }
                        }}
                        sx={{
                            "minWidth": 300,
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderRadius: 1,
                                borderColor: "lightgray"
                            }
                        }}
                    >
                        {programOptions.map((program) => (
                            <MenuItem key={program} value={program}>
                                {program}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" my={2}>
                {selectedPrograms.map((program) => (
                    <Button
                        key={program}
                        variant="contained"
                        onClick={() => handleRemoveProgram(program)}
                        sx={{ mr: 1, mb: 1, backgroundColor: "rgba(47, 113, 100, 1)" }}
                    >
                        {program} &times;
                    </Button>
                ))}
            </Box>

            {/* Ensure the MapChart renders when selectedPrograms is updated */}
            {isDataReady && (
                <MapChart
                    setReactTooltipContent={setContent}
                    title={programTitle}
                    stateCodes={stateCodes}
                    allPrograms={allPrograms}
                    allStates={allStates}
                    summary={summary}
                    screenWidth={screenWidth}
                    calculateTotal={calculateTotal}
                    selectedPrograms={selectedPrograms}
                    colorScale={colorScale}
                    calculateNationwideTotal={calculateNationwideTotal}
                    mapColor={mapColor}
                />
            )}

            <div className="tooltip-container">
                {/* Note that react-tooltip v4 has to use inline background color to style the tooltip arrow */}
                <ReactTooltip className={`${classes.customized_tooltip} tooltip`} backgroundColor={tooltipBkgColor}>
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};
const titleElement = ({ selectedPrograms }): JSX.Element => {
    return (
        <Box sx={{ ml: 10 }}>
            {" "}
            <Typography noWrap variant="h6">
                {selectedPrograms.join(",")} from <strong>2018 - 2022</strong>
            </Typography>
        </Box>
    );
};
export default LandingPageTotalMap;
