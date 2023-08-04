import React, { useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "../styles/map.css";
import { CircularProgress } from "@mui/material";
import { config } from "../app.config";
import { getJsonDataFromUrl, convertAllState } from "../utils/apiutil";
import DrawLegend from "./shared/DrawLegend";
import legendConfig from "../utils/legendConfig.json";

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
    const { setTooltipContent, title, stateCodes, allPrograms, allStates, summary } = props;
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
                <Typography noWrap variant="h6">
                    Total Farm Bill Benefits from <strong>2018 - 2022</strong>
                </Typography>
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
                <Typography noWrap variant="h6">
                    Total Commodities Programs (Title I) from <strong>2018 - 2022</strong>
                </Typography>
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
            // color1 = "#A1622F";
            // color2 = "#DCC287";
            // color3 = "#E3E3E3";
            // color4 = "#89CBC1";
            // color5 = "#2C8472";
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
                    Total Supplemental Nutrition Assistance Program (SNAP) Costs from <strong>2018 - 2022</strong>
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
    return (
        <div data-tip="">
            <Box id="TopMapContainer" display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <DrawLegend
                    colorScale={colorScale}
                    title={legendTitle}
                    programData={allPrograms.filter((d) => d.State !== "Total").map((d) => d[searchKey])}
                    prepColor={[color1, color2, color3, color4, color5]}
                    emptyState={zeroPoints}
                    initWidth={window.innerWidth > 1679 ? window.innerWidth * 0.75 : window.innerWidth * 0.8}
                />
            </Box>
            {summary.length === 0 ? null : (
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
                                                totalAverageMonthlyParticipation +=
                                                    record["Average Monthly Participation"];
                                            });
                                        }

                                        const hoverContent =
                                            title !== "All Programs" ? (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        bgcolor: "#ECF0ED",
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography sx={{ color: "#2F7164" }}>
                                                            {stateCodes[cur.id]}
                                                        </Typography>
                                                        {title ===
                                                        "Supplemental Nutrition Assistance Program (SNAP)" ? (
                                                            <Typography sx={{ color: "#2F7164" }}>
                                                                Total Cost
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ color: "#2F7164" }}>
                                                                Total Benefit
                                                            </Typography>
                                                        )}
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            {Math.round(Number(total / 1000000.0)) >= 0
                                                                ? `$${Number(
                                                                      Math.abs(total) / 1000000.0
                                                                  ).toLocaleString(undefined, {
                                                                      maximumFractionDigits: 2
                                                                  })}M`
                                                                : `-$${Number(
                                                                      Math.abs(total) / 1000000.0
                                                                  ).toLocaleString(undefined, {
                                                                      maximumFractionDigits: 2
                                                                  })}M`}
                                                        </Typography>
                                                        <br />
                                                        {/* Show additional data on hover for SNAP */}
                                                        {title ===
                                                            "Supplemental Nutrition Assistance Program (SNAP)" && (
                                                            <Typography sx={{ color: "#2F7164" }}>
                                                                Avg. Monthly Participation
                                                            </Typography>
                                                        )}
                                                        {/* Average SNAP monthly participation for the current years */}
                                                        {title ===
                                                            "Supplemental Nutrition Assistance Program (SNAP)" && (
                                                            <Typography sx={{ color: "#3F3F3F" }}>
                                                                {Number(
                                                                    totalAverageMonthlyParticipation / yearList.length
                                                                ).toLocaleString(undefined, {
                                                                    maximumFractionDigits: 0
                                                                })}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                    <Box>
                                                        {title ===
                                                        "Supplemental Nutrition Assistance Program (SNAP)" ? (
                                                            <Typography sx={{ color: "#3F3F3F" }}>
                                                                Costs:
                                                                <br />
                                                                {records.map((record) => (
                                                                    <div
                                                                        key={
                                                                            record.State +
                                                                            record.Title +
                                                                            record["Fiscal Year"]
                                                                        }
                                                                    >
                                                                        {record["Fiscal Year"]}:{" "}
                                                                        {Number(record.Amount / 1000000.0) >= 0
                                                                            ? `$${Number(
                                                                                  Math.abs(record.Amount) / 1000000.0
                                                                              ).toLocaleString(undefined, {
                                                                                  maximumFractionDigits: 2
                                                                              })}M`
                                                                            : `-$${Number(
                                                                                  Math.abs(record.Amount) / 1000000.0
                                                                              ).toLocaleString(undefined, {
                                                                                  maximumFractionDigits: 2
                                                                              })}M`}
                                                                    </div>
                                                                ))}
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ color: "#3F3F3F" }}>
                                                                {title === "Crop Insurance" ? "Benefits:" : "Payments:"}
                                                                <br />
                                                                {records.map((record) => (
                                                                    <div
                                                                        key={
                                                                            record.State +
                                                                            record.Title +
                                                                            record["Fiscal Year"]
                                                                        }
                                                                    >
                                                                        {record["Fiscal Year"]}:{" "}
                                                                        {Number(record.Amount / 1000000.0) >= 0
                                                                            ? `$${Number(
                                                                                  Math.abs(record.Amount) / 1000000.0
                                                                              ).toLocaleString(undefined, {
                                                                                  maximumFractionDigits: 2
                                                                              })}M`
                                                                            : `-$${Number(
                                                                                  Math.abs(record.Amount) / 1000000.0
                                                                              ).toLocaleString(undefined, {
                                                                                  maximumFractionDigits: 2
                                                                              })}M`}
                                                                    </div>
                                                                ))}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        bgcolor: "#ECF0ED",
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography sx={{ color: "#2F7164" }}>
                                                            {cur ? stateCodes[cur.id] : ""}
                                                        </Typography>
                                                        <Typography sx={{ color: "#2F7164" }}>Total Benefit</Typography>
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            {Math.round(Number(total / 1000000.0)) >= 0
                                                                ? `$${Number(
                                                                      Math.abs(total) / 1000000.0
                                                                  ).toLocaleString(undefined, {
                                                                      maximumFractionDigits: 2
                                                                  })}M`
                                                                : `-$${Number(
                                                                      Math.abs(total) / 1000000.0
                                                                  ).toLocaleString(undefined, {
                                                                      maximumFractionDigits: 2
                                                                  })}M`}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                    <Box>
                                                        <Typography sx={{ color: "#3F3F3F" }}>
                                                            Payments:
                                                            <br />
                                                            {records.map((record) => (
                                                                <div key={record.State}>
                                                                    2018:{" "}
                                                                    {record["2018 All Programs Total"] / 1000000.0 >= 0
                                                                        ? `$${Number(
                                                                              Math.abs(
                                                                                  record["2018 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`
                                                                        : `-$${Number(
                                                                              Math.abs(
                                                                                  record["2018 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`}
                                                                    <br />
                                                                    2019:{" "}
                                                                    {record["2019 All Programs Total"] / 1000000.0 >= 0
                                                                        ? `$${Number(
                                                                              Math.abs(
                                                                                  record["2019 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`
                                                                        : `-$${Number(
                                                                              Math.abs(
                                                                                  record["2019 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`}
                                                                    <br />
                                                                    2020:{" "}
                                                                    {record["2020 All Programs Total"] / 1000000.0 >= 0
                                                                        ? `$${Number(
                                                                              Math.abs(
                                                                                  record["2020 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`
                                                                        : `-$${Number(
                                                                              Math.abs(
                                                                                  record["2020 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`}
                                                                    <br />
                                                                    2021:{" "}
                                                                    {record["2021 All Programs Total"] / 1000000.0 >= 0
                                                                        ? `$${Number(
                                                                              Math.abs(
                                                                                  record["2021 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`
                                                                        : `-$${Number(
                                                                              Math.abs(
                                                                                  record["2021 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`}
                                                                    <br />
                                                                    2022:{" "}
                                                                    {record["2022 All Programs Total"] / 1000000.0 >= 0
                                                                        ? `$${Number(
                                                                              Math.abs(
                                                                                  record["2022 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`
                                                                        : `-$${Number(
                                                                              Math.abs(
                                                                                  record["2022 All Programs Total"]
                                                                              ) / 1000000.0
                                                                          ).toLocaleString(undefined, {
                                                                              maximumFractionDigits: 2
                                                                          })}M`}
                                                                    <br />
                                                                </div>
                                                            ))}
                                                        </Typography>
                                                    </Box>
                                                </Box>
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
                                                    setTooltipContent(hoverContent);
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltipContent("");
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
            )}
        </div>
    );
};

