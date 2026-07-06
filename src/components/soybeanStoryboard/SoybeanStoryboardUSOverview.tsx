import React from "react";
import Box from "@mui/material/Box";
import { geoAlbersUsa, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import countiesTopoJson from "../../files/maps/counties-10m.json";
import fipsToState from "../../files/maps/fipsToStateMap";
import SoybeanStoryboardNarrativeMap from "./SoybeanStoryboardNarrativeMap";

const VIEWBOX_WIDTH = 1280;
const VIEWBOX_HEIGHT = 780;
const HIGHLIGHT_STATES = new Set([
    "CO",
    "IA",
    "IL",
    "IN",
    "KS",
    "MI",
    "MN",
    "MO",
    "ND",
    "NE",
    "OH",
    "OK",
    "SD",
    "TX",
    "WI",
    "WY"
]);
const MIDWEST_STATES = new Set(["IA", "IL", "IN", "MI", "MN", "MO", "OH", "WI"]);

export default function SoybeanStoryboardUSOverview(): JSX.Element {
    const nationFeature = React.useMemo(
        () => topojson.feature(countiesTopoJson as any, (countiesTopoJson as any).objects.nation) as any,
        []
    );
    const stateFeatures = React.useMemo(
        () =>
            (topojson.feature(countiesTopoJson as any, (countiesTopoJson as any).objects.states) as any).features || [],
        []
    );
    const projection = React.useMemo(
        () =>
            geoAlbersUsa().fitExtent(
                [
                    [20, 18],
                    [VIEWBOX_WIDTH - 20, VIEWBOX_HEIGHT - 22]
                ],
                nationFeature
            ),
        [nationFeature]
    );
    const pathGenerator = React.useMemo(() => geoPath(projection), [projection]);
    return (
        <Box className="soybean-storyboard-us-overview-shell">
            <Box className="soybean-storyboard-title-block soybean-storyboard-title-block-section">
                <Box component="div" className="soybean-storyboard-title">
                    U.S Soybean Industry
                </Box>
            </Box>
            <SoybeanStoryboardNarrativeMap
                ariaLabel="U.S. soybean production concentration map"
                banner={
                    <>
                        U.S. soybean production is concentrated in the <span>Midwest</span> with recent expansion into
                        the Dakotas and Great Plains
                    </>
                }
                bannerClassName="soybean-storyboard-us-overview-card"
                bannerTextClassName="soybean-storyboard-banner-text soybean-storyboard-banner-text-centered soybean-storyboard-us-overview-card-text"
                frameClassName="soybean-storyboard-us-overview-frame"
                shellClassName="soybean-storyboard-us-overview-map-shell"
                svgClassName="soybean-storyboard-us-overview-map"
                viewBoxHeight={VIEWBOX_HEIGHT}
                viewBoxWidth={VIEWBOX_WIDTH}
            >
                <path d={pathGenerator(nationFeature) || ""} fill="#1E353B" stroke="#374B51" strokeWidth="1.3" />
                {stateFeatures.map((stateFeature: any) => {
                    const stateCode = fipsToState[String(stateFeature.id).padStart(2, "0")];
                    const isHighlighted = stateCode ? HIGHLIGHT_STATES.has(stateCode) : false;
                    const isMidwest = stateCode ? MIDWEST_STATES.has(stateCode) : false;
                    return (
                        <path
                            key={stateFeature.id}
                            d={pathGenerator(stateFeature) || ""}
                            fill={
                                isMidwest
                                    ? "rgba(89, 188, 195, 0.56)"
                                    : isHighlighted
                                      ? "rgba(89, 188, 195, 0.4)"
                                      : "#1E353B"
                            }
                            stroke="rgba(105, 120, 124, 0.42)"
                            strokeWidth={1.2}
                            vectorEffect="non-scaling-stroke"
                        />
                    );
                })}
            </SoybeanStoryboardNarrativeMap>
        </Box>
    );
}
