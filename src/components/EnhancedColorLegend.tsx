import * as React from "react";
import { Box, Tooltip, Typography, Paper } from "@mui/material";
import { DistributionType } from "./shared/DistributionFunctions";
import DistributionSelector from "./DistributionSelector";
interface EnhancedColorLegendProps {
    colors: string[];
    thresholds: number[];
    title?: React.ReactNode;
    distributionType: DistributionType;
    onDistributionChange: (type: DistributionType) => void;
    showDistributionSelector?: boolean;
}
const EnhancedColorLegend: React.FC<EnhancedColorLegendProps> = ({
    colors,
    thresholds,
    title,
    distributionType,
    onDistributionChange,
    showDistributionSelector = true
}) => {
    const getPercentileLabels = (): string[] => {
        switch (distributionType) {
            case "leftSkewed":
                return ["0%", "15%", "30%", "45%", "60%", "75%", "80%", "85%", "90%", "95%", "100%"];
            case "rightSkewed":
                return ["0%", "5%", "10%", "15%", "20%", "25%", "40%", "55%", "70%", "85%", "100%"];
            case "normal":
                return ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
            default:
                return ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
        }
    };
    const percentileLabels = getPercentileLabels();
    const renderColorBlock = (color: string, index: number) => {
        if (index >= colors.length || index >= thresholds.length - 1) return null;
        const percentileIndex = Math.min(index, percentileLabels.length - 2);
        const nextPercentileIndex = Math.min(percentileIndex + 1, percentileLabels.length - 1);
        const currentPercentile = percentileLabels[percentileIndex];
        const nextPercentile = percentileLabels[nextPercentileIndex];
        const tooltipContent = (
            <TooltipContent
                index={index}
                percentileLabel={currentPercentile}
                nextPercentileLabel={nextPercentile}
                threshold={thresholds[index]}
                nextThreshold={thresholds[index + 1]}
            />
        );
        return (
            <Tooltip key={`color-${index}`} title={tooltipContent} arrow placement="top">
                <Box
                    sx={{
                        bgcolor: color,
                        flex: 1,
                        minWidth: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "help",
                        position: "relative"
                    }}
                />
            </Tooltip>
        );
    };
    const getDistributionDescription = (): string => {
        switch (distributionType) {
            case "leftSkewed":
                return "More detail in higher values";
            case "rightSkewed":
                return "More detail in lower values";
            case "normal":
                return "Equal divisions across range";
            default:
                return "";
        }
    };
    return (
        <Paper
            elevation={1}
            sx={{
                p: 2,
                width: "100%",
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "none"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                {title && <Box sx={{ mb: 2 }}>{title}</Box>}
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                        <Typography sx={{ mr: 2, minWidth: 70 }}>Quantile:</Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flex: 1,
                                position: "relative",
                                height: 30
                            }}
                        >
                            {colors.map((color, index) => renderColorBlock(color, index))}
                            {/* Render percentile labels for all intervals */}
                            {percentileLabels.map((label, labelIndex) => {
                                const position =
                                    labelIndex === 0
                                        ? 0
                                        : labelIndex === percentileLabels.length - 1
                                        ? 100
                                        : (labelIndex / (percentileLabels.length - 1)) * 100;
                                return (
                                    <Typography
                                        key={`label-${labelIndex}`}
                                        sx={{
                                            position: "absolute",
                                            bottom: -25,
                                            left: `${position}%`,
                                            transform:
                                                labelIndex === 0
                                                    ? "translateX(0)"
                                                    : labelIndex === percentileLabels.length - 1
                                                    ? "translateX(-100%)"
                                                    : "translateX(-50%)",
                                            fontSize: "0.75rem",
                                            color: "text.secondary"
                                        }}
                                    >
                                        {label}
                                    </Typography>
                                );
                            })}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            mt: 2
                        }}
                    >
                        <Typography variant="caption" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                            {getDistributionDescription()}
                        </Typography>
                        {showDistributionSelector && (
                            <DistributionSelector
                                distributionType={distributionType}
                                onDistributionChange={onDistributionChange}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};
interface TooltipContentProps {
    index: number;
    percentileLabel: string;
    nextPercentileLabel: string;
    threshold: number;
    nextThreshold?: number;
}
const TooltipContent: React.FC<TooltipContentProps> = ({
    index,
    percentileLabel,
    nextPercentileLabel,
    threshold,
    nextThreshold
}) => {
    const formatValue = (value: number): string => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        } else {
            return `$${value.toFixed(0)}`;
        }
    };
    return (
        <Box sx={{ p: 1, maxWidth: 200 }}>
            <Typography variant="subtitle2" gutterBottom>
                {percentileLabel} - {nextPercentileLabel} Quantile
            </Typography>
            {threshold !== undefined && (
                <Typography variant="body2">
                    Range: {formatValue(threshold)} {nextThreshold && `- ${formatValue(nextThreshold)}`}
                </Typography>
            )}
        </Box>
    );
};
export default EnhancedColorLegend;
