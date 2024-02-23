/* eslint-disable no-nested-ternary */
import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DrawLegend from "./shared/DrawLegend";
import legendConfig from "../utils/legendConfig.json";
import { ShortFormat } from "./shared/ConvertionFormats";
import { useStyles, tooltipBkgColor } from "./shared/MapTooltip";
import "../styles/map.css";

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
    const { setReactTooltipContent, title, stateCodes, allPrograms, allStates, summary, screenWidth } = props;
    let searchKey = "";
    let color1 = "";
    let color2 = "";
    let color3 = "";
    let color4 = "";
    let color5 = "";
    let legendTitle = <div />;
    let customScale: number[] = [];
    const hashmap = new Map([]);
    summary.forEach((item) => {
        if (item.Title === title) {
            const state = item.State;
            if (!hashmap.has(state)) {
                hashmap.set(state, 0);
            }
            hashmap.set(state, hashmap.get(state) + item.Amount);
        }
    });
    switch (title) {
        case "All Programs":
            searchKey = "18-22 All Programs Total";
            color1 = "#FFF9D8";
            color2 = "#E1F2C4";
            color3 = "#9FD9BA";
            color4 = "#1B9577";
            color5 = "#005A45";
            legendTitle = (
                <Box>
                    <Typography noWrap variant="h6">
                        Total Farm Bill Benefits from <strong>2018 - 2022</strong>
                    </Typography>
                    <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                        <i>2022 payments for Title I have not yet been paid</i>
                    </Typography>
                </Box>
            );
            break;
        case "Title I: Commodities":
            searchKey = "Title I Total";
            color1 = "#F9F9D3";
            color2 = "#F9D48B";
            color3 = "#F59020";
            color4 = "#D95F0E";
            color5 = "#993404";
            legendTitle = (
                <Box>
                    <Typography noWrap variant="h6">
                        Total Commodities Programs (Title I) from <strong>2018 - 2022</strong>
                    </Typography>
                    <Typography noWrap style={{ fontSize: "0.5em", color: "#585858", textAlign: "center" }}>
                        <i>2022 payments for Title I have not yet been paid</i>
                    </Typography>
                </Box>
            );
            break;
        case "Title II: Conservation":
            searchKey = "Title II Total";
            color1 = "#F0F9E8";
            color2 = "#BAE4BC";
            color3 = "#7BCCC4";
            color4 = "#43A2CA";
            color5 = "#0868AC";
            legendTitle = (
                <Typography noWrap variant="h6">
                    Total Conservation Programs (Title II) Benefits from <strong>2018 - 2022</strong>
                </Typography>
            );
            break;
        case "Crop Insurance":
            searchKey = "Crop Insurance Total";
            color1 = "#C26C06";
            color2 = "#CCECE6";
            color3 = "#66C2A4";
            color4 = "#238B45";
            color5 = "#005C24";
            legendTitle = (
                <div>
                    <Box display="flex" flexDirection="column">
                        <Typography noWrap variant="h6" sx={{ pl: "10rem" }}>
                            Total Net Farmer Benefits from <strong>2018 - 2022</strong>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography noWrap variant="h6">
                            Net Farmer Benefit = Total Indemnities - (Total Premium - Total Premium Subsidy)
                        </Typography>
                    </Box>
                </div>
            );
            break;
        case "Supplemental Nutrition Assistance Program (SNAP)":
            searchKey = "SNAP Total";
            color1 = "#F1EEF6";
            color2 = "#CBD9F4";
            color3 = "#74A9CF";
            color4 = "#2B8CBE";
            color5 = "#045A8D";
            legendTitle = (
                <Typography variant="h6">
                    Total Supplemental Nutrition Assistance Program (SNAP) Benefits from <strong>2018 - 2022</strong>
                </Typography>
            );
            break;
    }
    customScale = legendConfig[searchKey];
    const colorScale = d3.scaleThreshold(customScale, [color1, color2, color3, color4, color5]);
    const yearList = summary
        .map((item) => item["Fiscal Year"])
        .filter((value, index, self) => self.indexOf(value) === index);
    const zeroPoints = [];
    allPrograms.forEach((d) => {
        if (d[searchKey] === 0) zeroPoints.push(d.State);
    });
    const classes = useStyles();
    return (
        <div data-tip="">
            <Box id="TopMapContainer" display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <DrawLegend
                    colorScale={colorScale}
                    title={legendTitle}
                    programData={allPrograms.filter((d) => d.State !== "Total").map((d) => d[searchKey])}
                    prepColor={[color1, color2, color3, color4, color5]}
                    emptyState={zeroPoints}
                    initRatioLarge={0.75}
                    initRatioSmall={0.8}
                    screenWidth={screenWidth}
                />
            </Box>
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                let records = [];
                                let total = 0;
                                let totalAverageMonthlyParticipation = 0;
                                const cur = allStates.find((s) => s.val === geo.id);
                                if (cur !== undefined) {
                                    if (title === "All Programs") {
                                        records = allPrograms.filter((s) => s.State === cur.id);
                                        records.forEach((record) => {
                                            total += record["18-22 All Programs Total"];
                                        });
                                    } else {
                                        records = summary.filter((s) => s.State === cur.id && s.Title === title);
                                        records.forEach((record) => {
                                            total += record.Amount;
                                        });
                                    }
                                    if (title === "Supplemental Nutrition Assistance Program (SNAP)") {
                                        records.forEach((record) => {
                                            totalAverageMonthlyParticipation += record["Average Monthly Participation"];
                                        });
                                    }

                                    const hoverContent =
                                        title !== "All Programs" ? (
                                            <div className="map_tooltip">
                                                <div className={classes.tooltip_header}>
                                                    <b>{stateCodes[cur.id]}</b>
                                                </div>
                                                <table className={classes.tooltip_table}>
                                                    <tbody key={cur.id}>
                                                        {records.map((record) => (
                                                            <tr key={record["Fiscal Year"]}>
                                                                <td
                                                                    className={
                                                                        record["Fiscal Year"] === 2018
                                                                            ? classes.tooltip_topcell_left
                                                                            : record["Fiscal Year"] === 2022
                                                                            ? classes.tooltip_bottomcell_left
                                                                            : classes.tooltip_regularcell_left
                                                                    }
                                                                >
                                                                    {`${record["Fiscal Year"]} Benefit:`}
                                                                </td>
                                                                <td
                                                                    className={
                                                                        record["Fiscal Year"] === 2018
                                                                            ? classes.tooltip_topcell_right
                                                                            : record["Fiscal Year"] === 2022
                                                                            ? classes.tooltip_bottomcell_right
                                                                            : classes.tooltip_regularcell_right
                                                                    }
                                                                >
                                                                    {String(record["Fiscal Year"]) === "2022" &&
                                                                    title.includes("Title I")
                                                                        ? "Not Available"
                                                                        : `$${ShortFormat(
                                                                              record.Amount,
                                                                              undefined,
                                                                              2
                                                                          )}`}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {title ===
                                                        "Supplemental Nutrition Assistance Program (SNAP)" ? (
                                                            <tr>
                                                                <td className={classes.tooltip_footer_left}>
                                                                    Total Benefits:
                                                                </td>
                                                                <td className={classes.tooltip_footer_right}>
                                                                    ${ShortFormat(total, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <tr>
                                                                <td className={classes.tooltip_footer_left}>
                                                                    Total Benefits:
                                                                </td>
                                                                <td className={classes.tooltip_footer_right}>
                                                                    ${ShortFormat(total, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {title ===
                                                        "Supplemental Nutrition Assistance Program (SNAP)" ? (
                                                            <tr style={{ color: "black" }}>
                                                                <td className={classes.tooltip_bottomcell_left}>
                                                                    Avg. Monthly Participation:
                                                                </td>
                                                                <td className={classes.tooltip_bottomcell_right}>
                                                                    {ShortFormat(
                                                                        totalAverageMonthlyParticipation /
                                                                            yearList.length,
                                                                        undefined,
                                                                        2
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ) : null}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="map_tooltip">
                                                <div className={classes.tooltip_header}>
                                                    <b>{cur ? stateCodes[cur.id] : ""}</b>
                                                </div>
                                                <table className={classes.tooltip_table}>
                                                    {records.map((record) => (
                                                        <tbody key={record.State}>
                                                            <tr>
                                                                <td className={classes.tooltip_topcell_left}>
                                                                    2018 Benefit:{" "}
                                                                </td>
                                                                <td className={classes.tooltip_topcell_right}>
                                                                    {`$${ShortFormat(
                                                                        record["2018 All Programs Total"],
                                                                        undefined,
                                                                        2
                                                                    )}`}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className={classes.tooltip_regularcell_left}>
                                                                    2019 Benefit:{" "}
                                                                </td>
                                                                <td
                                                                    className={classes.tooltip_regularcell_right}
                                                                >{`$${ShortFormat(
                                                                    record["2019 All Programs Total"],
                                                                    undefined,
                                                                    2
                                                                )}`}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className={classes.tooltip_regularcell_left}>
                                                                    2020 Benefit:{" "}
                                                                </td>
                                                                <td
                                                                    className={classes.tooltip_regularcell_right}
                                                                >{`$${ShortFormat(
                                                                    record["2020 All Programs Total"],
                                                                    undefined,
                                                                    2
                                                                )}`}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className={classes.tooltip_regularcell_left}>
                                                                    2021 Benefit:{" "}
                                                                </td>
                                                                <td
                                                                    className={classes.tooltip_regularcell_right}
                                                                >{`$${ShortFormat(
                                                                    record["2021 All Programs Total"],
                                                                    undefined,
                                                                    2
                                                                )}`}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className={classes.tooltip_bottomcell_left}>
                                                                    2022 Benefit:{" "}
                                                                </td>
                                                                <td
                                                                    className={classes.tooltip_bottomcell_right}
                                                                >{`$${ShortFormat(
                                                                    record["2022 All Programs Total"],
                                                                    undefined,
                                                                    2
                                                                )}`}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className={classes.tooltip_footer_left}>
                                                                    Total Benefits:{" "}
                                                                </td>
                                                                <td className={classes.tooltip_footer_right}>
                                                                    ${ShortFormat(total, undefined, 2)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    ))}
                                                </table>
                                            </div>
                                        );

                                    const fillColour = () => {
                                        if (total) {
                                            if (total !== 0) return colorScale(total);
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
                                }
                                return null;
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
    title: PropTypes.string
};

const LandingPageMap = ({
    programTitle,
    allStates,
    stateCodes,
    allPrograms,
    summary,
    containerWidth = window.innerWidth
}): JSX.Element => {
    const classes = useStyles();
    const [content, setContent] = useState("");
    const [screenWidth, setScreenWidth] = useState(containerWidth);
    return (
        <div>
            <MapChart
                setReactTooltipContent={setContent}
                title={programTitle}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                allStates={allStates}
                summary={summary}
                screenWidth={screenWidth}
            />
            <div className="tooltip-container">
                {/* Note that react-tooltip v4 has to use inline background color to style the tooltip arrow */}
                <ReactTooltip className={`${classes.customized_tooltip} tooltip`} backgroundColor={tooltipBkgColor}>
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default LandingPageMap;
