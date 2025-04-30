import * as d3 from "d3";
export type DistributionType = "leftSkewed" | "rightSkewed" | "normal";
export const calculateDistributionThresholds = (dataValues: number[], distributionType: DistributionType): number[] => {
    const validValues = dataValues.filter(
        (v) => v !== undefined && v !== null && !Number.isNaN(v) && v !== 0 && Number.isFinite(v)
    );
    if (validValues.length === 0) {
        return [];
    }
    const sortedData = [...validValues].sort((a, b) => a - b);
    const dataLength = sortedData.length;
    switch (distributionType) {
        case "leftSkewed":
            return calculateLeftSkewedThresholds(sortedData, dataLength);
        case "rightSkewed":
            return calculateRightSkewedThresholds(sortedData, dataLength);
        case "normal":
            return calculateNormalThresholds(sortedData, dataLength);
        default:
            return calculateLeftSkewedThresholds(sortedData, dataLength);
    }
};
const calculateLeftSkewedThresholds = (sortedData: number[], dataLength: number): number[] => {
    const percentiles = [0, 15, 30, 45, 60, 75, 80, 85, 90, 95, 100];
    return getPercentilesFromSortedData(sortedData, dataLength, percentiles);
};
const calculateRightSkewedThresholds = (sortedData: number[], dataLength: number): number[] => {
    const percentiles = [0, 5, 10, 15, 20, 25, 40, 55, 70, 85, 100];
    const thresholds = getPercentilesFromSortedData(sortedData, dataLength, percentiles);
    if (thresholds.length > 0 && sortedData.length > 0) {
        thresholds[thresholds.length - 1] = sortedData[dataLength - 1];
    }
    return thresholds;
};
const calculateNormalThresholds = (sortedData: number[], dataLength: number): number[] => {
    const percentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    return getPercentilesFromSortedData(sortedData, dataLength, percentiles);
};
const getPercentilesFromSortedData = (sortedData: number[], dataLength: number, percentiles: number[]): number[] => {
    const thresholds: number[] = [];
    percentiles.forEach((percentile) => {
        if (percentile === 0) {
            thresholds.push(sortedData[0]);
        } else if (percentile === 100) {
            thresholds.push(sortedData[dataLength - 1]);
        } else {
            const index = Math.floor(dataLength * (percentile / 100));
            thresholds.push(sortedData[Math.min(index, dataLength - 1)]);
        }
    });
    return Array.from(new Set(thresholds)).sort((a, b) => a - b);
};
export const generateDistributionPoints = (distributionType: DistributionType): [number, number][] => {
    const points: [number, number][] = [];
    const numPoints = 50;
    switch (distributionType) {
        case "leftSkewed":
            for (let i = 0; i < numPoints; i++) {
                const x = i / (numPoints - 1);
                const y = 0.8 * Math.exp(-4 * x) + 0.2 * Math.exp(-x);
                points.push([x, y]);
            }
            break;
        case "rightSkewed":
            for (let i = 0; i < numPoints; i++) {
                const x = i / (numPoints - 1);
                const y = 0.2 * Math.exp(-(1 - x) * 4) + 0.8 * Math.exp(-(1 - x));
                points.push([x, y]);
            }
            break;
        case "normal":
            for (let i = 0; i < numPoints; i++) {
                const x = i / (numPoints - 1);
                const y = Math.exp(-Math.pow((x - 0.5) * 3, 2));
                points.push([x, y]);
            }
            break;
        default:
            return generateDistributionPoints("leftSkewed");
    }
    return points;
};
export const detectDistributionType = (dataValues: number[]): DistributionType => {
    const validValues = dataValues.filter(
        (v) => v !== undefined && v !== null && !Number.isNaN(v) && v !== 0 && Number.isFinite(v)
    );
    if (validValues.length === 0) {
        return "leftSkewed";
    }
    const mean = d3.mean(validValues) || 0;
    const stdDev = d3.deviation(validValues) || 1;
    let skewness = 0;
    validValues.forEach((value) => {
        skewness += Math.pow((value - mean) / stdDev, 3);
    });
    skewness = skewness / validValues.length;
    if (skewness > 0.5) {
        return "rightSkewed";
    } else if (skewness < -0.5) {
        return "leftSkewed";
    } else {
        return "normal";
    }
};
