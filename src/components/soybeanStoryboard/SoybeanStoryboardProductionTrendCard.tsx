import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { curveCatmullRom, line } from "d3";
import {
    calculateGrowthPercentage,
    formatCompactAcres,
    formatSignedPercentage,
    getTrendLabelStride,
    isFiniteNumber,
    isTrendLabelVisible,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL
} from "./soybeanApi";
const TREND_CHART_WIDTH = 740;
const TREND_CHART_HEIGHT = 260;
const TREND_CHART_PADDING = {
    top: 18,
    right: 24,
    bottom: 54,
    left: 52
};
const TREND_TOOLTIP_WIDTH = 216;
const TREND_TOOLTIP_HEIGHT = 62;
const TREND_LABEL_MIN_SPACING = 44;

export type SoybeanProductionTrendPoint = {
    totalAcres: number | null;
    year: string;
};

type SoybeanStoryboardProductionTrendCardProps = {
    buttonLabel: string;
    canStartPlayback: boolean;
    isDetailLoading: boolean;
    isPlaying: boolean;
    label: string;
    onButtonClick: () => void;
    totalPointCount?: number;
    trendPoints: SoybeanProductionTrendPoint[];
};

function getTrendX(index: number, valueCount: number): number {
    const chartWidth = TREND_CHART_WIDTH - TREND_CHART_PADDING.left - TREND_CHART_PADDING.right;
    const pointOffset = (index * chartWidth) / Math.max(1, valueCount - 1);
    return TREND_CHART_PADDING.left + pointOffset;
}

function getNiceAxisMax(values: number[]): number {
    const maxValue = Math.max(...values, 0);
    if (maxValue <= 0) {
        return 100;
    }
    const magnitude = 10 ** Math.floor(Math.log10(maxValue));
    const normalizedValue = maxValue / magnitude;
    const niceStep = [1, 1.2, 1.5, 2, 2.5, 5, 10].find((step) => normalizedValue <= step) || 10;
    return niceStep * magnitude;
}

function getTrendY(value: number, axisMax: number): number {
    const chartHeight = TREND_CHART_HEIGHT - TREND_CHART_PADDING.top - TREND_CHART_PADDING.bottom;
    const valueRatio = Math.min(1, Math.max(0, value / axisMax));
    const pointOffset = (1 - valueRatio) * chartHeight;
    return TREND_CHART_PADDING.top + pointOffset;
}

function getTrendGrowthText(points: SoybeanProductionTrendPoint[]): string {
    const validPoints = points.filter((point) => isFiniteNumber(point.totalAcres));
    if (validPoints.length < 2) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    const growth = calculateGrowthPercentage(validPoints.map((point) => point.totalAcres).filter(isFiniteNumber));
    const yearSpan = Number(validPoints[validPoints.length - 1].year) - Number(validPoints[0].year);
    if (!isFiniteNumber(growth) || Number.isNaN(yearSpan)) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }
    return `${formatSignedPercentage(growth, 2)} over ${yearSpan} years`;
}

function formatTrendAxisTick(value: number): string {
    return value === 0 ? "0" : formatCompactAcres(value, 0);
}

function getTooltipX(pointX: number): number {
    const halfWidth = TREND_TOOLTIP_WIDTH / 2;
    return Math.min(
        TREND_CHART_WIDTH - TREND_CHART_PADDING.right - TREND_TOOLTIP_WIDTH,
        Math.max(TREND_CHART_PADDING.left + 8, pointX - halfWidth)
    );
}

function getTooltipY(pointY: number): number {
    if (pointY - TREND_TOOLTIP_HEIGHT - 12 < TREND_CHART_PADDING.top) {
        return pointY + 16;
    }
    return pointY - TREND_TOOLTIP_HEIGHT - 12;
}

