import countyFipsMapping from "../../../files/maps/fips_county_mapping.json";
import { ShortFormat } from "../../shared/ConvertionFormats";
import { topTipStyle } from "../../shared/MapTooltip";

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
    
    let tooltipContent = `
        <div class="${classes.tooltip_overall}">
            <div class="${classes.tooltip_header}">
                <b>${countyName} (FIPS: ${countyData.name})</b>
            </div>
            <table class="${classes.tooltip_table}">
            <tbody>`;
    const shouldShowMeanValues =
        showMeanValues &&
        selectedPrograms.length === 1 &&
        !selectedPrograms.includes("All Programs") &&
        (selectedPrograms[0].includes("ARC") || selectedPrograms[0].includes("PLC"));
    if (viewMode === "difference") {
        tooltipContent += generateDifferenceTooltipContent(countyData, classes, shouldShowMeanValues);
        
        if (selectedCommodities && !(selectedCommodities.length === 1 && selectedCommodities.includes("All Commodities"))) {
            tooltipContent += generateCommodityDifferenceContent(countyData, selectedCommodities, classes, shouldShowMeanValues);
        }
        
        if (selectedPrograms && !selectedPrograms.includes("All Programs") && selectedPrograms.length > 1) {
            tooltipContent += generateProgramDifferenceContent(
                countyData,
                selectedPrograms,
                classes,
                shouldShowMeanValues
            );
        }
    } else {
        tooltipContent += generateRegularTooltipContent(countyData, classes, shouldShowMeanValues, yearAggregation, selectedCommodities, selectedPrograms);
        
        if (selectedPrograms && !selectedPrograms.includes("All Programs") && selectedPrograms.length > 1) {
            tooltipContent += generateProgramRegularContent(
                countyData,
                selectedPrograms,
                classes,
                shouldShowMeanValues
            );
        }
    }
    tooltipContent += `
            </tbody>
            </table>
        </div>
    `;
    return tooltipContent;
};

function generateDifferenceTooltipContent(countyData, classes, shouldShowMeanValues) {
    let content = "";
    if (shouldShowMeanValues) {
        const meanRateDiff = countyData.meanRateDifference || 0;
        const medianRateDiff = countyData.medianRateDifference || 0;
        const formatDiff = (value) => {
            const sign = value >= 0 ? "+" : "";
            return `${sign}${ShortFormat(value, undefined, 2)}`;
        };
        content = `
            <tr style="${topTipStyle}">
                <td class="${classes.tooltip_topcell_left}">
                    Mean Rate Change:
                </td>
                <td class="${classes.tooltip_topcell_right}">
                    ${formatDiff(meanRateDiff)}/acre
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    Current Mean Rate:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(countyData.currentMeanRate || 0, undefined, 2)}/acre
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    Proposed Mean Rate:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(countyData.proposedMeanRate || 0, undefined, 2)}/acre
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    Median Rate Change:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    ${formatDiff(medianRateDiff)}/acre
                </td>
            </tr>
        `;
        return content;
    }
    return `
        <tr style="${topTipStyle}">
                <td class="${classes.tooltip_topcell_left}">
                    Change in Total Payment:
                </td>
                <td class="${classes.tooltip_topcell_right}">
                    $${ShortFormat(countyData.value, undefined, 2)} (${countyData.percentChange.toFixed(1)}%)
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    Current Policy:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(countyData.currentValue, undefined, 2)}
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    Proposed Policy:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(countyData.proposedValue, undefined, 2)}
                </td>
            </tr>
    `;
}

