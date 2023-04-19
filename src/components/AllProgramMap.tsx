import React, { useEffect, useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { scaleQuantize } from "d3-scale";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { config } from "../app.config";

import PropTypes from "prop-types";
import "../styles/map.css";
import summary from "../data/summary.json";
import { getJsonDataFromUrl} from "../utils/apiutil";
import {convertAllState} from "../utils/apiutil";

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
	const { setTooltipContent, stateCodes, allPrograms, allStates } = props;

	const minValue = 0;

	const hashmap = new Map([]);
	summary.forEach(
		(item) => {
			const state = item.State;
			if(!hashmap.has(state)) {
				hashmap.set(state, 0);
			}
			hashmap.set(state, hashmap.get(state) + item.Amount);
		}
	);

	const maxValue = Math.max(...hashmap.values());

	const colorScale = scaleQuantize()
		.domain([minValue, maxValue])
		.range(["#FFF9D8", "#E1F2C4", "#9FD9BA", "#1B9577", "#005A45"]);

	return (
		<div data-tip="">
			{allPrograms.length === 0 ? null :
				<ComposableMap projection="geoAlbersUsa">
					<Geographies geography={geoUrl}>
						{({ geographies }) => (
							<>
								{geographies.map((geo) => {
									let records = [];
									let total = 0;
									const cur = allStates.find((s) => s.val === geo.id);
									if (cur !== undefined) {
										records = allPrograms.filter((s) => s.State === cur.id);
										records.forEach((record) => {
											total += record["18-22 All Programs Total"];
										});
									}
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
												<Typography sx={{ color: "#2F7164" }}>{cur?stateCodes[cur.id]:""}</Typography>
												<Typography sx={{ color: "#2F7164" }}>Total Benefit</Typography>
												<Typography sx={{ color: "#3F3F3F" }}>
                                                    $
													{Number(total / 1000000.0).toLocaleString(undefined, {
														maximumFractionDigits: 2
													})}
                                                    M
												</Typography>
											</Box>
											<Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
											<Box>
												<Typography sx={{ color: "#3F3F3F" }}>
                                                    Payments:
													<br />
													{records.map((record) => (
														<div key={record.State}>
                                                            2018: $
															{Number(
																record["2018 All Programs Total"] / 1000000.0
															).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            M
															<br />
                                                            2019: $
															{Number(
																record["2019 All Programs Total"] / 1000000.0
															).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            M
															<br />
                                                            2020: $
															{Number(
																record["2020 All Programs Total"] / 1000000.0
															).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            M
															<br />
                                                            2021: $
															{Number(
																record["2021 All Programs Total"] / 1000000.0
															).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            M
															<br />
                                                            2022: $
															{Number(
																record["2022 All Programs Total"] / 1000000.0
															).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            M
															<br />
														</div>
													))}
												</Typography>
											</Box>
										</Box>
									);
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
											fill={colorScale(total)}
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
			}
		</div>
	);
};

MapChart.propTypes = {
	setTooltipContent: PropTypes.func
};

const AllProgramMap = (): JSX.Element => {
	const [content, setContent] = useState("");
	const [stateCodesData, setStateCodesData] = useState([]);
	const [allProgramsData, setAllProgramsData] = useState([]);
	const [allStatesData, setAllStatesData] = useState([]);

	useEffect(() => {
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
	}, []);

	return (
		<div>
			<MapChart setTooltipContent={setContent} stateCodes={stateCodesData}
				allPrograms={allProgramsData} allStates={allStatesData}/>
			<div className="tooltip-container">
				<ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
					{content}
				</ReactTooltip>
			</div>
		</div>
	);
};

export default AllProgramMap;
