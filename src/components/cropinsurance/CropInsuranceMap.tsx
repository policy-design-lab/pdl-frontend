import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import PropTypes from "prop-types";
import "../../styles/map.css";
import DrawLegend from "../shared/DrawLegend";
import legendConfig from "../../utils/legendConfig.json";
import { useStyles, tooltipBkgColor } from "../shared/MapTooltip";
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
    program,
    attribute,
    maxValue,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates,
    colorScale
}) => {
    let attr = 0;
    if (attribute === "lossRatio") attr = 1;
    if (attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium") attr = 2;

    const classes = useStyles();
    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                let programPayment = 0;
                                const state = statePerformance[year].filter(
                                    (v) => stateCodes[v.state] === geo.properties.name
                                )[0];
                                if (state === undefined || state.length === 0) {
                                    return null;
                                }
                                const key =
                                    getValueFromAttrDollar(state.programs[0], attribute) !== ""
                                        ? getValueFromAttrDollar(state.programs[0], attribute)
                                        : "totalNetFarmerBenefit";
                                programPayment = state.programs[0][key];
                                const hoverContent = (
                                    <div className="map_tooltip">
                                        <div className={classes.tooltip_header}>
                                            <b>{geo.properties.name}</b>
                                        </div>

                                        {attr === 1 ? (
                                            <table className={classes.tooltip_table}>
                                                <tbody key={geo.properties.name}>
                                                    <tr>
                                                        <td className={classes.tooltip_topcell_left}>
                                                            {Number(programPayment * 100).toLocaleString(undefined, {
                                                                maximumFractionDigits: 2
                                                            })}
                                                            %
                                                        </td>
                                                        <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        ) : (
                                            <table className={classes.tooltip_table}>
                                                <tbody key={geo.properties.name}>
                                                    {attr === 2 ? (
                                                        <tr>
                                                            <td className={classes.tooltip_topcell_left}>
                                                                ${ShortFormat(programPayment)}
                                                            </td>
                                                            <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                                        </tr>
                                                    ) : (
                                                        <tr>
                                                            <td className={classes.tooltip_topcell_left}>
                                                                ${ShortFormat(programPayment)}
                                                            </td>
                                                            <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
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
        </div>
    );
};

MapChart.propTypes = {
    setReactTooltipContent: PropTypes.func,
    attribute: PropTypes.string,
    program: PropTypes.string,
    maxValue: PropTypes.number
};

const CropInsuranceMap = ({
    program,
    attribute,
    year,
    mapColor,
    statePerformance,
    stateCodes,
    allStates
}: {
    program: string;
    attribute: any;
    year: string;
    mapColor: [string, string, string, string, string];
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
        key = key !== "" ? key : "totalNetFarmerBenefit";
        quantizeArray.push(ACur[key]);
        ACur[key] === 0 && zeroPoints.push(value.state);
        return null;
    });

    const maxValue = Math.max(...quantizeArray);
    const searchKey = attribute === undefined ? program : attribute;
    const customScale = legendConfig[searchKey];
    const colorScale = d3.scaleThreshold(customScale, mapColor);
    const classes = useStyles();
    return (
        <div>
            <Box display="flex" justifyContent="center">
                {attribute === "lossRatio" ? (
                    <DrawLegend
                        isRatio
                        colorScale={colorScale}
                        title={titleElement({ attribute, year })}
                        programData={quantizeArray}
                        prepColor={mapColor}
                        emptyState={zeroPoints}
                        initRatioLarge={0.6}
                        initRatioSmall={0.5}
                    />
                ) : (
                    <div>
                        {attribute === "averageInsuredAreaInAcres" || attribute === "totalPoliciesEarningPremium" ? (
                            <DrawLegend
                                isRatio={false}
                                notDollar
                                colorScale={colorScale}
                                title={titleElement({ attribute, year })}
                                programData={quantizeArray}
                                prepColor={mapColor}
                                emptyState={zeroPoints}
                                initRatioLarge={0.6}
                                initRatioSmall={0.5}
                            />
                        ) : (
                            <DrawLegend
                                isRatio={false}
                                colorScale={colorScale}
                                title={titleElement({ attribute, year })}
                                programData={quantizeArray}
                                prepColor={mapColor}
                                emptyState={zeroPoints}
                                initRatioLarge={0.6}
                                initRatioSmall={0.5}
                            />
                        )}
                    </div>
                )}
            </Box>
            <MapChart
                setReactTooltipContent={setContent}
                program={program}
                attribute={attribute}
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
const titleElement = ({ attribute, year }): JSX.Element => {
    if (attribute === "averageInsuredAreaInAcres")
        return (
            <div>
                {" "}
                <Box display="flex" justifyContent="center">
                    <Typography noWrap variant="h6">
                        <strong>
                            {attribute
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .split(" ")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                        </strong>{" "}
                        from <strong>{year}</strong>
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="center">
                    <Typography noWrap variant="subtitle2" sx={{ color: "#AAA" }}>
                        (Average acres includes acres insured by Pasture, Rangeland, and Forage (PRF) policies)
                    </Typography>
                </Box>
            </div>
        );
    return (
        <Typography noWrap variant="h6">
            <strong>
                {attribute
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
            </strong>{" "}
            from <strong>{year}</strong>
        </Typography>
    );
};
const getValueFromAttrDollar = (stateRecord, attribute): string => {
    let ans = "";
    Object.keys(stateRecord).forEach((key) => {
        const match = key.match(/^(.*?)(?=\s*InDollars)/);
        const extractedKey = match ? match[1] : key;
        if (extractedKey === attribute) {
            ans = key;
        }
    });
    return ans;
};
export default CropInsuranceMap;
