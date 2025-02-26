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
    predict,
    practices,
    maxValue,
    year,
    mapColor,
    predictedPerformance,
    stateCodes,
    allStates,
    colorScale,
    summary
}) => {
    const classes = useStyles();
    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                let practicePayment = 0;
                                const state = predictedPerformance[year].filter(
                                    (v) =>
                                        v.state.length !== 2
                                            ? v.state === geo.properties.name
                                            : stateCodes[v.state] === geo.properties.name
                                    /* eslint-disable func-call-spacing */
                                )[0];
                                if (state === undefined || state.length === 0) {
                                    return null;
                                }
                                // For list of practices, calculate the total of all practices if not "Total"
                                const practiceRecord = state;
                                practicePayment = practiceRecord.predictedTotalPaymentInDollars;
                                if (!practices.includes("Total")) {
                                    practicePayment = 0;
                                    practices.forEach((practice) => {
                                        const pra = practiceRecord.practices.find((s) => s.practiceName === practice);
                                        if (pra) {
                                            practicePayment += pra.predictedTotalPaymentInDollars;
                                        }
                                    });
                                }
                                const totalNationwidePayment = practices.includes("Total")
                                    ? summary[year].predictedTotalPaymentInDollars
                                    : summary[year].practices
                                          .filter((p) => practices.includes(p.practiceName))
                                          .reduce((acc, p) => acc + p.predictedTotalPaymentInDollars, 0);
                                let totalPaymentPercentageNationwide = (
                                    (practicePayment / totalNationwidePayment) *
                                    100
                                ).toFixed(2);
                                totalPaymentPercentageNationwide =
                                    totalPaymentPercentageNationwide === "NaN" ? "0" : totalPaymentPercentageNationwide;
                                const hoverContent = (
                                    <div className="map_tooltip">
                                        <div className={classes.tooltip_header}>
                                            <b>{geo.properties.name}</b>
                                        </div>
                                        <table className={classes.tooltip_table}>
                                            <tbody key={geo.properties.name}>
                                                {practices.includes("Total") ? (
                                                    <span>
                                                        <tr style={topTipStyle}>
                                                            <td className={classes.tooltip_topcell_left}>
                                                                Total Predicted Benefits:
                                                            </td>
                                                            <td className={classes.tooltip_topcell_right}>
                                                                ${ShortFormat(practicePayment, undefined, 2)}
                                                            </td>
                                                        </tr>
                                                        <tr style={topTipStyle}>
                                                            <td className={classes.tooltip_bottomcell_left}>
                                                                PCT. Nationwide:
                                                            </td>
                                                            <td className={classes.tooltip_bottomcell_right}>
                                                                {totalPaymentPercentageNationwide}%
                                                            </td>
                                                        </tr>
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {practices.length > 1 &&
                                                            practices.map((practice, index) => {
                                                                const pra = state.practices.find(
                                                                    (s) => s.practiceName === practice
                                                                );
                                                                if (pra) {
                                                                    return (
                                                                        <tr style={topTipStyle} key={practice}>
                                                                            <td
                                                                                className={
                                                                                    index === 0
                                                                                        ? classes.tooltip_topcell_left
                                                                                        : classes.tooltip_regularcell_left
                                                                                }
                                                                            >
                                                                                {practice} Predicted Benefits:
                                                                            </td>
                                                                            <td
                                                                                className={
                                                                                    index === 0
                                                                                        ? classes.tooltip_topcell_right
                                                                                        : classes.tooltip_regularcell_right
                                                                                }
                                                                            >
                                                                                $
                                                                                {ShortFormat(
                                                                                    pra.predictedTotalPaymentInDollars,
                                                                                    undefined,
                                                                                    2
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }
                                                                return (
                                                                    <tr style={topTipStyle} key={practice}>
                                                                        <td
                                                                            className={
                                                                                index === 0
                                                                                    ? classes.tooltip_topcell_left
                                                                                    : classes.tooltip_regularcell_left
                                                                            }
                                                                        >
                                                                            {practice} Predicted Benefits:
                                                                        </td>
                                                                        <td
                                                                            className={
                                                                                index === 0
                                                                                    ? classes.tooltip_topcell_right
                                                                                    : classes.tooltip_regularcell_right
                                                                            }
                                                                        >
                                                                            No Data
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}

                                                        {practices.length > 1 ? (
                                                            <tr style={topTipStyle}>
                                                                <td className={classes.tooltip_regularcell_left}>
                                                                    All Practices Predicted Benefits:
                                                                </td>
                                                                <td className={classes.tooltip_regularcell_right}>
                                                                    ${ShortFormat(practicePayment, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <tr style={topTipStyle}>
                                                                <td className={classes.tooltip_topcell_left}>
                                                                    {practices[0]} Predicted Benefits:
                                                                </td>
                                                                <td className={classes.tooltip_topcell_right}>
                                                                    ${ShortFormat(practicePayment, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr style={topTipStyle}>
                                                            <td className={classes.tooltip_bottomcell_left}>
                                                                {practices.length === 1
                                                                    ? "PCT. Nationwide:"
                                                                    : "PCT. Nationwide (All Practices):"}
                                                            </td>
                                                            <td className={classes.tooltip_bottomcell_right}>
                                                                {totalPaymentPercentageNationwide}%
                                                            </td>
                                                        </tr>
                                                    </span>
                                                )}
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
                                        fill={practicePayment === 0 ? "#CCC" : colorScale(practicePayment)}
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

MapChart.propTypes = {
    setReactTooltipContent: PropTypes.func,
    maxValue: PropTypes.number
};

const IRAPredictedMap = ({
    subtitle,
    practices,
    predict, // this is used for min/max. leave it now until confirmed no more min/max in the future
    year,
    mapColor,
    predictedPerformance,
    stateCodes,
    allStates,
    summary
}: {
    subtitle: string;
    practices: any;
    predict: any;
    year: string;
    mapColor: [string, string, string, string, string];
    predictedPerformance: any;
    stateCodes: any;
    allStates: any;
    summary: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    const quantizeArray: number[] = [];
    if (practices[0] === "Total") {
        predictedPerformance[year].forEach((value) => {
            quantizeArray.push(value.predictedTotalPaymentInDollars);
        });
    } else {
        // multiple practices

        predictedPerformance[year].forEach((value) => {
            const practiceRecord = value.practices;
            let totalPracticePayment = 0;
            practices.forEach((practice) => {
                const pra = practiceRecord.find((s) => s.practiceName === practice);
                if (pra) totalPracticePayment += pra.predictedTotalPaymentInDollars;
            });
            quantizeArray.push(totalPracticePayment);
        });
    }
    const maxValue = Math.max(...quantizeArray);
    // if (year !== "2023") searchKey = predict === "Min" ? searchKey + "_min" : searchKey + "_max";

    // const customScale = legendConfig[searchKey];
    // since IRA data is not predictable in legend config, separate the scale to five equal parts
    const sortedData = quantizeArray.sort((a, b) => a - b);
    const numIntervals = 5;
    const nonZeroData = sortedData.filter((value) => value > 0);
    const intervalSize = Math.ceil(nonZeroData.length / numIntervals);
    const thresholds: number[] = [];
    for (let i = 1; i < numIntervals; i += 1) {
        const thresholdIndex = i * intervalSize - 1;
        const adjustedIndex = Math.min(thresholdIndex, nonZeroData.length - 1);
        thresholds.push(nonZeroData[adjustedIndex]);
    }
    const colorScale = d3.scaleThreshold().domain(thresholds).range(mapColor);
    // For IRA, only if all practices are zero, the state will be colored as gray
    let zeroPoints: string[] = [];
    predictedPerformance[year].forEach((state) => {
        if (practices[0] === "Total") {
            if (state.predictedTotalPaymentInDollars === 0) zeroPoints.push(state.state);
        } else {
            practices.forEach((practice) => {
                const practiceRecord = state.practices;
                const pra = practiceRecord.find((s) => s.practiceName === practice);
                if (pra) {
                    if (pra.predictedTotalPaymentInDollars === 0) zeroPoints.push(state.state);
                    else if (zeroPoints.includes(state.state))
                        zeroPoints = zeroPoints.filter((item) => item !== state.state);
                } else zeroPoints.push(state.state);
            });
        }
    });

    const classes = useStyles();
    return (
        <div>
            <Box display="flex" justifyContent="center" className="IRAPredictedMapHeader">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement({ subtitle, year })}
                    programData={quantizeArray}
                    prepColor={mapColor}
                    emptyState={[]}
                />
            </Box>
            <MapChart
                setReactTooltipContent={setContent}
                subtitle={subtitle}
                predict={predict}
                practices={practices}
                maxValue={maxValue}
                year={year}
                mapColor={mapColor}
                predictedPerformance={predictedPerformance}
                stateCodes={stateCodes}
                allStates={allStates}
                colorScale={colorScale}
                summary={summary}
            />
            <div className="tooltip-container">
                <ReactTooltip className={`${classes.customized_tooltip} tooltip`} backgroundColor={tooltipBkgColor}>
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};
const titleElement = ({ subtitle, year }): JSX.Element => {
    return (
        <Box sx={{ ml: 10 }}>
            {" "}
            <Typography noWrap variant="h6">
                {subtitle} Inflation Reduction Act <strong>Predicted</strong> Benefits for <strong>{year}</strong>
            </Typography>
        </Box>
    );
};
export default IRAPredictedMap;
