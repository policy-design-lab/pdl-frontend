import countyFipsMapping from "../../../files/maps/fips_county_mapping.json";
import { ShortFormatInteger, ShortFormatPaymentRate } from "../../shared/ConvertionFormats";
import { topTipStyle } from "../../shared/MapTooltip";

interface CountyTooltipContentProps {
    countyData: any;
    countyFIPS: string;
    viewMode: string;
    selectedCommodities: string[];
    selectedPrograms: string[];
    classes: any;
    showMeanValues: boolean;
    yearAggregation: number;
    selectedYears?: (string | number)[];
    stateCodesData?: Record<string, string>;
}
const calculateDisplayBaseAcres = (
    baseAcres: number,
    isMultiYearSelection: boolean,
    hasYearAggregation: boolean,
    selectedYears: (string | number)[],
    yearAggregation: number
): number => {
    if (!(isMultiYearSelection || hasYearAggregation)) {
        return baseAcres;
    }

    const numberOfYears = isMultiYearSelection ? selectedYears.length : yearAggregation + 1;
    return Math.round(baseAcres / numberOfYears);
};

const getBaseAcresLabel = (isMultiYearSelection: boolean, hasYearAggregation: boolean): string => {
    return isMultiYearSelection || hasYearAggregation ? "Avg Base Acres" : "Base Acres";
};

