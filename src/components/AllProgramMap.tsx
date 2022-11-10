import React, { useState } from 'react';
import { geoCentroid } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';

import PropTypes from 'prop-types';
import allStates from '../data/allstates.json';
import allPrograms from '../data/allPrograms.json';

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

const MapChart = ({setTooltipContent}) => {
    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const cur = allStates.find((s) => s.val === geo.id);
                                const records = allPrograms.filter((s) => s.State === cur.id);
                                const hoverContent = (
                                    <div>
                                        Payments:
                                        <br />
                                        {records.map((record) => (
                                            <div key={record.State}>
                                                2018: ${Number(record['2018 All Programs Total']).toFixed(2)}<br />
                                                2019: ${Number(record['2019 All Programs Total']).toFixed(2)}<br />
                                                2020: ${Number(record['2020 All Programs Total']).toFixed(2)}<br />
                                                2021: ${Number(record['2021 All Programs Total']).toFixed(2)}<br />
                                                2022: ${Number(record['2022 All Programs Total']).toFixed(2)}<br />
                                            </div>
                                        ))}
                                    </div>
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
                                        fill="#DDD"
                                        stroke="#FFF"
                                        style={{
                                            default: {
                                                fill: '#D6D6DA',
                                                outline: 'none'
                                            },
                                            hover: {
                                                fill: '#F53',
                                                outline: 'none'
                                            },
                                            pressed: {
                                                fill: '#E42',
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

const AllProgramMap = (): JSX.Element => {
    const [content, setContent] = useState('');
    return (
        <div>
            <MapChart setTooltipContent={setContent} />
            <ReactTooltip>{content}</ReactTooltip>
        </div>
    );
};

export default AllProgramMap;
