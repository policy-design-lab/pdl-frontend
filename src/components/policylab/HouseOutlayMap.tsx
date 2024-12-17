import { FormControl, FormLabel, Select, Chip, MenuItem, Box, Typography, Tooltip } from "@mui/material";
import React, { useState, useMemo } from "react";
import { geoCentroid } from "d3-geo";
import * as d3 from "d3";
import InfoIcon from "@mui/icons-material/Info";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { useStyles, tooltipBkgColor, topTipStyle } from "../shared/MapTooltip";
import DrawLegend from "../shared/DrawLegend";
import { ShortFormat } from "../shared/ConvertionFormats";

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
    setReactTooltipContent,
    allStates,
    statePerformance,
    year,
    stateCodes,
    colorScale,
    selectedPractices,
    classes
}) => {
    const calculateNationalTotal = (performance, practices, y) => {
        if (!performance[y]) return 0;
        if (practices.includes("All Practices")) {
            return performance[y].reduce(
                (total, state) => total + Math.abs(state.predictedMaximumTotalPaymentInDollars || 0),
                0
            );
        }
        return performance[y].reduce((total, state) => {
            const practiceSum = practices.reduce((sum, practice) => {
                const practiceData = state.practices.find((p) => p.practiceName === practice);
                return sum + Math.abs(practiceData?.predictedMaximumTotalPaymentInDollars || 0);
            }, 0);
            return total + practiceSum;
        }, 0);
    };
    const handleMouseEnter = (geo, state) => {
        if (!state) return;
        let stateValue;
        let percentageNationwide;
        const nationalTotal = calculateNationalTotal(statePerformance, selectedPractices, year);
        if (selectedPractices.includes("All Practices")) {
            stateValue = state.predictedMaximumTotalPaymentInDollars;
            percentageNationwide = state.predictedMaximumTotalPaymentPercentageNationwide.toFixed(2);
        } else {
            stateValue = selectedPractices.reduce((sum, practice) => {
                const practiceData = state.practices.find((p) => p.practiceName === practice);
                return sum + (practiceData?.predictedMaximumTotalPaymentInDollars || 0);
            }, 0);
            percentageNationwide =
                nationalTotal > 0 ? ((Math.abs(stateValue) / nationalTotal) * 100).toFixed(2) : "0.00";
        }
        const content = `
            <div class="${classes.tooltip_overall}">
                <div class="${classes.tooltip_header}">
                    <b>${geo.properties.name}</b>
                </div>
                <table class="${classes.tooltip_table}">
                <tbody>
                    ${
                        selectedPractices.includes("All Practices")
                            ? `
                            <tr style="${topTipStyle}">
                                <td class="${classes.tooltip_topcell_left}">
                                    Total Projected Maximum Payment:
                                </td>
                                <td class="${classes.tooltip_topcell_right}">
                                    $${ShortFormat(Math.abs(stateValue), undefined, 2)}
                                </td>
                            </tr>
                            <tr style="${topTipStyle}">
                                <td class="${classes.tooltip_bottomcell_left}">
                                    PCT. Nationwide:
                                </td>
                                <td class="${classes.tooltip_bottomcell_right}">
                                    ${percentageNationwide}%
                                </td>
                            </tr>
                        `
                            : `
                            ${selectedPractices
                                .map((practice, index) => {
                                    const practiceData = state.practices.find((p) => p.practiceName === practice);
                                    const amount = practiceData?.predictedMaximumTotalPaymentInDollars || 0;
                                    return `
                                    <tr style="${topTipStyle}">
                                        <td class="${
                                            index === 0
                                                ? classes.tooltip_topcell_left
                                                : classes.tooltip_regularcell_left
                                        }">
                                            ${practice}:
                                        </td>
                                        <td class="${
                                            index === 0
                                                ? classes.tooltip_topcell_right
                                                : classes.tooltip_regularcell_right
                                        }">
                                            $${ShortFormat(amount, undefined, 2)}
                                        </td>
                                    </tr>
                                `;
                                })
                                .join("")}
                            ${
                                selectedPractices.length > 1
                                    ? `
                                    <tr style="${topTipStyle}">
                                        <td class="${classes.tooltip_footer_left}">
                                            Total Selected:
                                        </td>
                                        <td class="${classes.tooltip_footer_right}">
                                            $${ShortFormat(stateValue, undefined, 2)}
                                        </td>
                                    </tr>
                                `
                                    : ""
                            }
                            <tr style="${topTipStyle}">
                                <td class="${classes.tooltip_bottomcell_left}">
                                    PCT. Nationwide:
                                </td>
                                <td class="${classes.tooltip_bottomcell_right}">
                                    ${percentageNationwide}%
                                </td>
                            </tr>
                        `
                    }
                </tbody>
            </table>
            </div>
        `;

        setReactTooltipContent(content);
    };
    const handleMouseLeave = () => {
        setReactTooltipContent("");
    };
    return (
        <div data-tip="" data-for="map-tooltip" style={{ width: "100%" }}>
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const state = statePerformance[year]?.find(
                                    (v) => stateCodes[v.state] === geo.properties.name
                                );
                                if (!state) return null;

                                let value = 0;
                                if (selectedPractices.includes("All Practices")) {
                                    value = state.predictedMaximumTotalPaymentInDollars;
                                } else {
                                    selectedPractices.forEach((practice) => {
                                        const practiceData = state.practices.find((p) => p.practiceName === practice);
                                        value += practiceData?.predictedMaximumTotalPaymentInDollars || 0;
                                    });
                                }

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => handleMouseEnter(geo, state)}
                                        onMouseLeave={handleMouseLeave}
                                        fill={value === 0 ? "#CCC" : colorScale(Math.abs(value))}
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

const HouseOutlayMap = ({ practiceNames, initialStatePerformance, allStates, stateCodes, year = "2024-2033" }) => {
    const [content, setContent] = useState("");
    const [statePerformance, setStatePerformance] = useState(initialStatePerformance);
    const classes = useStyles();
    const [selectedPractices, setSelectedPractices] = useState(["All Practices"]);

    // test description tooltip
    const practiceDescriptions = {
        "All Practices": "View the combined total of all conservation practices and their projected maximum payments",
        "CNMP Design and Implementation Activity (101)":
            "Description for Practice 1 explaining what it entails and its benefits",
        "Comprehensive Nutrient Management Plan (102)":
            "Description for Practice 2 detailing its implementation and expected outcomes"
        // this will be derived from the data
    };
    const MenuItemWithTooltip = ({ practice, description }) => (
        <MenuItem
            value={practice}
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                pr: 1
            }}
        >
            <span>{practice}</span>
            <Tooltip title={description || "No description available"} placement="right" arrow>
                <InfoIcon
                    sx={{
                        "cursor": "help",
                        "ml": 1,
                        "fontSize": "1rem",
                        "color": "rgba(47, 113, 100, 0.7)",
                        "&:hover": {
                            color: "rgba(47, 113, 100, 1)"
                        }
                    }}
                />
            </Tooltip>
        </MenuItem>
    );

    const practiceData = useMemo(() => {
        if (!statePerformance[year]) return { data: [], thresholds: [] };
        const data = statePerformance[year].map((state) => {
            if (selectedPractices.includes("All Practices")) {
                return Math.abs(state.predictedMaximumTotalPaymentInDollars);
            }
            return selectedPractices.reduce((sum, practice) => {
                const practiceRecord = state.practices.find((p) => p.practiceName === practice);
                return sum + Math.abs(practiceRecord?.predictedMaximumTotalPaymentInDollars || 0);
            }, 0);
        });
        const sortedData = data.sort((a, b) => a - b);
        const nonZeroData = sortedData.filter((value) => value > 0);
        const numIntervals = 5;
        const intervalSize = Math.ceil(nonZeroData.length / numIntervals);
        const thresholds: number[] = [];
        for (let i = 1; i < numIntervals; i += 1) {
            const thresholdIndex = i * intervalSize - 1;
            const adjustedIndex = Math.min(thresholdIndex, nonZeroData.length - 1);
            thresholds.push(nonZeroData[adjustedIndex]);
        }
        return { data, thresholds };
    }, [statePerformance, year, selectedPractices]);

    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const colorScale = d3.scaleThreshold().domain(practiceData.thresholds).range(mapColor);

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
    };

    const handleChipDelete = (practiceToDelete) => {
        let newSelected;
        if (selectedPractices.length === 1) {
            newSelected = ["All Practices"];
        } else {
            newSelected = selectedPractices.filter((p) => p !== practiceToDelete);
        }
        setSelectedPractices(newSelected);
    };

    const titleElement = (
        <Box sx={{ ml: 10 }}>
            <Typography noWrap variant="h6">
                {selectedPractices.includes("All Practices")
                    ? "Total Projected Maximum Payment"
                    : "Selected Practices Projected Payment"}{" "}
                for <strong>{year}</strong>
            </Typography>
        </Box>
    );

    return (
        <div className="house-outlay-map" style={{ width: "100%" }}>
            <Box display="flex" justifyContent="center">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement}
                    programData={practiceData.data}
                    prepColor={mapColor}
                    initRatioLarge={0.6}
                    initRatioSmall={0.5}
                    emptyState={[]}
                />
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" pt={4} pb={4}>
                <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            "mr": 0.5,
                            "minWidth": "5em",
                            "fontWeight": "bold",
                            "fontSize": "1.25rem",
                            "color": "rgba(47, 113, 100, 1)",
                            "&.Mui-focused": { color: "rgba(47, 113, 100, 1) !important" }
                        }}
                    >
                        Select Practice
                    </FormLabel>
                    <Tooltip
                        title="Choose one or multiple practices to view their projected maximum payments across states. Select 'All Practices' to see combined totals."
                        arrow
                        placement="top"
                    >
                        <InfoIcon
                            sx={{
                                "mr": 1,
                                "fontSize": "1.25rem",
                                "color": "rgba(47, 113, 100, 0.7)",
                                "cursor": "help",
                                "&:hover": {
                                    color: "rgba(47, 113, 100, 1)"
                                }
                            }}
                        />
                    </Tooltip>
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
                                }
                            }
                        }}
                    >
                        {/* <MenuItem value="All Practices">All Practices</MenuItem>
                        {practiceNames[year]?.map((practice) => (
                            <MenuItem key={practice} value={practice}>
                                {practice}
                            </MenuItem>
                        ))} */}
                        <MenuItemWithTooltip
                            practice="All Practices"
                            description={practiceDescriptions["All Practices"]}
                        />
                        {practiceNames[year]?.map((practice) => (
                            <MenuItemWithTooltip
                                key={practice}
                                practice={practice}
                                description={practiceDescriptions[practice]}
                            />
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ width: "100%" }}>
                <MapChart
                    setReactTooltipContent={setContent}
                    allStates={allStates}
                    statePerformance={statePerformance}
                    year={year}
                    stateCodes={stateCodes}
                    colorScale={colorScale}
                    selectedPractices={selectedPractices}
                    classes={classes}
                />
                <ReactTooltip
                    className={`${classes.customized_tooltip} tooltip`}
                    backgroundColor={tooltipBkgColor}
                    effect="float"
                    html
                    id="map-tooltip"
                >
                    {content}
                </ReactTooltip>
            </Box>
        </div>
    );
};

export default HouseOutlayMap;
