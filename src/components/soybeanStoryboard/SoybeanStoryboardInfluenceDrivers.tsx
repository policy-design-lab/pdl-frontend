import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { curveCatmullRom, line } from "d3";
import { formatNumericValue, ShortFormat } from "../shared/ConvertionFormats";
import {
    calculateGrowthPercentage,
    ChinaCommodityDemandRecord,
    ChinaSocioeconomicRecord,
    createNormalizedTrendValues,
    formatPercentage,
    formatThousandMetricTonsAsMmt,
    getPreferredYear,
    getRecentYears,
    isFiniteNumber,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SoybeanYearRecord
} from "./soybeanApi";

const CHART_WIDTH = 1480;
const CHART_HEIGHT = 206;
const Y_MIN = 0;
const Y_MAX = 125;
const AXIS_VALUES = [0, 25, 50, 75, 100, 125];
const CHART_PADDING = {
    top: 12,
    right: 256,
    bottom: 18,
    left: 92
};
const DRIVER_TOOLTIP_PADDING_X = 14;
const DRIVER_TOOLTIP_MIN_WIDTH = 128;
const DRIVER_TOOLTIP_MAX_WIDTH = 320;
const DRIVER_TOOLTIP_LINE_HEIGHT = 23;
const DRIVER_TOOLTIP_VERTICAL_PADDING = 14;

type TrendSeries = {
    id: string;
    color: string;
    endLabel: string;
    pillTone: "light" | "pork" | "poultry";
    points?: TrendSeriesPoint[];
    tooltipLabel?: string;
    values: number[];
};

type TrendSeriesPoint = {
    value: number;
    valueLabel: string;
    year: string;
};

type TrendAxisTick = {
    label: string;
    value: number;
};

type TrendChartDefinition = {
    id: string;
    title: string;
    annotation: string;
    annotationClassName?: string;
    axisTicks?: TrendAxisTick[];
    showProteinPills?: boolean;
    series: TrendSeries[];
};

type SoybeanStoryboardInfluenceDriversProps = {
    commodities: SoybeanYearRecord<ChinaCommodityDemandRecord>;
    socioeconomic: SoybeanYearRecord<ChinaSocioeconomicRecord>;
};
const fallbackInfluenceCharts: TrendChartDefinition[] = [
    {
        id: "population-growth",
        title: "Population Growth",
        annotation: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        series: [
            {
                id: "population",
                color: "#A8CCE2",
                endLabel: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
                pillTone: "light",
                values: [16, 18, 19, 49, 28, 40, 47, 62, 62, 78, 80, 87, 61, 88, 106, 86, 91, 115, 101, 113]
            }
        ]
    },
    {
        id: "income-growth",
        title: "Income Growth",
        annotation: "People Get Richer",
        series: [
            {
                id: "income",
                color: "#A8CCE2",
                endLabel: "GDP Per Capita",
                pillTone: "light",
                values: [15, 11, 23, 31, 49, 55, 35, 44, 54, 68, 86, 71, 84, 76, 77, 93, 79, 118, 118, 118]
            }
        ]
    },
    {
        id: "protein-demand",
        title: "Demand for Pork and Poultry",
        annotation: "China Has A Big Preference For Pork And Poultry",
        annotationClassName: "soybean-storyboard-driver-annotation soybean-storyboard-driver-annotation-tight",
        showProteinPills: true,
        series: [
            {
                id: "pork",
                color: "#E3E1A6",
                endLabel: "Pork Amount",
                pillTone: "pork",
                values: [16, 18, 20, 49, 29, 40, 47, 62, 62, 79, 82, 88, 66, 104, 88, 92, 115, 103, 101, 111]
            },
            {
                id: "poultry",
                color: "#E3A6DD",
                endLabel: "Poultry Amount",
                pillTone: "poultry",
                values: [5, 1, 12, 20, 38, 46, 25, 34, 45, 58, 76, 61, 63, 65, 81, 69, 105, 105, 106, 93]
            }
        ]
    },
    {
        id: "urbanization-growth",
        title: "Urbanization Growth",
        annotation: "More Urban Countries Also Increase Food Demand",
        annotationClassName: "soybean-storyboard-driver-annotation soybean-storyboard-driver-annotation-wide",
        series: [
            {
                id: "urbanization",
                color: "#A8CCE2",
                endLabel: "Urbanization Metric",
                pillTone: "light",
                values: [12, 29, 12, 16, 44, 58, 45, 61, 41, 76, 90, 89, 58, 81, 98, 113, 92, 99, 118, 121]
            }
        ]
    }
];
const fallbackAxisTicks = AXIS_VALUES.map((value) => ({
    label: `${value}`,
    value
}));

