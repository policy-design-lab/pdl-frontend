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
    statePerformance,
    stateCodes,
    allStates,
    colorScale
}) => {
    const classes = useStyles();
    const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
    return (
        <div data-tip="">
            {
                year === "2023" ? (
                    <ComposableMap projection="geoAlbersUsa">
                        <Geographies geography={geoUrl}>
                            {({ geographies }) => (
                                <>
                                    {geographies.map((geo) => {
                                        let practicePayment = 0;
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
                                        // For list of practices, calculate the total of all practices if not "Total"
                                        const practiceRecord = state;
                                        practicePayment = practiceRecord.totalPaymentInDollars;
                                        if (!practices.includes("Total")) {
                                            practicePayment = 0;
                                            practices.forEach((practice) => {
                                                const pra = practiceRecord.practices.find(
                                                    (s) => s.practiceName === practice
                                                );
                                                if (pra) {
                                                    practicePayment += pra.totalPaymentInDollars;
                                                }
                                            });
                                        }
                                        const hoverContent = (
                                            <div className="map_tooltip">
                                                <div className={classes.tooltip_header}>
                                                    <b>{geo.properties.name}</b>
                                                </div>
                                                <table className={classes.tooltip_table}>
                                                    <tbody key={geo.properties.name}>
                                                        {practices.includes("Total") ? (
                                                            <tr style={topTipStyle}>
                                                                <td className={classes.tooltip_topcell_left}>
                                                                    Total Benefits:
                                                                </td>
                                                                <td className={classes.tooltip_topcell_right}>
                                                                    ${ShortFormat(practicePayment, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <span>
                                                                {practices.length > 1 &&
                                                                    practices.map((practice, index) => {
                                                                        const pra = state.practices.find(
                                                                            (s) => s.practiceName === practice
                                                                        );
                                                                        if (pra) {
                                                                            return (
                                                                                <tr style={topTipStyle}>
                                                                                    <td
                                                                                        className={
                                                                                            index === 0
                                                                                                ? classes.tooltip_topcell_left
                                                                                                : classes.tooltip_regularcell_left
                                                                                        }
                                                                                    >
                                                                                        {practice} Benefits:
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
                                                                                            pra.totalPaymentInDollars,
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
                                                                                    {practice} Benefits:
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
                                                                        <td
                                                                            className={classes.tooltip_regularcell_left}
                                                                        >
                                                                            All Practices Benefits:
                                                                        </td>
                                                                        <td
                                                                            className={
                                                                                classes.tooltip_regularcell_right
                                                                            }
                                                                        >
                                                                            $
                                                                            {ShortFormat(practicePayment, undefined, 2)}
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    <tr style={topTipStyle}>
                                                                        <td className={classes.tooltip_topcell_left}>
                                                                            {practices[0]} Benefits:
                                                                        </td>
                                                                        <td className={classes.tooltip_topcell_right}>
                                                                            $
                                                                            {ShortFormat(practicePayment, undefined, 2)}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </span>
                                                        )}

                                                        {/* <tr>
                                                        <td className={classes.tooltip_regularcell_left}>
                                                            PCT. Nationwide:
                                                        </td>
                                                        <td className={classes.tooltip_regularcell_right}>
                                                            {totalPaymentInPercentage} %
                                                        </td>
                                                    </tr> */}
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
                ) : null
                // Comment out this part until working on the predicted data
                // <ComposableMap projection="geoAlbersUsa">
                //     <Geographies geography={geoUrl}>
                //         {({ geographies }) => (
                //             <>
                //                 {geographies.map((geo) => {
                //                     let practicePayment = 0;
                //                     const state = statePerformance[year].filter(
                //                         (v) => stateCodes[v.state] === geo.properties.name
                //                     )[0];
                //                     if (state === undefined || state.length === 0) {
                //                         return null;
                //                     }

                //                     practicePayment =
                //                         practice === "Total"
                //                             ? predict === "Min"
                //                                 ? state.predictedMinimumTotalPaymentInDollars
                //                                 : state.predictedMaximumTotalPaymentInDollars
                //                             : predict === "Min"
                //                             ? state.practices.find((s) => s.practiceName === practice)
                //                                 ? state.practices.find((s) => s.practiceName === practice)
                //                                       .predictedMinimumTotalPaymentInDollars
                //                                 : 0
                //                             : state.practices.find((s) => s.practiceName === practice)
                //                             ? state.practices.find((s) => s.practiceName === practice)
                //                                   .predictedMaximumTotalPaymentInDollars
                //                             : 0;

                //                     const hoverContent = (
                //                         <div className="map_tooltip">
                //                             <div className={classes.tooltip_header}>
                //                                 <b>{geo.properties.name}</b>
                //                             </div>
                //                             <table className={classes.tooltip_table}>
                //                                 <tbody key={geo.properties.name}>
                //                                     <tr style={topTipStyle}>
                //                                         <td className={classes.tooltip_topcell_left}>
                //                                             Predicted {predict}:{" "}
                //                                         </td>
                //                                         <td className={classes.tooltip_topcell_right}>
                //                                             ${ShortFormat(practicePayment, undefined, 2)}
                //                                         </td>
                //                                     </tr>
                //                                     <tr>
                //                                         <td className={classes.tooltip_regularcell_left}>
                //                                             Practice Instance Count:
                //                                         </td>
                //                                         <td className={classes.tooltip_regularcell_right}>
                //                                             {totalPaymentInPercentage} %
                //                                         </td>
                //                                     </tr>
                //                                     {/* <tr>
                //                                         <td className={classes.tooltip_regularcell_left}>
                //                                             PCT. Nationwide:
                //                                         </td>
                //                                         <td className={classes.tooltip_regularcell_right}>
                //                                             {totalPaymentInPercentage} %
                //                                         </td>
                //                                     </tr> */}
                //                                 </tbody>
                //                             </table>
                //                             {/* )} */}
                //                         </div>
                //                     );
                //                     return (
                //                         <Geography
                //                             key={geo.rsmKey}
                //                             geography={geo}
                //                             onMouseEnter={() => {
                //                                 setReactTooltipContent(hoverContent);
                //                             }}
                //                             onMouseLeave={() => {
                //                                 setReactTooltipContent("");
                //                             }}
                //                             fill={practicePayment === 0 ? "#CCC" : colorScale(practicePayment)}
                //                             stroke="#FFF"
                //                             style={{
                //                                 default: {
                //                                     stroke: "#FFFFFF",
                //                                     strokeWidth: 0.75,
                //                                     outline: "none"
                //                                 },
                //                                 hover: {
                //                                     stroke: "#232323",
                //                                     strokeWidth: 2,
                //                                     outline: "none"
                //                                 },
                //                                 pressed: {
                //                                     fill: "#345feb",
                //                                     outline: "none"
                //                                 }
                //                             }}
                //                         />
                //                     );
                //                 })}
                //                 {geographies.map((geo) => {
                //                     const centroid = geoCentroid(geo);
                //                     const cur = allStates.find((s) => s.val === geo.id);
                //                     return (
                //                         <g key={`${geo.rsmKey}-name`}>
                //                             {cur &&
                //                                 centroid[0] > -160 &&
                //                                 centroid[0] < -67 &&
                //                                 (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                //                                     <Marker coordinates={centroid}>
                //                                         <text y="2" fontSize={14} textAnchor="middle">
                //                                             {cur.id}
                //                                         </text>
                //                                     </Marker>
                //                                 ) : (
                //                                     <Annotation
                //                                         subject={centroid}
                //                                         dx={offsets[cur.id][0]}
                //                                         dy={offsets[cur.id][1]}
                //                                     >
                //                                         <text x={4} fontSize={14} alignmentBaseline="middle">
                //                                             {cur.id}
                //                                         </text>
                //                                     </Annotation>
                //                                 ))}
                //                         </g>
                //                     );
                //                 })}
                //             </>
                //         )}
                //     </Geographies>
                // </ComposableMap>
            }
        </div>
    );
};

MapChart.propTypes = {
    setReactTooltipContent: PropTypes.func,
    maxValue: PropTypes.number
};

const IRAMap = ({
    subtitle,
    practices,
    predict,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates
}: {
    subtitle: string;
    practices: any;
    predict: any;
    year: string;
    mapColor: [string, string, string, string, string];
    statePerformance: any;
    stateCodes: any;
    allStates: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    const quantizeArray: number[] = [];
    if (practices[0] === "Total") {
        if (year === "2023") {
            statePerformance[year].forEach((value) => {
                quantizeArray.push(value.totalPaymentInDollars);
            });
        } else {
            statePerformance[year].forEach((value) => {
                if (predict === "Min") {
                    quantizeArray.push(value.predictedMinimumTotalPaymentInDollars);
                } else {
                    quantizeArray.push(value.predictedMaximumTotalPaymentInDollars);
                }
            });
        }
    } else {
        // multiple practices

        statePerformance[year].forEach((value) => {
            const practiceRecord = value.practices;
            let totalPracticePayment = 0;
            practices.forEach((practice) => {
                const pra = practiceRecord.find((s) => s.practiceName === practice);
                if (pra) {
                    if (year === "2023") totalPracticePayment += pra.totalPaymentInDollars;

                    // comment out this part until working on the predicted data
                    // else
                    //     predict === "Min"
                    //         ? quantizeArray.push(pra.predictedMinimumTotalPaymentInDollars)
                    //         : quantizeArray.push(pra.predictedMaximumTotalPaymentInDollars);
                }
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
    const intervalSize = Math.floor(sortedData.length / numIntervals);
    const thresholds = [];
    for (let i = 1; i < numIntervals; i += 1) {
        const thresholdIndex = i * intervalSize - 1;
        thresholds.push(sortedData[thresholdIndex]);
    }
    if (thresholds[0] === 0) thresholds.unshift(1000);
    const colorScale = d3.scaleThreshold().domain(thresholds).range(mapColor);
    // For IRA, only if all practices are zero, the state will be colored as grey
    let zeroPoints = [];
    statePerformance[year].forEach((state) => {
        if (practices[0] === "Total") {
            if (year === "2023") {
                if (state.totalPaymentInDollars === 0) zeroPoints.push(state.state);
            } else if (predict === "Min") {
                if (state.predictedMinimumTotalPaymentInDollars === 0) zeroPoints.push(state.state);
            } else if (state.predictedMaximumTotalPaymentInDollars === 0) zeroPoints.push(state.state);
        } else {
            practices.forEach((practice) => {
                const practiceRecord = state.practices;
                const pra = practiceRecord.find((s) => s.practiceName === practice);
                if (pra) {
                    if (year === "2023") {
                        if (pra.totalPaymentInDollars === 0) zeroPoints.push(state.state);
                        else if (zeroPoints.includes(state.state))
                            zeroPoints = zeroPoints.filter((item) => item !== state.state);
                    } else {
                        const paymentCondition =
                            predict === "Min"
                                ? pra.predictedMinimumTotalPaymentInDollars
                                : pra.predictedMaximumTotalPaymentInDollars;
                        if (paymentCondition === 0) {
                            zeroPoints.push(state.state);
                        } else if (zeroPoints.includes(state.state)) {
                            zeroPoints = zeroPoints.filter((item) => item !== state.state);
                        }
                    }
                } else zeroPoints.push(state.state);
            });
        }
    });

    const classes = useStyles();
    return (
        <div>
            <Box display="flex" justifyContent="center" className="IRAMapHeader">
                <DrawLegend
                    colorScale={colorScale}
                    title={titleElement({ subtitle, year })}
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
                predict={predict}
                practices={practices}
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
// PENDING: adjust use title element after the component is fully functional
const titleElement = ({ subtitle, year }): JSX.Element => {
    return (
        <Box sx={{ ml: 10 }}>
            {" "}
            {year === "2023" ? (
                <Typography noWrap variant="h6">
                    {subtitle} Inflation Reduction Act Benefits for <strong>{year}</strong>
                </Typography>
            ) : (
                <Typography noWrap variant="h6">
                    {subtitle} Inflation Reduction Act Predicted Benefits for <strong>{year}</strong>
                </Typography>
            )}
        </Box>
    );
};
export default IRAMap;
