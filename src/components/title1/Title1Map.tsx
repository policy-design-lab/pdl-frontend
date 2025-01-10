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
    setReactTooltipContent,
    subtitle,
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
    const classes = useStyles();
    return (
        <div data-tip="">
            {subtitle && program ? (
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
                                    if (!subprogram) {
                                        programPayment = ACur.totalPaymentInDollars;
                                        totalPaymentInPercentage = ACur.totalPaymentInPercentageNationwide;
                                    } else {
                                        const subprogramRecord = ACur.subPrograms.find(
                                            (s) => s.subProgramName === subprogram
                                        );
                                        programPayment = subprogramRecord.totalPaymentInDollars;
                                        totalPaymentInPercentage = subprogramRecord.totalPaymentInPercentageNationwide;
                                    }
                                    const hoverContent = (
                                        <div className="map_tooltip">
                                            <div className={classes.tooltip_header}>
                                                <b>{geo.properties.name}</b>
                                            </div>
                                            <table className={classes.tooltip_table}>
                                                <tbody key={geo.properties.name}>
                                                    <tr style={topTipStyle}>
                                                        <td className={classes.tooltip_topcell_left}>Payments:</td>
                                                        <td className={classes.tooltip_topcell_right}>
                                                            ${ShortFormat(programPayment, undefined, 2)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className={classes.tooltip_regularcell_left}>
                                                            PCT. Nationwide:
                                                        </td>
                                                        <td className={classes.tooltip_regularcell_right}>
                                                            {totalPaymentInPercentage} %
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {/* )} */}
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
                                        <div className="map_tooltip">
                                            <div className={classes.tooltip_header}>
                                                <b>{geo.properties.name}</b>
                                            </div>
                                            <table className={classes.tooltip_table}>
                                                <tbody key={geo.properties.name}>
                                                    <tr style={topTipStyle}>
                                                        <td className={classes.tooltip_topcell_left}>Payments:</td>
                                                        <td className={classes.tooltip_topcell_right}>
                                                            ${ShortFormat(programPayment, undefined, 2)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className={classes.tooltip_regularcell_left}>
                                                            PCT. Nationwide:
                                                        </td>
                                                        <td className={classes.tooltip_regularcell_right}>
                                                            {totalPaymentInPercentage} %
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {/* )} */}
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
    setReactTooltipContent: PropTypes.func,
    subprogram: PropTypes.string,
    program: PropTypes.string,
    maxValue: PropTypes.number
};

const Title1Map = ({
    subtitle,
    program,
    subprogram,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates
}: {
    subtitle: string;
    program: any;
    subprogram: any;
    year: string;
    mapColor: [string, string, string, string, string];
    statePerformance: any;
    stateCodes: any;
    allStates: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    const quantizeArray: number[] = [];
    if (subtitle && program) {
        statePerformance[year].forEach((value) => {
            const programRecord = value.programs;
            const ACur = programRecord.find((s) => s.programName === program);
            if (!subprogram) {
                quantizeArray.push(ACur.totalPaymentInDollars);
            } else {
                const AArray = ACur.subPrograms;
                const subprogramRecord = AArray.find((s) => s.subProgramName === subprogram);
                quantizeArray.push(subprogramRecord.totalPaymentInDollars);
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
    const searchKey = !subprogram ? program || subtitle : subprogram;
    const customScale = legendConfig[searchKey];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const zeroPoints: string[] = [];
    statePerformance[year].forEach((state) => {
        if (subtitle && program) {
            const programList = state.programs;
            if (!subprogram) {
                const programRecord = programList.find((s) => s.programName === program);
                if (!programRecord || programRecord.totalPaymentInDollars === 0) zeroPoints.push(state.state);
            } else {
                const programRecord = programList.find((s) => s.programName === program);
                const subprogramRecord = programRecord.subPrograms.find((s) => s.subProgramName === subprogram);
                if (!subprogramRecord || subprogramRecord.totalPaymentInDollars === 0) zeroPoints.push(state.state);
            }
        } else if (state.totalPaymentInDollars === 0) {
            zeroPoints.push(state.state);
        }
    });
    const classes = useStyles();
    return (
        <div>
            <Box display="flex" justifyContent="center" className="Title1MapHeader">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement({ subtitle, program, subprogram, year })}
                    programData={quantizeArray}
                    prepColor={mapColor}
                    emptyState={zeroPoints}
                    initRatioLarge={0.6}
                    initRatioSmall={0.5}
                />
            </Box>
            <MapChart
                setReactTooltipContent={setContent}
                subtitle={subtitle}
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
                <ReactTooltip className={`${classes.customized_tooltip} tooltip`} backgroundColor={tooltipBkgColor}>
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};
const titleElement = ({ subtitle, program, subprogram, year }): JSX.Element => {
    return (
        <Box>
            {" "}
            {subprogram ? (
                <Typography noWrap variant="h6">
                    <strong>{subprogram}</strong> Payments from <strong>{year}</strong>
                </Typography>
            ) : (
                <Typography noWrap variant="h6">
                    <strong>{program || subtitle}</strong> Payments from <strong>{year}</strong>
                </Typography>
            )}
            <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                <i>2022 payments for Title I have not yet been paid</i>
            </Typography>
        </Box>
    );
};
export default Title1Map;