function getRoundedPercentage(value: number | null): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatNumericValue(value, Math.abs(value) < 10 ? 1 : 0)}%`;
}

function getRecordValuePoints<T>(
    records: SoybeanYearRecord<T>,
    years: string[],
    selector: (record: T) => number | null | undefined
): { value: number; year: string }[] {
    return years
        .map((year) => ({
            value: selector(records[year]),
            year
        }))
        .filter((point): point is { value: number; year: string } => isFiniteNumber(point.value));
}

function getUrbanizationShare(record: ChinaSocioeconomicRecord): number | null {
    if (!isFiniteNumber(record.urban_population) || !isFiniteNumber(record.total_population)) {
        return null;
    }
    return (record.urban_population / record.total_population) * 100;
}

function getLatestValue(values: number[]): number | null {
    return values.length > 0 ? values[values.length - 1] : null;
}

function formatPopulationAxis(value: number): string {
    return ShortFormat(value, undefined, 2);
}

function formatPopulationTooltip(value: number): string {
    return ShortFormat(value, undefined, 3);
}

function formatCurrencyAxis(value: number): string {
    if (Math.abs(value) >= 1000) {
        return `$${ShortFormat(value, undefined, 1)}`;
    }
    return `$${formatNumericValue(value, 0)}`;
}

function formatMmtAxis(value: number): string {
    return `${formatNumericValue(value / 1000, 1)} MMT`;
}

function formatPercentageAxis(value: number): string {
    return `${formatNumericValue(value, 1)}%`;
}

function formatPopulationLabel(value: number | null): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatPopulationAxis(value)} People`;
}

