import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { geoMercator, geoPath } from "d3-geo";
import {
    argentinaColor,
    brazilColor,
    mainlandChinaColor,
    mutedCountryFill,
    mutedCountryStroke,
    unitedStatesColor
} from "./constants";
import {
    formatMillionMetricTons,
    formatPlainMetricTons,
    getExportsForCountry,
    getMarketBalanceForCountry,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SoybeanExportsRecord,
    SoybeanMarketBalanceCountry,
    SoybeanYearRecord
} from "./soybeanApi";
import { loadWorldFeatures, normalizeCountryId } from "./worldMapData";

const VIEWBOX_WIDTH = 1280;
const VIEWBOX_HEIGHT = 620;
const TRADE_VIEWBOX_HEIGHT = 760;
const TRADE_MAP_TARGET_WIDTH = VIEWBOX_WIDTH - 100;
const TRADE_MAP_TOP = 58;

type SoybeanStoryboardWorldMapProps = {
    exports: SoybeanYearRecord<SoybeanExportsRecord[]>;
    exportsYear: string;
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
    marketBalanceYear: string;
    variant: "overview" | "trade";
};

type TooltipState = {
    countryId: string;
    x: number;
    y: number;
} | null;

type ProjectedPoint = [number, number];

type HighlightCountry = {
    id: string;
    label: string;
    shortLabel?: string;
    fill: string;
    textColor: string;
    labelCoordinates: [number, number];
    labelMaxWidth: number;
    labelMinFontSize?: number;
    tooltipLabel: string;
    tooltipValue: string;
    tooltipNote: string;
};

type TradeFlow = {
    id: string;
    from: [number, number];
    to: [number, number];
    label: string;
    color: string;
    curveX: number;
    curveY: number;
    width: number;
    markerId: string;
};

type RestOfWorldFlow = {
    id: string;
    from: [number, number];
    to: [number, number];
    topLine: string;
    bottomLine: string;
    color: string;
    labelCoordinates: [number, number];
    strokeWidth: number;
    markerId: string;
    textAnchor: "start" | "middle" | "end";
};

const baseHighlightedCountries: Record<string, HighlightCountry> = {
    "032": {
        id: "032",
        label: "ARGENTINA",
        shortLabel: "* ARGENTINA",
        fill: argentinaColor,
        textColor: "#FFFFFF",
        labelCoordinates: [-63, -34.2],
        labelMaxWidth: 98,
        labelMinFontSize: 11,
        tooltipLabel: "Domestic market",
        tooltipValue: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        tooltipNote: "Domestic demand is centered on crushing, with exports weighted toward meal and oil."
    },
    "076": {
        id: "076",
        label: "BRAZIL",
        fill: brazilColor,
        textColor: "#FFFFFF",
        labelCoordinates: [-51, -12.2],
        labelMaxWidth: 76,
        tooltipLabel: "Domestic market",
        tooltipValue: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        tooltipNote: "A large internal crush market complements Brazil's leading export position."
    },
    "156": {
        id: "156",
        label: "MAINLAND CHINA",
        fill: mainlandChinaColor,
        textColor: "#17242A",
        labelCoordinates: [101, 38.8],
        labelMaxWidth: 108,
        labelMinFontSize: 11,
        tooltipLabel: "Domestic use",
        tooltipValue: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        tooltipNote: "China remains the largest global soybean importer and processor."
    },
    "840": {
        id: "840",
        label: "UNITED STATES",
        fill: unitedStatesColor,
        textColor: "#FFFFFF",
        labelCoordinates: [-100, 38],
        labelMaxWidth: 124,
        tooltipLabel: "Domestic use",
        tooltipValue: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        tooltipNote: "Large crush, feed, and biofuel demand keeps the U.S. home market substantial."
    }
};

