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
import { getValueFromAttrDollar } from "../../utils/apiutil";

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
    const { setTooltipContent, allStates, statePerformance, year, stateCodes, colorScale } = props;
    return (
        <div data-tip="">
            {allStates.length > 0 && statePerformance[year] !== undefined ? (
                <ComposableMap projection="geoAlbersUsa">
                    <Geographies geography={geoUrl}>
                        {({ geographies }) => (
                            <>
                                {geographies.map((geo) => {
                                    const record = statePerformance[year].filter(
                                        (v) => v.state === geo.properties.name
                                    )[0];
                                    if (record === undefined || record.length === 0) {
                                        return null;
                                    }
                                    // the totalPaymentInDolloars in RCPP is financial assistancePaymentInDollars
                                    const totalPaymentInDollars = record.programs[0].assistancePaymentInDollars;
                                    // since the total is financial assistance, the percentage should also be financial one
                                    const totalPaymentInPercentageNationwide =
                                        record.programs[0].assistancePaymentInPercentageNationwide;
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
                                                        {Number(totalPaymentInDollars) < 1000000
                                                            ? `$${Number(
                                                                  Number(totalPaymentInDollars) / 1000.0
                                                              ).toLocaleString(undefined, {
                                                                  maximumFractionDigits: 2
                                                              })}K`
                                                            : `$${Number(
                                                                  Number(totalPaymentInDollars) / 1000000.0
                                                              ).toLocaleString(undefined, {
                                                                  maximumFractionDigits: 2
                                                              })}M`}
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

const RCPPTotalMap = ({
    program,
    attribute,
    year,
    statePerformance,
    stateCodes,
    allStates
}: {
    program: string;
    attribute: any;
    year: string;
    statePerformance: any;
    stateCodes: any;
    allStates: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    const quantizeArray: number[] = [];
    const zeroPoints = [];
    statePerformance[year].forEach((value) => {
        const programRecord = value.programs;
        const ACur = programRecord.find((s) => s.programName === program);
        let key = getValueFromAttrDollar(ACur, attribute);
        key = key !== "" ? key : attribute;
        quantizeArray.push(ACur[key]);
        ACur[key] === 0 && zeroPoints.push(value.state);
        return null;
    });
    const category = "Total RCPP";
    const years = "2018-2022";
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const customScale = legendConfig[category];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
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
                    year={year}
                    stateCodes={stateCodes}
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
export default RCPPTotalMap;
