/**
 * For thresholds with possible negative number, get length of negative numbers and positive numbers, then replace the largest number with 0 for negative side or replace the smallest number with 0 for positive side, depending on which side has more numbers
 * @param thresholds
 * @returns
 */
export const CheckAddZero = (thresholds: number[]): number[] => {
    if (thresholds.some((d) => d < 0) && thresholds.some((d) => d > 0)) {
        if (!thresholds.includes(0)) {
            // get length of negative numbers and positive numbers
            const negativeLength = thresholds.filter((d) => d < 0).length;
            const positiveLength = thresholds.filter((d) => d > 0).length;
            // for the larger side, replace the largest number with 0 for negative side or replace the smallest number with 0 for positive side
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

const identifyLargeGaps = (sortedData: number[], maxGapRatio = 3): number[] => {
    type Gap = { start: number; end: number; ratio: number };
    const gaps: Gap[] = [];
    for (let i = 1; i < sortedData.length; i += 1) {
        const curr = sortedData[i];
        const prev = sortedData[i - 1];
        if (prev < 0.001) {
            continue;
        }
        const ratio = curr / prev;
        if (ratio > maxGapRatio) {
            gaps.push({
                start: prev,
                end: curr,
                ratio
            });
        }
    }
    gaps.sort((a, b) => b.ratio - a.ratio);
    const breakpoints: number[] = [];
    gaps.slice(0, 5).forEach((gap) => {
        if (gap.ratio > 50) {
            const logStart = Math.log10(gap.start);
            const logEnd = Math.log10(gap.end);
            const logRange = logEnd - logStart;
            for (let i = 1; i <= 3; i += 1) {
                const logVal = logStart + (logRange / 4);
                breakpoints.push(10 ** logVal);
            }
        } else if (gap.ratio > 10) {
            const logStart = Math.log10(gap.start);
            const logEnd = Math.log10(gap.end);
            const logRange = logEnd - logStart;
            breakpoints.push(10 ** (logStart + logRange / 3));
            breakpoints.push(10 ** (logStart + (logRange * 2) / 3));
        } else {
            breakpoints.push((gap.start + gap.end) / 2);
        }
    });
    
    return breakpoints;
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

const determineOptimalThresholdCount = (data: number[]): number => {
    if (data.length < 10) return Math.min(data.length - 1, 6);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const dataRatio = max / Math.max(0.001, min);
    if (dataRatio > 1000) return 8;
    if (dataRatio > 100) return 7;
    if (dataRatio > 10) return 6;
    return 5;
};

const optimizeThresholds = (thresholds: number[], data: number[]): number[] => {
    if (thresholds.length <= 1) return thresholds;
    if (!wouldLabelsOverlap(thresholds)) return thresholds;
    if (thresholds.length > 3) {
        const reducedThresholds = thresholds.filter((_, i) => i % 2 === 0);
        return optimizeThresholds(reducedThresholds, data);
    }
    const scale = Math.max(...thresholds) >= 1000000 
        ? 1000000 
        : Math.max(...thresholds) >= 1000 
            ? 1000 
            : 1;
    const roundingFactors = scale === 1000000 
        ? [1000000, 5000000, 10000000] 
        : scale === 1000 
            ? [1000, 5000, 10000, 50000] 
            : [1, 5, 10, 50, 100];
    for (const factor of roundingFactors) {
        const roundedThresholds = thresholds.map((t) => Math.round(t / factor) * factor);
        const uniqueRounded = Array.from(new Set(roundedThresholds)).sort((a, b) => a - b);
        if (uniqueRounded.length >= 3 && !wouldLabelsOverlap(uniqueRounded)) {
            return uniqueRounded;
        }
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const result: number[] = [];
    if (scale === 1000000) {
        const values = [1000000, 10000000, 100000000];
        values.forEach((val) => {
            if (val > min && val < max) {
                result.push(val);
            }
        });
    } else if (scale === 1000) {
        const values = [1000, 10000, 100000, 1000000];
        values.forEach((val) => {
            if (val > min && val < max) {
                result.push(val);
            }
        });
    } else {
        const values = [10, 100, 1000];
        values.forEach((val) => {
            if (val > min && val < max) {
                result.push(val);
            }
        });
    }
    return result;
};

/**
 * Calculate thresholds for color mapping based on data values
 * @param dataValues - Array of numbers representing data values
 * @returns Array of thresholds for color mapping
 */
export const calculateThresholds = (dataValues: number[]): number[] => {
    const validValues = dataValues.filter(
        (v) => v !== undefined && v !== null && !Number.isNaN(v) && v !== 0 && Number.isFinite(v)
    );
    
    if (validValues.length === 0) {
        return [];
    }
    const sortedData = [...validValues].sort((a, b) => a - b);
    const dataLength = sortedData.length;
    const initialThresholds: number[] = [];
    if (dataLength < 30) {
        const min = sortedData[0];
        const max = sortedData[dataLength - 1];
        const step = (max - min) / 9;
        for (let i = 0; i <= 9; i += 1) {
            initialThresholds.push(min + step * i);
        }
    } else {
        const percentiles = [
            0,      // Min
            10,     // 10th
            20,     // 20th
            30,     // 30th
            40,     // 40th
            50,     // 50th
            60,     // 60th
            70,     // 70th
            80,     // 80th
            85,     // 85th
            90,     // 90th
            95,     // 95th
            97.5,   // 97.5th
            100     // Max
        ];
        percentiles.forEach(percentile => {
            if (percentile === 0) {
                initialThresholds.push(sortedData[0]);
            } else if (percentile === 100) {
                initialThresholds.push(sortedData[dataLength - 1]);
            } else {
                const index = Math.floor(dataLength * (percentile / 100));
                initialThresholds.push(sortedData[Math.min(index, dataLength - 1)]);
            }
        });
    }
    const uniqueThresholds = Array.from(new Set(initialThresholds)).sort((a, b) => a - b);
    if (uniqueThresholds.length > 10) {
        const targetCount = 10;
        const step = uniqueThresholds.length / targetCount;
        const reducedThresholds: number[] = [];
        reducedThresholds.push(uniqueThresholds[0]);
        for (let i = 1; i < targetCount - 1; i += 1) {
            const index = Math.min(Math.floor(i * step), uniqueThresholds.length - 2);
            reducedThresholds.push(uniqueThresholds[index]);
        }
        reducedThresholds.push(uniqueThresholds[uniqueThresholds.length - 1]);
        return reducedThresholds;
    }
    if (uniqueThresholds.length < 10) {
        const missingCount = 10 - uniqueThresholds.length;
        const tempThresholds = [...uniqueThresholds];
        for (let i = 0; i < missingCount; i += 1) {
            let largestGapIdx = 0;
            let largestGapSize = 0;
            for (let j = 0; j < tempThresholds.length - 1; j += 1) {
                const gap = tempThresholds[j + 1] - tempThresholds[j];
                if (gap > largestGapSize) {
                    largestGapSize = gap;
                    largestGapIdx = j;
                }
            }
            const newValue = (tempThresholds[largestGapIdx] + tempThresholds[largestGapIdx + 1]) / 2;
            tempThresholds.splice(largestGapIdx + 1, 0, newValue);
        }
        
        return tempThresholds;
    }
    return uniqueThresholds;
};