export default function SoybeanStoryboardProductionTrendCard({
    buttonLabel,
    canStartPlayback,
    isDetailLoading,
    isPlaying,
    label,
    onButtonClick,
    totalPointCount,
    trendPoints
}: SoybeanStoryboardProductionTrendCardProps): JSX.Element {
    const [hoveredPointIndex, setHoveredPointIndex] = React.useState<number | null>(null);
    const validTrendValues = React.useMemo(
        () => trendPoints.map((point) => point.totalAcres).filter(isFiniteNumber),
        [trendPoints]
    );
    const axisMax = React.useMemo(() => getNiceAxisMax(validTrendValues), [validTrendValues]);
    const axisTicks = React.useMemo(() => [0, axisMax / 2, axisMax], [axisMax]);
    const labelStride = React.useMemo(
        () =>
            getTrendLabelStride(
                Math.max(totalPointCount || 0, trendPoints.length),
                TREND_CHART_WIDTH - TREND_CHART_PADDING.left - TREND_CHART_PADDING.right,
                TREND_LABEL_MIN_SPACING
            ),
        [totalPointCount, trendPoints.length]
    );
    const trendLine = React.useMemo(
        () =>
            line<SoybeanProductionTrendPoint>()
                .defined((point) => isFiniteNumber(point.totalAcres))
                .x((_, index) => getTrendX(index, trendPoints.length))
                .y((point) => getTrendY(point.totalAcres || 0, axisMax))
                .curve(curveCatmullRom.alpha(0.52))(trendPoints) || "",
        [axisMax, trendPoints]
    );
    const activePoint = trendPoints
        .slice()
        .reverse()
        .find((point) => isFiniteNumber(point.totalAcres));
    const activeValue = activePoint
        ? formatCompactAcres(activePoint.totalAcres, 2)
        : SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    const growthText = getTrendGrowthText(trendPoints);
    const hoveredPoint =
        hoveredPointIndex !== null && isFiniteNumber(trendPoints[hoveredPointIndex]?.totalAcres)
            ? trendPoints[hoveredPointIndex]
            : null;
    const hoveredPointX = hoveredPoint ? getTrendX(hoveredPointIndex || 0, trendPoints.length) : 0;
    const hoveredPointY = hoveredPoint ? getTrendY(hoveredPoint.totalAcres || 0, axisMax) : 0;
    return (
        <Box className="soybean-storyboard-production-card">
            <Box className="soybean-storyboard-production-card-top">
                <Box>
                    <Typography className="soybean-storyboard-production-card-label">{label}</Typography>
                    <Typography className="soybean-storyboard-production-card-value">{activeValue}</Typography>
                </Box>
                <Typography className="soybean-storyboard-production-card-growth">{growthText}</Typography>
            </Box>
            <svg
                viewBox={`0 0 ${TREND_CHART_WIDTH} ${TREND_CHART_HEIGHT}`}
                className="soybean-storyboard-production-trend"
                role="img"
                aria-label={`${label} trend`}
            >
                <line
                    x1={TREND_CHART_PADDING.left}
                    x2={TREND_CHART_PADDING.left}
                    y1={TREND_CHART_PADDING.top}
                    y2={TREND_CHART_HEIGHT - TREND_CHART_PADDING.bottom}
                    stroke="rgba(156, 173, 179, 0.26)"
                    strokeWidth="1.5"
                />
                <line
                    x1={TREND_CHART_PADDING.left}
                    x2={TREND_CHART_WIDTH - TREND_CHART_PADDING.right}
                    y1={TREND_CHART_HEIGHT - TREND_CHART_PADDING.bottom}
                    y2={TREND_CHART_HEIGHT - TREND_CHART_PADDING.bottom}
                    stroke="rgba(156, 173, 179, 0.26)"
                    strokeWidth="1.5"
                />
                {axisTicks.map((tick) => (
                    <text
                        key={tick}
                        x={TREND_CHART_PADDING.left - 10}
                        y={getTrendY(tick, axisMax) + 4}
                        fill="rgba(176, 191, 196, 0.56)"
                        fontSize="14"
                        textAnchor="end"
                    >
                        {formatTrendAxisTick(tick)}
                    </text>
                ))}
                {trendPoints.map((point, index) =>
                    isTrendLabelVisible(index, trendPoints.length, labelStride) ? (
                        <text
                            key={`${point.year}-${index}`}
                            x={getTrendX(index, trendPoints.length)}
                            y={TREND_CHART_HEIGHT - 16}
                            fill="rgba(176, 191, 196, 0.56)"
                            fontSize="13"
                            textAnchor={index === trendPoints.length - 1 ? "end" : "middle"}
                        >
                            {point.year}
                        </text>
                    ) : null
                )}
                {trendLine ? (
                    <path
                        d={trendLine}
                        fill="none"
                        stroke="rgba(228, 232, 233, 0.72)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : null}
                {trendPoints.map((point, index) => {
                    if (!isFiniteNumber(point.totalAcres)) {
                        return null;
                    }
                    const pointX = getTrendX(index, trendPoints.length);
                    const pointY = getTrendY(point.totalAcres, axisMax);
                    const isLatest = point.year === activePoint?.year;
                    return (
                        <g key={`${point.year}-${point.totalAcres}`}>
                            <circle
                                cx={pointX}
                                cy={pointY}
                                r={isLatest ? 12 : 5}
                                fill="rgba(255, 255, 255, 0.9)"
                                opacity={isLatest ? 1 : 0.82}
                            />
                            <circle
                                cx={pointX}
                                cy={pointY}
                                r="15"
                                fill="transparent"
                                pointerEvents="all"
                                onMouseEnter={() => setHoveredPointIndex(index)}
                                onMouseLeave={() => setHoveredPointIndex(null)}
                            />
                        </g>
                    );
                })}
                {hoveredPoint ? (
                    <g
                        transform={`translate(${getTooltipX(hoveredPointX)} ${getTooltipY(hoveredPointY)})`}
                        pointerEvents="none"
                    >
                        <rect
                            width={TREND_TOOLTIP_WIDTH}
                            height={TREND_TOOLTIP_HEIGHT}
                            rx="8"
                            fill="rgba(7, 22, 28, 0.96)"
                            stroke="rgba(255, 255, 255, 0.14)"
                        />
                        <text
                            x={TREND_TOOLTIP_WIDTH / 2}
                            y={27}
                            fill="#ffffff"
                            fontSize="16"
                            fontWeight="700"
                            textAnchor="middle"
                        >
                            {hoveredPoint.year}
                        </text>
                        <text
                            x={TREND_TOOLTIP_WIDTH / 2}
                            y={48}
                            fill="rgba(216, 223, 226, 0.9)"
                            fontSize="20"
                            textAnchor="middle"
                        >
                            {formatCompactAcres(hoveredPoint.totalAcres, 2)}
                        </text>
                    </g>
                ) : null}
            </svg>
            {canStartPlayback ? (
                <Button
                    startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    className="soybean-storyboard-production-button"
                    disabled={isDetailLoading}
                    disableElevation
                    disableRipple
                    onClick={onButtonClick}
                >
                    {buttonLabel}
                </Button>
            ) : null}
        </Box>
    );
}
