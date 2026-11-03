import * as d3 from "d3";

export const MIN_COUNTIES_FOR_QUANTILES = 5;

export type CountyScaleMode = "quantile" | "sparse" | "empty";

export interface CountyColorScale {
    mode: CountyScaleMode;
    colorScale: d3.ScaleThreshold<number, string>;
    highlightColor: string;
}

export interface SparseCountyEntry {
    fips: string;
    label: string;
    value: number;
}

const interpolatePercentile = (sorted: number[], pct: number): number => {
    const idx = (pct / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] * (1 - (idx - lo)) + sorted[hi] * (idx - lo);
};

const alignThresholdsToZero = (thresholds: number[], values: number[]): number[] => {
    const hasNeg = values.some((v) => v < 0);
    const hasPos = values.some((v) => v > 0);
    if (!hasNeg || !hasPos || thresholds.includes(0)) {
        return thresholds;
    }
    const aligned = [...thresholds];
    const negThresholds = aligned.filter((v) => v < 0);
    const posThresholds = aligned.filter((v) => v > 0);
    if (negThresholds.length > 0 && posThresholds.length > 0) {
        const closestNegIdx = aligned.indexOf(Math.max(...negThresholds));
        const closestPosIdx = aligned.indexOf(Math.min(...posThresholds));
        if (Math.abs(aligned[closestNegIdx]) <= Math.abs(aligned[closestPosIdx])) {
            aligned[closestNegIdx] = 0;
        } else {
            aligned[closestPosIdx] = 0;
        }
    } else if (negThresholds.length > 0) {
        aligned[aligned.indexOf(Math.max(...negThresholds))] = 0;
    } else {
        aligned[aligned.indexOf(Math.min(...posThresholds))] = 0;
    }
    return aligned;
};

export const getCountyScaleMode = (values: number[]): CountyScaleMode => {
    const nonZeroCount = values.filter((v) => v !== 0).length;
    if (nonZeroCount === 0) return "empty";
    if (nonZeroCount < MIN_COUNTIES_FOR_QUANTILES) return "sparse";
    return "quantile";
};

export const buildCountyColorScale = (
    values: number[],
    percentiles: number[],
    colors: readonly string[]
): CountyColorScale => {
    const mode = getCountyScaleMode(values);
    const highlightColor = colors[colors.length - 1];
    if (mode !== "quantile") {
        return { mode, colorScale: d3.scaleThreshold<number, string>([], [highlightColor]), highlightColor };
    }
    const sorted = values.filter((v) => v !== 0).sort((a, b) => a - b);
    const thresholds = alignThresholdsToZero(
        percentiles.map((pct) => interpolatePercentile(sorted, pct)),
        values
    );
    return { mode, colorScale: d3.scaleThreshold<number, string>(thresholds, [...colors]), highlightColor };
};

export const getSparseCountyEntries = (
    countyValueMap: Record<string, number>,
    countyDataMap: Record<string, any>,
    stateCodes: Record<string, string>
): SparseCountyEntry[] =>
    Object.entries(countyValueMap)
        .filter(([, value]) => value !== 0)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .map(([fips, value]) => {
            const record = countyDataMap[fips] ?? {};
            const stateName = stateCodes[record.state] || record.state;
            const label = [record.countyName, stateName].filter(Boolean).join(", ") || fips;
            return { fips, label, value };
        });
