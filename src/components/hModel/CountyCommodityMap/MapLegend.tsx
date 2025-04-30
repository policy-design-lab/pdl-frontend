import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import DrawLegend from "../../shared/DrawLegend";
import EnhancedColorLegend from "../../EnhancedColorLegend";
import { DistributionType, detectDistributionType } from "../../shared/DistributionFunctions";
const MapLegend = ({
    mapData,
    mapColor,
    viewMode,
    selectedYear,
    selectedState,
    yearAggregation,
    showMeanValues,
    proposedPolicyName,
    onDistributionChange,
    distributionType: externalDistributionType
}) => {
    const [distributionType, setDistributionType] = useState<DistributionType>(
        externalDistributionType || "leftSkewed"
    );
    useEffect(() => {
        if (externalDistributionType && externalDistributionType !== distributionType) {
            setDistributionType(externalDistributionType);
        }
    }, [externalDistributionType]);
    useEffect(() => {
        if (!externalDistributionType && mapData && mapData.data && mapData.data.length > 0) {
            const detectedType = detectDistributionType(mapData.data);
            setDistributionType(detectedType);
        }
    }, [mapData.data, externalDistributionType]);
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);
    const getLegendTitle = () => {
        let title = "";
        if (viewMode === "difference") {
            title = `${
                showMeanValues ? "Mean Rate" : "Payment"
            } Differences Between Current and Proposed Policy for ${selectedYear}`;
        } else if (showMeanValues) {
            title = `Mean Payment Rates for ${selectedYear}`;
        } else {
            title = `Total Payments for ${selectedYear}`;
        }
        if (selectedState !== "All States") {
            title += ` in ${selectedState}`;
        }
        if (yearAggregation > 0 && !showMeanValues) {
            title += ` (Aggregated with previous ${yearAggregation} year${yearAggregation > 1 ? "s" : ""})`;
        }
        if (viewMode !== "difference") {
            title += viewMode === "current" ? " (Current Policy)" : ` (${proposedPolicyName})`;
        }
        return title;
    };
    const handleDistributionChange = (newType: DistributionType) => {
        setDistributionType(newType);
        if (onDistributionChange) {
            onDistributionChange(newType);
        }
    };
    const titleElement = (
        <Box display="flex" justifyContent="center">
            <Typography noWrap variant="h6">
                {getLegendTitle()}
            </Typography>
        </Box>
    );
    if (mapData.thresholds && mapData.thresholds.length > 0) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <EnhancedColorLegend
                    key={`${selectedYear}-${viewMode}-${showMeanValues}-${distributionType}-${mapData.thresholds.length}`}
                    colors={mapColor}
                    thresholds={mapData.thresholds}
                    title={titleElement}
                    distributionType={distributionType}
                    onDistributionChange={handleDistributionChange}
                />
            </Box>
        );
    }
    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <DrawLegend
                key={`${selectedYear}-${viewMode}-${showMeanValues}-${mapData.thresholds.join(
                    ","
                )}-${selectedState}-${yearAggregation}`}
                colorScale={colorScale}
                title={
                    <Box display="flex" justifyContent="center" sx={{ ml: 10 }}>
                        <Typography noWrap variant="h6">
                            {getLegendTitle()}
                        </Typography>
                    </Box>
                }
                programData={mapData.data}
                prepColor={mapColor}
                emptyState={[]}
                isRatio={false}
                notDollar={!!showMeanValues}
            />
        </Box>
    );
};
export default MapLegend;
