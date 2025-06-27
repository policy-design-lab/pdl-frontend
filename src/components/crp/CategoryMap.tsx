import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import { useStyles, tooltipBkgColor, topTipStyle } from "../shared/MapTooltip";
import "../../styles/map.css";
import legendConfig from "../../utils/legendConfig.json";
import DrawLegend from "../shared/DrawLegend";
import { getValueFromAttrDollar } from "../../utils/apiutil";
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

interface SubSubProgram {
    subSubProgramName: string;
    totalPaymentInDollars: number;
    totalPaymentInPercentageNationwide: number;
}

interface SubProgram {
    subProgramName: string;
    totalPaymentInDollars: number;
    totalPaymentInPercentageNationwide: number;
    subSubPrograms?: SubSubProgram[];
}

interface StateRecord {
    state: string;
    subPrograms: SubProgram[];
    length?: number;
}

const MapChart = ({ year, setReactTooltipContent, category, allStates, stateCodes, statePerformance, colorScale }) => {
    let categoryRecord;
    const classes = useStyles();
    const getColorForValue = (value) => {
        return colorScale(value);
    };

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
                                record.subPrograms.forEach((value) => {
                                    if (value.subProgramName === "General Sign-up") {
                                        ACur = value;
                                    } else if (value.subProgramName === "Continuous Sign-up") {
                                        BCur = value;
                                        if (BCur.subSubPrograms !== undefined) {
                                            BCur.subSubPrograms.forEach((subSubValue) => {
                                                if (subSubValue.subSubProgramName === "CREP Only") {
                                                    CCur = subSubValue;
                                                } else if (subSubValue.subSubProgramName === "Continuous Non-CREP") {
                                                    DCur = subSubValue;
                                                } else if (subSubValue.subSubProgramName === "Farmable Wetland") {
                                                    ECur = subSubValue;
                                                }
                                            });
                                        }
                                    } else if (value.subProgramName === "Grassland") {
                                        FCur = value;
                                    }
                                });
                                if (category === "General Sign-up") {
                                    categoryRecord = ACur;
                                } else if (category === "Continuous Sign-up") {
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
                                if (categoryRecord === undefined || Object.values(categoryRecord).length === 0) {
                                    categoryRecord = {
                                        totalPaymentInDollars: 0,
                                        totalPaymentInPercentageNationwide: 0
                                    };
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
                                    if (categoryPayment !== undefined) {
                                        if (categoryPayment !== 0) {
                                            return getColorForValue(categoryPayment);
                                        }
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

interface CategoryMapProps {
    year: string;
    category: string;
    attribute: string;
    statePerformance: Record<string, StateRecord[]>;
    allStates: any[];
    stateCodes: Record<string, string>;
}

const CategoryMap = ({
    year,
    category,
    attribute,
    statePerformance,
    allStates,
    stateCodes
}: CategoryMapProps): JSX.Element => {
    const [content, setContent] = useState<string | JSX.Element>("");
    let title = `CRP ${category} from ${year}`;
    const quantizeArray: number[] = [];
    const zeroPoints: string[] = [];

    statePerformance[year].forEach((value) => {
        const programRecord = value.subPrograms;
        let ACur = {};
        if (category === "General Sign-up" || category === "Continuous Sign-up" || category === "Grassland") {
            ACur = programRecord.find((s) => s.subProgramName === category);
        } else if (category === "CREP Only" || category === "Continuous Non-CREP" || category === "Farmable Wetland") {
            const contSingUp = programRecord.find((s) => s.subProgramName === "Continuous Sign-up");
            if (contSingUp && contSingUp.subSubPrograms) {
                const subSubPrograms = contSingUp.subSubPrograms;
                title = `CRP Continuous Sign-up, ${category} from ${year}`;

                subSubPrograms.forEach((subValue) => {
                    if (subValue.subSubProgramName === category) {
                        ACur = subValue;
                    }
                });
            }
        }
        if (ACur && Object.keys(ACur).length > 0) {
            let key = getValueFromAttrDollar(ACur, attribute);
            key = key !== "" ? key : attribute;
            if (ACur[key] !== undefined && ACur[key] > 0) {
                quantizeArray.push(ACur[key]);
            } else if (ACur[key] === 0) {
                zeroPoints.push(value.state);
            }
        }
        return null;
    });
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const customScale = legendConfig[category === "Grassland" ? "Grassland-CRP" : category];
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
                            programData={[...quantizeArray]}
                            prepColor={mapColor}
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
                year={year}
                setReactTooltipContent={setContent}
                category={category}
                colorScale={colorScale}
                allStates={allStates}
                stateCodes={stateCodes}
                statePerformance={statePerformance}
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
                <i>In any state that appears in gray, there is no available data</i>
            </Typography>
        </Box>
    );
};
export default CategoryMap;