function formatCurrencyLabel(value: number | null): string {
    if (!isFiniteNumber(value)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatCurrencyAxis(value)} GDP Per Capita`;
}

function createAxisTicks(
    values: number[],
    formatter: (value: number) => string,
    floor = 8,
    ceiling = 118,
    domainValues = values,
    tickCount = 5
): TrendAxisTick[] {
    const validValues = domainValues.filter(isFiniteNumber);
    if (validValues.length === 0) {
        return fallbackAxisTicks;
    }
    const minValue = Math.min(...validValues);
    const maxValue = Math.max(...validValues);
    if (maxValue === minValue) {
        return [
            {
                label: formatter(maxValue),
                value: (floor + ceiling) / 2
            }
        ];
    }
    const rawRange = maxValue - minValue;
    const normalizedRange = ceiling - floor;
    return Array.from({ length: tickCount }, (_, index) => {
        const ratio = index / (tickCount - 1);
        const rawDelta = ratio * rawRange;
        const normalizedDelta = ratio * normalizedRange;
        const rawValue = minValue + rawDelta;
        const normalizedValue = floor + normalizedDelta;
        return {
            label: formatter(rawValue),
            value: normalizedValue
        };
    });
}

function createChartFromPoints(
    fallbackChart: TrendChartDefinition,
    points: { value: number; year: string }[],
    seriesOptions: Omit<TrendSeries, "points" | "values">,
    axisTicks: TrendAxisTick[],
    formatter: (value: number) => string
): TrendChartDefinition {
    if (points.length < 2) {
        return fallbackChart;
    }
    return {
        ...fallbackChart,
        axisTicks,
        series: [
            {
                ...seriesOptions,
                points: points.map((point) => ({
                    value: point.value,
                    valueLabel: formatter(point.value),
                    year: point.year
                })),
                values: createNormalizedTrendValues(points.map((point) => point.value))
            }
        ]
    };
}

function buildInfluenceCharts(
    socioeconomic: SoybeanYearRecord<ChinaSocioeconomicRecord>,
    commodities: SoybeanYearRecord<ChinaCommodityDemandRecord>
): TrendChartDefinition[] {
    const socioeconomicYear = getPreferredYear(socioeconomic);
    const commodityYear = getPreferredYear(commodities, socioeconomicYear);
    const socioeconomicYears = getRecentYears(socioeconomic, socioeconomicYear, 20);
    const commodityYears = getRecentYears(commodities, commodityYear, 20);
    const populationPoints = getRecordValuePoints(
        socioeconomic,
        socioeconomicYears,
        (record) => record.total_population
    );
    const gdpPoints = getRecordValuePoints(socioeconomic, socioeconomicYears, (record) => record.gdp_per_capita);
    const urbanizationPoints = getRecordValuePoints(socioeconomic, socioeconomicYears, getUrbanizationShare);
    const porkPoints = getRecordValuePoints(commodities, commodityYears, (record) => record.pork_demand);
    const poultryPoints = getRecordValuePoints(commodities, commodityYears, (record) => record.poultry_demand);
    const populationValues = populationPoints.map((point) => point.value);
    const gdpValues = gdpPoints.map((point) => point.value);
    const urbanizationValues = urbanizationPoints.map((point) => point.value);
    const porkValues = porkPoints.map((point) => point.value);
    const poultryValues = poultryPoints.map((point) => point.value);
    const proteinValues = [...porkValues, ...poultryValues];
    const populationGrowth = calculateGrowthPercentage(populationValues);
    const gdpGrowth = calculateGrowthPercentage(gdpValues);
    const latestUrbanization = getLatestValue(urbanizationValues);
    const latestPork = getLatestValue(porkValues);
    const latestPoultry = getLatestValue(poultryValues);
    const charts = [...fallbackInfluenceCharts];
    charts[0] = {
        ...createChartFromPoints(
            charts[0],
            populationPoints,
            {
                color: "#A8CCE2",
                endLabel: formatPopulationLabel(getLatestValue(populationValues)),
                id: "population",
                pillTone: "light",
                tooltipLabel: "Population"
            },
            createAxisTicks(populationValues, formatPopulationAxis),
            formatPopulationTooltip
        ),
        annotation: `China's Population Grew By Roughly ${getRoundedPercentage(populationGrowth)}`
    };
    charts[1] = {
        ...createChartFromPoints(
            charts[1],
            gdpPoints,
            {
                color: "#A8CCE2",
                endLabel: formatCurrencyLabel(getLatestValue(gdpValues)),
                id: "income",
                pillTone: "light",
                tooltipLabel: "GDP per capita"
            },
            createAxisTicks(gdpValues, formatCurrencyAxis),
            formatCurrencyAxis
        ),
        annotation: `GDP Per Capita Rose ${getRoundedPercentage(gdpGrowth)}`
    };
    if (porkValues.length > 1 && poultryValues.length > 1 && proteinValues.length > 1) {
        charts[2] = {
            ...charts[2],
            axisTicks: createAxisTicks(proteinValues, formatMmtAxis, 8, 118, proteinValues),
            series: [
                {
                    color: "#E3E1A6",
                    endLabel: formatThousandMetricTonsAsMmt(latestPork, "Pork"),
                    id: "pork",
                    points: porkPoints.map((point) => ({
                        value: point.value,
                        valueLabel: formatMmtAxis(point.value),
                        year: point.year
                    })),
                    pillTone: "pork",
                    tooltipLabel: "Pork demand",
                    values: createNormalizedTrendValues(porkValues, 8, 118, proteinValues)
                },
                {
                    color: "#E3A6DD",
                    endLabel: formatThousandMetricTonsAsMmt(latestPoultry, "Poultry"),
                    id: "poultry",
                    points: poultryPoints.map((point) => ({
                        value: point.value,
                        valueLabel: formatMmtAxis(point.value),
                        year: point.year
                    })),
                    pillTone: "poultry",
                    tooltipLabel: "Poultry demand",
                    values: createNormalizedTrendValues(poultryValues, 8, 118, proteinValues)
                }
            ]
        };
    }

    charts[3] = {
        ...createChartFromPoints(
            charts[3],
            urbanizationPoints,
            {
                color: "#A8CCE2",
                endLabel: `${formatPercentage(latestUrbanization, 1)} Urban`,
                id: "urbanization",
                pillTone: "light",
                tooltipLabel: "Urban share"
            },
            createAxisTicks(urbanizationValues, formatPercentageAxis),
            (value) => formatPercentage(value, 1)
        ),
        annotation: `Urban Share Reached ${formatPercentage(latestUrbanization, 1)}`
    };
    return charts;
}

