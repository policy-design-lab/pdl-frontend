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

const MapChart = ({
    setTooltipContent,
    program,
    subprogram,
    maxValue,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates,
    colorScale
}) => {
    return (
        <div data-tip="">
            {program !== "Total Commodities Programs" ? (
                <ComposableMap projection="geoAlbersUsa">
                    <Geographies geography={geoUrl}>
                        {({ geographies }) => (
                            <>
                                {geographies.map((geo) => {
                                    let programPayment = 0;
                                    let totalPaymentInPercentage = 0;
                                    const state = statePerformance[year].filter(
                                        (v) =>
                                            v.state.length !== 2
                                                ? v.state === geo.properties.name
                                                : stateCodes[v.state] === geo.properties.name
                                        /* eslint-disable func-call-spacing */
                                    )[0];
                                    if (state === undefined || state.length === 0) {
                                        return null;
                                    }
                                    const programRecord = state.programs;
                                    const ACur = programRecord.find((s) => s.programName === program);
                                    if (subprogram === undefined) {
                                        programPayment = ACur.programPaymentInDollars;
                                    } else {
                                        const subprogramRecord = ACur.subPrograms.find(
                                            (s) => s.subProgramName === subprogram
                                        );
                                        programPayment = subprogramRecord.paymentInDollars;
                                        totalPaymentInPercentage = subprogramRecord.paymentInPercentageNationwide;
                                    }
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

                                                {subprogram === undefined ? (
                                                    <Typography sx={{ color: "#3F3F3F" }}>
                                                        ${ShortFormat(programPayment, undefined, 2)}
                                                    </Typography>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexDirection: "row"
                                                        }}
                                                    >
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            ${ShortFormat(programPayment, undefined, 2)}
                                                        </Typography>
                                                        <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            {totalPaymentInPercentage} %
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    );
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
            ) : (
                <ComposableMap projection="geoAlbersUsa">
                    <Geographies geography={geoUrl}>
                        {({ geographies }) => (
                            <>
                                {geographies.map((geo) => {
                                    let programPayment = 0;
                                    let totalPaymentInPercentage = 0;
                                    const state = statePerformance[year].filter(
                                        (v) => stateCodes[v.state] === geo.properties.name
                                    )[0];
                                    if (state === undefined || state.length === 0) {
                                        return null;
                                    }

                                    programPayment = state.totalPaymentInDollars;
                                    totalPaymentInPercentage = state.totalPaymentInPercentageNationwide;
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

                                                {subprogram === undefined ? (
                                                    <Typography sx={{ color: "#3F3F3F" }}>
                                                        ${ShortFormat(programPayment, undefined, 2)}
                                                    </Typography>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexDirection: "row"
                                                        }}
                                                    >
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            ${ShortFormat(programPayment, undefined, 2)}
                                                        </Typography>
                                                        <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            {totalPaymentInPercentage} %
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    );
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
            )}
        </div>
    );
};

MapChart.propTypes = {
    setTooltipContent: PropTypes.func,
    subprogram: PropTypes.string,
    program: PropTypes.string,
    maxValue: PropTypes.number
};

const Title1Map = ({
    program,
    subprogram,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates
}: {
    program: string;
    subprogram: any;
    year: string;
    mapColor: [string, string, string, string, string];
    statePerformance: any;
    stateCodes: any;
    allStates: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    const quantizeArray: number[] = [];
    if (program !== "Total Commodities Programs") {
        statePerformance[year].forEach((value) => {
            const programRecord = value.programs;
            const ACur = programRecord.find((s) => s.programName === program);
            if (subprogram === undefined) {
                quantizeArray.push(ACur.programPaymentInDollars);
            } else {
                const AArray = ACur.subPrograms;
                const subprogramRecord = AArray.find((s) => s.subProgramName === subprogram);
                quantizeArray.push(subprogramRecord.paymentInDollars);
            }
            return null;
        });
    } else {
        statePerformance[year].forEach((value) => {
            quantizeArray.push(value.totalPaymentInDollars);
            return null;
        });
    }
    const maxValue = Math.max(...quantizeArray);
    const searchKey = subprogram === undefined ? program : subprogram;
    const customScale = legendConfig[searchKey];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const zeroPoints = [];
    statePerformance[year].forEach((state) => {
        if (program !== "Total Commodities Programs") {
            const programList = state.programs;
            if (subprogram === undefined) {
                const programRecord = programList.find((s) => s.programName === program);
                if (!programRecord || programRecord.programPaymentInDollars === 0) zeroPoints.push(state.state);
            } else {
                const programRecord = programList.find((s) => s.programName === program);
                const subprogramRecord = programRecord.subPrograms.find((s) => s.subProgramName === subprogram);
                if (!subprogramRecord || subprogramRecord.paymentInDollars === 0) zeroPoints.push(state.state);
            }
        } else if (state.totalPaymentInDollars === 0) {
            zeroPoints.push(state.state);
        }
    });
    return (
        <div>
            <Box display="flex" justifyContent="center" className="Title1MapHeader">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement({ program, subprogram, year })}
                    programData={quantizeArray}
                    prepColor={mapColor}
                    emptyState={zeroPoints}
                    initRatioLarge={0.6}
                    initRatioSmall={0.5}
                />
            </Box>
            <MapChart
                setTooltipContent={setContent}
                program={program}
                subprogram={subprogram}
                maxValue={maxValue}
                year={year}
                mapColor={mapColor}
                statePerformance={statePerformance}
                stateCodes={stateCodes}
                allStates={allStates}
                colorScale={colorScale}
            />
            <div className="tooltip-container">
                <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};
const titleElement = ({ program, subprogram, year }): JSX.Element => {
    if (subprogram) {
        return (
            <Box>
                {" "}
                <Typography noWrap variant="h6">
                    Total <strong>{subprogram}</strong> Payments from <strong>{year}</strong>
                </Typography>
                <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                    <i>2022 payments for Title I have not yet been paid</i>
                </Typography>
            </Box>
        );
    }
    if (program === "Total Commodities Programs") {
        return (
            <Box>
                {" "}
                <Typography noWrap variant="h6">
                    <strong>Total Commodities Programs, Subtitle A</strong> Payments from <strong>{year}</strong>
                </Typography>{" "}
                <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                    <i>2022 payments for Title I have not yet been paid</i>
                </Typography>
            </Box>
        );
    }
    return (
        <Box>
            <Typography noWrap variant="h6">
                Total <strong>{program}</strong> Payments from <strong>{year}</strong>
            </Typography>{" "}
            <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                <i>2022 payments for Title I have not yet been paid</i>
            </Typography>
        </Box>
    );
};
export default Title1Map;