function buildHighlightedCountries(
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>,
    marketBalanceYear: string
): Record<string, HighlightCountry> {
    const argentinaBalance = getMarketBalanceForCountry(marketBalance, marketBalanceYear, "AR");
    const brazilBalance = getMarketBalanceForCountry(marketBalance, marketBalanceYear, "BR");
    const chinaBalance = getMarketBalanceForCountry(marketBalance, marketBalanceYear, "CN");
    const unitedStatesBalance = getMarketBalanceForCountry(marketBalance, marketBalanceYear, "US");
    return {
        ...baseHighlightedCountries,
        "032": {
            ...baseHighlightedCountries["032"],
            tooltipValue: formatMillionMetricTons(argentinaBalance?.consumptionMT)
        },
        "076": {
            ...baseHighlightedCountries["076"],
            tooltipValue: formatMillionMetricTons(brazilBalance?.consumptionMT)
        },
        "156": {
            ...baseHighlightedCountries["156"],
            tooltipValue: formatMillionMetricTons(chinaBalance?.consumptionMT)
        },
        "840": {
            ...baseHighlightedCountries["840"],
            tooltipValue: formatMillionMetricTons(unitedStatesBalance?.consumptionMT)
        }
    };
}

function buildTradeFlows(exports: SoybeanYearRecord<SoybeanExportsRecord[]>, exportsYear: string): TradeFlow[] {
    const usExports = getExportsForCountry(exports, exportsYear, "US");
    const brExports = getExportsForCountry(exports, exportsYear, "BR");
    const arExports = getExportsForCountry(exports, exportsYear, "AR");
    return [
        {
            id: "us-china",
            from: [-88, 37] as [number, number],
            to: [96, 42] as [number, number],
            label: formatPlainMetricTons(usExports?.china),
            color: unitedStatesColor,
            curveX: 12,
            curveY: -124,
            width: 6,
            markerId: "soybean-arrow-us"
        },
        {
            id: "brazil-china",
            from: [-52, -13] as [number, number],
            to: [101, 25] as [number, number],
            label: formatPlainMetricTons(brExports?.china),
            color: brazilColor,
            curveX: 4,
            curveY: -140,
            width: 12,
            markerId: "soybean-arrow-brazil"
        },
        {
            id: "argentina-china",
            from: [-63, -38] as [number, number],
            to: [109, 22] as [number, number],
            label: formatPlainMetricTons(arExports?.china),
            color: argentinaColor,
            curveX: 28,
            curveY: 104,
            width: 3.25,
            markerId: "soybean-arrow-argentina"
        }
    ];
}

function buildRestOfWorldFlows(
    exports: SoybeanYearRecord<SoybeanExportsRecord[]>,
    exportsYear: string
): RestOfWorldFlow[] {
    const usExports = getExportsForCountry(exports, exportsYear, "US");
    const brExports = getExportsForCountry(exports, exportsYear, "BR");
    return [
        {
            id: "us-rest",
            from: [-122, 37.1] as [number, number],
            to: [-147.5, 37.1] as [number, number],
            topLine: formatPlainMetricTons(usExports?.rest_of_world),
            bottomLine: "Rest of the world",
            color: unitedStatesColor,
            labelCoordinates: [-149.2, 35.2] as [number, number],
            strokeWidth: 4.8,
            markerId: "soybean-arrow-rest-us",
            textAnchor: "end"
        },
        {
            id: "brazil-rest",
            from: [-63.5, -11.3] as [number, number],
            to: [-144.5, -11.3] as [number, number],
            topLine: formatPlainMetricTons(brExports?.rest_of_world),
            bottomLine: "Rest of the world",
            color: brazilColor,
            labelCoordinates: [-146.7, -13.9] as [number, number],
            strokeWidth: 5.4,
            markerId: "soybean-arrow-rest-brazil",
            textAnchor: "end"
        }
    ];
}

function computeTradeFlowPoints(
    project: (coordinates: [number, number]) => ProjectedPoint,
    flow: TradeFlow
): { path: string; pillX: number; pillY: number } {
    const [x1, y1] = project(flow.from);
    const [x2, y2] = project(flow.to);
    const midX = (x1 + x2) / 2 + flow.curveX;
    const midY = (y1 + y2) / 2 + flow.curveY;
    const controlAX = x1 + (midX - x1) * 0.55;
    const controlAY = y1 + (midY - y1) * 0.9;
    const controlBX = x2 + (midX - x2) * 0.55;
    const controlBY = y2 + (midY - y2) * 0.9;
    const path = `M ${x1} ${y1} C ${controlAX} ${controlAY}, ${controlBX} ${controlBY}, ${x2} ${y2}`;
    const t = 0.5;
    const mt = 1 - t;
    const pillX = mt * mt * mt * x1 + 3 * mt * mt * t * controlAX + 3 * mt * t * t * controlBX + t * t * t * x2;
    const pillY = mt * mt * mt * y1 + 3 * mt * mt * t * controlAY + 3 * mt * t * t * controlBY + t * t * t * y2;
    return { path, pillX, pillY };
}