function getChartPointX(index: number, pointCount: number): number {
    if (pointCount <= 1) {
        return CHART_PADDING.left;
    }
    const chartWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const pointOffset = (index * chartWidth) / (pointCount - 1);
    return CHART_PADDING.left + pointOffset;
}

function getChartPointY(value: number): number {
    const chartHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const safeValue = Math.max(Y_MIN, Math.min(Y_MAX, value));
    const valueRatio = (Y_MAX - safeValue) / (Y_MAX - Y_MIN);
    const pointOffset = valueRatio * chartHeight;
    return CHART_PADDING.top + pointOffset;
}

function getDriverTooltipTextWidth(text: string, charWidth: number): number {
    return text.length * charWidth;
}

function getDriverTooltipSize(yearLabel: string, valueLabel: string): { height: number; width: number } {
    const textWidth = Math.max(getDriverTooltipTextWidth(yearLabel, 8.4), getDriverTooltipTextWidth(valueLabel, 10.5));
    const verticalPadding = DRIVER_TOOLTIP_VERTICAL_PADDING * 2;
    const contentHeight = DRIVER_TOOLTIP_LINE_HEIGHT * 2;
    const horizontalPadding = DRIVER_TOOLTIP_PADDING_X * 2;
    return {
        height: verticalPadding + contentHeight,
        width: Math.min(DRIVER_TOOLTIP_MAX_WIDTH, Math.max(DRIVER_TOOLTIP_MIN_WIDTH, textWidth + horizontalPadding))
    };
}

function getDriverTooltipX(pointX: number, tooltipWidth: number): number {
    const halfWidth = tooltipWidth / 2;
    return Math.min(
        CHART_WIDTH - CHART_PADDING.right - tooltipWidth,
        Math.max(CHART_PADDING.left + 8, pointX - halfWidth)
    );
}

function getDriverTooltipY(pointY: number, tooltipHeight: number): number {
    if (pointY - tooltipHeight - 12 < CHART_PADDING.top) {
        return pointY + 16;
    }
    return pointY - tooltipHeight - 12;
}

function getSeriesPoint(series: TrendSeries, index: number): TrendSeriesPoint | null {
    const point = series.points?.[index];
    if (point) {
        return point;
    }
    const value = series.values[index];
    if (!isFiniteNumber(value)) {
        return null;
    }
    return {
        value,
        valueLabel: formatNumericValue(value, 0),
        year: `${index + 1}`
    };
}

function getPillWidth(text: string): number {
    const textWidth = text.length * 9;
    return textWidth + 28;
}

function DriverTitle({ chart }: { chart: TrendChartDefinition }): JSX.Element {
    if (!chart.showProteinPills) {
        return <Typography className="soybean-storyboard-driver-title">{chart.title}</Typography>;
    }
    return (
        <Box className="soybean-storyboard-driver-title-row">
            <Typography className="soybean-storyboard-driver-title">Demand for</Typography>
            <Box className="soybean-storyboard-driver-title-pill soybean-storyboard-driver-title-pill-pork">Pork</Box>
            <Typography className="soybean-storyboard-driver-title">and</Typography>
            <Box className="soybean-storyboard-driver-title-pill soybean-storyboard-driver-title-pill-poultry">
                Poultry
            </Box>
            {/* More info is in design but no data for this */}
            {/* <Typography className="soybean-storyboard-driver-more-info">More info -&gt;</Typography> */}
        </Box>
    );
}

