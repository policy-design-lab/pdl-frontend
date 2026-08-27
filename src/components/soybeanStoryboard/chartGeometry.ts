export type ChartPadding = {
    bottom: number;
    left: number;
    right: number;
    top: number;
};

const TOOLTIP_EDGE_INSET = 8;
const TOOLTIP_POINT_GAP = 12;
const TOOLTIP_BELOW_POINT_OFFSET = 16;

export function getPlotWidth(chartWidth: number, padding: ChartPadding): number {
    return chartWidth - padding.left - padding.right;
}

export function getPlotHeight(chartHeight: number, padding: ChartPadding): number {
    return chartHeight - padding.top - padding.bottom;
}

export function getPointX(index: number, pointCount: number, chartWidth: number, padding: ChartPadding): number {
    const pointOffset = (index * getPlotWidth(chartWidth, padding)) / Math.max(1, pointCount - 1);
    return padding.left + pointOffset;
}

export function getPointY(valueRatio: number, chartHeight: number, padding: ChartPadding): number {
    const clampedRatio = Math.min(1, Math.max(0, valueRatio));
    const pointOffset = (1 - clampedRatio) * getPlotHeight(chartHeight, padding);
    return padding.top + pointOffset;
}

export function getTooltipX(pointX: number, tooltipWidth: number, chartWidth: number, padding: ChartPadding): number {
    const halfWidth = tooltipWidth / 2;
    return Math.min(
        chartWidth - padding.right - tooltipWidth,
        Math.max(padding.left + TOOLTIP_EDGE_INSET, pointX - halfWidth)
    );
}

export function getTooltipY(pointY: number, tooltipHeight: number, padding: ChartPadding): number {
    if (pointY - tooltipHeight - TOOLTIP_POINT_GAP < padding.top) {
        return pointY + TOOLTIP_BELOW_POINT_OFFSET;
    }
    return pointY - tooltipHeight - TOOLTIP_POINT_GAP;
}

export function getNiceAxisMax(values: number[]): number {
    const maxValue = Math.max(...values, 0);
    if (maxValue <= 0) {
        return 100;
    }
    const magnitude = 10 ** Math.floor(Math.log10(maxValue));
    const normalizedValue = maxValue / magnitude;
    const niceStep = [1, 1.2, 1.5, 2, 2.5, 5, 10].find((step) => normalizedValue <= step) || 10;
    return niceStep * magnitude;
}

export function getLabelStride(pointCount: number, availableWidth: number, minLabelSpacing: number): number {
    if (pointCount <= 1 || availableWidth <= 0 || minLabelSpacing <= 0) {
        return 1;
    }
    const spacing = availableWidth / (pointCount - 1);
    if (spacing >= minLabelSpacing) {
        return 1;
    }
    return Math.max(1, Math.ceil(minLabelSpacing / spacing));
}

export function isLabelVisible(index: number, pointCount: number, stride: number): boolean {
    if (index === 0 || index === pointCount - 1) {
        return true;
    }
    if (index % stride !== 0) {
        return false;
    }
    return pointCount - 1 - index >= stride;
}
