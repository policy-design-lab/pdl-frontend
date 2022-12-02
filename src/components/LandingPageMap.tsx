import React, { useState } from 'react';
import { geoCentroid } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { scaleQuantile } from 'd3-scale';

import PropTypes from 'prop-types';
import allStates from '../data/allstates.json';
import summary from '../data/summary.json';
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

const MapChart = ({ setTooltipContent, title }) => {
    let searchKey = '';
    let color1 = '';
    let color2 = '';
    let color3 = '';
    let color4 = '';
    let color5 = '';

    switch (title) {
        case 'Title I: Commodities':
            searchKey = 'Title I Total';
            color1 = '#F9F9D3';
            color2 = '#F9D48B';
            color3 = '#F59020';
            color4 = '#D95F0E';
            color5 = '#993404';
            break;
        case 'Title II: Conservation':
            searchKey = 'Title II Total';
            color1 = '#F0F9E8';
            color2 = '#BAE4BC';
            color3 = '#7BCCC4';
            color4 = '#43A2CA';
            color5 = '#0868AC';
            break;
        case 'Crop Insurance':
            searchKey = 'Crop Insurance Total';
            color1 = '#A1622F';
            color2 = '#DCC287';
            color3 = '#f5f5f5';
            color4 = '#89CBC1';
            color5 = '#2C8472';
            break;
        case 'Supplemental Nutrition Assistance Program (SNAP)':
            searchKey = 'SNAP Total';
            color1 = '#F1EEF6';
            color2 = '#BDC9E1';
            color3 = '#74A9CF';
            color4 = '#2B8CBE';
            color5 = '#045A8D';
            break;
    }

    const colorScale = scaleQuantile()
        .domain(allPrograms.map((d) => d[searchKey]))
        .range([color1, color2, color3, color4, color5]);

    return (
        <div data-tip="">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <>
                            {geographies.map((geo) => {
                                const cur = allStates.find((s) => s.val === geo.id);
                                const records = summary.filter((s) => s.State === cur.id && s.Title === title);
                                let total = 0;
                                records.forEach((record) => {
                                    total += record.Amount;
                                });
                                const hoverContent = (
                                    <div>
                                        Payments:
                                        <br />
                                        {records.map((record) => (
                                            <div key={record.State + record.Title + record['Fiscal Year']}>
                                                {record['Fiscal Year']}: ${Number(record.Amount / 1000000.0).toFixed(2)}
                                                M
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
                                        fill={colorScale(total)}
                                        stroke="#FFF"
                                        style={{
                                            default: { outline: 'none' },
                                            hover: {
                                                fill: '#34b7eb',
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
    setTooltipContent: PropTypes.func,
    title: PropTypes.string
};

const LandingPageMap = ({ programTitle }: { programTitle: string }): JSX.Element => {
    const [content, setContent] = useState('');
    return (
        <div>
            <MapChart setTooltipContent={setContent} title={programTitle} />
            <ReactTooltip>{content}</ReactTooltip>
        </div>
    );
};

export default LandingPageMap;
