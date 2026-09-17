import { FormControl, FormLabel, Select, MenuItem, Chip, Grid, Box, Divider } from "@mui/material";
import React from "react";
import noShowStates from "../../../files/maps/noShow-state.json";
import InfoTooltip from "./InfoTooltip";
import { CommodityOrder } from "./CommodityOrder";
import MultiChipSelect from "../../shared/selectors/MultiChipSelect";
import {
    activeSelectHighlight,
    chipContainerStyle,
    chipStyle,
    formControlFocusStyle,
    formLabelStyle,
    menuItemStyle,
    selectStyle
} from "../../shared/selectors/selectorStyles";

interface FilterSelectorsProps {
    availableCommodities: string[];
    availablePrograms: string[];
    stateCodesData: Record<string, string>;
    selectedCommodities: string[];
    selectedPrograms: string[];
    selectedState: string;
    setSelectedCommodities: (value: string[]) => void;
    setSelectedPrograms: (value: string[]) => void;
    setSelectedState: (value: string) => void;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
    availableCommodities,
    availablePrograms,
    stateCodesData,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    setSelectedCommodities,
    setSelectedPrograms,
    setSelectedState
}) => {
    const handleProgramChange = (event: { target: { value: unknown } }) => {
        const value = event.target.value as string;
        setSelectedPrograms([value]);
    };

    const handleStateChange = (event: { target: { value: unknown } }) => {
        setSelectedState(event.target.value as string);
    };

    const sortedCommodities = React.useMemo(() => {
        return availableCommodities.sort((a, b) => {
            const indexA = CommodityOrder.indexOf(a);
            const indexB = CommodityOrder.indexOf(b);

            if (indexA === -1 && indexB === -1) {
                return a.localeCompare(b);
            }
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
        });
    }, [availableCommodities]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={formControlFocusStyle}>
                    <FormLabel component="legend" sx={formLabelStyle}>
                        Select State to View/Zoom
                        <InfoTooltip title="Select a specific state to zoom in on the map, or keep 'All States' selected to view the entire U.S. map." />
                    </FormLabel>
                    <Select
                        value={selectedState}
                        onChange={handleStateChange}
                        renderValue={(selected) => (
                            <Box sx={chipContainerStyle}>
                                <Chip key={selected} label={selected} sx={chipStyle} />
                            </Box>
                        )}
                        sx={{
                            ...selectStyle,
                            width: "100%",

                            ...(selectedState !== "All States" && {
                                ...activeSelectHighlight
                            })
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 300,
                                    overflowY: "auto"
                                }
                            }
                        }}
                    >
                        <MenuItem
                            value="All States"
                            sx={{
                                ...menuItemStyle,
                                fontWeight: "bold",
                                bgcolor: selectedState !== "All States" ? "rgba(47, 113, 100, 0.1)" : "inherit"
                            }}
                        >
                            All States (US Map)
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        {Object.entries(stateCodesData)
                            .filter(([, name], index, self) => self.findIndex((item) => item[1] === name) === index)
                            .filter(([, name]) => !noShowStates[name])
                            .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
                            .map(([code, name]) => (
                                <MenuItem key={code} value={String(name)} sx={menuItemStyle}>
                                    {String(name)}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
                <MultiChipSelect
                    label="Select Program Crop"
                    tooltip="Select the program crop or crops to view payment projections, or select ‘All Program Crops’ to visualize projections for all program crops combined. Program crops are those authorized by Congress to be eligible for ARC-CO and PLC payments and for which base acres exist to be enrolled in a program. The following are the program crops included in the model are and available in the map and table: corn, soybeans, wheat, sorghum, seed cotton, rice, and peanuts."
                    options={sortedCommodities}
                    selected={selectedCommodities}
                    allSentinel="All Program Crops"
                    onChange={setSelectedCommodities}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={formControlFocusStyle}>
                    <FormLabel component="legend" sx={formLabelStyle}>
                        Select Farm Program
                        <InfoTooltip title="Select the farm program for data visualization. Agriculture Risk Coverage, county option (ARC-CO) provides payments triggered by declines in crop revenues (price times yield). Price Loss Coverage (PLC) provides payments triggered when marketing year average prices are below the effective reference price. Users can also select ‘All Programs’ to view the data for both programs combined. More information on the programs is available from USDA’s Farm Service Agency (FSA): https://www.fsa.usda.gov/resources/programs/arc-plc." />
                    </FormLabel>
                    <Select
                        value={selectedPrograms[0]}
                        onChange={handleProgramChange}
                        renderValue={(selected) => (
                            <Box sx={chipContainerStyle}>
                                <Chip key={selected} label={selected} sx={chipStyle} />
                            </Box>
                        )}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 300,
                                    overflowY: "auto"
                                }
                            }
                        }}
                        sx={{
                            ...selectStyle,
                            width: "100%",

                            ...(selectedPrograms[0] !== "All Programs" && {
                                ...activeSelectHighlight
                            })
                        }}
                    >
                        <MenuItem
                            value="All Programs"
                            sx={{
                                ...menuItemStyle,
                                fontWeight: "bold",
                                bgcolor: selectedPrograms[0] !== "All Programs" ? "rgba(47, 113, 100, 0.1)" : "inherit"
                            }}
                        >
                            All Programs
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        {availablePrograms.map((program) => (
                            <MenuItem
                                key={program}
                                value={program}
                                sx={{
                                    ...menuItemStyle,
                                    ...(selectedPrograms.includes(program) && {
                                        backgroundColor: "rgba(47, 113, 100, 0.1)"
                                    })
                                }}
                            >
                                {program}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default FilterSelectors;
