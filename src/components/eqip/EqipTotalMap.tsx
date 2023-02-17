import React, { useState } from 'react';
import { geoCentroid } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { scaleQuantile } from 'd3-scale';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import PropTypes from 'prop-types';
import allStates from '../../data/allstates.json';
import statePerformance from '../../data/eqip/EQIP_STATE_PERFORMANCE_DATA.json';
import '../../styles/map.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

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

const MapChart = ({ setTooltipContent }) => {
    const colorScale = scaleQuantile()
        .domain(Object.values(statePerformance).map((value) => value[0].totalPaymentInDollars))
        .range(['#FFF9D8', '#E1F2C4', '#9FD9BA', '#1B9577', '#005A45']);

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
                                const record = statePerformance[geo.properties.name][0];
                                const totalPaymentInDollars = record.totalPaymentInDollars;
                                const totalPaymentInPercentageNationwide = record.totalPaymentInPercentageNationwide;
                                const hoverContent = (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            bgcolor: '#ECF0ED',
                                            borderRadius: 1
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ color: '#2F7164' }}>{geo.properties.name}</Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <Typography sx={{ color: '#3F3F3F' }}>
                                                    $
                                                    {Number(totalPaymentInDollars / 1000000.0).toLocaleString(
                                                        undefined,
                                                        {
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                    M
                                                </Typography>
                                                <Divider sx={{ mx: 2 }} orientation="vertical" flexItem />
                                                <Typography sx={{ color: '#3F3F3F' }}>
                                                    {totalPaymentInPercentageNationwide}%
                                                </Typography>
                                            </Box>
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
                                            setTooltipContent('');
                                        }}
                                        fill={colorScale(totalPaymentInDollars)}
                                        stroke="#FFF"
                                        style={{
                                            default: { stroke: '#FFFFFF', strokeWidth: 0.75, outline: 'none' },
                                            hover: {
                                                stroke: '#232323',
                                                strokeWidth: 2,
                                                outline: 'none'
                                            },
                                            pressed: {
                                                fill: '#345feb',
                                                outline: 'none'
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
    setTooltipContent: PropTypes.func
};

const EqipTotalMap = (): JSX.Element => {
    const [content, setContent] = useState('');
    return (
        <div>
            <MapChart setTooltipContent={setContent} />
            <div className="tooltip-container">
                <ReactTooltip className="tooltip" classNameArrow="tooltip-arrow" backgroundColor="#ECF0ED">
                    {content}
                </ReactTooltip>
            </div>
        </div>
    );
};

export default EqipTotalMap;
