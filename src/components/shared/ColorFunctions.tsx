/**
 * For thresholds with possible negative number, get length of negative numbers and positive numbers, then replace the largest number with 0 for negative side or replace the smallest number with 0 for positive side, depending on which side has more numbers
 * @param thresholds
 * @returns
 */
export const CheckAddZero = (thresholds: number[]) => {
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

/**
 * Calculate thresholds for color mapping based on data values
 * @param dataValues - Array of numbers representing data values
 * @returns Array of thresholds for color mapping
 */
export const calculateThresholds = (dataValues: number[]) => {
    const sortedData = [...dataValues].sort((a, b) => a - b);
    if (sortedData.length === 0) {
        return [];
    }
    const numIntervals = 6;
    const intervalSize = Math.ceil(sortedData.length / numIntervals);
    let thresholds: number[] = [];
    for (let i = 1; i < numIntervals; i += 1) {
        const thresholdIndex = i * intervalSize - 1;
        const adjustedIndex = Math.min(thresholdIndex, sortedData.length - 1);
        thresholds.push(sortedData[adjustedIndex]);
    }
    if (sortedData.length > 0) {
        thresholds.push(Math.min(...sortedData));
        thresholds.push(Math.max(...sortedData));
    }
    thresholds = CheckAddZero(thresholds.sort((a, b) => a - b));
    return thresholds;
};
