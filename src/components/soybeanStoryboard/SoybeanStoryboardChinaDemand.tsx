import React from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import soybeanGlyph from "../../images/soybean/soybean.svg";
import { mainlandChinaColor, mutedCountryFill, mutedCountryStroke } from "./constants";
import {
    formatPercentage,
    getMarketBalanceForCountry,
    SoybeanYearRecord,
    SoybeanMarketBalanceCountry
} from "./soybeanApi";
import { loadWorldFeatures, normalizeCountryId } from "./worldMapData";

const VIEWBOX_WIDTH = 920;
const VIEWBOX_HEIGHT = 620;
const SOYBEAN_GRID_COUNT = 100;
const SOYBEAN_GLYPH_MARKUP = soybeanGlyph.replace(/fill="white"/g, 'fill="currentColor"');

type SoybeanStoryboardChinaDemandProps = {
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
    marketBalanceYear: string;
};

function SoybeanShareGlyph({ active }: { active: boolean }): JSX.Element {
    const color = active ? "#D69830" : "rgba(214, 222, 228, 0.74)";
    return (
        <Box
            component="span"
            className="soybean-storyboard-demand-grid-icon"
            sx={{ color }}
            dangerouslySetInnerHTML={{ __html: SOYBEAN_GLYPH_MARKUP }}
        />
    );
}

export default function SoybeanStoryboardChinaDemand({
    marketBalance,
    marketBalanceYear
}: SoybeanStoryboardChinaDemandProps): JSX.Element {
    const [unit, setUnit] = React.useState("MMT");
    const [worldFeatures, setWorldFeatures] = React.useState<any[]>([]);
    React.useEffect(() => {
        loadWorldFeatures().then((features) => {
            setWorldFeatures(features);
        });
    }, []);
    const handleUnitChange = (event: SelectChangeEvent<string>) => {
        setUnit(event.target.value);
    };
    const chinaFeature = React.useMemo(
        () => worldFeatures.find((feature: any) => normalizeCountryId(feature.id) === "156") || null,
        [worldFeatures]
    );
    const regionalFeatures = React.useMemo(
        () =>
            worldFeatures.filter((feature: any) => {
                const [longitude, latitude] = geoCentroid(feature);
                return longitude >= 42 && longitude <= 160 && latitude >= -2 && latitude <= 63;
            }),
        [worldFeatures]
    );
    const projection = React.useMemo(() => {
        if (regionalFeatures.length === 0) {
            return null;
        }
        const projectionInstance = geoMercator().fitExtent(
            [
                [12, 16],
                [VIEWBOX_WIDTH - 18, VIEWBOX_HEIGHT - 18]
            ],
            {
                type: "FeatureCollection",
                features: regionalFeatures
            } as any
        );
        projectionInstance.scale(projectionInstance.scale() * 1.06);
        if (chinaFeature) {
            const chinaPoint = projectionInstance(geoCentroid(chinaFeature) as [number, number]);
            if (chinaPoint) {
                projectionInstance.translate([
                    projectionInstance.translate()[0] + (VIEWBOX_WIDTH * 0.48 - chinaPoint[0]),
                    projectionInstance.translate()[1] + (VIEWBOX_HEIGHT * 0.54 - chinaPoint[1])
                ]);
            }
        }
        return projectionInstance;
    }, [chinaFeature, regionalFeatures]);
    const pathGenerator = React.useMemo(() => (projection ? geoPath(projection) : null), [projection]);
    const chinaBalance = React.useMemo(
        () => getMarketBalanceForCountry(marketBalance, marketBalanceYear, "CN"),
        [marketBalance, marketBalanceYear]
    );
    const soybeanImportShare = chinaBalance?.importPercentageWorldwide ?? 0;
    const activeGlyphCount = Math.max(0, Math.min(SOYBEAN_GRID_COUNT, Math.round(soybeanImportShare)));
    return (
        <Box className="soybean-storyboard-demand-shell">
            <Box className="soybean-storyboard-demand-title-row">
                <Typography className="soybean-storyboard-subheader soybean-storyboard-demand-title">
                    {marketBalanceYear} China&apos;s Demand Of Soybean
                </Typography>
            </Box>
            <Box className="soybean-storyboard-demand-control-row">
                <Typography className="soybean-storyboard-demand-control-label">Unit</Typography>
                <FormControl size="small" className="soybean-storyboard-demand-select-wrap">
                    <InputLabel id="soybean-storyboard-demand-unit-label">Unit</InputLabel>
                    <Select
                        labelId="soybean-storyboard-demand-unit-label"
                        id="soybean-storyboard-demand-unit"
                        value={unit}
                        label="Unit"
                        onChange={handleUnitChange}
                        className="soybean-storyboard-demand-select"
                    >
                        <MenuItem value="MMT">MMT</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box className="soybean-storyboard-demand-visual">
                <Box className="soybean-storyboard-demand-map-frame">
                    {pathGenerator ? (
                        <svg
                            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                            className="soybean-storyboard-demand-map"
                            role="img"
                            aria-label="2024 China's demand of soybean map"
                        >
                            {regionalFeatures.map((feature: any) => {
                                const countryId = normalizeCountryId(feature.id);
                                const isChina = countryId === "156";
                                return (
                                    <path
                                        key={countryId}
                                        d={pathGenerator(feature) || ""}
                                        fill={isChina ? "rgba(255, 197, 126, 0.08)" : mutedCountryFill}
                                        stroke={isChina ? mainlandChinaColor : mutedCountryStroke}
                                        strokeWidth={isChina ? 4.5 : 1.3}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                            {chinaFeature ? (
                                <path
                                    d={pathGenerator(chinaFeature) || ""}
                                    fill="rgba(255, 197, 126, 0.06)"
                                    stroke={mainlandChinaColor}
                                    strokeWidth={6}
                                    vectorEffect="non-scaling-stroke"
                                />
                            ) : null}
                        </svg>
                    ) : (
                        <Box className="soybean-storyboard-map-loading">
                            <Typography className="soybean-storyboard-map-loading-text">
                                Loading regional map...
                            </Typography>
                        </Box>
                    )}
                    <Box className="soybean-storyboard-demand-card">
                        <Box component="div" className="soybean-storyboard-demand-card-text">
                            Mainland China accounted for roughly <span>~{formatPercentage(soybeanImportShare)}</span> of
                            the global soybean import market in {marketBalanceYear}
                        </Box>
                    </Box>
                </Box>
                <Box className="soybean-storyboard-demand-grid" aria-label="Soybean import share illustration">
                    {Array.from({ length: SOYBEAN_GRID_COUNT }, (_, index) => (
                        <Box key={index} className="soybean-storyboard-demand-grid-item">
                            <SoybeanShareGlyph active={index < activeGlyphCount} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
