// 10 color segments with more detail in lowest and highest percentiles
export const defaultPercentiles = [0, 5, 10, 15, 40, 65, 80, 85, 90, 95, 100];

export const getMapPercentiles = (): number[] => {
  // other percentiles for testing
  //return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return defaultPercentiles;
};
