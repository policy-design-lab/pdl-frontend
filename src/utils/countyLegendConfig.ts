const defaultPercentiles = [10, 35, 65, 90];

const countyLegendConfig: Record<string, number[]> = {
    default: defaultPercentiles,
    lossRatio: defaultPercentiles,
    totalNetFarmerBenefit: defaultPercentiles,
    totalIndemnities: defaultPercentiles,
    totalPremium: defaultPercentiles,
    totalPremiumSubsidy: defaultPercentiles,
    totalFarmerPaidPremium: defaultPercentiles,
    totalPoliciesEarningPremium: defaultPercentiles,
    averageLiabilities: defaultPercentiles,
    averageInsuredAreaInAcres: defaultPercentiles
};

export function getCountyPercentiles(attribute: string): number[] {
    return countyLegendConfig[attribute] || countyLegendConfig.default;
}

export default countyLegendConfig;
