import countyFipsMapping from "../../../files/maps/fips_county_mapping.json";
import { ShortFormat } from "../../shared/ConvertionFormats";
import { topTipStyle } from "../../shared/MapTooltip";
import { getPaymentRateForTooltip } from "../utils";

export const CountyTooltipContent = ({
    countyData,
    countyFIPS,
    viewMode,
    selectedCommodities,
    selectedPrograms,
    classes,
    showMeanValues,
    yearAggregation
}) => {
    if (!countyData) return "";
    const countyName = countyFipsMapping[countyFIPS] || `County ${countyFIPS}`;
    const syntheticDataNote = countyData.isSyntheticData
        ? `<div style="color: #666; margin-top: 8px; font-style: italic; font-size: 0.9em;">
            Note: This is sample data for display purposes only.
         </div>`
        : "";

    if (!countyData.hasData) {
        const stateFIPS = countyFIPS?.substring(0, 2);
        const stateName = stateFIPS ? countyFipsMapping[stateFIPS] || "" : "";
        const stateDisplay = stateName ? `, ${stateName}` : "";

        return `
        <div class="${classes.tooltip_overall}">
            <div class="${
                classes.tooltip_header
            }" style="background-color: rgba(47, 113, 100, 0.15); padding: 8px; border-radius: 4px 4px 0 0;">
                <b>${countyName}${stateDisplay}</b>
            </div>
            <table class="${classes.tooltip_table}" style="border-spacing: 0; width: 100%; padding: 8px 0 10px 0;">
            <tbody>
                <tr>
                    <td class="${
                        classes.tooltip_topcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        FIPS Code:
                    </td>
                    <td class="${
                        classes.tooltip_topcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        ${countyFIPS || "Unknown"}
                    </td>
                </tr>
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
            <div class="${
                classes.tooltip_header
            }" style="background-color: rgba(47, 113, 100, 0.15); padding: 8px; border-radius: 4px 4px 0 0;">
                <b>${countyName} (FIPS: ${countyFIPS || countyData.name})</b>
            </div>
            <table class="${classes.tooltip_table}" style="border-spacing: 0; width: 100%; padding: 8px 0 10px 0;">
            <tbody>`;

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
                ${ShortFormat(
                    viewMode === "proposed" ? countyData.proposedBaseAcres || 0 : countyData.currentBaseAcres || 0,
                    undefined,
                    1
                )}
            </td>
        </tr>`;

    if (viewMode === "difference") {
        tooltipContent += generateDifferenceTooltipContent(countyData, classes, showMeanValues);

        if (yearAggregation > 0 && countyData.yearlyData && Object.keys(countyData.yearlyData).length > 0) {
            tooltipContent += generateYearBreakdownDifferenceContent(countyData, classes, showMeanValues);
        }

        if (
            selectedCommodities &&
            !(selectedCommodities.length === 1 && selectedCommodities.includes("All Commodities"))
        ) {
            tooltipContent += generateCommodityDifferenceContent(
                countyData,
                selectedCommodities,
                classes,
                showMeanValues,
                viewMode,
                yearAggregation
            );
        }

        if (selectedPrograms && (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)) {
            tooltipContent += generateProgramDifferenceContent(countyData, selectedPrograms, classes, showMeanValues);
        }
    } else {
        tooltipContent += generateRegularTooltipContent(
            countyData,
            classes,
            showMeanValues,
            yearAggregation,
            selectedCommodities,
            selectedPrograms
        );

        if (
            selectedCommodities &&
            !(selectedCommodities.length === 1 && selectedCommodities.includes("All Commodities"))
        ) {
            tooltipContent += generateCommodityRegularContent(
                countyData,
                selectedCommodities,
                classes,
                showMeanValues,
                viewMode,
                yearAggregation
            );
        }

        if (selectedPrograms && (selectedPrograms.includes("All Programs") || selectedPrograms.length > 1)) {
            tooltipContent += generateProgramRegularContent(
                countyData,
                selectedPrograms,
                classes,
                showMeanValues,
                viewMode
            );
        }
    }
    tooltipContent += `
            </tbody>
            </table>
            ${syntheticDataNote}
        </div>
        <div style="height: 8px; background-color: #dadada;"></div>
    `;
    return tooltipContent;
};

function generateDifferenceTooltipContent(countyData, classes, showMeanValues) {
    const formatDiff = (value) => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${ShortFormat(value, undefined, 2)}`;
    };

    const isCurrentWeightedAvg = countyData.isCurrentMeanWeighted;
    const isProposedWeightedAvg = countyData.isProposedMeanWeighted;
    const meanRateDiff = countyData.meanRateDifference || 0;

    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
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
                $${ShortFormat(countyData.value, undefined, 2)} (${countyData.percentChange.toFixed(1)}%)
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
                ${formatDiff(meanRateDiff)}/acre
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
                $${ShortFormat(countyData.currentValue, undefined, 2)}
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
                $${ShortFormat(countyData.currentMeanRate || 0, undefined, 2)}/acre${
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
                $${ShortFormat(countyData.proposedValue, undefined, 2)}
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
                $${ShortFormat(countyData.proposedMeanRate || 0, undefined, 2)}/acre${
        isProposedWeightedAvg ? " (weighted avg)" : ""
    }
            </td>
        </tr>
    `;
    return content;
}

function generateRegularTooltipContent(
    countyData,
    classes,
    showMeanValues,
    yearAggregation,
    selectedCommodities,
    selectedPrograms
) {
    const viewMode = countyData.proposedValue > 0 ? "proposed" : "current";
    const totalPayment = viewMode === "proposed" ? countyData.proposedValue : countyData.currentValue;
    const meanRate = countyData.meanPaymentRateInDollarsPerAcre || 0;
    const baseAcres = countyData.baseAcres || 0;

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
            $${ShortFormat(totalPayment, undefined, 2)}
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
                $${ShortFormat(meanRate, undefined, 2)}/acre${countyData.isMeanWeighted ? " (weighted avg)" : ""}
            </td>
        </tr>`;
    }

    if (yearAggregation > 0 && countyData.yearlyData && Object.keys(countyData.yearlyData).length > 0) {
        content += generateYearBreakdownContent(countyData, classes, showMeanValues);
    }

    return content;
}