MapChart.propTypes = {
    setTooltipContent: PropTypes.func,
    title: PropTypes.string
};

const LandingPageMap = ({ programTitle }: { programTitle: string }): JSX.Element => {
    const [content, setContent] = useState("");
    const [stateCodesData, setStateCodesData] = useState([]);
    const [allProgramsData, setAllProgramsData] = useState([]);
    const [allStatesData, setAllStatesData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    React.useEffect(() => {
        const statecode_url = `${config.apiUrl}/statecodes`;
        getJsonDataFromUrl(statecode_url).then((response) => {
            const converted_json = convertAllState(response);
            setStateCodesData(converted_json);
        });
        const allprograms_url = `${config.apiUrl}/allprograms`;
        getJsonDataFromUrl(allprograms_url).then((response) => {
            setAllProgramsData(response);
        });
        const allstates_url = `${config.apiUrl}/states`;
        getJsonDataFromUrl(allstates_url).then((response) => {
            setAllStatesData(response);
        });
        const summary_url = `${config.apiUrl}/summary`;
        getJsonDataFromUrl(summary_url).then((response) => {
            setSummaryData(response);
        });
    }, []);
    return (
        <div>
            {allProgramsData.length > 0 ? (
                <div>
                    <MapChart
                        setTooltipContent={setContent}
                        title={programTitle}
                        stateCodes={stateCodesData}
                        allPrograms={allProgramsData}
                        allStates={allStatesData}
                        summary={summaryData}
                        screenWidth={screenWidth}
                    />
                    <div className="tooltip-container">
                        <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
                            {content}
                        </ReactTooltip>
                    </div>
                </div>
            ) : (
                <div className="dataLoading">
                    <CircularProgress />
                    Loading data...
                </div>
            )}
        </div>
    );
};

export default LandingPageMap;
