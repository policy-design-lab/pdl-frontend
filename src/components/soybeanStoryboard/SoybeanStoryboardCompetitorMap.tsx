import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import { loadWorldFeatures, normalizeCountryId } from "./worldMapData";
import SoybeanStoryboardNarrativeMap from "./SoybeanStoryboardNarrativeMap";

const VIEWBOX_WIDTH = 1360;
const VIEWBOX_HEIGHT = 920;
const BRAZIL_COUNTRY_ID = "076";

export default function SoybeanStoryboardCompetitorMap(): JSX.Element {
    const [worldFeatures, setWorldFeatures] = React.useState<any[]>([]);

    React.useEffect(() => {
        loadWorldFeatures().then((features) => {
            setWorldFeatures(features);
        });
    }, []);
    const regionalFeatures = React.useMemo(
        () =>
            worldFeatures.filter((feature: any) => {
                const [longitude, latitude] = geoCentroid(feature);
                return longitude >= -130 && longitude <= -20 && latitude >= -60 && latitude <= 45;
            }),
        [worldFeatures]
    );
    const projection = React.useMemo(() => {
        if (regionalFeatures.length === 0) {
            return null;
        }
        const featureCollection = {
            type: "FeatureCollection",
            features: regionalFeatures
        } as any;
        const mapProjection = geoMercator().fitExtent(
            [
                [44, 28],
                [VIEWBOX_WIDTH - 26, VIEWBOX_HEIGHT - 20]
            ],
            featureCollection
        );
        const previewPath = geoPath(mapProjection);
        const [[minX, minY], [maxX, maxY]] = previewPath.bounds(featureCollection);
        const currentCenterX = (minX + maxX) / 2;
        const currentCenterY = (minY + maxY) / 2;
        mapProjection.scale(mapProjection.scale() * 1.28);
        const viewBoxCenterX = VIEWBOX_WIDTH / 2;
        const viewBoxCenterY = VIEWBOX_HEIGHT / 2;
        mapProjection.translate([
            mapProjection.translate()[0] + (viewBoxCenterX - currentCenterX) + 12,
            mapProjection.translate()[1] + (viewBoxCenterY - currentCenterY) + 8
        ]);
        return mapProjection;
    }, [regionalFeatures]);
    const pathGenerator = React.useMemo(() => (projection ? geoPath(projection) : null), [projection]);
    if (!pathGenerator) {
        return (
            <Box className="soybean-storyboard-competitor-map-frame soybean-storyboard-map-loading">
                <Typography className="soybean-storyboard-map-loading-text">Loading Americas map...</Typography>
            </Box>
        );
    }
    return (
        <SoybeanStoryboardNarrativeMap
            ariaLabel="Brazil highlighted within the Americas soybean market landscape"
            banner="Brazil is the major competitor."
            bannerClassName="soybean-storyboard-competitor-card"
            bannerTextClassName="soybean-storyboard-banner-text soybean-storyboard-competitor-card-text"
            frameClassName="soybean-storyboard-competitor-map-frame"
            shellClassName="soybean-storyboard-competitor-shell"
            svgClassName="soybean-storyboard-competitor-map"
            viewBoxHeight={VIEWBOX_HEIGHT}
            viewBoxWidth={VIEWBOX_WIDTH}
        >
            {regionalFeatures.map((feature: any) => {
                const countryId = normalizeCountryId(feature.id);
                const isBrazil = countryId === BRAZIL_COUNTRY_ID;
                const [, latitude] = geoCentroid(feature);
                const baseFill = latitude < 8 ? "rgba(55, 75, 81, 0.82)" : "rgba(30, 53, 59, 0.88)";
                return (
                    <path
                        key={countryId}
                        d={pathGenerator(feature) || ""}
                        fill={isBrazil ? "#4D9F45" : baseFill}
                        stroke={isBrazil ? "rgba(236, 245, 235, 0.62)" : "rgba(20, 39, 47, 0.95)"}
                        strokeWidth={isBrazil ? 2.4 : 1.1}
                        vectorEffect="non-scaling-stroke"
                    />
                );
            })}
        </SoybeanStoryboardNarrativeMap>
    );
}
