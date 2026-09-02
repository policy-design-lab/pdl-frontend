import React from "react";
import { formatCurrency, formatNumericValue } from "../../shared/ConvertionFormats";
import {
    tooltipBreakdownContainerStyle,
    tooltipBreakdownTableStyle,
    tooltipCellStyle,
    tooltipRowHeaderStyle,
    tooltipSectionHeaderStyle,
    tooltipTableHeaderStyle
} from "../../shared/tooltipBreakdownStyles";
import { ALL_CROPS_SENTINEL } from "./commodityMapping";
import { CountyMetrics, ProjectedCountyRecord } from "./types";

export const RATIO_ATTRIBUTES = ["lossRatio"];
export const COUNT_ATTRIBUTES = ["totalPoliciesEarningPremium", "averageInsuredAreaInAcres", "totalInsuredAreaInAcres"];

const METRIC_KEY_BY_ATTRIBUTE: Record<string, string> = {
    totalNetFarmerBenefit: "totalNetFarmerBenefitInDollars",
    totalIndemnities: "totalIndemnitiesInDollars",
    totalPremium: "totalPremiumInDollars",
    totalPremiumSubsidy: "totalPremiumSubsidyInDollars",
    totalFarmerPaidPremium: "totalFarmerPaidPremiumInDollars",
    totalLiabilities: "totalLiabilitiesInDollars",
    averageLiabilities: "averageLiabilitiesInDollars",
    averageInsuredAreaInAcres: "averageInsuredAreaInAcres",
    totalInsuredArea: "totalInsuredAreaInAcres",
    totalPoliciesEarningPremium: "totalPoliciesEarningPremium",
    lossRatio: "lossRatio"
};

export function resolveMetricKey(attribute: string): string {
    return METRIC_KEY_BY_ATTRIBUTE[attribute] ?? attribute;
}

export function formatMetric(attribute: string, value: number): string {
    if (!Number.isFinite(value)) {
        return "-";
    }
    if (RATIO_ATTRIBUTES.includes(attribute)) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
    }
    if (COUNT_ATTRIBUTES.includes(attribute)) {
        return formatNumericValue(value, 0);
    }
    return formatCurrency(value, 0);
}

export function metricValue(metrics: CountyMetrics | undefined, attribute: string): number {
    if (!metrics) {
        return 0;
    }
    const value = (metrics as unknown as Record<string, number>)[resolveMetricKey(attribute)];
    return Number.isFinite(value) ? value : 0;
}

interface CountyBreakdownTablesProps {
    record: ProjectedCountyRecord;
    attribute: string;
    metricLabel: string;
    yearKeys: string[];
    selectedCrops: string[];
}

const CountyBreakdownTables: React.FC<CountyBreakdownTablesProps> = ({
    record,
    attribute,
    metricLabel,
    yearKeys,
    selectedCrops
}) => {
    const showYears = yearKeys.length > 1;
    const showCrops = selectedCrops.length > 0 && !selectedCrops.includes(ALL_CROPS_SENTINEL);

    if (!showYears && !showCrops) {
        return null;
    }

    return (
        <div style={tooltipBreakdownContainerStyle}>
            {showYears && (
                <>
                    <div style={tooltipSectionHeaderStyle}>Year Breakdown</div>
                    <table style={tooltipBreakdownTableStyle}>
                        <thead>
                            <tr>
                                <th style={{ ...tooltipTableHeaderStyle, textAlign: "left" }}>Year</th>
                                <th style={tooltipTableHeaderStyle}>{metricLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yearKeys.map((year) => (
                                <tr key={`year-${year}`}>
                                    <td style={tooltipRowHeaderStyle}>{year}</td>
                                    <td style={tooltipCellStyle}>
                                        {formatMetric(attribute, metricValue(record.yearBreakdown?.[year], attribute))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
            {showCrops && (
                <>
                    <div style={{ ...tooltipSectionHeaderStyle, marginTop: showYears ? "6px" : 0 }}>
                        Commodity Breakdown
                    </div>
                    <table style={tooltipBreakdownTableStyle}>
                        <thead>
                            <tr>
                                <th style={{ ...tooltipTableHeaderStyle, textAlign: "left" }}>Commodity</th>
                                {showYears &&
                                    yearKeys.map((year) => (
                                        <th key={`crop-head-${year}`} style={tooltipTableHeaderStyle}>
                                            {year}
                                        </th>
                                    ))}
                                <th style={tooltipTableHeaderStyle}>{showYears ? "Total" : metricLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCrops.map((crop) => {
                                const entry = record.commodityBreakdown?.[crop];
                                return (
                                    <tr key={`crop-${crop}`}>
                                        <td style={tooltipRowHeaderStyle}>{crop}</td>
                                        {showYears &&
                                            yearKeys.map((year) => (
                                                <td key={`crop-${crop}-${year}`} style={tooltipCellStyle}>
                                                    {formatMetric(
                                                        attribute,
                                                        metricValue(entry?.yearBreakdown?.[year], attribute)
                                                    )}
                                                </td>
                                            ))}
                                        <td style={tooltipCellStyle}>
                                            {formatMetric(attribute, metricValue(entry, attribute))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default CountyBreakdownTables;
