// 10 color segments with more detail in higher percentiles
export const defaultPercentiles = [0, 15, 30, 45, 60, 75, 80, 85, 90, 95, 100];

export const getMapPercentiles = (): number[] => {
    return defaultPercentiles;
};