export const CountyTooltipContent = ({
    countyData,
    countyFIPS,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    classes,
    showMeanValues,
    yearAggregation,
    selectedYears = [],
    stateCodesData
}: CountyTooltipContentProps): string => {
    if (!countyData) return "";
    const countyName = countyFipsMapping[countyFIPS] || `County ${countyFIPS}`;
    const stateFIPS = countyFIPS?.substring(0, 2);
    const stateName = stateFIPS ? stateCodesData?.[stateFIPS] || countyFipsMapping[stateFIPS] || "" : "";
    const displayName = stateName ? `${countyName}, ${stateName}` : countyName;
    if (!countyData.hasData) {
        return `
        <div class="${classes.tooltip_overall}">
            <div class="${classes.tooltip_header}" style="background-color: rgba(47, 113, 100, 0.15); padding: 8px; border-radius: 4px 4px 0 0;">
                <b>${displayName}</b>
            </div>
            <table class="${classes.tooltip_table}" style="border-spacing: 0; width: 100%; padding: 8px 0 10px 0;">
            <tbody>
                <tr>
                    <td colspan="2" style="background-color: rgba(200, 200, 200, 0.2); padding: 10px; text-align: center; color: #666; font-style: italic; border-radius: 4px;">
                        No payment data available for this county.
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
                <b>${displayName}</b>
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
                        viewMode === "proposed" ? countyData.proposedBaseAcres || 0 : countyData.currentBaseAcres || 0
                    )}
                </td>
            </tr>`;
    } else {
        const numberOfYears = isMultiYearSelection ? selectedYears.length : yearAggregation + 1;
        const averageBaseAcres =
            viewMode === "proposed"
                ? Math.round((countyData.proposedBaseAcres || 0) / numberOfYears)
                : Math.round((countyData.currentBaseAcres || 0) / numberOfYears);
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

    if (viewMode === "difference") {
        tooltipContent += generateDifferenceTooltipContent(countyData, classes, showMeanValues);

        if (
            selectedCommodities &&
            !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops")) &&
            selectedPrograms &&
            (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)
        ) {
            tooltipContent += generateCombinedCommodityProgramContent(
                countyData,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                viewMode,
                yearAggregation,
                selectedYears
            );
        } else {
            if (
                selectedCommodities &&
                !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops"))
            ) {
                tooltipContent += generateCommodityDifferenceContent(
                    countyData,
                    selectedCommodities,
                    classes,
                    showMeanValues,
                    viewMode,
                    yearAggregation,
                    selectedYears
                );
            }
            if (selectedPrograms && (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)) {
                tooltipContent += generateProgramDifferenceContent(
                    countyData,
                    selectedPrograms,
                    classes,
                    showMeanValues,
                    yearAggregation,
                    selectedYears
                );
            }
        }
    } else {
        tooltipContent += generateRegularTooltipContent(
            countyData,
            classes,
            showMeanValues,
            yearAggregation,
            selectedCommodities,
            selectedPrograms,
            selectedYears,
            countyFIPS
        );

        if (
            selectedCommodities &&
            !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops")) &&
            selectedPrograms &&
            (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)
        ) {
            tooltipContent += generateCombinedCommodityProgramContent(
                countyData,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                viewMode,
                yearAggregation,
                selectedYears
            );
        } else {
            if (
                selectedCommodities &&
                !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops"))
            ) {
                tooltipContent += generateCommodityRegularContent(
                    countyData,
                    selectedCommodities,
                    classes,
                    showMeanValues,
                    viewMode,
                    yearAggregation,
                    selectedYears
                );
            }

            if (selectedPrograms && (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)) {
                tooltipContent += generateProgramRegularContent(
                    countyData,
                    selectedPrograms,
                    classes,
                    showMeanValues,
                    viewMode,
                    yearAggregation,
                    selectedYears
                );
            }
        }
    }
    tooltipContent += `
            </tbody>
            </table>
        </div>
        <div style="height: 8px; background-color: #dadada;"></div>
    `;
    return tooltipContent;
};

function generateDifferenceTooltipContent(countyData: any, classes: any, showMeanValues: boolean): string {
    const formatDiff = (value: number | undefined | null): string => {
        if (!value) return "";
        const sign = value > 0 ? "+" : "";
        return `${sign}${ShortFormatInteger(value)}`;
    };

    const formatPaymentRateDiff = (value: number | undefined | null): string => {
        if (!value) return "";
        const sign = value > 0 ? "+" : "";
        return `${sign}${ShortFormatPaymentRate(value, true)}`;
    };

    const isCurrentWeightedAvg = countyData.isCurrentMeanWeighted;
    const isProposedWeightedAvg = countyData.isProposedMeanWeighted;
    const currentRate = countyData.currentMeanRatePrecise || 0;
    const proposedRate = countyData.proposedMeanRatePrecise || 0;
    const meanRateDiff = proposedRate - currentRate;
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    const content = `
        <tr style="${topTipStyle}">
            <td class="${
                classes.tooltip_topcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; background-color: rgba(156, 39, 176, 0.12); border-radius: 2px 0 0 2px;">
                Total Payment Change:
            </td>
            <td class="${
                classes.tooltip_topcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; background-color: rgba(156, 39, 176, 0.12); border-radius: 0 2px 2px 0;">
                $${ShortFormatInteger(countyData.value || 0)} (${(countyData.percentChange || 0).toFixed(1)}%)
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 2px 0 0 2px;">
                Payment Rate Change:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 0 2px 2px 0;">
                ${formatPaymentRateDiff(meanRateDiff)}/acre
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                Current Total:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                $${ShortFormatInteger(countyData.currentValue || 0)}
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                Current Payment Rate:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                $${ShortFormatPaymentRate(countyData.currentMeanRatePrecise || 0)}/acre${
        isCurrentWeightedAvg ? " (weighted avg)" : ""
    }
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                Proposed Total:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                $${ShortFormatInteger(countyData.proposedValue || 0)}
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                Proposed Payment Rate:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                $${ShortFormatPaymentRate(countyData.proposedMeanRatePrecise || 0)}/acre${
        isProposedWeightedAvg ? " (weighted avg)" : ""
    }
            </td>
        </tr>
    `;
    return content;
}

function generateRegularTooltipContent(
    countyData: any,
    classes: any,
    showMeanValues: boolean,
    yearAggregation: number,
    selectedCommodities: string[] = [],
    selectedPrograms: string[] = [],
    selectedYears: (string | number)[] = [],
    countyFIPS = ""
): string {
    const viewMode = countyData.proposedValue > 0 ? "proposed" : "current";
    const totalPayment = viewMode === "proposed" ? countyData.proposedValue : countyData.currentValue;
    const baseAcres = countyData.baseAcres || 0;
    const calculatedMeanRate =
        viewMode === "proposed" ? countyData.proposedMeanRatePrecise || 0 : countyData.currentMeanRatePrecise || 0;
    let content = `
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
        content += `
        <tr>
            <td class="${
                classes.tooltip_regularcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                Mean Payment Rate:
            </td>
            <td class="${
                classes.tooltip_regularcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                $${ShortFormatPaymentRate(calculatedMeanRate || 0)}/acre${
            countyData.isMeanWeighted ? " (weighted avg)" : ""
        }
            </td>
        </tr>`;
    }
    return content;
}

function generateCommodityDifferenceContent(
    countyData: any,
    selectedCommodities: string[],
    classes: any,
    showMeanValues: boolean,
    viewMode: string,
    yearAggregation = 0,
    selectedYears: (string | number)[] = []
): string {
    let content = "";

    if (!countyData || !countyData.commodities) {
        return content;
    }

    const commoditiesToDisplay = selectedCommodities.includes("All Program Crops")
        ? Object.keys(countyData.commodities)
        : selectedCommodities;

    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    const formatDiff = (value: number | undefined | null): string => {
        if (!value) return "";
        const sign = value > 0 ? "+" : "";
        return `${sign}${ShortFormatPaymentRate(value, true)}`;
    };

    if (commoditiesToDisplay.length > 0) {
        content += `<tr><td colspan="2" style="${sectionHeaderStyle}">Commodity Breakdown</td></tr>`;
        commoditiesToDisplay.forEach((commodity) => {
            const commodityData = countyData.commodities[commodity];
            if (!commodityData) {
                return;
            }
            if (
                commodityData.value > 0 ||
                commodityData.currentValue > 0 ||
                commodityData.proposedValue > 0 ||
                commodityData.difference !== 0
            ) {
                let commodityCurrentValue = commodityData.currentValue;
                let commodityProposedValue = commodityData.proposedValue;
                let commodityDifference = commodityData.difference;

                if (typeof commodityCurrentValue === "string") {
                    commodityCurrentValue = parseFloat(commodityCurrentValue.replace(/[^0-9.-]+/g, ""));
                }
                if (typeof commodityProposedValue === "string") {
                    commodityProposedValue = parseFloat(commodityProposedValue.replace(/[^0-9.-]+/g, ""));
                }
                if (typeof commodityDifference === "string") {
                    commodityDifference = parseFloat(commodityDifference.replace(/[^0-9.-]+/g, ""));
                }
                commodityDifference = commodityProposedValue - commodityCurrentValue;
                const baseAcres = commodityData.baseAcres || 0;
                const currentBaseAcres = commodityData.currentBaseAcres || 0;
                const proposedBaseAcres = commodityData.proposedBaseAcres || 0;
                let percentChange = 0;
                if (commodityCurrentValue !== 0 && commodityCurrentValue !== undefined) {
                    percentChange =
                        ((commodityProposedValue - commodityCurrentValue) / Math.abs(commodityCurrentValue)) * 100;
                } else if (commodityProposedValue !== 0) {
                    percentChange = 100;
                }
                const commodityCurrentMeanRate = currentBaseAcres > 0 ? commodityCurrentValue / currentBaseAcres : 0;
                const commodityProposedMeanRate =
                    proposedBaseAcres > 0 ? commodityProposedValue / proposedBaseAcres : 0;
                content += `
                <tr>
                    <td colspan="2" style="${subSectionStyle}">
                        ${commodity}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px; ${diffHighlightStyle} border-radius: 2px 0 0 2px;">
                        Total Change:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px; ${diffHighlightStyle} border-radius: 0 2px 2px 0;">
                        ${formatDiff(commodityDifference)} (${percentChange.toFixed(1)}%)
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        Current Value:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        $${ShortFormatInteger(commodityCurrentValue)}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        Proposed Value:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        $${ShortFormatInteger(commodityProposedValue)}
                    </td>
                </tr>`;
            }
        });
    }

    return content;
}

function generateProgramDifferenceContent(
    countyData: any,
    selectedPrograms: string[],
    classes: any,
    showMeanValues: boolean,
    yearAggregation = 0,
    selectedYears: (string | number)[] = []
): string {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">Program Breakdown</td></tr>`;

    let programsToDisplay: string[] = [];
    if (selectedPrograms.includes("All Programs")) {
        if (
            countyData.programs &&
            countyData.programs["ARC-CO"] &&
            (countyData.programs["ARC-CO"].currentValue > 0 || countyData.programs["ARC-CO"].proposedValue > 0)
        ) {
            programsToDisplay.push("ARC-CO");
        }
        if (
            countyData.programs &&
            countyData.programs.PLC &&
            (countyData.programs.PLC.currentValue > 0 || countyData.programs.PLC.proposedValue > 0)
        ) {
            programsToDisplay.push("PLC");
        }

        if (programsToDisplay.length === 0 && countyData.programs) {
            programsToDisplay = Object.keys(countyData.programs);
        }
    } else {
        programsToDisplay = selectedPrograms;
    }

    programsToDisplay.forEach((program) => {
        const programData = countyData.programs && countyData.programs[program];
        if (programData && (programData.currentValue > 0 || programData.proposedValue > 0)) {
            const formatDiff = (value: number | undefined | null): string => {
                if (!value) return "";
                const sign = value > 0 ? "+" : "";
                return `${sign}${ShortFormatPaymentRate(value, true)}`;
            };

            content += `
            <tr>
                <td colspan="2" style="${subSectionStyle}">
                    ${program}
                </td>
            </tr>`;

            if (showMeanValues) {
                const currentBaseAcres = programData.currentBaseAcres || 0;
                const proposedBaseAcres = programData.proposedBaseAcres || 0;
                const currentRate = currentBaseAcres > 0 ? (programData.currentValue || 0) / currentBaseAcres : 0;
                const proposedRate = proposedBaseAcres > 0 ? (programData.proposedValue || 0) / proposedBaseAcres : 0;
                const diff = proposedRate - currentRate;

                const isWeightedAvg = selectedPrograms.includes("All Programs") || selectedPrograms.length > 1;

                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 2px 0 0 2px;">
                        Payment Rate Diff:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 0 2px 2px 0;">
                        ${diff !== 0 ? `${diff > 0 ? "+" : ""}${ShortFormatPaymentRate(diff, true)}/acre` : ""}${
                    isWeightedAvg ? " (weighted avg)" : ""
                }
                    </td>
                </tr>`;
            } else {
                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 2px 0 0 2px;">
                        Payment Diff:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle} border-radius: 0 2px 2px 0;">
                        $${formatDiff(programData.value)}
                    </td>
                </tr>`;
            }
            const isMultiYearSelection = selectedYears && selectedYears.length > 1;
            const hasYearAggregation = yearAggregation > 0;
            const displayCurrentBaseAcres = calculateDisplayBaseAcres(
                programData.currentBaseAcres || 0,
                isMultiYearSelection,
                hasYearAggregation,
                selectedYears,
                yearAggregation
            );
            const displayProposedBaseAcres = calculateDisplayBaseAcres(
                programData.proposedBaseAcres || 0,
                isMultiYearSelection,
                hasYearAggregation,
                selectedYears,
                yearAggregation
            );
            const baseAcresLabel = getBaseAcresLabel(isMultiYearSelection, hasYearAggregation);

            content += `
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Current ${baseAcresLabel}:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormatInteger(displayCurrentBaseAcres)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Proposed ${baseAcresLabel}:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormatInteger(displayProposedBaseAcres)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Current Value:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    $${ShortFormatInteger(Math.abs(programData.currentValue || 0))}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Proposed Value:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    $${ShortFormatInteger(Math.abs(programData.proposedValue || 0))}
                </td>
            </tr>`;
        }
    });
    return content;
}

function generateProgramRegularContent(
    countyData: any,
    selectedPrograms: string[],
    classes: any,
    showMeanValues: boolean,
    viewMode = "current",
    yearAggregation = 0,
    selectedYears: (string | number)[] = []
): string {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";
    const totalPayment = viewMode === "proposed" ? countyData.proposedValue : countyData.currentValue;
    const baseAcres = viewMode === "proposed" ? countyData.proposedBaseAcres : countyData.currentBaseAcres;
    const calculatedMeanRate = baseAcres > 0 ? totalPayment / baseAcres : 0;

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">Program Breakdown</td></tr>`;

    if (!selectedPrograms.includes("All Programs")) {
        content += `
        <tr>
            <td class="${
                classes.tooltip_topcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                <b>Programs Total:</b>
            </td>
            <td class="${
                classes.tooltip_topcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                <b>$${ShortFormatInteger(Math.abs(countyData.value))}</b>
            </td>
        </tr>
        <tr>
            <td class="${
                classes.tooltip_topcell_left
            }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                <b>Programs Payment Rate:</b>
            </td>
            <td class="${
                classes.tooltip_topcell_right
            }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                <b>$${ShortFormatPaymentRate(Math.abs(calculatedMeanRate))}/acre${
            countyData.isMeanWeighted ? " (weighted avg)" : ""
        }</b>
            </td>
        </tr>`;
    }

    let programsToDisplay: string[] = [];
    if (selectedPrograms.includes("All Programs")) {
        if (countyData.programs && Object.keys(countyData.programs).length > 0) {
            if (countyData.programs["ARC-CO"]) {
                programsToDisplay.push("ARC-CO");
            }
            if (countyData.programs.PLC) {
                programsToDisplay.push("PLC");
            }

            if (programsToDisplay.length === 0) {
                programsToDisplay = Object.keys(countyData.programs);
            }
        }
    } else {
        programsToDisplay = selectedPrograms;
    }

    programsToDisplay.forEach((program) => {
        const programData = countyData.programs && countyData.programs[program];
        if (programData) {
            const programValue =
                viewMode === "proposed"
                    ? Math.abs(programData.proposedValue || 0)
                    : Math.abs(programData.currentValue || 0);

            const baseAcresValue =
                viewMode === "proposed" ? programData.proposedBaseAcres || 0 : programData.currentBaseAcres || 0;

            const isMultiYearSelection = selectedYears && selectedYears.length > 1;
            const hasYearAggregation = yearAggregation > 0;

            const displayBaseAcres = calculateDisplayBaseAcres(
                baseAcresValue,
                isMultiYearSelection,
                hasYearAggregation,
                selectedYears,
                yearAggregation
            );

            const baseAcresLabel = getBaseAcresLabel(isMultiYearSelection, hasYearAggregation);

            const programMeanRate = baseAcresValue > 0 ? programValue / baseAcresValue : 0;
            content += `
            <tr>
                <td colspan="2" style="${subSectionStyle}">
                    ${program}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Total:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    $${ShortFormatInteger(programValue)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${baseAcresLabel}:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormatInteger(displayBaseAcres)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Payment Rate:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                            $${ShortFormatPaymentRate(Math.abs(programMeanRate))}/acre
                </td>
            </tr>`;
        }
    });
    return content;
}

function generateCommodityRegularContent(
    countyData: any,
    selectedCommodities: string[],
    classes: any,
    showMeanValues: boolean,
    viewMode = "current",
    yearAggregation = 0,
    selectedYears: (string | number)[] = []
): string {
    let content = "";
    const commoditiesToDisplay = selectedCommodities.includes("All Program Crops")
        ? Object.keys(countyData.commodities)
        : selectedCommodities;

    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";

    if (commoditiesToDisplay.length > 0) {
        content += `<tr><td colspan="2" style="${sectionHeaderStyle}">Commodity Breakdown</td></tr>`;

        commoditiesToDisplay.forEach((commodity) => {
            const commodityData = countyData.commodities[commodity];
            if (!commodityData) {
                return;
            }

            if (
                commodityData.value > 0 ||
                commodityData.currentValue > 0 ||
                commodityData.proposedValue > 0 ||
                commodityData.difference !== 0
            ) {
                let commodityValue = commodityData.value;
                if (typeof commodityValue === "string") {
                    commodityValue = parseFloat(commodityValue.replace(/[^0-9.-]+/g, ""));
                }
                const baseAcres =
                    viewMode === "proposed"
                        ? commodityData.proposedBaseAcres || 0
                        : commodityData.currentBaseAcres || 0;

                const isMultiYearSelection = selectedYears && selectedYears.length > 1;
                const hasYearAggregation = yearAggregation > 0;

                const displayBaseAcres = calculateDisplayBaseAcres(
                    baseAcres,
                    isMultiYearSelection,
                    hasYearAggregation,
                    selectedYears,
                    yearAggregation
                );

                const baseAcresLabel = getBaseAcresLabel(isMultiYearSelection, hasYearAggregation);

                let commodityMeanRate = 0;
                if (baseAcres > 0) {
                    commodityMeanRate = commodityValue / baseAcres;
                }
                content += `
                <tr>
                    <td colspan="2" style="${subSectionStyle}">
                        ${commodity}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        Total:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        $${ShortFormatInteger(commodityValue)}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        ${baseAcresLabel}:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        ${ShortFormatInteger(displayBaseAcres)}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        Payment Rate:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        $${ShortFormatPaymentRate(commodityMeanRate)}/acre
                    </td>
                </tr>`;
            }
        });
    }
    return content;
}

function generateCombinedCommodityProgramContent(
    countyData: any,
    selectedCommodities: string[],
    selectedPrograms: string[],
    classes: any,
    showMeanValues: boolean,
    viewMode = "current",
    yearAggregation = 0,
    selectedYears: (string | number)[] = []
): string {
    const commoditiesToDisplay = selectedCommodities.includes("All Program Crops")
        ? Object.keys(countyData.commodities || {})
        : selectedCommodities;

    const programsToDisplay = selectedPrograms.includes("All Programs") ? ["ARC-CO", "PLC"] : selectedPrograms;

    if (commoditiesToDisplay.length === 0 || !countyData.commodities) {
        return "";
    }

    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 8px; border-radius: 3px; margin-top: 6px;";

    const tableHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.08); font-weight: bold; text-align: center; padding: 6px 4px; border: 1px solid rgba(47, 113, 100, 0.2); font-size: 0.8em;";

    const commodityHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.12); font-weight: bold; text-align: left; padding: 6px 8px; border: 1px solid rgba(47, 113, 100, 0.2); color: #2F7164;";

    const cellStyle =
        "text-align: right; vertical-align: middle; padding: 4px 6px; border: 1px solid rgba(47, 113, 100, 0.15); font-size: 0.85em;";

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">Commodity Breakdown</td></tr>`;

    const showAllPrograms = selectedPrograms.includes("All Programs");
    const isMultiYearSelection = selectedYears && selectedYears.length > 1;
    const hasYearAggregation = yearAggregation > 0;
    const baseAcresLabel = getBaseAcresLabel(isMultiYearSelection, hasYearAggregation);

    if (showAllPrograms) {
        content += `
        <tr>
            <td colspan="2" style="padding: 4px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
                    <thead>
                        <tr>
                            <th style="${tableHeaderStyle}; text-align: left; width: 20%;">Commodity</th>
                            <th style="${tableHeaderStyle}; width: 13%;">${
            showMeanValues ? "Total Rate" : "Total ($)"
        }</th>
                            <th style="${tableHeaderStyle}; width: 13%;">${baseAcresLabel}</th>
                            <th style="${tableHeaderStyle}; width: 13%;">${
            showMeanValues ? "ARC Rate" : "ARC Total"
        }</th>
                            <th style="${tableHeaderStyle}; width: 13%;">ARC Acres</th>
                            <th style="${tableHeaderStyle}; width: 13%;">${
            showMeanValues ? "PLC Rate" : "PLC Total"
        }</th>
                            <th style="${tableHeaderStyle}; width: 13%;">PLC Acres</th>
                        </tr>
                    </thead>
                    <tbody>`;

        commoditiesToDisplay.forEach((commodity) => {
            const commodityData = countyData.commodities[commodity];
            if (!commodityData) return;

            const getValueForViewMode = (data: any) => {
                if (viewMode === "difference") {
                    return (data.proposedValue || 0) - (data.currentValue || 0);
                }
                if (viewMode === "proposed") {
                    return data.proposedValue || data.value || 0;
                }
                return data.currentValue || data.value || 0;
            };

            const getAcresForViewMode = (data: any) => {
                if (viewMode === "proposed") {
                    return data.proposedBaseAcres || data.baseAcres || 0;
                }
                return data.currentBaseAcres || data.baseAcres || 0;
            };

            const commodityValue = getValueForViewMode(commodityData);
            const commodityBaseAcres = getAcresForViewMode(commodityData);

            let commodityArcValue = 0;
            let commodityPlcValue = 0;
            let commodityArcAcres = 0;
            let commodityPlcAcres = 0;

            if (commodityData.programs) {
                if (Array.isArray(commodityData.programs)) {
                    commodityData.programs.forEach((program: any) => {
                        const programValue = getValueForViewMode({
                            currentValue: program.currentValue || program.totalPaymentInDollars || 0,
                            proposedValue: program.proposedValue || program.totalPaymentInDollars || 0
                        });
                        const programAcres = getAcresForViewMode({
                            currentBaseAcres: program.currentBaseAcres || program.baseAcres || 0,
                            proposedBaseAcres: program.proposedBaseAcres || program.baseAcres || 0
                        });

                        if (program.programName === "ARC-CO") {
                            commodityArcValue += programValue;
                            commodityArcAcres += programAcres;
                        } else if (program.programName === "PLC") {
                            commodityPlcValue += programValue;
                            commodityPlcAcres += programAcres;
                        }
                    });
                } else if (typeof commodityData.programs === "object") {
                    if (commodityData.programs["ARC-CO"]) {
                        const arcProgram = commodityData.programs["ARC-CO"];
                        commodityArcValue = getValueForViewMode(arcProgram);
                        commodityArcAcres = getAcresForViewMode(arcProgram);
                    }
                    if (commodityData.programs.PLC) {
                        const plcProgram = commodityData.programs.PLC;
                        commodityPlcValue = getValueForViewMode(plcProgram);
                        commodityPlcAcres = getAcresForViewMode(plcProgram);
                    }
                }
            }

            const totalCommodityProgramAcres = commodityArcAcres + commodityPlcAcres;
            let numberOfYears;
            if (selectedYears && selectedYears.length > 1) {
                numberOfYears = selectedYears.length;
            } else if (yearAggregation > 0) {
                numberOfYears = yearAggregation;
            } else {
                numberOfYears = 1;
            }

            let commodityArcRate = 0;
            let commodityPlcRate = 0;

            if (commodityArcAcres > 0) {
                commodityArcRate = commodityArcValue / commodityArcAcres;
            }

            if (commodityPlcAcres > 0) {
                commodityPlcRate = commodityPlcValue / commodityPlcAcres;
            }
            const actualCommodityBaseAcres =
                totalCommodityProgramAcres > 0 ? totalCommodityProgramAcres : commodityBaseAcres;

            let commodityRate = 0;
            if (actualCommodityBaseAcres > 0) {
                commodityRate = commodityValue / actualCommodityBaseAcres;
            }
            if (commodityValue > 0 || commodityBaseAcres > 0 || commodityArcValue > 0 || commodityPlcValue > 0) {
                const isMultiYear = selectedYears && selectedYears.length > 1;
                const hasAggregation = yearAggregation > 0;
                const actualBaseAcres =
                    totalCommodityProgramAcres > 0 ? totalCommodityProgramAcres : commodityBaseAcres;
                const displayBaseAcres = calculateDisplayBaseAcres(
                    actualBaseAcres,
                    isMultiYear,
                    hasAggregation,
                    selectedYears,
                    yearAggregation
                );
                const displayArcAcres = calculateDisplayBaseAcres(
                    commodityArcAcres,
                    isMultiYear,
                    hasAggregation,
                    selectedYears,
                    yearAggregation
                );
                const displayPlcAcres = calculateDisplayBaseAcres(
                    commodityPlcAcres,
                    isMultiYear,
                    hasAggregation,
                    selectedYears,
                    yearAggregation
                );
                const formatValue = (value: number, isRate = false) => {
                    if (viewMode === "difference") {
                        const sign = value >= 0 ? "+" : "";
                        if (isRate) {
                            return `${sign}$${ShortFormatPaymentRate(Math.abs(value), true)}/acre`;
                        }
                        return `${sign}$${ShortFormatInteger(Math.round(Math.abs(value)))}`;
                    }
                    if (isRate) {
                        return `$${ShortFormatPaymentRate(value)}/acre`;
                    }
                    return `$${ShortFormatInteger(Math.round(value))}`;
                };

                content += `
                        <tr>
                            <td style="${commodityHeaderStyle}">${commodity}</td>
                            <td style="${cellStyle}">${formatValue(
                    showMeanValues ? commodityRate : commodityValue,
                    showMeanValues
                )}</td>
                                                         <td style="${cellStyle}">${ShortFormatInteger(
                    displayBaseAcres
                )}</td>
                            <td style="${cellStyle}">${
                    commodityArcValue > 0
                        ? formatValue(showMeanValues ? commodityArcRate : commodityArcValue, showMeanValues)
                        : "-"
                }</td>
                            <td style="${cellStyle}">${
                    commodityArcAcres > 0 ? ShortFormatInteger(displayArcAcres) : "-"
                }</td>
                            <td style="${cellStyle}">${
                    commodityPlcValue > 0
                        ? formatValue(showMeanValues ? commodityPlcRate : commodityPlcValue, showMeanValues)
                        : "-"
                }</td>
                            <td style="${cellStyle}">${
                    commodityPlcAcres > 0 ? ShortFormatInteger(displayPlcAcres) : "-"
                }</td>
                        </tr>`;
            }
        });

        content += `
                    </tbody>
                </table>
            </td>
        </tr>`;
    } else {
        content += `
        <tr>
            <td colspan="2" style="padding: 4px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr>
                            <th style="${tableHeaderStyle}; text-align: left; width: 40%;">Commodity/Program</th>
                            <th style="${tableHeaderStyle}; width: 30%;">${
            showMeanValues ? "Rate ($/acre)" : "Total ($)"
        }</th>
                            <th style="${tableHeaderStyle}; width: 30%;">${baseAcresLabel}</th>
                        </tr>
                    </thead>
                    <tbody>`;

        commoditiesToDisplay.forEach((commodity) => {
            const commodityData = countyData.commodities[commodity];
            if (!commodityData) return;

            const getValueForProgram = (programData: any) => {
                if (!programData) return 0;
                if (viewMode === "difference") {
                    return (programData.proposedValue || 0) - (programData.currentValue || 0);
                }
                return programData.totalPaymentInDollars || programData.value || programData.currentValue || 0;
            };

            const getAcresForProgram = (programData: any) => {
                if (!programData) return 0;
                return programData.baseAcres || programData.currentBaseAcres || 0;
            };

            const getValueForViewMode = (data: any) => {
                if (viewMode === "difference") {
                    return (data.proposedValue || 0) - (data.currentValue || 0);
                }
                if (viewMode === "proposed") {
                    return data.proposedValue || data.value || 0;
                }
                return data.currentValue || data.value || 0;
            };

            const getAcresForViewMode = (data: any) => {
                if (viewMode === "proposed") {
                    return data.proposedBaseAcres || data.baseAcres || 0;
                }
                return data.currentBaseAcres || data.baseAcres || 0;
            };

            const commodityValue = getValueForViewMode(commodityData);
            const commodityBaseAcres = getAcresForViewMode(commodityData);
            const commodityRate = commodityBaseAcres > 0 ? commodityValue / commodityBaseAcres : 0;

            if (commodityValue > 0 || commodityBaseAcres > 0) {
                const isMultiYear = selectedYears && selectedYears.length > 1;
                const hasAggregation = yearAggregation > 0;

                const displayCommodityBaseAcres = calculateDisplayBaseAcres(
                    commodityBaseAcres,
                    isMultiYear,
                    hasAggregation,
                    selectedYears,
                    yearAggregation
                );
                const formatValue = (value, isRate = false) => {
                    if (viewMode === "difference") {
                        const sign = value >= 0 ? "+" : "";
                        if (isRate) {
                            return `${sign}$${ShortFormatPaymentRate(Math.abs(value), true)}/acre`;
                        }
                        return `${sign}$${ShortFormatInteger(Math.round(Math.abs(value)))}`;
                    }
                    if (isRate) {
                        return `$${ShortFormatPaymentRate(value)}/acre`;
                    }
                    return `$${ShortFormatInteger(Math.round(value))}`;
                };

                content += `
                        <tr>
                            <td style="${commodityHeaderStyle}">${commodity}</td>
                            <td style="${cellStyle}">${formatValue(
                    showMeanValues ? commodityRate : commodityValue,
                    showMeanValues
                )}</td>
                                                         <td style="${cellStyle}">${ShortFormatInteger(
                    displayCommodityBaseAcres
                )}</td>
                        </tr>`;

                if (commodityData.programs) {
                    programsToDisplay.forEach((program) => {
                        let programData = null;

                        if (Array.isArray(commodityData.programs)) {
                            programData = commodityData.programs.find((p) => p.programName === program);
                        } else if (typeof commodityData.programs === "object") {
                            programData = commodityData.programs[program];
                        }

                        if (programData) {
                            const programValue = getValueForProgram(programData);
                            const programBaseAcres = getAcresForProgram(programData);
                            const programRate = programBaseAcres > 0 ? programValue / programBaseAcres : 0;

                            if (programValue > 0 || programBaseAcres > 0) {
                                const displayProgramBaseAcres = calculateDisplayBaseAcres(
                                    programBaseAcres,
                                    isMultiYear,
                                    hasAggregation,
                                    selectedYears,
                                    yearAggregation
                                );
                                content += `
                        <tr>
                            <td style="text-align: left; vertical-align: middle; padding: 4px 8px; border: 1px solid rgba(47, 113, 100, 0.15); font-size: 0.9em; padding-left: 16px;">• ${program}</td>
                            <td style="${cellStyle}">${formatValue(
                                    showMeanValues ? programRate : programValue,
                                    showMeanValues
                                )}</td>
                                                         <td style="${cellStyle}">${ShortFormatInteger(
                                    displayProgramBaseAcres
                                )}</td>
                        </tr>`;
                            }
                        }
                    });
                }
            }
        });

        content += `
                    </tbody>
                </table>
            </td>
        </tr>`;
    }

    return content;
}
