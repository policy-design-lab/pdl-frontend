import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import PropTypes from "prop-types";
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

const MapChart = (props) => {
    const { setTooltipContent, allStates, statePerformance, colorScale } = props;

    return (
        <div data-tip="">
            {allStates.length > 0 && statePerformance.Wisconsin !== undefined ? (
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
                                    const totalPaymentInPercentageNationwide =
                                        record.totalPaymentInPercentageNationwide;
                                    const hoverContent = (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                bgcolor: "#ECF0ED",
                                                borderRadius: 1
                                            }}
                                        >
                                            <Box>
                                                <Typography sx={{ color: "#2F7164" }}>{geo.properties.name}</Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row"
                                                    }}
                                                >
                                                    <Typography sx={{ color: "#3F3F3F" }}>
                                                        ${ShortFormat(totalPaymentInDollars, undefined, 2)}
                                                    </Typography>
                                                    <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                    <Typography sx={{ color: "#3F3F3F" }}>
                                                        {totalPaymentInPercentageNationwide
                                                            ? `${totalPaymentInPercentageNationwide} %`
                                                            : "0%"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                    const fillColour = () => {
                                        if (totalPaymentInDollars) {
                                            if (totalPaymentInDollars !== 0) return colorScale(totalPaymentInDollars);
                                            return "#D2D2D2";
                                        }
                                        return "#D2D2D2";
                                    };
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {
                                                setTooltipContent(hoverContent);
                                            }}
                                            onMouseLeave={() => {
                                                setTooltipContent("");
                                            }}
                                            fill={fillColour()}
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
            ) : (
                <Box display="flex" justifyContent="center" sx={{ pt: 1 }}>
                    <h1>Loading Map Data...</h1>
                </Box>
            )}
        </div>
    );
};

MapChart.propTypes = {
    setTooltipContent: PropTypes.func
};

const CSPTotalMap = ({ statePerformance, allStates }: { statePerformance: any; allStates: any }): JSX.Element => {
    const quantizeArray: number[] = [];
    const category = "Total CSP";
    Object.values(statePerformance).map((value) => {
        if (Array.isArray(value)) {
            quantizeArray.push(value[0].totalPaymentInDollars);
        }
        return null;
    });
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
    return (
        <div>
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
                    setTooltipContent={setContent}
                    maxValue={maxValue}
                    statePerformance={statePerformance}
                    allStates={allStates}
                    colorScale={colorScale}
                />

                <div className="tooltip-container">
                    <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
                        {content}
                    </ReactTooltip>
                </div>
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
export default CSPTotalMap;
