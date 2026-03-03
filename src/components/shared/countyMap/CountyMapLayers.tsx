import React, { useEffect, useMemo, useRef } from "react";
import { Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

interface CountyGeographyLayerProps {
    geographies: any[];
    selectedStateFips: string | null;
    getCountyFillColor: (countyFIPS: string, geo: any) => string;
    onMouseEnter?: (geo: any, countyFIPS: string) => void;
    onMouseLeave?: () => void;
    onGeographiesReady?: () => void;
    stroke?: string;
    strokeWidth?: number;
    defaultStyle?: Record<string, unknown>;
    hoverStyle?: Record<string, unknown>;
    pressedStyle?: Record<string, unknown>;
}

const CountyGeographyLayerComponent = ({
    geographies,
    selectedStateFips,
    getCountyFillColor,
    onMouseEnter,
    onMouseLeave,
    onGeographiesReady,
    stroke = "#FFFFFF",
    strokeWidth = 0.15,
    defaultStyle,
    hoverStyle,
    pressedStyle
}: CountyGeographyLayerProps): JSX.Element => {
    const readyNotifiedRef = useRef(false);

    useEffect(() => {
        if (!readyNotifiedRef.current && geographies.length > 0 && onGeographiesReady) {
            readyNotifiedRef.current = true;
            onGeographiesReady();
        }
    }, [geographies.length, onGeographiesReady]);

    const visibleGeographies = useMemo(
        () =>
            selectedStateFips === null
                ? geographies
                : geographies.filter((geo) => String(geo.id || "").startsWith(selectedStateFips)),
        [geographies, selectedStateFips]
    );

    return (
        <>
            {visibleGeographies.map((geo) => {
                const countyFIPS = String(geo.id || "");
                if (!countyFIPS) return null;
                return (
                    <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => onMouseEnter && onMouseEnter(geo, countyFIPS)}
                        onMouseLeave={onMouseLeave}
                        fill={getCountyFillColor(countyFIPS, geo)}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        style={{
                            default: defaultStyle || { outline: "none" },
                            hover: hoverStyle || {
                                stroke: "#232323",
                                strokeWidth: 0.5,
                                outline: "none"
                            },
                            pressed: pressedStyle || { outline: "none" }
                        }}
                    />
                );
            })}
        </>
    );
};

interface StateBoundaryLayerProps {
    geographies: any[];
    onGeographiesReady?: () => void;
    stroke?: string;
    strokeWidth?: number;
    defaultStyle?: Record<string, unknown>;
    hoverStyle?: Record<string, unknown>;
    pressedStyle?: Record<string, unknown>;
}

const StateBoundaryLayerComponent = ({
    geographies,
    onGeographiesReady,
    stroke = "#000",
    strokeWidth = 0.5,
    defaultStyle,
    hoverStyle,
    pressedStyle
}: StateBoundaryLayerProps): JSX.Element => {
    const readyNotifiedRef = useRef(false);

    useEffect(() => {
        if (!readyNotifiedRef.current && geographies.length > 0 && onGeographiesReady) {
            readyNotifiedRef.current = true;
            onGeographiesReady();
        }
    }, [geographies.length, onGeographiesReady]);

    return (
        <>
            {geographies.map((geo) => (
                <Geography
                    key={`state-${geo.rsmKey}`}
                    geography={geo}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{
                        default: defaultStyle || { outline: "none", pointerEvents: "none" },
                        hover: hoverStyle || { outline: "none", pointerEvents: "none" },
                        pressed: pressedStyle || { outline: "none", pointerEvents: "none" }
                    }}
                />
            ))}
        </>
    );
};

interface StateLabelLayerProps {
    geographies: any[];
    selectedState: string;
    stateAbbrevByVal: Record<string, string>;
    minLabelLon?: number;
    maxLabelLon?: number;
}

const StateLabelLayerComponent = ({
    geographies,
    selectedState,
    stateAbbrevByVal,
    minLabelLon = -160,
    maxLabelLon = -67
}: StateLabelLayerProps): JSX.Element => {
    if (selectedState !== "All States") {
        return <></>;
    }
    return (
        <>
            {geographies.map((geo) => {
                const centroid = geoCentroid(geo);
                const stateAbbrev = stateAbbrevByVal[String(geo.id)];
                if (!stateAbbrev || centroid[0] < minLabelLon || centroid[0] > maxLabelLon) {
                    return null;
                }
                return (
                    <g key={`${geo.rsmKey}-name`}>
                        <Marker coordinates={centroid}>
                            <rect
                                x="-10"
                                y="-6"
                                width="20"
                                height="14"
                                fill="white"
                                opacity="0.7"
                                style={{ pointerEvents: "none" }}
                            />
                            <text
                                y="2"
                                fontSize={12}
                                textAnchor="middle"
                                fill="#555"
                                style={{ fontWeight: "bold", pointerEvents: "none" }}
                            >
                                {stateAbbrev}
                            </text>
                        </Marker>
                    </g>
                );
            })}
        </>
    );
};

export const CountyGeographyLayer = React.memo(CountyGeographyLayerComponent);
export const StateBoundaryLayer = React.memo(StateBoundaryLayerComponent);
export const StateLabelLayer = React.memo(StateLabelLayerComponent);
