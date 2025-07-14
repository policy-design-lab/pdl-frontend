import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { formatCurrency, formatNumericValue } from "../utils";
import { ShortFormatInteger, ShortFormatPaymentRate } from "../../shared/ConvertionFormats";
import { topTipStyle } from "../../shared/MapTooltip";

interface CongressionalDistrictTooltipContentProps {
    geo: any;
    districtData: any;
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    showMeanValues: boolean;
    selectedYear: string | string[];
    yearAggregation: number;
    selectedYears: (string | number)[];
}

export const CongressionalDistrictTooltipContent: React.FC<CongressionalDistrictTooltipContentProps> = ({
    geo,
    districtData,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    showMeanValues,
    selectedYear,
    yearAggregation,
    selectedYears
}) => {
    if (!districtData) {
        return (
            <Box sx={{ padding: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {geo.properties.NAMELSAD}
                </Typography>
                <Typography variant="body2" sx={{ color: "#999" }}>
                    No data available
                </Typography>
            </Box>
        );
    }

    const formatValue = (value: number | string): string => {
        if (typeof value === "string") {
            const numValue = parseFloat(value);
            if (Number.isNaN(numValue)) return "0";
            return formatCurrency(numValue);
        }
        return formatCurrency(value);
    };

    const getDisplayValue = (): string => {
        if (viewMode === "difference") {
            return formatValue(districtData.difference || 0);
        }
        if (viewMode === "proposed") {
            return formatValue(districtData.proposedValue || 0);
        }
        return formatValue(districtData.value || 0);
    };

    const getDisplayTitle = (): string => {
        if (viewMode === "difference") {
            return "Payment Difference";
        }
        if (viewMode === "proposed") {
            return "Proposed Payment";
        }
        return "Current Payment";
    };

    return (
        <Box sx={{ padding: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                {geo.properties.NAMELSAD}
            </Typography>

            <Box sx={{ marginBottom: 1 }}>
                <Typography variant="body2">
                    <strong>{getDisplayTitle()}:</strong> {getDisplayValue()}
                </Typography>

                {districtData.baseAcres && (
                    <Typography variant="body2">
                        <strong>Base Acres:</strong> {formatNumericValue(districtData.baseAcres)}
                    </Typography>
                )}

                {showMeanValues && districtData.meanRate && (
                    <Typography variant="body2">
                        <strong>Mean Rate:</strong> ${formatNumericValue(districtData.meanRate)}/acre
                    </Typography>
                )}
            </Box>

            {districtData.commodities && Object.keys(districtData.commodities).length > 0 && (
                <>
                    <Divider sx={{ margin: "8px 0" }} />
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        Commodities:
                    </Typography>
                    {Object.entries(districtData.commodities)
                        .slice(0, 3)
                        .map(([commodity, data]: [string, any]) => (
                            <Typography key={commodity} variant="caption" sx={{ display: "block" }}>
                                {commodity}: {formatValue(data.value || 0)}
                            </Typography>
                        ))}
                    {Object.keys(districtData.commodities).length > 3 && (
                        <Typography variant="caption" sx={{ color: "#999" }}>
                            +{Object.keys(districtData.commodities).length - 3} more...
                        </Typography>
                    )}
                </>
            )}

            {districtData.programs && Object.keys(districtData.programs).length > 0 && (
                <>
                    <Divider sx={{ margin: "8px 0" }} />
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        Programs:
                    </Typography>
                    {Object.entries(districtData.programs)
                        .slice(0, 3)
                        .map(([program, data]: [string, any]) => (
                            <Typography key={program} variant="caption" sx={{ display: "block" }}>
                                {program}: {formatValue(data.value || 0)}
                            </Typography>
                        ))}
                    {Object.keys(districtData.programs).length > 3 && (
                        <Typography variant="caption" sx={{ color: "#999" }}>
                            +{Object.keys(districtData.programs).length - 3} more...
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
};

export const CongressionalDistrictTooltipContentHTML = ({
    districtData,
    districtName,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    classes,
    showMeanValues,
    yearAggregation,
    selectedYears = []
}: {
    districtData: any;
    districtName: string;
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    classes: any;
    showMeanValues: boolean;
    yearAggregation: number;
    selectedYears?: (string | number)[];
}): string => {
    if (!districtData) return "";

    if (!districtData.hasData) {
        return `
        <div class="${classes.tooltip_overall}">
            <div class="${classes.tooltip_header}" style="background-color: rgba(47, 113, 100, 0.15); padding: 8px; border-radius: 4px 4px 0 0;">
                <b>${districtName}</b>
            </div>
            <table class="${classes.tooltip_table}" style="border-spacing: 0; width: 100%; padding: 8px 0 10px 0;">
            <tbody>
                <tr>
                    <td colspan="2" style="background-color: rgba(200, 200, 200, 0.2); padding: 10px; text-align: center; color: #666; font-style: italic; border-radius: 4px;">
                        No payment data available for this district.
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
        <div style="height: 8px; background-color: #dadada;"></div>
        `;
    }

    let tooltipContent = `
        <div class="${classes.tooltip_overall}">
            <div class="${classes.tooltip_header}" style="background-color: rgba(47, 113, 100, 0.15); padding: 8px; border-radius: 4px 4px 0 0;">
                <b>${districtName}</b>
            </div>
            <table class="${classes.tooltip_table}" style="border-spacing: 0; width: 100%; padding: 8px 0 10px 0;">
            <tbody>`;

    const isMultiYearSelection = selectedYears && selectedYears.length > 1;
    const hasYearAggregation = yearAggregation > 0;

    if (!(isMultiYearSelection || hasYearAggregation)) {
        tooltipContent += `
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                    Base Acres:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                    ${ShortFormatInteger(
                        viewMode === "proposed"
                            ? districtData.proposedBaseAcres || 0
                            : districtData.currentBaseAcres || 0
                    )}
                </td>
            </tr>`;
    } else {
        const numberOfYears = isMultiYearSelection ? selectedYears.length : yearAggregation + 1;
        const averageBaseAcres =
            viewMode === "proposed"
                ? Math.round((districtData.proposedBaseAcres || 0) / numberOfYears)
                : Math.round((districtData.currentBaseAcres || 0) / numberOfYears);
        tooltipContent += `
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                    Avg Base Acres:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                    ${ShortFormatInteger(averageBaseAcres)}
                </td>
            </tr>`;
    }

    const totalPayment = viewMode === "proposed" ? districtData.proposedValue : districtData.currentValue;
    const baseAcres = districtData.baseAcres || 0;
    const calculatedMeanRate =
        viewMode === "proposed" ? districtData.proposedMeanRate || 0 : districtData.currentMeanRate || 0;

    tooltipContent += `
    <tr style="${topTipStyle}">
        <td class="${
            classes.tooltip_topcell_left
        }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
            Total Payment:
        </td>
        <td class="${
            classes.tooltip_topcell_right
        }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
            $${ShortFormatInteger(totalPayment || 0)}
        </td>
    </tr>`;

    if (baseAcres > 0 && showMeanValues) {
        tooltipContent += `
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                Mean Payment Rate:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                $${ShortFormatPaymentRate(calculatedMeanRate || 0)}/acre
            </td>
        </tr>`;
    }

    tooltipContent += `
            </tbody>
            </table>
        </div>
        <div style="height: 8px; background-color: #dadada;"></div>
    `;
    return tooltipContent;
};