function generateCommodityDifferenceContent(
    countyData,
    selectedCommodities,
    classes,
    showMeanValues,
    viewMode,
    yearAggregation = 0
) {
    let content = "";
    const commoditiesToDisplay = selectedCommodities.includes("All Commodities")
        ? Object.keys(countyData.commodities)
        : selectedCommodities;

    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    if (commoditiesToDisplay.length > 0) {
        content += `<tr><td colspan="2" style="${sectionHeaderStyle}">Commodity Breakdown</td></tr>`;

        commoditiesToDisplay.forEach((commodity) => {
            const commodityData = countyData.commodities[commodity];
            if (commodityData) {
                let commodityCurrentValue = commodityData.currentValue || 0;
                let commodityProposedValue = commodityData.proposedValue || 0;

                if (typeof commodityCurrentValue === "string") {
                    commodityCurrentValue = parseFloat(commodityCurrentValue.replace(/[^0-9.-]+/g, ""));
                }
                if (typeof commodityProposedValue === "string") {
                    commodityProposedValue = parseFloat(commodityProposedValue.replace(/[^0-9.-]+/g, ""));
                }

                const difference = commodityProposedValue - commodityCurrentValue;
                const percentChange = commodityCurrentValue !== 0 ? (difference / commodityCurrentValue) * 100 : 0;

                const currentBaseAcres = commodityData.currentBaseAcres || 0;
                const proposedBaseAcres = commodityData.proposedBaseAcres || 0;

                content += `
                <tr>
                    <td colspan="2" style="${subSectionStyle}">
                        ${commodity}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px; ${diffHighlightStyle}">
                        Total Change:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px; ${diffHighlightStyle}">
                        $${ShortFormat(difference, undefined, 2)} (${percentChange.toFixed(1)}%)
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
                        $${ShortFormat(commodityCurrentValue, undefined, 2)}
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
                        $${ShortFormat(commodityProposedValue, undefined, 2)}
                    </td>
                </tr>`;

                if (
                    yearAggregation > 0 &&
                    commodityData.yearlyData &&
                    Object.keys(commodityData.yearlyData).length > 0
                ) {
                    const years = Object.keys(commodityData.yearlyData).sort((a, b) => b.localeCompare(a));
                    if (years.length > 0) {
                        content += `
                        <tr>
                            <td colspan="2" style="padding-left: 15px; font-style: italic; color: #2F7164; padding-top: 2px; text-align: left; font-weight: bold; font-size: 0.9rem;">
                                Yearly Breakdown:
                            </td>
                        </tr>`;

                        years.forEach((year) => {
                            const yearData = commodityData.yearlyData[year];
                            if (yearData) {
                                // Check for various property names to handle different data structures
                                const currentValue =
                                    yearData.currentValue !== undefined
                                        ? yearData.currentValue
                                        : yearData.current !== undefined
                                        ? yearData.current
                                        : yearData.value || 0;

                                const proposedValue =
                                    yearData.proposedValue !== undefined
                                        ? yearData.proposedValue
                                        : yearData.proposed !== undefined
                                        ? yearData.proposed
                                        : yearData.value || 0;

                                const difference = proposedValue - currentValue;
                                const percentChange = currentValue !== 0 ? (difference / currentValue) * 100 : 0;

                                content += `
                                <tr>
                                    <td class="${
                                        classes.tooltip_regularcell_left
                                    }" style="padding-left: 20px; text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                                        ${year} Change:
                                    </td>
                                    <td class="${
                                        classes.tooltip_regularcell_right
                                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                                        $${ShortFormat(difference, undefined, 2)} (${percentChange.toFixed(1)}%)
                                    </td>
                                </tr>
                                <tr>
                                    <td class="${
                                        classes.tooltip_regularcell_left
                                    }" style="padding-left: 20px; text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        ${year} Current:
                                    </td>
                                    <td class="${
                                        classes.tooltip_regularcell_right
                                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        $${ShortFormat(currentValue, undefined, 2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="${
                                        classes.tooltip_regularcell_left
                                    }" style="padding-left: 20px; text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        ${year} Proposed:
                                    </td>
                                    <td class="${
                                        classes.tooltip_regularcell_right
                                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        $${ShortFormat(proposedValue, undefined, 2)}
                                    </td>
                                </tr>`;
                            }
                        });
                    }
                }
            }
        });
    }

    return content;
}