function createLinearPath(
    project: (coordinates: [number, number]) => ProjectedPoint,
    from: [number, number],
    to: [number, number]
): string {
    const [x1, y1] = project(from);
    const [x2, y2] = project(to);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function estimatePillWidth(text: string): number {
    let w = 0;
    for (const ch of text) {
        if ("MW".includes(ch)) w += 12;
        else if ("m".includes(ch)) w += 10;
        else if (" ".includes(ch)) w += 5;
        else if (".,iIl1".includes(ch)) w += 5;
        else w += 9;
    }
    return w + 24;
}

function renderMetricPill(x: number, y: number, text: string, fill: string) {
    const width = estimatePillWidth(text);
    return (
        <g transform={`translate(${x - width / 2} ${y - 14})`}>
            <rect width={width} height={28} rx={4} fill={fill} opacity={0.92} />
            <text
                x={width / 2}
                y={18}
                fill="#FFFFFF"
                fontFamily="Roboto"
                fontSize="16"
                fontStyle="normal"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="0.15"
                style={{ fontFeatureSettings: "'liga' off, 'clig' off" }}
            >
                {text}
            </text>
        </g>
    );
}

function renderCountryLabel(project: (coordinates: [number, number]) => ProjectedPoint, country: HighlightCountry) {
    const [x, y] = project(country.labelCoordinates);
    const label = country.shortLabel || country.label;
    const fontSize = Math.max(
        country.labelMinFontSize ?? 10,
        Math.min(14, country.labelMaxWidth / Math.max(1, label.length * 0.68))
    );
    return (
        <text
            x={x}
            y={y}
            fill={country.textColor}
            fontFamily="Roboto"
            fontSize={fontSize}
            fontStyle="normal"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.15"
            style={{ fontFeatureSettings: "'liga' off, 'clig' off" }}
        >
            {label}
        </text>
    );
}

function renderRestOfWorldLabel(
    project: (coordinates: [number, number]) => ProjectedPoint,
    coordinates: [number, number],
    topLine: string,
    bottomLine: string,
    textAnchor: RestOfWorldFlow["textAnchor"]
) {
    const [x, y] = project(coordinates);
    return (
        <text
            x={x}
            y={y}
            fill="rgba(255, 255, 255, 0.5)"
            textAnchor={textAnchor}
            fontFamily="Roboto"
            fontSize="12"
            fontStyle="normal"
            fontWeight="400"
            letterSpacing="0.15"
            style={{ fontFeatureSettings: "'liga' off, 'clig' off" }}
        >
            <tspan x={x} dy="0">
                {topLine}
            </tspan>
            <tspan x={x} dy="14">
                {bottomLine}
            </tspan>
        </text>
    );
}

export default function SoybeanStoryboardWorldMap({
    exports,
    exportsYear,
    marketBalance,
    marketBalanceYear,
    variant
}: SoybeanStoryboardWorldMapProps): JSX.Element {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [worldFeatures, setWorldFeatures] = React.useState<any[]>([]);
    const [tooltip, setTooltip] = React.useState<TooltipState>(null);
    const highlightedCountries = React.useMemo(
        () => buildHighlightedCountries(marketBalance, marketBalanceYear),
        [marketBalance, marketBalanceYear]
    );
    const tradeFlows = React.useMemo(() => buildTradeFlows(exports, exportsYear), [exports, exportsYear]);
    const restOfWorldFlows = React.useMemo(() => buildRestOfWorldFlows(exports, exportsYear), [exports, exportsYear]);

    React.useEffect(() => {
        loadWorldFeatures().then((features) => {
            setWorldFeatures(features);
        });
    }, []);

    const handleTooltipMove = (event: React.MouseEvent<SVGPathElement>, countryId: string) => {
        if (!containerRef.current || variant !== "trade") {
            return;
        }

        const bounds = containerRef.current.getBoundingClientRect();

        setTooltip({
            countryId,
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
        });
    };
    if (worldFeatures.length === 0) {
        return (
            <Box className="soybean-storyboard-map-frame soybean-storyboard-map-loading">
                <Typography className="soybean-storyboard-map-loading-text">Loading world map...</Typography>
            </Box>
        );
    }

    const activeViewBoxHeight = variant === "trade" ? TRADE_VIEWBOX_HEIGHT : VIEWBOX_HEIGHT;
    const fitExtent =
        variant === "trade"
            ? [
                  [6, 6],
                  [VIEWBOX_WIDTH - 6, activeViewBoxHeight - 2]
              ]
            : [
                  [0, 28],
                  [VIEWBOX_WIDTH, activeViewBoxHeight - 10]
              ];

    const featureCollection = {
        type: "FeatureCollection",
        features: worldFeatures
    } as any;
    const projection = geoMercator().fitExtent(fitExtent, featureCollection);
    if (variant === "trade") {
        const tradePathGenerator = geoPath(projection);
        const [[minX, minY], [maxX]] = tradePathGenerator.bounds(featureCollection);
        const currentWidth = maxX - minX;
        const horizontalScale = TRADE_MAP_TARGET_WIDTH / currentWidth;

        projection.scale(projection.scale() * horizontalScale);

        const scaledTradePathGenerator = geoPath(projection);
        const [[scaledMinX, scaledMinY], [scaledMaxX]] = scaledTradePathGenerator.bounds(featureCollection);
        const scaledWidth = scaledMaxX - scaledMinX;
        const scaledLeft = (VIEWBOX_WIDTH - scaledWidth) / 2;
        const verticalDriftCorrection = (scaledMinY - minY) * 0.02;

        projection.translate([
            projection.translate()[0] + (scaledLeft - scaledMinX),
            projection.translate()[1] + (TRADE_MAP_TOP - scaledMinY) + verticalDriftCorrection
        ]);
    }

    const pathGenerator = geoPath(projection);
    const project = (coordinates: [number, number]): ProjectedPoint =>
        (projection(coordinates) || [0, 0]) as ProjectedPoint;
    return (
        <Box ref={containerRef} className={`soybean-storyboard-map-frame soybean-storyboard-map-frame-${variant}`}>
            <svg
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${activeViewBoxHeight}`}
                className="soybean-storyboard-world-map"
                role="img"
                aria-label={variant === "trade" ? "2024 soybean trading market map" : "Global soybean landscape map"}
            >
                <defs>
                    <marker
                        id="soybean-arrow-us"
                        markerUnits="userSpaceOnUse"
                        markerWidth="18"
                        markerHeight="18"
                        refX="14"
                        refY="9"
                        orient="auto"
                    >
                        <path d="M 0 0 L 18 9 L 0 18 z" fill={unitedStatesColor} />
                    </marker>
                    <marker
                        id="soybean-arrow-brazil"
                        markerUnits="userSpaceOnUse"
                        markerWidth="22"
                        markerHeight="22"
                        refX="17"
                        refY="11"
                        orient="auto"
                    >
                        <path d="M 0 0 L 22 11 L 0 22 z" fill={brazilColor} />
                    </marker>
                    <marker
                        id="soybean-arrow-argentina"
                        markerUnits="userSpaceOnUse"
                        markerWidth="14"
                        markerHeight="14"
                        refX="11"
                        refY="7"
                        orient="auto"
                    >
                        <path d="M 0 0 L 14 7 L 0 14 z" fill={argentinaColor} />
                    </marker>
                    <marker
                        id="soybean-arrow-rest-us"
                        markerUnits="userSpaceOnUse"
                        markerWidth="16"
                        markerHeight="16"
                        refX="12"
                        refY="8"
                        orient="auto"
                    >
                        <path d="M 0 0 L 16 8 L 0 16 z" fill={unitedStatesColor} />
                    </marker>
                    <marker
                        id="soybean-arrow-rest-brazil"
                        markerUnits="userSpaceOnUse"
                        markerWidth="18"
                        markerHeight="18"
                        refX="14"
                        refY="9"
                        orient="auto"
                    >
                        <path d="M 0 0 L 18 9 L 0 18 z" fill={brazilColor} />
                    </marker>
                </defs>
                {worldFeatures.map((item: any, index) => {
                    const normalizedCountryId = normalizeCountryId(item.id);
                    const countryId = normalizedCountryId || `feature-${index}`;
                    const highlightedCountry = highlightedCountries[countryId];
                    const isHighlighted = Boolean(highlightedCountry);
                    const fill = variant === "trade" && highlightedCountry ? highlightedCountry.fill : mutedCountryFill;
                    const stroke = isHighlighted ? highlightedCountry.fill : mutedCountryStroke;
                    const strokeWidth = isHighlighted ? (variant === "trade" ? 1.2 : 2.3) : 0.7;
                    return (
                        <path
                            key={countryId}
                            d={pathGenerator(item) || ""}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            vectorEffect="non-scaling-stroke"
                            className={
                                isHighlighted
                                    ? "soybean-storyboard-country soybean-storyboard-country-highlighted"
                                    : "soybean-storyboard-country"
                            }
                            style={{
                                cursor: variant === "trade" && isHighlighted ? "pointer" : "default"
                            }}
                            onMouseEnter={
                                variant === "trade" && isHighlighted
                                    ? (event) => handleTooltipMove(event, countryId)
                                    : undefined
                            }
                            onMouseMove={
                                variant === "trade" && isHighlighted
                                    ? (event) => handleTooltipMove(event, countryId)
                                    : undefined
                            }
                            onMouseLeave={variant === "trade" ? () => setTooltip(null) : undefined}
                        />
                    );
                })}
                {variant === "trade" &&
                    tradeFlows.map((flow) => {
                        const { path, pillX, pillY } = computeTradeFlowPoints(project, flow);
                        return (
                            <g key={flow.id}>
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={flow.color}
                                    strokeWidth={flow.width}
                                    strokeOpacity="0.88"
                                    strokeLinecap="round"
                                    markerEnd={`url(#${flow.markerId})`}
                                />
                                {renderMetricPill(pillX, pillY, flow.label, flow.color)}
                            </g>
                        );
                    })}
                {variant === "trade" &&
                    restOfWorldFlows.map((flow) => (
                        <g key={flow.id}>
                            <path
                                d={createLinearPath(project, flow.from, flow.to)}
                                fill="none"
                                stroke={flow.color}
                                strokeWidth={flow.strokeWidth}
                                strokeOpacity="0.88"
                                strokeLinecap="round"
                                markerEnd={`url(#${flow.markerId})`}
                            />
                            {renderRestOfWorldLabel(
                                project,
                                flow.labelCoordinates,
                                flow.topLine,
                                flow.bottomLine,
                                flow.textAnchor
                            )}
                        </g>
                    ))}
                {variant === "trade" &&
                    Object.values(highlightedCountries).map((country) => (
                        <g key={country.id}>{renderCountryLabel(project, country)}</g>
                    ))}
            </svg>
            {variant === "trade" && tooltip ? (
                <Box
                    className="soybean-storyboard-country-tooltip"
                    sx={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`
                    }}
                >
                    <Typography className="soybean-storyboard-country-tooltip-title">
                        {highlightedCountries[tooltip.countryId].label}
                    </Typography>
                    <Box className="soybean-storyboard-country-tooltip-pill-row">
                        <Box className="soybean-storyboard-country-tooltip-pill">
                            {highlightedCountries[tooltip.countryId].tooltipLabel}
                        </Box>
                        <Typography className="soybean-storyboard-country-tooltip-value">
                            {highlightedCountries[tooltip.countryId].tooltipValue}
                        </Typography>
                    </Box>
                    <Typography className="soybean-storyboard-country-tooltip-note">
                        {highlightedCountries[tooltip.countryId].tooltipNote}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
}
