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
    const { setReactTooltipContent, category, allStates, statePerformance, stateCodes, colorScale, year } = props;
    let categoryRecord;
    const classes = useStyles();
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
                                const statuteRecord = record.statutes;
                                const ACur = statuteRecord.find((s) => s.statuteName === "2018 Practices");
                                const AArray = ACur.practiceCategories;
                                const BCur = statuteRecord.find((s) => s.statuteName === "2014 Eligible Land");
                                const BArray = BCur.practiceCategories;
                                const CCur = statuteRecord.find((s) => s.statuteName === "Miscellaneous Practices");
                                const CArray = CCur.practiceCategories;
                                const TotalArray = AArray.concat(BArray).concat(CArray);
                                if (category === "2018 Practices") {
                                    categoryRecord = statuteRecord[0];
                                } else if (category === "2014 Eligible Land") {
                                    categoryRecord = statuteRecord[1];
                                } else if (category === "Miscellaneous Practices") {
                                    categoryRecord = statuteRecord[2];
                                } else {
                                    categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
                                }
                                const categoryPayment = categoryRecord.totalPaymentInDollars;
                                const nationwidePercentage = categoryRecord.totalPaymentInPercentageNationwide;
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
    allStates,
    year,
    stateCodes
}: {
    category: string;
    statePerformance: any;
    allStates: any;
    year: string;
    stateCodes: any;
}): JSX.Element => {
    const [content, setContent] = useState("");

    const title = `${category} Benefits from ${year}`;
    const quantizeArray: number[] = [];
    statePerformance[year].map((value) => {
        let categoryRecord = {};
        const statuteRecord = value.statutes;
        const ACur = statuteRecord.find((s) => s.statuteName === "2018 Practices");
        const AArray = ACur.practiceCategories;
        const BCur = statuteRecord.find((s) => s.statuteName === "2014 Eligible Land");
        const BArray = BCur.practiceCategories;
        const CCur = statuteRecord.find((s) => s.statuteName === "Miscellaneous Practices");
        const CArray = CCur.practiceCategories;
        const TotalArray = AArray.concat(BArray).concat(CArray);
        if (category === "2018 Practices") {
            categoryRecord = statuteRecord[0];
        } else if (category === "2014 Eligible Land") {
            categoryRecord = statuteRecord[1];
        } else if (category === "Miscellaneous Practices") {
            categoryRecord = statuteRecord[2];
        } else {
            categoryRecord = TotalArray.find((s) => s.practiceCategoryName === category);
        }
        if (categoryRecord !== undefined) quantizeArray.push(categoryRecord.totalPaymentInDollars);
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
                            title={titleElement(category, year)}
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
                            {titleElement(category, year)}
                            <Box display="flex" justifyContent="center">
                                <Typography sx={{ color: "#CCC", fontWeight: 700 }}>
                                    {category} data in {year} is unavailable for all states.
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
                year={year}
                stateCodes={stateCodes}
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
