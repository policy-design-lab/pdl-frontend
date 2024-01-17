import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import PropTypes from "prop-types";
import { useStyles, tooltipBkgColor, topTipStyle } from "../shared/MapTooltip";
import "../../styles/map.css";
import legendConfig from "../../utils/legendConfig.json";
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

const MapChart = ({ setReactTooltipContent, maxValue, allStates, statePerformance, colorScale }) => {
    const classes = useStyles();
    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                if (!Object.keys(statePerformance).includes(geo.properties.name)) {
                                    return null;
                                }
                                const record = statePerformance[geo.properties.name][0];
                                const totalPaymentInDollars = record.totalPaymentInDollars;
                                const totalPaymentInPercentageNationwide = record.totalPaymentInPercentageNationwide;
                                const hoverContent = (
                                    <div className="map_tooltip">
                                        <div className={classes.tooltip_header}>
                                            <b>{geo.properties.name}</b>
                                        </div>
                                        <table className={classes.tooltip_table}>
                                            <tbody key={geo.properties.name}>
                                                <tr style={topTipStyle}>
                                                    <td className={classes.tooltip_topcell_left}>Benefits:</td>
                                                    <td className={classes.tooltip_topcell_right}>
                                                        ${ShortFormat(totalPaymentInDollars, undefined, 2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={classes.tooltip_regularcell_left}>
                                                        PCT. Nationwide:
                                                    </td>
                                                    <td className={classes.tooltip_regularcell_right}>
                                                        {totalPaymentInPercentageNationwide
                                                            ? `${totalPaymentInPercentageNationwide} %`
                                                            : "0%"}
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
                                        onMouseEnter={() => {
                                            setReactTooltipContent(hoverContent);
                                        }}
                                        onMouseLeave={() => {
                                            setReactTooltipContent("");
                                        }}
                                        fill={colorScale(totalPaymentInDollars || { value: 0 }) || "#D2D2D2"}
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
    maxValue: PropTypes.number
};

const EQIPTotalMap = ({ statePerformance, allStates }: { statePerformance: any; allStates: any }): JSX.Element => {
    const quantizeArray: number[] = [];
    const category = "Total EQIP";
    Object.values(statePerformance).map((value) => quantizeArray.push(value[0].totalPaymentInDollars));
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const customScale = legendConfig[category];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const [content, setContent] = useState("");
    // issue158: since eqip and csp are using old data structure (i.e. year is not the first level of data structure), going into array to find the year
    let years = "2018-2022";
    if (
        Object.keys(statePerformance).length !== 0 &&
        Array(Array(Array(Object.values(statePerformance)[0])[0])[0])[0]
    ) {
        years = Array(Array(Array(Object.values(statePerformance)[0])[0])[0])[0][0].years;
    }
    const classes = useStyles();
    return (
        <div>
            <Box display="flex" justifyContent="center" sx={{ pt: 24 }}>
                {maxValue !== 0 ? (
                    <DrawLegend
                        colorScale={colorScale}
                        title={titleElement(category, years)}
                        programData={quantizeArray}
                        prepColor={mapColor}
                        initRatioLarge={0.6}
                        initRatioSmall={0.5}
                        isRatio={false}
                        notDollar={false}
                        emptyState={[]}
                    />
                ) : (
                    <div>
                        {titleElement(category, years)}
                        <Box display="flex" justifyContent="center">
                            <Typography sx={{ color: "#CCC", fontWeight: 700 }}>
                                {category} data in {years} is unavailable for all states.
                            </Typography>
                        </Box>
                    </div>
                )}
            </Box>
            <MapChart
                setReactTooltipContent={setContent}
                maxValue={maxValue}
                allStates={allStates}
                statePerformance={statePerformance}
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
const titleElement = (attribute, year): JSX.Element => {
    return (
        <Box>
            <Typography noWrap variant="h6">
                <strong>{attribute}</strong> Benefits from <strong>{year}</strong>
            </Typography>{" "}
            <Typography noWrap style={{ fontSize: "0.5em", color: "#AAA", textAlign: "center" }}>
                <i>In any state that appears in grey, there is no available data</i>
            </Typography>
        </Box>
    );
};
export default EQIPTotalMap;
