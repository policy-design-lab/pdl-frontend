import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { DistributionType } from "./shared/DistributionFunctions";
import DistributionTooltip from "./DistributionTooltip";
interface DistributionSelectorProps {
  distributionType: DistributionType;
  onDistributionChange: (type: DistributionType) => void;
  disabled?: boolean;
}
const DistributionSelector: React.FC<DistributionSelectorProps> = ({
  distributionType,
  onDistributionChange,
  disabled = false
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onDistributionChange(event.target.value as DistributionType);
  };
  return (
    <Box sx={{ minWidth: 180, maxWidth: 200 }}>
      <FormControl size="small" fullWidth disabled={disabled}>
        <InputLabel id="distribution-type-label">Distribution</InputLabel>
        <Select
          labelId="distribution-type-label"
          id="distribution-type-select"
          value={distributionType}
          label="Distribution"
          onChange={handleChange}
        >
          <MenuItem value="leftSkewed">
            <Tooltip
              title={<DistributionTooltip distributionType="leftSkewed" />}
              placement="right"
              arrow
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Left-skewed
              </Box>
            </Tooltip>
          </MenuItem>
          <MenuItem value="rightSkewed">
            <Tooltip
              title={<DistributionTooltip distributionType="rightSkewed" />}
              placement="right"
              arrow
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Right-skewed
              </Box>
            </Tooltip>
          </MenuItem>
          <MenuItem value="normal">
            <Tooltip
              title={<DistributionTooltip distributionType="normal" />}
              placement="right"
              arrow
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Normal
              </Box>
            </Tooltip>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
export default DistributionSelector; 
