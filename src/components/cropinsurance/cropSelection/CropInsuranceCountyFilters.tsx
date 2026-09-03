import React from "react";
import { Box, Grid } from "@mui/material";
import MultiChipSelect from "../../shared/selectors/MultiChipSelect";
import YearToggleGroup from "../../shared/selectors/YearToggleGroup";
import { toggleIndexNeverEmpty } from "../../shared/selectors/multiSelectUtils";
import { formLabelStyleBasic } from "../../shared/selectors/selectorStyles";
import InfoTooltip from "../../shared/InfoTooltip";
import { ALL_CROPS_SENTINEL, selectableCrops } from "./commodityMapping";
import { CROP_INSURANCE_YEARS } from "./resolveYearKeys";

interface CropInsuranceCountyFiltersProps {
    selectedYears: string[];
    selectedCrops: string[];
    onYearsChange: (years: string[]) => void;
    onCropsChange: (crops: string[]) => void;
}

const YEAR_TOOLTIP =
    "Choose the crop year or combination of crop years to visualize in the county map and table below. " +
    "Selecting multiple years aggregates them in the map, with each year shown separately in the table " +
    "and tooltip.";

const CROP_TOOLTIP =
    "Select one or more commodities to view county data for those crops only, or keep 'All Commodities' " +
    "to view every commodity combined. Corn, Cotton, Grain Sorghum, Peanuts, Rice, Soybeans and Wheat are " +
    "reported individually; 'Other Commodities' combines every remaining insured commodity.";

const CropInsuranceCountyFilters: React.FC<CropInsuranceCountyFiltersProps> = ({
    selectedYears,
    selectedCrops,
    onYearsChange,
    onCropsChange
}) => {
    const selectedIndices = React.useMemo(
        () =>
            selectedYears
                .map((year) => CROP_INSURANCE_YEARS.indexOf(year))
                .filter((index) => index >= 0)
                .sort((a, b) => a - b),
        [selectedYears]
    );

    const handleYearToggle = (index: number) => {
        const nextIndices = toggleIndexNeverEmpty(selectedIndices, index);
        onYearsChange([...nextIndices].sort((a, b) => a - b).map((yearIndex) => CROP_INSURANCE_YEARS[yearIndex]));
    };

    return (
        <Box
            sx={{
                p: 2,
                mb: 3,
                backgroundColor: "white",
                borderRadius: "4px",
                border: "1px solid rgba(47, 113, 100, 0.2)"
            }}
        >
            <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={8}>
                    <Box component="legend" sx={formLabelStyleBasic}>
                        Select Crop Year or Combination of Crop Years
                        <InfoTooltip title={YEAR_TOOLTIP} />
                    </Box>
                    <YearToggleGroup
                        years={CROP_INSURANCE_YEARS}
                        selectedIndices={selectedIndices}
                        onToggle={handleYearToggle}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <MultiChipSelect
                        label="Select Commodity"
                        tooltip={CROP_TOOLTIP}
                        options={selectableCrops()}
                        selected={selectedCrops}
                        allSentinel={ALL_CROPS_SENTINEL}
                        onChange={onCropsChange}
                        autoHeight
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default CropInsuranceCountyFilters;
