import React from "react";
import { Box, Typography } from "@mui/material";
import { DistributionType } from "./shared/DistributionFunctions";
interface DistributionTooltipProps {
  distributionType: DistributionType;
}
const DistributionTooltip: React.FC<DistributionTooltipProps> = ({
  distributionType
}) => {
  return (
    <Box sx={{ p: 1, maxWidth: 200 }}>
      <Typography variant="subtitle2" gutterBottom>
        {distributionType === "leftSkewed" && "Left-skewed Distribution"}
        {distributionType === "rightSkewed" && "Right-skewed Distribution"}
        {distributionType === "normal" && "Normal Distribution"}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {distributionType === "leftSkewed" && "Creates more color divisions in higher values, showing greater detail for larger numbers."}
        {distributionType === "rightSkewed" && "Creates more color divisions in lower values, showing greater detail for smaller numbers."}
        {distributionType === "normal" && "Creates equal color divisions across the entire range of values."}
      </Typography>
    </Box>
  );
};
export default DistributionTooltip; 