function generateRegularTooltipContent(countyData, classes, shouldShowMeanValues, yearAggregation, selectedCommodities, selectedPrograms) {
    const meanRate = shouldShowMeanValues ? countyData.meanPaymentRateInDollarsPerAcre || 0 : countyData.meanRate || 0;
    const medianRate = shouldShowMeanValues ? countyData.medianPaymentRateInDollarsPerAcre || 0 : countyData.medianRate || 0;
    
    let content = `
        <tr style="${topTipStyle}">
            <td class="${classes.tooltip_topcell_left}">
                ${shouldShowMeanValues ? 'Mean Payment Rate:' : 'Total Payment:'}
            </td>
            <td class="${classes.tooltip_topcell_right}">
                ${shouldShowMeanValues ? 
                    `$${ShortFormat(meanRate, undefined, 2)}/acre` : 
                    `$${ShortFormat(countyData.value, undefined, 2)}`}
            </td>
        </tr>
        <tr>
            <td class="${classes.tooltip_regularcell_left}">
                Base Acres:
            </td>
            <td class="${classes.tooltip_regularcell_right}">
                ${ShortFormat(countyData.baseAcres, undefined, 1)}
            </td>
        </tr>
        ${shouldShowMeanValues ? `
        <tr>
            <td class="${classes.tooltip_regularcell_left}">
                Median Payment Rate:
            </td>
            <td class="${classes.tooltip_regularcell_right}">
                $${ShortFormat(medianRate, undefined, 2)}/acre
            </td>
        </tr>
        ` : ''}
    `;
    
    if (yearAggregation > 0 && !shouldShowMeanValues && countyData.yearlyData) {
        content += `<tr><td colspan="2" class="${classes.tooltip_section_header}">Yearly Breakdown</td></tr>`;
        
        const years = Object.keys(countyData.yearlyData).sort((a, b) => b.localeCompare(a));
        
        content += `
        <tr>
            <td class="${classes.tooltip_topcell_left}">
                <b>Total (All Years):</b>
            </td>
            <td class="${classes.tooltip_topcell_right}">
                <b>$${ShortFormat(countyData.value, undefined, 2)}</b>
            </td>
        </tr>`;
        
        years.forEach(year => {
            const yearData = countyData.yearlyData[year];
            if (yearData && yearData.value > 0) {
                content += `
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${year}:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        $${ShortFormat(yearData.value, undefined, 2)}
                    </td>
                </tr>`;
            }
        });
    }
    
    if (selectedCommodities && 
        !(selectedCommodities.length === 1 && selectedCommodities.includes("All Commodities"))) {
        
        const commoditiesToDisplay = selectedCommodities.includes("All Commodities") 
            ? Object.keys(countyData.commodities)
            : selectedCommodities;
        
        if (commoditiesToDisplay.length > 0) {
            content += `<tr><td colspan="2" class="${classes.tooltip_section_header}">Commodity Breakdown</td></tr>`;
            
            if (commoditiesToDisplay.length > 1) {
                content += `
                <tr>
                    <td class="${classes.tooltip_topcell_left}">
                        <b>Total (All Commodities):</b>
                    </td>
                    <td class="${classes.tooltip_topcell_right}">
                        <b>${shouldShowMeanValues ? 
                            `$${ShortFormat(meanRate, undefined, 2)}/acre` : 
                            `$${ShortFormat(countyData.value, undefined, 2)}`}</b>
                    </td>
                </tr>`;
            }
            
            commoditiesToDisplay.forEach(commodity => {
                const commodityData = countyData.commodities[commodity];
                
                if (commodityData) {
                    let commodityMeanRate = 0;
                    let commodityValue = commodityData.value;
                    
                    if (shouldShowMeanValues && commodityData.baseAcres > 0) {
                        if (selectedPrograms.length === 1 && !selectedPrograms.includes("All Programs")) {
                            commodityMeanRate = commodityData.value / commodityData.baseAcres;
                        } else {
                            commodityMeanRate = commodityData.value / commodityData.baseAcres;
                        }
                    }
                    
                    content += `
                    <tr>
                        <td class="${classes.tooltip_regularcell_left}">
                            ${commodity}:
                        </td>
                        <td class="${classes.tooltip_regularcell_right}">
                            ${shouldShowMeanValues ? 
                                `$${ShortFormat(commodityMeanRate, undefined, 2)}/acre` : 
                                `$${ShortFormat(commodityValue, undefined, 2)}`}
                        </td>
                    </tr>`;
                    
                    content += `
                    <tr>
                        <td class="${classes.tooltip_regularcell_left}">
                            ${commodity} Base Acres:
                        </td>
                        <td class="${classes.tooltip_regularcell_right}">
                            ${ShortFormat(commodityData.baseAcres, undefined, 1)}
                        </td>
                    </tr>`;
                } else {
                    content += `
                    <tr>
                        <td class="${classes.tooltip_regularcell_left}">
                            ${commodity}:
                        </td>
                        <td class="${classes.tooltip_regularcell_right}">
                            No data for this county
                        </td>
                    </tr>`;
                }
            });
        }
    }
    
    return content;
}

