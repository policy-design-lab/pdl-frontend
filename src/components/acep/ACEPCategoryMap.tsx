import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import * as d3 from "d3";
import "../../styles/map.css";
import legendConfig from "../../utils/legendConfig.json";
import DrawLegend from "../shared/DrawLegend";
import { getValueFromAttrDollar, getValueFromAttrPercentage } from "../../utils/apiutil";

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
    const { year, setTooltipContent, category, allStates, stateCodes, statePerformance, colorScale, attribute } = props;

    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                let keyDollar;
                                let keyPercentage = "";
                                const record = statePerformance[year].filter((v) => v.state === geo.properties.name)[0];
                                if (record === undefined || record.length === 0) {
                                    return null;
                                }
                                if (attribute === "contracts") {
                                    keyDollar = "totalContracts";
                                    keyPercentage = "contractsInPercentageNationwide";
                                } else if (attribute === "acres") {
                                    keyDollar = "totalAcres";
                                    keyPercentage = "acresInPercentageNationwide";
                                } else {
                                    keyDollar = getValueFromAttrDollar(record.programs[0], attribute);
                                    keyPercentage = getValueFromAttrPercentage(record.programs[0], attribute);
                                }
                                const categoryPayment = record.programs[0][keyDollar];
                                const nationwidePercentage = record.programs[0][keyPercentage];
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
                                                    ${ShortFormat(categoryPayment, undefined, 2)}
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
    const title = `ACEP ${category} from ${year}`;
    const quantizeArray: number[] = [];
    const zeroPoints = [];

    statePerformance[year].forEach((value) => {
        const programRecord = value.programs;
        const ACur = programRecord[0];
        let key = "";
        if (attribute === "contracts") key = "totalContracts";
        else if (attribute === "acres") key = "totalAcres";
        else {
            key = getValueFromAttrDollar(ACur, attribute);
            key = key !== "" ? key : attribute;
        }
        quantizeArray.push(ACur[key]);
        ACur[key] === 0 && zeroPoints.push(value.state);
        return null;
    });
    const years = "2018-2022";
    const maxValue = Math.max(...quantizeArray);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"];
    const customScale = legendConfig[category];
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
                            notDollar={!!(attribute === "acres" || attribute === "contracts")}
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
                attribute={attribute}
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
                <strong>{attribute}</strong> from <strong>{year}</strong>
            </Typography>{" "}
            <Typography noWrap style={{ fontSize: "0.5em", color: "#AAA", textAlign: "center" }}>
                <i>In any state that appears in grey, there is no available data</i>
            </Typography>
        </Box>
    );
};
export default CategoryMap;
