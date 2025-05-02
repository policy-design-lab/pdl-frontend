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
    const regionPlural = regionType + (tooltipData.regionCount !== 1 ? "s" : "");
    const valueType = notDollar ? "payment rates" : "payment amounts";
    const hasHighestValueInfo =
        tooltipData.regionCount === 0 &&
        isRegionObject(tooltipData.minRegion) &&
        isRegionObject(tooltipData.maxRegion) &&
        tooltipData.minRegion.value > 0;
    const percentileMatch = tooltipData.percentileRange.match(/(\d+)% - (\d+)%/);
    const startPercentile = percentileMatch ? percentileMatch[1] : "";
    const endPercentile = percentileMatch ? percentileMatch[2] : "";
    const isHighestRange = endPercentile === "100";

    return (
        <>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Percentile Range: {tooltipData.percentileRange}
            </div>
        <div style={{ marginBottom: "8px", lineHeight: "1.4", fontSize: "0.9rem" }}>
          {tooltipData.regionCount > 0 ? (
            `${tooltipData.regionCount} ${regionPlural} with ${valueType} that fall between the ${startPercentile}th and ${endPercentile}th percentiles of all values`
          ) : isHighestRange ? (
            `This represents the highest value range (${startPercentile}%-${endPercentile}%). There are no ${regionPlural} with values in this specific range.`
          ) : (
            `There are no ${regionPlural} with ${valueType} that fall between the ${startPercentile}th and ${endPercentile}th percentiles.`
          )}
          </div>
          {(tooltipData.regionCount > 0 || hasHighestValueInfo) &&
       isRegionObject(tooltipData.minRegion) && 
       isRegionObject(tooltipData.maxRegion) && (
       <>
                        {hasHighestValueInfo ? (
              <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                                <strong>Highest Value:</strong> {tooltipData.maxRegion.name}
                {tooltipData.maxRegion.state ? `, ${tooltipData.maxRegion.state}` : ""}: 
                {notDollar ? tooltipData.maxRegion.value.toLocaleString() : `$${tooltipData.maxRegion.value.toLocaleString()}`}
                            </div>
                        ) : (
                            <>
                <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                  <strong>Lowest:</strong> {tooltipData.minRegion.name}
                  {tooltipData.minRegion.state ? `, ${tooltipData.minRegion.state}` : ""}: 
                  {notDollar ? tooltipData.minRegion.value.toLocaleString() : `$${tooltipData.minRegion.value.toLocaleString()}`}
                                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  <strong>Highest:</strong> {tooltipData.maxRegion.name}
                  {tooltipData.maxRegion.state ? `, ${tooltipData.maxRegion.state}` : ""}: 
                  {notDollar ? tooltipData.maxRegion.value.toLocaleString() : `$${tooltipData.maxRegion.value.toLocaleString()}`}
                                </div>
                            </>
                        )}
                    </>
                )}
        </>
    );
};

export default LegendTooltipContent;