function generateCommodityDifferenceContent(countyData, selectedCommodities, classes, shouldShowMeanValues) {
    const commoditiesToDisplay = selectedCommodities.includes("All Commodities") 
        ? Object.keys(countyData.commodities)
        : selectedCommodities;
    
    if (commoditiesToDisplay.length === 0) {
        return '';
    }
    
    let content = `<tr><td colspan="2" class="${classes.tooltip_section_header}">Selected Commodities</td></tr>`;
    
    if (commoditiesToDisplay.length > 1) {
        if (shouldShowMeanValues) {
            const meanRateDiff = countyData.meanRateDifference || 0;
            const formatDiff = (value) => {
                const sign = value >= 0 ? "+" : "";
                return `${sign}${ShortFormat(value, undefined, 2)}`;
            };
            
            content += `
            <tr>
                <td class="${classes.tooltip_topcell_left}">
                    <b>Total Mean Rate Change:</b>
                </td>
                <td class="${classes.tooltip_topcell_right}">
                    <b>${formatDiff(meanRateDiff)}/acre</b>
                </td>
            </tr>`;
        } else {
            content += `
            <tr>
                <td class="${classes.tooltip_topcell_left}">
                    <b>Total Change:</b>
                </td>
                <td class="${classes.tooltip_topcell_right}">
                    <b>$${ShortFormat(countyData.value, undefined, 2)}</b>
                </td>
            </tr>`;
        }
    }
    
    commoditiesToDisplay.forEach((commodity) => {
        const commodityData = countyData.commodities[commodity];
        if (commodityData) {
            if (shouldShowMeanValues && commodityData.baseAcres > 0) {
                const currentMeanRate = commodityData.currentValue / commodityData.currentBaseAcres || 0;
                const proposedMeanRate = commodityData.proposedValue / commodityData.proposedBaseAcres || 0;
                const meanRateDiff = proposedMeanRate - currentMeanRate;
                
                const formatDiff = (value) => {
                    const sign = value >= 0 ? "+" : "";
                    return `${sign}${ShortFormat(value, undefined, 2)}`;
                };
                
                content += `
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${commodity} Mean Rate Change:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        ${formatDiff(meanRateDiff)}/acre
                    </td>
                </tr>
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${commodity} Base Acres:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        ${ShortFormat(commodityData.baseAcres, undefined, 1)}
                    </td>
                </tr>`;
            } else {
                const percentChange = commodityData.currentValue !== 0 
                    ? (commodityData.value / commodityData.currentValue) * 100 
                    : 0;
                
                content += `
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${commodity}:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        $${ShortFormat(commodityData.value, undefined, 2)} (${percentChange.toFixed(1)}%)
                    </td>
                </tr>
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${commodity} Base Acres:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        ${ShortFormat(commodityData.baseAcres, undefined, 1)}
                    </td>
                </tr>`;
            }
        } else {
            content += `
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    ${commodity}:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    No data for this county
                </td>
            </tr>`;
        }
    });
    return content;
}

function generateProgramDifferenceContent(countyData, selectedPrograms, classes, showMeanValues) {
    let content = `<tr><td colspan="2" class="${classes.tooltip_section_header}">Selected Programs</td></tr>`;
    selectedPrograms.forEach((program) => {
        const programData = countyData.programs[program];
        if (programData) {
            if (showMeanValues) {
                const meanRateChange = programData.proposedMeanRate - programData.currentMeanRate;
                const medianRateChange = programData.proposedMedianRate - programData.currentMedianRate;
                const formatDiff = (value) => {
                    const sign = value >= 0 ? "+" : "";
                    return `${sign}${ShortFormat(value, undefined, 2)}`;
                };

                content += `
                <tr>
                  <td class="${classes.tooltip_regularcell_left}">
                    ${program} Mean Rate Change:
                  </td>
                  <td class="${classes.tooltip_regularcell_right}">
                    ${formatDiff(meanRateChange)}/acre
                  </td>
                </tr>
                <tr>
                  <td class="${classes.tooltip_regularcell_left}">
                    ${program} Median Rate Change:
                  </td>
                  <td class="${classes.tooltip_regularcell_right}">
                    ${formatDiff(medianRateChange)}/acre
                  </td>
                </tr>`;
            } else {
                content += `
                <tr>
                  <td class="${classes.tooltip_regularcell_left}">
                    ${program}:
                  </td>
                  <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(programData.value, undefined, 2)}
                  </td>
                </tr>`;
            }
        }
    });
    return content;
}

function generateProgramRegularContent(countyData, selectedPrograms, classes, showMeanValues) {
    let content = `<tr><td colspan="2" class="${classes.tooltip_section_header}">Selected Programs</td></tr>`;
    selectedPrograms.forEach((program) => {
        const programData = countyData.programs[program];
        if (programData) {
            if (showMeanValues) {
                content += `
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${program} Mean Rate:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        $${ShortFormat(programData.meanPaymentRateInDollarsPerAcre || 0, undefined, 2)}/acre
                    </td>
                </tr>
                <tr>
                    <td class="${classes.tooltip_regularcell_left}">
                        ${program} Median Rate:
                    </td>
                    <td class="${classes.tooltip_regularcell_right}">
                        $${ShortFormat(programData.medianPaymentRateInDollarsPerAcre || 0, undefined, 2)}/acre
                    </td>
                </tr>`;
            }

            content += `
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    ${program}:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    $${ShortFormat(programData.value, undefined, 2)}
                </td>
            </tr>
            <tr>
                <td class="${classes.tooltip_regularcell_left}">
                    ${program} Base Acres:
                </td>
                <td class="${classes.tooltip_regularcell_right}">
                    ${ShortFormat(programData.baseAcres, undefined, 1)}
                </td>
            </tr>`;
        }
    });
    return content;
}
