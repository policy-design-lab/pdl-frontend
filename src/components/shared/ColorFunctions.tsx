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
