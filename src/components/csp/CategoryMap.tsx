import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import * as d3 from "d3";
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

const MapChart = (props) => {
    const { setReactTooltipContent, category, allStates, statePerformance, colorScale } = props;
    let categoryRecord;
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
                                const statuteRecord = statePerformance[geo.properties.name][0].statutes;
                                const ACur = statuteRecord.find((s) => s.statuteName === "2018 Practices");
                                const AArray = ACur.practiceCategories;
                                const BCur = statuteRecord.find((s) => s.statuteName === "2014 Eligible Land");
                                const BArray = BCur.practiceCategories;
                                const TotalArray = AArray.concat(BArray);
                                if (category === "2018 Practices") {
                                    categoryRecord = statuteRecord[0];
                                } else if (category === "2014 Eligible Land") {
                                    categoryRecord = statuteRecord[1];
                                } else {
                                    categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
                                }
                                const categoryPayment =
                                    category === "2018 Practices" || category === "2014 Eligible Land"
                                        ? categoryRecord.statutePaymentInDollars
                                        : categoryRecord.paymentInDollars;
                                const nationwidePercentage =
                                    category === "2018 Practices" || category === "2014 Eligible Land"
                                        ? categoryRecord.statutePaymentInPercentageNationwide
                                        : categoryRecord.paymentInPercentageNationwide;
                                const withinStatePercentage =
                                    category === "2018 Practices" || category === "2014 Eligible Land"
                                        ? categoryRecord.statutePaymentInPercentageWithinState
                                        : categoryRecord.paymentInPercentageWithinState;
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
                                                        ${ShortFormat(categoryPayment, undefined, 2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={classes.tooltip_regularcell_left}>
                                                        PCT. Nationwide:
                                                    </td>
                                                    <td className={classes.tooltip_regularcell_right}>
                                                        {nationwidePercentage ? `${nationwidePercentage} %` : "0%"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
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
                                            setReactTooltipContent(hoverContent);
                                        }}
                                        onMouseLeave={() => {
                                            setReactTooltipContent("");
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
    setReactTooltipContent: PropTypes.func,
    category: PropTypes.string
};

const CategoryMap = ({
    category,
    statePerformance,
    allStates
}: {
    category: string;
    statePerformance: any;
    allStates: any;
}): JSX.Element => {
    const [content, setContent] = useState("");
    // issue158: since eqip and csp are using old data structure (i.e. year is not the first level of data structure), going into array to find the year
    let years = "2018-2022";
    if (
        Object.keys(statePerformance).length !== 0 &&
        Array(Array(Array(Object.values(statePerformance)[0])[0])[0])[0]
    ) {
        years = Array(Array(Array(Object.values(statePerformance)[0])[0])[0])[0][0].years;
    }
    const title = `${category} Benefits from ${years}`;
    const quantizeArray: number[] = [];
    let categoryRecord = {};
    Object.values(statePerformance).map((value) => {
        if (Array.isArray(value)) {
            const statuteRecord = value[0].statutes;
            const ACur = statuteRecord.find((s) => s.statuteName === "2018 Practices");
            const AArray = ACur.practiceCategories;
            const BCur = statuteRecord.find((s) => s.statuteName === "2014 Eligible Land");
            const BArray = BCur.practiceCategories;
            const TotalArray = AArray.concat(BArray);
            if (category === "2018 Practices") {
                categoryRecord = statuteRecord[0];
            } else if (category === "2014 Eligible Land") {
                categoryRecord = statuteRecord[1];
            } else {
                categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
            }
            if (categoryRecord !== undefined) {
                if (category === "2018 Practices" || category === "2014 Eligible Land")
                    quantizeArray.push(categoryRecord.statutePaymentInDollars);
                else quantizeArray.push(categoryRecord.paymentInDollars);
            }
        }
        return null;
    });
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    let legendCategory = category;
    if (category === "Structural") legendCategory = "Structural-CSP";
    if (category === "Vegetative") legendCategory = "Vegetative-CSP";
    if (category === "Land management") legendCategory = "Land management-CSP";
    if (category === "Forest management") legendCategory = "Forest management-CSP";
    if (category === "Soil testing") legendCategory = "Soil testing-CSP";
    if (category === "Other improvement") legendCategory = "Other improvement-CSP";
    const customScale = legendConfig[legendCategory];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const classes = useStyles();
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
                setReactTooltipContent={setContent}
                category={category}
                statePerformance={statePerformance}
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
