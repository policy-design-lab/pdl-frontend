import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { scaleQuantize } from "d3-scale";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import * as d3 from "d3";
import "../../styles/map.css";
import legendConfig from "../../utils/legendConfig.json";
import DrawLegend from "../shared/DrawLegend";
import { getValueFromAttr } from "../../utils/apiutil";

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
    const { year, setTooltipContent, category, allStates, stateCodes, statePerformance, colorScale } = props;
    let categoryRecord;
    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const record = statePerformance[year].filter(
                                    (v) => stateCodes[v.state] === geo.properties.name
                                )[0];
                                if (record === undefined || record.length === 0) {
                                    return null;
                                }
                                let ACur = {};
                                let BCur = {};
                                let CCur = {};
                                let DCur = {};
                                let ECur = {};
                                let FCur = {};
                                record.programs.forEach((value) => {
                                    if (value.programName === "Total General Sign-Up") {
                                        ACur = value;
                                    } else if (value.programName === "Total Continuous Sign-Up") {
                                        BCur = value;
                                        value.subPrograms.forEach((subValue) => {
                                            if (subValue.programName === "CREP Only") {
                                                CCur = subValue;
                                            } else if (subValue.programName === "Continuous Non-CREP") {
                                                DCur = subValue;
                                            } else if (subValue.programName === "Farmable Wetland") {
                                                ECur = subValue;
                                            }
                                        });
                                    } else if (value.programName === "Grassland") {
                                        FCur = value;
                                    }
                                });
                                if (category === "Total General Sign-Up") {
                                    categoryRecord = ACur;
                                } else if (category === "Total Continuous Sign-Up") {
                                    categoryRecord = BCur;
                                } else if (category === "CREP Only") {
                                    categoryRecord = CCur;
                                } else if (category === "Continuous Non-CREP") {
                                    categoryRecord = DCur;
                                } else if (category === "Farmable Wetland") {
                                    categoryRecord = ECur;
                                } else {
                                    categoryRecord = FCur;
                                }
                                const categoryPayment = categoryRecord.paymentInDollars;
                                const nationwidePercentage = categoryRecord.paymentInPercentageNationwide;
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
                                        stroke="#FFFFFF"
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
    year: PropTypes.string,
    setTooltipContent: PropTypes.func,
    category: PropTypes.string
};

const CategoryMap = ({
    year,
    category,
    attribute,
    statePerformance,
    allStates,
    stateCodes
}: {
    year: string;
    category: string;
    attribute: string;
    statePerformance: any;
    allStates: any;
    stateCodes: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    let title = `CRP ${category} from ${year}`;
    const quantizeArray: number[] = [];
    const zeroPoints = [];

    statePerformance[year].forEach((value) => {
        const programRecord = value.programs;
        let ACur = {};
        if (
            category === "Total General Sign-Up" ||
            category === "Total Continuous Sign-Up" ||
            category === "Grassland"
        ) {
            ACur = programRecord.find((s) => s.programName === category);
        } else if (category === "CREP Only" || category === "Continuous Non-CREP" || category === "Farmable Wetland") {
            const contSingUp = programRecord.find((s) => s.programName === "Total Continuous Sign-Up");
            const subPrograms = contSingUp.subPrograms;
            title = `CRP Total Continuous, ${category} from ${year}`;
            subPrograms.forEach((subValue) => {
                if (subValue.programName === category) {
                    ACur = subValue;
                }
            });
        }
        let key = getValueFromAttr(ACur, attribute);
        key = key !== "" ? key : attribute;
        quantizeArray.push(ACur[key]);
        ACur[key] === 0 && zeroPoints.push(value.state);
        return null;
    });
    const years = "2018-2022";
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const customScale = legendConfig[category === "Grassland" ? "Grassland-CRP" : category];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    return (
        <div>
            {maxValue !== 0 ? (
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
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 560,
                        pt: 24
                    }}
                >
                    <Box display="flex" justifyContent="center" sx={{ mb: 1 }}>
                        <Typography variant="h5">
                            <strong>{title}</strong>
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Typography sx={{ color: "#CCC", fontWeight: 700 }}>
                            {title} data is unavailable for all states.
                        </Typography>
                    </Box>
                </Box>
            )}
            <MapChart
                year={year}
                setTooltipContent={setContent}
                category={category}
                colorScale={colorScale}
                allStates={allStates}
                stateCodes={stateCodes}
                statePerformance={statePerformance}
            />
            <div className="tooltip-container">
                <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
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
export default CategoryMap;