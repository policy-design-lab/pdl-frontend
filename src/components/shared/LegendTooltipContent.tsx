import React from "react";
import { TooltipData, isRegionObject } from "./LegendTooltipUtils";

interface LegendTooltipContentProps {
    tooltipData: TooltipData;
    notDollar: boolean;
    regionType?: string;
}
export const LegendTooltipContent: React.FC<LegendTooltipContentProps> = ({
    tooltipData,
    notDollar,
    regionType = "county"
}) => {
    const getRegionPlural = () => {
        if (tooltipData.regionCount === 1) {
            return regionType;
        }
        return regionType === "county" ? "counties" : `${regionType}s`;
    };
    const regionPlural = getRegionPlural();
    const valueLabel = notDollar ? "Rate" : "Amount";
    const hasHighestValueInfo =
        tooltipData.regionCount === 0 &&
        isRegionObject(tooltipData.minRegion) &&
        isRegionObject(tooltipData.maxRegion) &&
        tooltipData.minRegion.value > 0;
    const percentileMatch = tooltipData.percentileRange.match(/(\d+)% - (\d+)%/);
    const startPercentile = percentileMatch ? percentileMatch[1] : "";
    const endPercentile = percentileMatch ? percentileMatch[2] : "";
    const isHighestRange = endPercentile === "100";
    const isLowestRange = startPercentile === "0";
    const isSameRegion =
        tooltipData.regionCount === 0 &&
        isRegionObject(tooltipData.minRegion) &&
        isRegionObject(tooltipData.maxRegion) &&
        tooltipData.minRegion.fips === tooltipData.maxRegion.fips;
    const formatValue = (value: number) => {
        const roundedValue = Math.round(value * 100) / 100;
        if (notDollar) {
            return roundedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return `$${roundedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const getCombinedText = () => {
        if (tooltipData.regionCount > 0) {
            if (isHighestRange) {
                return notDollar ? (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>payment rates</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range have the highest rates.
                        <div style={{ marginTop: "8px" }}>
                            This means they&apos;re in the top {100 - parseInt(startPercentile, 10)}% of all counties
                            when sorted by payment rate, receiving the most significant financial support per acre.
                        </div>
                    </>
                ) : (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>total payments</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range receive the highest payments.
                        <div style={{ marginTop: "8px" }}>
                            This means they&apos;re in the top {100 - parseInt(startPercentile, 10)}% of all counties
                            when sorted by total payment, receiving the most substantial overall financial support.
                        </div>
                    </>
                );
            }
            if (isLowestRange) {
                return notDollar ? (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>payment rates</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range have the lowest rates.
                        <div style={{ marginTop: "8px" }}>
                            This means they&apos;re in the bottom {parseInt(endPercentile, 10)}% of all counties when
                            sorted by payment rate, receiving minimal financial support per acre.
                        </div>
                    </>
                ) : (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>total payments</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range receive the lowest payments.
                        <div style={{ marginTop: "8px" }}>
                            This means they&apos;re in the bottom {parseInt(endPercentile, 10)}% of all counties when
                            sorted by total payment, receiving minimal overall financial support.
                        </div>
                    </>
                );
            }
            if (parseInt(startPercentile, 10) >= 80) {
                return notDollar ? (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>payment rates</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range have higher than average rates.
                        <div style={{ marginTop: "8px" }}>
                            If all counties were arranged from lowest to highest payment rate, these would be found
                            between the {startPercentile}% and {endPercentile}% mark, making them among the
                            top-performing counties.
                        </div>
                    </>
                ) : (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>total payments</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range receive higher than average payments.
                        <div style={{ marginTop: "8px" }}>
                            If all counties were arranged from lowest to highest total payment, these would be found
                            between the {startPercentile}% and {endPercentile}% mark, making them among the
                            top-performing counties.
                        </div>
                    </>
                );
            }
            if (parseInt(endPercentile, 10) <= 20) {
                return notDollar ? (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>payment rates</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range have lower than average rates.
                        <div style={{ marginTop: "8px" }}>
                            If all counties were arranged from lowest to highest payment rate, these would be found
                            between the {startPercentile}% and {endPercentile}% mark, placing them among counties
                            receiving less financial support per acre.
                        </div>
                    </>
                ) : (
                    <>
                        {tooltipData.regionCount} {regionPlural} with <strong>total payments</strong> in the{" "}
                        <strong>
                            {startPercentile}%-{endPercentile}%
                        </strong>{" "}
                        percentile range receive lower than average payments.
                        <div style={{ marginTop: "8px" }}>
                            If all counties were arranged from lowest to highest total payment, these would be found
                            between the {startPercentile}% and {endPercentile}% mark, placing them among counties
                            receiving less financial support overall.
                        </div>
                    </>
                );
            }
            return notDollar ? (
                <>
                    {tooltipData.regionCount} {regionPlural} with <strong>payment rates</strong> in the{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range have moderate rates.
                    <div style={{ marginTop: "8px" }}>
                        If all counties were arranged from lowest to highest payment rate, these would be found between
                        the {startPercentile}% and {endPercentile}% mark, representing the middle portion of the
                        distribution.
                    </div>
                </>
            ) : (
                <>
                    {tooltipData.regionCount} {regionPlural} with <strong>total payments</strong> in the{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range receive moderate payments.
                    <div style={{ marginTop: "8px" }}>
                        If all counties were arranged from lowest to highest total payment, these would be found between
                        the {startPercentile}% and {endPercentile}% mark, representing the middle portion of the
                        distribution.
                    </div>
                </>
            );
        }
        if (isHighestRange) {
            return notDollar ? (
                <>
                    The{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range shows the highest <strong>payment rate</strong> values.
                    <div style={{ marginTop: "8px" }}>
                        There are no {regionPlural} in this range, which would represent the top{" "}
                        {100 - parseInt(startPercentile, 10)}% of counties if any existed here.
                    </div>
                </>
            ) : (
                <>
                    The{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range shows the highest <strong>total payment</strong> values.
                    <div style={{ marginTop: "8px" }}>
                        There are no {regionPlural} in this range, which would represent the top{" "}
                        {100 - parseInt(startPercentile, 10)}% of counties if any existed here.
                    </div>
                </>
            );
        }
        if (isLowestRange) {
            return notDollar ? (
                <>
                    The{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range shows the lowest <strong>payment rate</strong> values.
                    <div style={{ marginTop: "8px" }}>
                        There are no {regionPlural} in this range, which would represent the bottom{" "}
                        {parseInt(endPercentile, 10)}% of counties if any existed here.
                    </div>
                </>
            ) : (
                <>
                    The{" "}
                    <strong>
                        {startPercentile}%-{endPercentile}%
                    </strong>{" "}
                    percentile range shows the lowest <strong>total payment</strong> values.
                    <div style={{ marginTop: "8px" }}>
                        There are no {regionPlural} in this range, which would represent the bottom{" "}
                        {parseInt(endPercentile, 10)}% of counties if any existed here.
                    </div>
                </>
            );
        }
        return notDollar ? (
            <>
                The{" "}
                <strong>
                    {startPercentile}%-{endPercentile}%
                </strong>{" "}
                percentile range has no {regionPlural} with <strong>payment rates</strong> that fall in this segment of
                the distribution.
                <div style={{ marginTop: "8px" }}>
                    If all counties were arranged from lowest to highest, this range would mark the area between{" "}
                    {startPercentile}% and {endPercentile}% of the way through.
                </div>
            </>
        ) : (
            <>
                The{" "}
                <strong>
                    {startPercentile}%-{endPercentile}%
                </strong>{" "}
                percentile range has no {regionPlural} with <strong>total payments</strong> that fall in this segment of
                the distribution.
                <div style={{ marginTop: "8px" }}>
                    If all counties were arranged from lowest to highest, this range would mark the area between{" "}
                    {startPercentile}% and {endPercentile}% of the way through.
                </div>
            </>
        );
    };
    return (
        <>
            <div style={{ marginBottom: "12px", lineHeight: "1.5", fontSize: "0.95rem" }}>{getCombinedText()}</div>
            {(tooltipData.regionCount > 0 || (hasHighestValueInfo && !isSameRegion)) &&
                isRegionObject(tooltipData.minRegion) &&
                isRegionObject(tooltipData.maxRegion) && (
                    <>
                        {hasHighestValueInfo && isSameRegion ? (
                            <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                                <strong>{isHighestRange ? "Highest Value" : "Only Value"}:</strong>{" "}
                                {tooltipData.maxRegion.name}
                                {tooltipData.maxRegion.state ? `, ${tooltipData.maxRegion.state}` : ""}:
                                {formatValue(tooltipData.maxRegion.value)}
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                                    <strong>Lowest {valueLabel}:</strong> {tooltipData.minRegion.name}
                                    {tooltipData.minRegion.state ? `, ${tooltipData.minRegion.state}` : ""}:
                                    {formatValue(tooltipData.minRegion.value)}
                                </div>
                                <div style={{ fontSize: "0.85rem" }}>
                                    <strong>Highest {valueLabel}:</strong> {tooltipData.maxRegion.name}
                                    {tooltipData.maxRegion.state ? `, ${tooltipData.maxRegion.state}` : ""}:
                                    {formatValue(tooltipData.maxRegion.value)}
                                </div>
                            </>
                        )}
                    </>
                )}
        </>
    );
};

export default LegendTooltipContent;