function renderEndpointPill(x: number, y: number, series: TrendSeries): JSX.Element {
    const width = getPillWidth(series.endLabel);
    const className = `soybean-storyboard-driver-pill soybean-storyboard-driver-pill-${series.pillTone}`;
    const textClassName = `soybean-storyboard-driver-pill-text soybean-storyboard-driver-pill-text-${series.pillTone}`;
    return (
        <g transform={`translate(${x + 26} ${y - 18})`}>
            <foreignObject width={width} height="38">
                <Box className={className}>
                    <Typography component="span" className={textClassName}>
                        {series.endLabel}
                    </Typography>
                </Box>
            </foreignObject>
        </g>
    );
}

function renderSeries(
    series: TrendSeries,
    pointCount: number,
    onPointEnter: (seriesId: string, index: number) => void,
    onPointLeave: () => void
): JSX.Element {
    const generator = line<number>()
        .x((_, index) => getChartPointX(index, pointCount))
        .y((value) => getChartPointY(value))
        .curve(curveCatmullRom.alpha(0.55));
    const lastIndex = series.values.length - 1;
    const lastX = getChartPointX(lastIndex, pointCount);
    const lastY = getChartPointY(series.values[lastIndex]);
    const endpointDotClassName = `soybean-storyboard-driver-endpoint soybean-storyboard-driver-endpoint-${series.pillTone}`;
    return (
        <g key={series.id}>
            <path
                d={generator(series.values) || ""}
                fill="none"
                stroke={series.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
            {series.values.map((value, index) => (
                <g key={`${series.id}-${index}`}>
                    <circle
                        cx={getChartPointX(index, pointCount)}
                        cy={getChartPointY(value)}
                        r={index === lastIndex ? 0 : 4.5}
                        fill={series.color}
                    />
                    <circle
                        cx={getChartPointX(index, pointCount)}
                        cy={getChartPointY(value)}
                        r="15"
                        fill="transparent"
                        pointerEvents="all"
                        onMouseEnter={() => onPointEnter(series.id, index)}
                        onMouseLeave={onPointLeave}
                    />
                </g>
            ))}
            <line
                x1={lastX}
                x2={lastX}
                y1={CHART_PADDING.top}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                stroke="rgba(255, 255, 255, 0.92)"
                strokeWidth="2"
                strokeDasharray="18 14"
            />
            <circle
                cx={lastX}
                cy={lastY}
                r="16"
                fill="transparent"
                pointerEvents="all"
                onMouseEnter={() => onPointEnter(series.id, lastIndex)}
                onMouseLeave={onPointLeave}
            />
            <circle cx={lastX} cy={lastY} r="10" className={endpointDotClassName} pointerEvents="none" />
            {renderEndpointPill(lastX, lastY, series)}
        </g>
    );
}

function TrendChart({ chart }: { chart: TrendChartDefinition }): JSX.Element {
    const [hoveredPoint, setHoveredPoint] = React.useState<{ index: number; seriesId: string } | null>(null);
    const pointCount = chart.series[0].values.length;
    const axisTicks = chart.axisTicks || fallbackAxisTicks;
    const hoveredSeries = hoveredPoint
        ? chart.series.find((series) => series.id === hoveredPoint.seriesId) || null
        : null;
    const hoveredSeriesPoint = hoveredSeries && hoveredPoint ? getSeriesPoint(hoveredSeries, hoveredPoint.index) : null;
    const hoveredTooltipValue =
        hoveredSeries && hoveredSeriesPoint
            ? `${hoveredSeries.tooltipLabel ? `${hoveredSeries.tooltipLabel}: ` : ""}${hoveredSeriesPoint.valueLabel}`
            : "";
    const hoveredTooltipSize = hoveredSeriesPoint
        ? getDriverTooltipSize(hoveredSeriesPoint.year, hoveredTooltipValue)
        : { height: 0, width: 0 };
    const hoveredPointX = hoveredPoint ? getChartPointX(hoveredPoint.index, pointCount) : 0;
    const hoveredPointY =
        hoveredSeries && hoveredPoint ? getChartPointY(hoveredSeries.values[hoveredPoint.index] || 0) : 0;
    return (
        <Box className="soybean-storyboard-driver-chart">
            <Box className="soybean-storyboard-driver-chart-header">
                <DriverTitle chart={chart} />
                <Typography className={chart.annotationClassName || "soybean-storyboard-driver-annotation"}>
                    {chart.annotation}
                </Typography>
            </Box>
            <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="soybean-storyboard-driver-chart-svg"
                role="img"
                aria-label={chart.title}
            >
                {axisTicks.map((tick) => {
                    const y = getChartPointY(tick.value);
                    return (
                        <g key={`${chart.id}-axis-${tick.value}-${tick.label}`}>
                            <line
                                x1={CHART_PADDING.left}
                                x2={CHART_WIDTH - CHART_PADDING.right}
                                y1={y}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="1"
                            />
                            <text
                                x={16}
                                y={y + 5}
                                fill="rgba(197, 214, 222, 0.72)"
                                fontFamily="Roboto"
                                fontSize="16"
                                fontWeight="400"
                            >
                                {tick.label}
                            </text>
                        </g>
                    );
                })}
                {Array.from({ length: pointCount }, (_, index) => {
                    const x = getChartPointX(index, pointCount);
                    return (
                        <line
                            key={`${chart.id}-grid-${index}`}
                            x1={x}
                            x2={x}
                            y1={CHART_PADDING.top}
                            y2={CHART_HEIGHT - CHART_PADDING.bottom}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth="1"
                        />
                    );
                })}
                {chart.series.map((series) =>
                    renderSeries(
                        series,
                        pointCount,
                        (seriesId, index) => setHoveredPoint({ seriesId, index }),
                        () => setHoveredPoint(null)
                    )
                )}
                {hoveredSeries && hoveredSeriesPoint ? (
                    <g
                        transform={`translate(${getDriverTooltipX(
                            hoveredPointX,
                            hoveredTooltipSize.width
                        )} ${getDriverTooltipY(hoveredPointY, hoveredTooltipSize.height)})`}
                        pointerEvents="none"
                    >
                        <rect
                            width={hoveredTooltipSize.width}
                            height={hoveredTooltipSize.height}
                            rx="8"
                            fill="rgba(7, 22, 28, 0.96)"
                            stroke="rgba(255, 255, 255, 0.14)"
                        />
                        <text
                            x={hoveredTooltipSize.width / 2}
                            y={33}
                            fill="#ffffff"
                            fontFamily="Roboto"
                            fontSize="16"
                            fontWeight="700"
                            textAnchor="middle"
                        >
                            {hoveredSeriesPoint.year}
                        </text>
                        <text
                            x={hoveredTooltipSize.width / 2}
                            y={54}
                            fill="rgba(216, 223, 226, 0.92)"
                            fontFamily="Roboto"
                            fontSize="20"
                            textAnchor="middle"
                        >
                            {hoveredTooltipValue}
                        </text>
                    </g>
                ) : null}
            </svg>
        </Box>
    );
}

export default function SoybeanStoryboardInfluenceDrivers({
    commodities,
    socioeconomic
}: SoybeanStoryboardInfluenceDriversProps): JSX.Element {
    const influenceCharts = React.useMemo(
        () => buildInfluenceCharts(socioeconomic, commodities),
        [commodities, socioeconomic]
    );
    return (
        <Box className="soybean-storyboard-driver-shell">
            <Typography className="soybean-storyboard-subheader soybean-storyboard-driver-section-title">
                Why is Mainland China Influential on Soybean Market?
            </Typography>
            <Box className="soybean-storyboard-driver-chart-stack">
                {influenceCharts.map((chart) => (
                    <TrendChart key={chart.id} chart={chart} />
                ))}
            </Box>
        </Box>
    );
}
