import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { scaleQuantile, scaleQuantize } from "d3-scale";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import PropTypes from "prop-types";
import allStates from "../../data/allstates.json";
import statePerformance from "../../data/EQIP/EQIP_STATE_PERFORMANCE_DATA.json";
import "../../styles/map.css";
import HorizontalStackedBar from "../HorizontalStackedBar";

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

const MapChart = ({ setTooltipContent, category, maxValue }) => {
    const colorScale = scaleQuantize()
        .domain([0, maxValue])
        .range(["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"]);

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
                                const statuteRecord = statePerformance[geo.properties.name][0].statutes;
                                const ACur = statuteRecord.find((s) => s.statuteName === "(6)(A) Practices");
                                const AArray = ACur.practiceCategories;
                                const BCur = statuteRecord.find((s) => s.statuteName === "(6)(B) Practices");
                                const BArray = BCur.practiceCategories;
                                const TotalArray = AArray.concat(BArray);
                                const categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
                                const categoryPayment = categoryRecord.paymentInDollars;
                                const nationwidePercentage = categoryRecord.paymentInPercentageNationwide;
                                const withinStatePercentage = categoryRecord.paymentInPercentageWithinState;
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
                                                    {Number(categoryPayment) < 1000000
                                                        ? `$${Number(Number(categoryPayment) / 1000.0).toLocaleString(
                                                              undefined,
                                                              {
                                                                  maximumFractionDigits: 2
                                                              }
                                                          )}K`
                                                        : `$${Number(
                                                              Number(categoryPayment) / 1000000.0
                                                          ).toLocaleString(undefined, {
                                                              maximumFractionDigits: 2
                                                          })}M`}
                                                </Typography>
                                                <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                <Typography sx={{ color: "#3F3F3F" }}>
                                                    {nationwidePercentage ? `${nationwidePercentage} %` : "0%"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                                const fillColour = () => {
                                    if (categoryPayment) {
                                        if (categoryPayment !== 0) return colorScale(categoryPayment);
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
        </div>
    );
};

MapChart.propTypes = {
    setTooltipContent: PropTypes.func,
    category: PropTypes.string,
    maxValue: PropTypes.number
};

const CategoryMap = ({ category }: { category: string }): JSX.Element => {
    const [content, setContent] = useState("");
    const title = `${category} Benefits`;
    const quantizeArray: number[] = [];
    Object.values(statePerformance).map((value) => {
        const statuteRecord = value[0].statutes;
        const ACur = statuteRecord.find((s) => s.statuteName === "(6)(A) Practices");
        const AArray = ACur.practiceCategories;
        const BCur = statuteRecord.find((s) => s.statuteName === "(6)(B) Practices");
        const BArray = BCur.practiceCategories;
        const TotalArray = AArray.concat(BArray);
        const categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
        quantizeArray.push(categoryRecord.paymentInDollars);
        return null;
    });
    const maxValue = Math.max(...quantizeArray);
    const label1 = (maxValue / 5) * 0;
    const label2 = (maxValue / 5) * 1;
    const label3 = (maxValue / 5) * 2;
    const label4 = (maxValue / 5) * 3;
    const label5 = (maxValue / 5) * 4;
    return (
        <div>
            <Box display="flex" justifyContent="center" sx={{ pt: 23 }}>
                <HorizontalStackedBar
                    title={title}
                    color1="#F0F9E8"
                    color2="#BAE4BC"
                    color3="#7BCCC4"
                    color4="#43A2CA"
                    color5="#0868AC"
                    label1={`$${Number(label1 / 1000000).toLocaleString(undefined, {
                        maximumFractionDigits: 0
                    })}`}
                    label2={
                        label2 >= 1000000
                            ? `$${Number(label2 / 1000000).toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                              })}M`
                            : `$${Number(label2 / 1000.0).toLocaleString(undefined, {
                                  maximumFractionDigits: 1
                              })}K`
                    }
                    label3={
                        label3 >= 1000000
                            ? `$${Number(label3 / 1000000).toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                              })}M`
                            : `$${Number(label3 / 1000.0).toLocaleString(undefined, {
                                  maximumFractionDigits: 1
                              })}K`
                    }
                    label4={
                        label4 >= 1000000
                            ? `$${Number(label4 / 1000000).toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                              })}M`
                            : `$${Number(label4 / 1000.0).toLocaleString(undefined, {
                                  maximumFractionDigits: 1
                              })}K`
                    }
                    label5={
                        label5 >= 1000000
                            ? `$${Number(label5 / 1000000).toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                              })}M`
                            : `$${Number(label5 / 1000.0).toLocaleString(undefined, {
                                  maximumFractionDigits: 1
                              })}K`
                    }
                    label6={
                        maxValue >= 1000000
                            ? `$${Number(maxValue / 1000000).toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                              })}M`
                            : `$${Number(maxValue / 1000.0).toLocaleString(undefined, {
                                  maximumFractionDigits: 1
                              })}K`
                    }
                />
            </Box>
            <MapChart setTooltipContent={setContent} category={category} maxValue={maxValue} />
            <div className="tooltip-container">
                <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default CategoryMap;
