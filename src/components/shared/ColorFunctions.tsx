export const CheckAddZero = (thresholds: number[]): number[] => {
    if (thresholds.some((d) => d < 0) && thresholds.some((d) => d > 0)) {
        if (!thresholds.includes(0)) {
            const negativeLength = thresholds.filter((d) => d < 0).length;
            const positiveLength = thresholds.filter((d) => d > 0).length;
            if (negativeLength > positiveLength) {
                thresholds[thresholds.indexOf(Math.max(...thresholds.filter((x) => x < 0)))] = 0;
            } else {
                thresholds[thresholds.indexOf(Math.min(...thresholds.filter((x) => x > 0)))] = 0;
            }
        }
    }
    return thresholds.slice(1, thresholds.length - 2);
};

const formatNumber = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(0);
};

const wouldLabelsOverlap = (values: number[]): boolean => {
    const formatted = values.map(formatNumber);
    const uniqueFormatted = new Set(formatted);
    if (uniqueFormatted.size < formatted.length) {
        return true;
    }
    for (let i = 1; i < values.length; i += 1) {
        const ratio = values[i] / Math.max(0.001, values[i - 1]);
        if (ratio < 1.25) {
            return true;
        }
    }
    return false;
};

const defaultPercentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const calculateThresholds = (dataValues: number[], customPercentiles?: number[]): number[] => {
    const validValues = dataValues.filter(
        (v) => v !== undefined && v !== null && !Number.isNaN(v) && v !== 0 && Number.isFinite(v)
    );
    if (validValues.length === 0) {
        return [];
    }
    const sortedData = [...validValues].sort((a, b) => a - b);
    const dataLength = sortedData.length;
    const initialThresholds: number[] = [];
    initialThresholds.push(sortedData[0]);
    if (dataLength < 30) {
        const min = sortedData[0];
        const max = sortedData[dataLength - 1];
        const step = (max - min) / 9;
        for (let i = 1; i < 9; i += 1) {
            initialThresholds.push(min + step * i);
        }
        initialThresholds.push(max);
    } else {
        const percentiles = customPercentiles || defaultPercentiles;
        const filteredPercentiles = percentiles.filter((p) => p > 0 && p < 100);
        filteredPercentiles.forEach((percentile) => {
            const index = Math.floor(dataLength * (percentile / 100));
            initialThresholds.push(sortedData[Math.min(index, dataLength - 1)]);
        });
        initialThresholds.push(sortedData[dataLength - 1]);
    }
    const uniqueThresholds = Array.from(new Set(initialThresholds)).sort((a, b) => a - b);
    return uniqueThresholds;
};