function generateProgramDifferenceContent(countyData, selectedPrograms, classes, showMeanValues) {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">Program Breakdown</td></tr>`;

    let programsToDisplay = [];
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
            const formatDiff = (value) => {
                const sign = value >= 0 ? "+" : "";
                return `${sign}${ShortFormat(value, undefined, 2)}`;
            };

            content += `
            <tr>
                <td colspan="2" style="${subSectionStyle}">
                    ${program}
                </td>
            </tr>`;

            if (showMeanValues) {
                const currentRate = programData.currentMeanRate || 0;
                const proposedRate = programData.proposedMeanRate || 0;
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
                        ${formatDiff(diff)}/acre${isWeightedAvg ? " (weighted avg)" : ""}
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

            content += `
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Current Base Acres:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormat(programData.currentBaseAcres || 0, undefined, 1)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Proposed Base Acres:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormat(programData.proposedBaseAcres || 0, undefined, 1)}
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
                    $${ShortFormat(Math.abs(programData.currentValue || 0), undefined, 2)}
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
                    $${ShortFormat(Math.abs(programData.proposedValue || 0), undefined, 2)}
                </td>
            </tr>`;
        }
    });
    return content;
}

function generateProgramRegularContent(countyData, selectedPrograms, classes, showMeanValues, viewMode = "current") {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";

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
                <b>$${ShortFormat(Math.abs(countyData.value), undefined, 2)}</b>
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
                <b>$${ShortFormat(Math.abs(countyData.meanPaymentRateInDollarsPerAcre || 0), undefined, 2)}/acre${
            countyData.isMeanWeighted ? " (weighted avg)" : ""
        }</b>
            </td>
        </tr>`;
    }

    let programsToDisplay = [];
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

            const programMeanRate =
                viewMode === "proposed" ? programData.proposedMeanRate || 0 : programData.currentMeanRate || 0;

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
                    $${ShortFormat(programValue, undefined, 2)}
                </td>
            </tr>
            <tr>
                <td class="${
                    classes.tooltip_regularcell_left
                }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    Base Acres:
                </td>
                <td class="${
                    classes.tooltip_regularcell_right
                }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                    ${ShortFormat(baseAcresValue, undefined, 1)}
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
                    $${ShortFormat(Math.abs(programMeanRate), undefined, 2)}/acre
                </td>
            </tr>`;
        }
    });
    return content;
}

