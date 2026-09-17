export const formatYearDisplay = (selectedYear: string | string[]): string => {
    if (!Array.isArray(selectedYear)) {
        return selectedYear;
    }
    if (selectedYear.length <= 1) {
        return selectedYear[0] ?? "";
    }
    const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const areConsecutive = sortedYears.every(
        (year, index) => index === 0 || parseInt(year, 10) - parseInt(sortedYears[index - 1], 10) === 1
    );
    if (areConsecutive) {
        return `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`;
    }
    if (sortedYears.length <= 4) {
        return sortedYears.join(", ");
    }
    return `${sortedYears.length} Selected Years (${sortedYears[0]} to ${sortedYears[sortedYears.length - 1]})`;
};

export const formatSelectionTitle = (
    metricLabel: string,
    selectedYears: string[],
    selectedCrops: string[],
    allCropsSentinel: string,
    allCropsLabel = "All Commodities",
    selectedState = "All States"
): string => {
    const cropDisplay = formatCommoditySelection(selectedCrops, allCropsSentinel) || allCropsLabel;
    const yearDisplay = formatYearDisplay(selectedYears);
    const aggregated = selectedYears.length > 1 ? " - Aggregated" : "";
    const statePart = selectedState !== "All States" ? ` - ${selectedState}` : "";
    return `${metricLabel} for ${cropDisplay} (${yearDisplay})${aggregated}${statePart}`;
};

export const csvFilenameFromTitle = (title: string): string =>
    `${title
        .replace(/[/\\:*?"<>|]/g, " ")
        .replace(/\s+/g, " ")
        .trim()}.csv`;

export const formatCommoditySelection = (selectedCommodities: string[], allSentinel: string): string => {
    if (!selectedCommodities || selectedCommodities.length === 0 || selectedCommodities.includes(allSentinel)) {
        return "";
    }
    if (selectedCommodities.length <= 3) {
        return selectedCommodities.join(", ");
    }
    return `${selectedCommodities.length} Selected Commodities`;
};

export const generateTableTitle = (
    selectedYear: string | string[],
    selectedCommodities: string[],
    selectedPrograms: string[],
    viewMode: string,
    isAggregatedYear: boolean,
    showMeanValues = false,
    currentPolicyTitle = "Current Policy",
    proposedPolicyTitle = "Proposed Policy"
): string => {
    const isMultiYearSelection = Array.isArray(selectedYear) && selectedYear.length > 1;
    const yearDisplay = formatYearDisplay(selectedYear);
    let title = "";
    let policyMode = "";
    let metrics = "";
    if (viewMode === "difference") {
        policyMode = "Policy Differences";
        metrics = showMeanValues ? "Mean Rate" : "Payment";
        title = `${metrics} Differences Between Current and Proposed Policy`;
    } else {
        policyMode = viewMode === "current" ? currentPolicyTitle : proposedPolicyTitle;
        metrics = showMeanValues ? "Payment Rate ($/base acre)" : "Total Payments";
        title = `${policyMode}: ${metrics}`;
    }
    const commodityPart = formatCommoditySelection(selectedCommodities, "All Program Crops");
    if (commodityPart !== "") {
        title += ` for ${commodityPart}`;
    }
    title += ` (${yearDisplay})`;
    if (isMultiYearSelection || isAggregatedYear) {
        title += " - Aggregated";
    }
    return title;
};
