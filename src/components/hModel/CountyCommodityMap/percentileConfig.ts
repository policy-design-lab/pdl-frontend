// 10 color segments with more detail in lowest and highest percentiles
export const defaultPercentiles = [0, 5, 10, 15, 40, 65, 80, 85, 90, 95, 100];

// Equal percentile distribution
export const equalPercentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export enum PercentileMode {
    DEFAULT = "default",
    EQUAL = "equal"
}

export const getMapPercentiles = (mode: PercentileMode = PercentileMode.DEFAULT): number[] => {
    if (mode === PercentileMode.EQUAL) {
        return equalPercentiles;
    }
    return defaultPercentiles;
};