function generateYearBreakdownContent(countyData, classes, showMeanValues) {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const subSectionStyle =
        "background-color: rgba(47, 113, 100, 0.05); padding: 4px 5px; font-weight: bold; font-style: italic; color: #2F7164;";

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">County Yearly Breakdown</td></tr>`;

    const valueLabel = showMeanValues ? "County Payment Rate" : "County Total";
    content += `
    <tr>
        <td class="${
            classes.tooltip_topcell_left
        }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
            <b>${valueLabel}:</b>
        </td>
        <td class="${
            classes.tooltip_topcell_right
        }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
            <b>${
                showMeanValues
                    ? `$${ShortFormat(countyData.meanPaymentRateInDollarsPerAcre || 0, undefined, 2)}/acre`
                    : `$${ShortFormat(countyData.value, undefined, 2)}`
            }</b>
        </td>
    </tr>`;

    if (countyData.yearlyData) {
        const years = Object.keys(countyData.yearlyData).sort((a, b) => b.localeCompare(a));
        years.forEach((year) => {
            const yearData = countyData.yearlyData[year];
            if (yearData) {
                // Handle various possible property names
                const value =
                    yearData.value !== undefined
                        ? yearData.value
                        : yearData.total !== undefined
                        ? yearData.total
                        : yearData.current !== undefined
                        ? yearData.current
                        : 0;

                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        ${year} Payment:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        $${ShortFormat(value, undefined, 2)}
                    </td>
                </tr>`;

                if (yearData.baseAcres > 0) {
                    const yearlyRate = value / yearData.baseAcres;
                    content += `
                    <tr>
                        <td class="${
                            classes.tooltip_regularcell_left
                        }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                            ${year} Payment Rate:
                        </td>
                        <td class="${
                            classes.tooltip_regularcell_right
                        }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                            $${ShortFormat(yearlyRate, undefined, 2)}/acre
                        </td>
                    </tr>`;
                }
            }
        });
    }

    return content;
}

function generateYearBreakdownDifferenceContent(countyData, classes, showMeanValues) {
    const sectionHeaderStyle =
        "background-color: rgba(47, 113, 100, 0.1); font-weight: bold; text-align: center; padding: 5px; border-radius: 3px; margin-top: 6px;";
    const diffHighlightStyle = "background-color: rgba(156, 39, 176, 0.08); border-radius: 2px;";

    let content = `<tr><td colspan="2" style="${sectionHeaderStyle}">County Yearly Breakdown</td></tr>`;

    const valueLabel = showMeanValues ? "County Payment Rate Diff" : "County Total Diff";
    content += `
    <tr>
        <td class="${
            classes.tooltip_topcell_left
        }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
            <b>${valueLabel}:</b>
        </td>
        <td class="${
            classes.tooltip_topcell_right
        }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
            <b>${
                showMeanValues
                    ? `$${ShortFormat(countyData.meanRateDifference || 0, undefined, 2)}/acre`
                    : `$${ShortFormat(countyData.value, undefined, 2)}`
            }</b>
        </td>
    </tr>`;

    if (countyData.yearlyData) {
        const years = Object.keys(countyData.yearlyData).sort((a, b) => b.localeCompare(a));
        years.forEach((year) => {
            const yearData = countyData.yearlyData[year];
            if (yearData) {
                // The yearData might have either current/proposed values or just a value depending on the view mode
                // Let's handle both possibilities
                const currentValue =
                    yearData.currentValue !== undefined
                        ? yearData.currentValue
                        : yearData.current !== undefined
                        ? yearData.current
                        : yearData.value || 0;

                const proposedValue =
                    yearData.proposedValue !== undefined
                        ? yearData.proposedValue
                        : yearData.proposed !== undefined
                        ? yearData.proposed
                        : yearData.value || 0;

                const difference = proposedValue - currentValue;
                const percentChange = currentValue !== 0 ? (difference / currentValue) * 100 : 0;

                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                        ${year} Payment Change:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                        $${ShortFormat(difference, undefined, 2)} (${percentChange.toFixed(1)}%)
                    </td>
                </tr>`;

                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        ${year} Current:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        $${ShortFormat(currentValue, undefined, 2)}
                    </td>
                </tr>`;

                content += `
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        ${year} Proposed:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                        $${ShortFormat(proposedValue, undefined, 2)}
                    </td>
                </tr>`;

                if (yearData.baseAcres > 0) {
                    const currentRate = currentValue / yearData.baseAcres;
                    const proposedRate = proposedValue / yearData.baseAcres;
                    const rateDiff = proposedRate - currentRate;

                    content += `
                    <tr>
                        <td class="${
                            classes.tooltip_regularcell_left
                        }" style="text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                            ${year} Payment Rate Diff:
                        </td>
                        <td class="${
                            classes.tooltip_regularcell_right
                        }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px; ${diffHighlightStyle}">
                            $${ShortFormat(rateDiff, undefined, 2)}/acre
                        </td>
                    </tr>`;
                }
            }
        });
    }

    return content;
}

function generateCommodityRegularContent(
    countyData,
    selectedCommodities,
    classes,
    showMeanValues,
    viewMode = "current",
    yearAggregation = 0
) {
    let content = "";
    const commoditiesToDisplay = selectedCommodities.includes("All Commodities")
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
            if (commodityData && commodityData.value > 0) {
                let commodityValue = commodityData.value;
                if (typeof commodityValue === "string") {
                    commodityValue = parseFloat(commodityValue.replace(/[^0-9.-]+/g, ""));
                }

                const baseAcres =
                    viewMode === "proposed"
                        ? commodityData.proposedBaseAcres || 0
                        : commodityData.currentBaseAcres || 0;

                const commodityMeanRate = baseAcres > 0 ? commodityValue / baseAcres : 0;

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
                        $${ShortFormat(commodityValue, undefined, 2)}
                    </td>
                </tr>
                <tr>
                    <td class="${
                        classes.tooltip_regularcell_left
                    }" style="text-align: left; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        Base Acres:
                    </td>
                    <td class="${
                        classes.tooltip_regularcell_right
                    }" style="text-align: right; vertical-align: top; padding-top: 3px; padding-bottom: 3px;">
                        ${ShortFormat(baseAcres, undefined, 1)}
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
                        $${ShortFormat(commodityMeanRate, undefined, 2)}/acre
                    </td>
                </tr>`;

                if (
                    yearAggregation > 0 &&
                    commodityData.yearlyData &&
                    Object.keys(commodityData.yearlyData).length > 0
                ) {
                    const years = Object.keys(commodityData.yearlyData).sort((a, b) => b.localeCompare(a));
                    if (years.length > 0) {
                        content += `
                        <tr>
                            <td colspan="2" style="padding-left: 15px; font-style: italic; color: #2F7164; padding-top: 2px; text-align: left; font-weight: bold; font-size: 0.9rem;">
                                Yearly Breakdown:
                            </td>
                        </tr>`;

                        years.forEach((year) => {
                            const yearData = commodityData.yearlyData[year];
                            if (yearData) {
                                // Handle various possible property names
                                const value =
                                    yearData.value !== undefined
                                        ? yearData.value
                                        : yearData.total !== undefined
                                        ? yearData.total
                                        : viewMode === "proposed"
                                        ? yearData.proposed !== undefined
                                            ? yearData.proposed
                                            : 0
                                        : yearData.current !== undefined
                                        ? yearData.current
                                        : 0;

                                content += `
                                <tr>
                                    <td class="${
                                        classes.tooltip_regularcell_left
                                    }" style="padding-left: 20px; text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        ${year} Payment:
                                    </td>
                                    <td class="${
                                        classes.tooltip_regularcell_right
                                    }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                        $${ShortFormat(value, undefined, 2)}
                                    </td>
                                </tr>`;

                                if (yearData.baseAcres > 0) {
                                    const yearlyRate = value / yearData.baseAcres;
                                    content += `
                                    <tr>
                                        <td class="${
                                            classes.tooltip_regularcell_left
                                        }" style="padding-left: 20px; text-align: left; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                            ${year} Payment Rate:
                                        </td>
                                        <td class="${
                                            classes.tooltip_regularcell_right
                                        }" style="text-align: right; vertical-align: top; padding-top: 2px; padding-bottom: 2px;">
                                            $${ShortFormat(yearlyRate, undefined, 2)}/acre
                                        </td>
                                    </tr>`;
                                }
                            }
                        });
                    }
                }
            }
        });
    }
    return content;
}
