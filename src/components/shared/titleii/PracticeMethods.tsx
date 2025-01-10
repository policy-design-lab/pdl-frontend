import legendConfig from "../../../utils/legendConfig.json";
import { ShortFormat } from "../ConvertionFormats";
import PracticeNameMatch from "./PracticeNameMatch";

export const getPracticeData = (statePerformance, year, selectedPractices) => {
    if (!statePerformance[year]) return [];

    return statePerformance[year]
        .map((state) => {
            let total = 0;
            if (selectedPractices.includes("All Practices")) {
                total = state.totalPaymentInDollars || 0;
            } else {
                selectedPractices.forEach((practice) => {
                    const practiceCode = PracticeNameMatch(practice);
                    if (!practiceCode) return;
                    state.statutes?.forEach((statute) => {
                        statute.practiceCategories?.forEach((category) => {
                            if (!category.practices || category.practices.length === 0) {
                                // Handle category level match
                                const categoryMatch = practice.includes(category.practiceCategoryName);
                                if (categoryMatch) {
                                    total += category.totalPaymentInDollars || 0;
                                }
                            } else {
                                category.practices.forEach((p) => {
                                    const practiceMatch = PracticeNameMatch(p.practiceName);
                                    if (practiceMatch === practiceCode) {
                                        total += p.totalPaymentInDollars || 0;
                                    }
                                });
                            }
                        });
                    });
                });
            }
            return total;
        })
        .filter((value) => value > 0);
};

export const getPracticeCategories = (practiceNames) => {
    if (!practiceNames || practiceNames.length === 0) {
        return ["All Practices"];
    }
    return ["All Practices", ...practiceNames];
};
export const calculateNationalTotalMap = (statePerformance, practices, year) => {
    let total = 0;
    if (!statePerformance[year]) return total;
    if (practices.includes("All Practices")) {
        statePerformance[year].forEach((state) => {
            total += state.totalPaymentInDollars || 0;
        });
        return total;
    }
    statePerformance[year].forEach((state) => {
        practices.forEach((practice) => {
            const practiceAmount = getPracticeTotal(state, practice);
            total += practiceAmount;
        });
    });

    return total;
};
export const getPracticeTotal = (record, practiceName) => {
    if (!record || !record.statutes) return 0;
    if (practiceName === "All Practices") {
        return record.totalPaymentInDollars || 0;
    }

    // Use PracticeNameMatch for consistent code extraction
    const codeMatch = PracticeNameMatch(practiceName);
    const practiceCode = codeMatch || null;
    // Strip anything in parentheses at the end
    const practiceName_noCode = practiceName.replace(/\s*\([^)]*\)$/, "");

    let total = 0;
    record.statutes?.forEach((statute) => {
        if (!statute.practiceCategories) return;
        statute.practiceCategories.forEach((category) => {
            // Match for category totals
            if (practiceName_noCode === category.practiceCategoryName) {
                total += category.totalPaymentInDollars || 0;
                return;
            }

            // Match for specific practices
            if (practiceCode && Array.isArray(category.practices) && category.practices.length > 0) {
                category.practices.forEach((practice) => {
                    // Use same PracticeNameMatch for consistent comparison
                    const currentPracticeCode = PracticeNameMatch(practice.practiceName);
                    if (currentPracticeCode === practiceCode) {
                        total += practice.totalPaymentInDollars || 0;
                    }
                });
            }
        });
    });

    return total;
};
export const getCustomScale = (practiceData, configName) => {
    if (practiceData.length === 0) return legendConfig[configName];

    const sortedData = [...practiceData].sort((a, b) => a - b);
    const quintileSize = Math.ceil(sortedData.length / 5);

    return [
        sortedData[quintileSize],
        sortedData[quintileSize * 2],
        sortedData[quintileSize * 3],
        sortedData[quintileSize * 4]
    ];
};

export const computeTooltipContent = (geo, record, selectedPractices, classes, getNationalTotal) => {
    if (!record) return "";
    let tooltipContent = `
        <div class="map_tooltip">
            <div class="${classes.tooltip_header}">
                <b>${geo.properties.name}</b>
            </div>
            <table class="${classes.tooltip_table}">
                <tbody>`;
    let practiceTotal = 0;
    const nationalTotal = getNationalTotal(selectedPractices);
    if (selectedPractices.includes("All Practices")) {
        practiceTotal = record.totalPaymentInDollars || 0;
        tooltipContent += `
                <tr>
                    <td class="${classes.tooltip_topcell_left}">All Practices:</td>
                    <td class="${classes.tooltip_topcell_right}">
                        $${ShortFormat(practiceTotal, undefined, 2)}
                    </td>
                </tr>`;
    } else {
        selectedPractices.forEach((practice, index) => {
            const practiceAmount = getPracticeTotal(record, practice);
            practiceTotal += practiceAmount;
            const displayName = practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "");

            // Calculate individual practice percentage
            const practiceNationalTotal = getNationalTotal([practice]);
            const practicePercentage = practiceNationalTotal > 0 ? (practiceAmount / practiceNationalTotal) * 100 : 0;

            tooltipContent += `
                    <tr>
                        <td class="${index === 0 ? classes.tooltip_topcell_left : classes.tooltip_regularcell_left}">
                            ${displayName}:
                        </td>
                        <td class="${index === 0 ? classes.tooltip_topcell_right : classes.tooltip_regularcell_right}">
                            $${ShortFormat(practiceAmount, undefined, 2)} (${practicePercentage.toFixed(2)}%)
                        </td>
                    </tr>`;
        });
    }
    const totalPercentage = nationalTotal > 0 ? (practiceTotal / nationalTotal) * 100 : 0;
    tooltipContent += `
                <tr>
                    <td class="${classes.tooltip_footer_left}">Total Benefits:</td>
                    <td class="${classes.tooltip_footer_right}">
                        $${ShortFormat(practiceTotal, undefined, 2)}
                    </td>
                </tr>
                <tr>
                    <td class="${classes.tooltip_bottomcell_left}">PCT. of Selected Practice(s):</td>
                    <td class="${classes.tooltip_bottomcell_right}">
                        ${totalPercentage > 0 ? `${totalPercentage.toFixed(2)}%` : "0%"}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`;

    return tooltipContent;
};
