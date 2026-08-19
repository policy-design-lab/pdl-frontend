import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import soybeanGlyph from "../../images/soybean/soybean.svg";
import { mainlandChinaColor, mutedCountryFill, mutedCountryStroke, soybeanDataSources } from "./constants";
import SoybeanStoryboardDataSources from "./SoybeanStoryboardDataSources";
import {
    convertMetricTonsToUnit,
    formatPercentage,
    formatSoybeanQuantity,
    getMarketBalanceForCountry,
    getLatestYear,
    getSortedYears,
    SoybeanQuantityUnit,
    SoybeanYearRecord,
    SoybeanMarketBalanceCountry
} from "./soybeanApi";
import SoybeanStoryboardUnitSelect from "./SoybeanStoryboardUnitSelect";
import SoybeanStoryboardYearSelect from "./SoybeanStoryboardYearSelect";
import { loadWorldFeatures, normalizeCountryId } from "./worldMapData";

const VIEWBOX_WIDTH = 920;
const VIEWBOX_HEIGHT = 620;
const SOYBEAN_GRID_COUNT = 100;
const SOYBEAN_GOLD_COLOR = "#D69830";
const SOYBEAN_GREY_COLOR = "rgba(214, 222, 228, 0.74)";

type SoybeanStoryboardChinaDemandProps = {
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
};

function buildGlyphMarkup(goldRatio: number, gradientId: string): string {
    if (goldRatio >= 1) {
        return soybeanGlyph.replace(/fill="white"/g, `fill="${SOYBEAN_GOLD_COLOR}"`);
    }
    if (goldRatio <= 0) {
        return soybeanGlyph.replace(/fill="white"/g, `fill="${SOYBEAN_GREY_COLOR}"`);
    }
    const offset = `${(goldRatio * 100).toFixed(2)}%`;
    const gradient =
        `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${SOYBEAN_GOLD_COLOR}"/>` +
        `<stop offset="${offset}" stop-color="${SOYBEAN_GOLD_COLOR}"/>` +
        `<stop offset="${offset}" stop-color="${SOYBEAN_GREY_COLOR}"/>` +
        `<stop offset="1" stop-color="${SOYBEAN_GREY_COLOR}"/>` +
        "</linearGradient></defs>";
    return soybeanGlyph.replace(/fill="white"/g, `fill="url(#${gradientId})"`).replace(/(<svg[^>]*>)/, `$1${gradient}`);
}

function SoybeanShareGlyph({ goldRatio, gradientId }: { goldRatio: number; gradientId: string }): JSX.Element {
    return (
        <Box
            component="span"
            className="soybean-storyboard-demand-grid-icon"
            dangerouslySetInnerHTML={{ __html: buildGlyphMarkup(goldRatio, gradientId) }}
        />
    );
}

export default function SoybeanStoryboardChinaDemand({
    marketBalance
}: SoybeanStoryboardChinaDemandProps): JSX.Element {
    const [worldFeatures, setWorldFeatures] = React.useState<any[]>([]);
    const [unit, setUnit] = React.useState<SoybeanQuantityUnit>("mmt");
    const [selectedYear, setSelectedYear] = React.useState("");
    const availableYears = React.useMemo(() => getSortedYears(marketBalance), [marketBalance]);
    const preferredYear = React.useMemo(() => getLatestYear(marketBalance), [marketBalance]);
    const marketBalanceYear = availableYears.includes(selectedYear) ? selectedYear : preferredYear;
    React.useEffect(() => {
        loadWorldFeatures().then((features) => {
            setWorldFeatures(features);
        });
    }, []);
    React.useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(preferredYear);
        }
    }, [availableYears, preferredYear, selectedYear]);
    const yearOptions = availableYears.length > 0 ? [...availableYears].reverse() : [marketBalanceYear];
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
                const chinaAnchorX = VIEWBOX_WIDTH * 0.48;
                const chinaAnchorY = VIEWBOX_HEIGHT * 0.54;
                projectionInstance.translate([
                    projectionInstance.translate()[0] + (chinaAnchorX - chinaPoint[0]),
                    projectionInstance.translate()[1] + (chinaAnchorY - chinaPoint[1])
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
    const soybeanImportShare = Math.max(0, Math.min(SOYBEAN_GRID_COUNT, chinaBalance?.importPercentageWorldwide ?? 0));
    const importVolume = convertMetricTonsToUnit(chinaBalance?.importsMT, unit);
    return (
        <Box className="soybean-storyboard-demand-shell">
            <Box className="soybean-storyboard-demand-title-row">
                <Typography className="soybean-storyboard-subheader soybean-storyboard-demand-title">
                    China&apos;s Demand Of Soybean
                </Typography>
            </Box>
            <Box className="soybean-storyboard-demand-control-row">
                <SoybeanStoryboardUnitSelect
                    value={unit}
                    onChange={setUnit}
                    selectWrapClassName="soybean-storyboard-trade-year-select-wrap"
                />
                <SoybeanStoryboardYearSelect
                    value={marketBalanceYear}
                    years={yearOptions}
                    onChange={setSelectedYear}
                    selectWrapClassName="soybean-storyboard-trade-year-select-wrap"
                />
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
                                        fill={isChina ? "rgba(255, 179, 104, 0.08)" : mutedCountryFill}
                                        stroke={isChina ? mainlandChinaColor : mutedCountryStroke}
                                        strokeWidth={isChina ? 4.5 : 1.3}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                            {chinaFeature ? (
                                <path
                                    d={pathGenerator(chinaFeature) || ""}
                                    fill="rgba(255, 179, 104, 0.06)"
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
                            Mainland China imported roughly <span>{formatSoybeanQuantity(importVolume, unit)}</span> of
                            soybeans, accounting for about <span>~{formatPercentage(soybeanImportShare, 1)}</span> of
                            the global soybean import market in {marketBalanceYear}
                        </Box>
                    </Box>
                </Box>
                <Box className="soybean-storyboard-demand-grid-panel">
                    <Typography className="soybean-storyboard-demand-grid-explainer">
                        Each soybean represents 1% of global soybean imports. Colored soybeans show Mainland
                        China&apos;s {formatPercentage(soybeanImportShare, 1)} share (
                        {formatSoybeanQuantity(importVolume, unit)}) of the {marketBalanceYear} world import market;
                        uncolored soybeans are the remainder imported by the rest of the world.
                    </Typography>
                    <Box className="soybean-storyboard-demand-grid" aria-label="Soybean import share illustration">
                        {Array.from({ length: SOYBEAN_GRID_COUNT }, (_, index) => {
                            const goldRatio = Math.max(0, Math.min(1, soybeanImportShare - index));
                            return (
                                <Box key={index} className="soybean-storyboard-demand-grid-item">
                                    <SoybeanShareGlyph
                                        goldRatio={goldRatio}
                                        gradientId={`soybean-demand-glyph-gradient-${index}`}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
            <SoybeanStoryboardDataSources sources={[soybeanDataSources.marketView]} />
        </Box>
    );
}
