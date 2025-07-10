import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import { useStyles, tooltipBkgColor } from "../shared/MapTooltip";
import "../../styles/map.css";
import DrawLegend from "../shared/DrawLegend";
import legendConfig from "../../utils/legendConfig.json";
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

const MapChart = ({ setReactTooltipContent, statePerformance, stateCodes, allStates, colorScale }) => {
    const classes = useStyles();

    // Find all year keys, filtering out any "total" or "summary" keys.
    const allYearKeys = Object.keys(statePerformance).filter(
        (y) => Array.isArray(statePerformance[y]) && !y.includes("-")
    );

    // Find the summary key (the one with '-')
    const summaryKey = Object.keys(statePerformance).find((k) => k.includes("-"));

    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const stateName = geo.properties.name;
                                // Find summary entry for "total" (e.g., "2018-2022")
                                const summaryEntry = summaryKey
                                    ? statePerformance[summaryKey].find(
                                          (v) =>
                                              v.state &&
                                              (v.state.length !== 2
                                                  ? v.state === stateName
                                                  : stateCodes[v.state] === stateName)
                                      )
                                    : null;
                                // Gather per-year values
                                const yearlyBenefits = allYearKeys.map((y) => {
                                    const entry = statePerformance[y].find(
                                        (v) =>
                                            v.state &&
                                            (v.state.length !== 2
                                                ? v.state === stateName
                                                : stateCodes[v.state] === stateName)
                                    );
                                    return {
                                        year: y,
                                        value: entry?.totalPaymentInDollars ?? 0
                                    };
                                });

                                if (!summaryEntry) return null;

                                const programPayment = summaryEntry?.totalPaymentInDollars ?? 0;
                                const avgParticipation = summaryEntry?.averageMonthlyParticipation ?? 0;

                                const hoverContent = (
                                    <div className="map_tooltip">
                                        <div className={classes.tooltip_header}>
                                            <b>{stateName}</b>
                                        </div>
                                        <table className={classes.tooltip_table}>
                                            <tbody>
                                                {/* Year-by-year benefit rows */}
                                                {yearlyBenefits.map(({ year, value }, idx) => (
                                                    <tr key={`${year}-benefit`}>
                                                        <td
                                                            className={
                                                                idx === 0
                                                                    ? classes.tooltip_topcell_left
                                                                    : classes.tooltip_regularcell_left
                                                            }
                                                            style={{
                                                                color: "#555",
                                                                fontWeight: 400,
                                                                background: "#f5f5f5"
                                                            }}
                                                        >
                                                            {year} Benefit:
                                                        </td>
                                                        <td
                                                            className={
                                                                idx === 0
                                                                    ? classes.tooltip_topcell_right
                                                                    : classes.tooltip_regularcell_right
                                                            }
                                                            style={{
                                                                color: "#555",
                                                                textAlign: "right",
                                                                background: "#f5f5f5",
                                                                fontVariantNumeric: "tabular-nums"
                                                            }}
                                                        >
                                                            ${ShortFormat(value, undefined, 2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Total Benefits */}
                                                <tr>
                                                    <td
                                                        className={classes.tooltip_footer_left}
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "#232323",
                                                            background: "#f5f5f5"
                                                        }}
                                                    >
                                                        Total Benefits:
                                                    </td>
                                                    <td
                                                        className={classes.tooltip_footer_right}
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "#232323",
                                                            background: "#f5f5f5",
                                                            textAlign: "right",
                                                            fontVariantNumeric: "tabular-nums"
                                                        }}
                                                    >
                                                        ${ShortFormat(programPayment, undefined, 2)}
                                                    </td>
                                                </tr>
                                                {/* Avg. Monthly Participation */}
                                                <tr>
                                                    <td
                                                        className={classes.tooltip_bottomcell_left}
                                                        style={{ color: "#232323", background: "#f5f5f5" }}
                                                    >
                                                        Avg. Monthly Participation:
                                                    </td>
                                                    <td
                                                        className={classes.tooltip_bottomcell_right}
                                                        style={{
                                                            color: "#232323",
                                                            background: "#f5f5f5",
                                                            textAlign: "right",
                                                            fontVariantNumeric: "tabular-nums"
                                                        }}
                                                    >
                                                        {ShortFormat(avgParticipation, undefined, 2)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                );

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => setReactTooltipContent(hoverContent)}
                                        onMouseLeave={() => setReactTooltipContent("")}
                                        fill={programPayment === 0 ? "#CCC" : colorScale(programPayment)}
                                        stroke="#FFF"
                                        style={{
                                            default: {
                                                stroke: "#FFFFFF",
                                                strokeWidth: 0.75,
                                                outline: "none"
                                            },
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

const SNAPMap = ({ mapColor, statePerformance, stateCodes, allStates }) => {
    const [content, setContent] = useState("");

    // Get summary key and some year to use for legend/color scale
    const summaryKey = Object.keys(statePerformance).find((k) => k.includes("-"));

    // Use the summary key for legend/color
    const quantizeArray = summaryKey ? statePerformance[summaryKey].map((v) => v?.totalPaymentInDollars ?? 0) : [];
    const maxValue = Math.max(...quantizeArray, 0);

    const customScale = legendConfig["SNAP Total"] || [0, maxValue / 4, maxValue / 2, (3 * maxValue) / 4, maxValue];
    const colorScale = d3.scaleThreshold(customScale, mapColor);

    const zeroPoints = summaryKey
        ? statePerformance[summaryKey].filter((state) => !state?.totalPaymentInDollars).map((state) => state.state)
        : [];
    const classes = useStyles();

    return (
        <div>
            <Box display="flex" justifyContent="center" className="Title1MapHeader">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement({ summaryKey })}
                    programData={quantizeArray}
                    prepColor={mapColor}
                    emptyState={zeroPoints}
                />
            </Box>
            <MapChart
                setReactTooltipContent={setContent}
                statePerformance={statePerformance}
                stateCodes={stateCodes}
                allStates={allStates}
                colorScale={colorScale}
            />
            <div className="tooltip-container">
                <ReactTooltip className={`${classes.customized_tooltip} tooltip`} backgroundColor={tooltipBkgColor}>
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

const titleElement = ({ summaryKey }) => (
    <Box>
        <Typography noWrap variant="h6">
            <strong>Supplemental Nutrition Assistance Program (SNAP)</strong> Payments{" "}
            <strong>{summaryKey ? `from ${summaryKey}` : ""}</strong>
        </Typography>
    </Box>
);

export default SNAPMap;
