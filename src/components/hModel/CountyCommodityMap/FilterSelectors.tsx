import { FormControl, FormLabel, Select, MenuItem, Chip, Grid, Box, Divider } from "@mui/material";
import React from "react";
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
    const handleCommodityChange = (event: { target: { value: unknown } }) => {
        const value = event.target.value as string[];
        if (value.includes("All Commodities") && selectedCommodities.length > 1) {
            setSelectedCommodities(["All Commodities"]);
        } else if (value.includes("All Commodities") && value.length > 1) {
            setSelectedCommodities(value.filter((v) => v !== "All Commodities"));
        } else if (value.length === 0) {
            setSelectedCommodities(["All Commodities"]);
        } else {
            setSelectedCommodities(value);
        }
    };
    const handleProgramChange = (event: { target: { value: unknown } }) => {
        const value = event.target.value as string[];
        if (value.includes("All Programs") && selectedPrograms.length > 1) {
            setSelectedPrograms(["All Programs"]);
        } else if (value.includes("All Programs") && value.length > 1) {
            setSelectedPrograms(value.filter((v) => v !== "All Programs"));
        } else if (value.length === 0) {
            setSelectedPrograms(["All Programs"]);
        } else {
            setSelectedPrograms(value);
        }
    };
    const handleStateChange = (event: { target: { value: unknown } }) => {
        setSelectedState(event.target.value as string);
    };
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                    <FormLabel
                        component="legend"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "rgba(47, 113, 100, 1)",
                            mb: 1
                        }}
                    >
                        Select State
                    </FormLabel>
                    <Select
                        value={selectedState}
                        onChange={handleStateChange}
                        sx={{
                            width: "100%",
                            color: "rgba(47, 113, 100, 1)"
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
                                fontWeight: 'bold',
                                bgcolor: selectedState !== "All States" ? 'rgba(47, 113, 100, 0.1)' : 'inherit'
                            }}
                        >
                            All States (US Map)
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        {Object.entries(stateCodesData)
                            .filter(([, name], index, self) => 
                                self.findIndex((item) => item[1] === name) === index
                            )
                            .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
                            .map(([code, name]) => (
                                <MenuItem key={code} value={String(name)}>
                                    {String(name)}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                    <FormLabel
                        component="legend"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "rgba(47, 113, 100, 1)",
                            mb: 1
                        }}
                    >
                        Select Commodities
                    </FormLabel>
                    <Select
                        multiple
                        value={selectedCommodities}
                        onChange={handleCommodityChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                    <Chip
                                        key={value}
                                        label={value}
                                        onDelete={() => {
                                            if (selectedCommodities.length > 1) {
                                                setSelectedCommodities(
                                                    selectedCommodities.filter((item) => item !== value)
                                                );
                                            } else {
                                                setSelectedCommodities(["All Commodities"]);
                                            }
                                        }}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        sx={{
                                            borderRadius: 1,
                                            borderColor: "lightgray",
                                            color: "rgba(47, 113, 100, 1)"
                                        }}
                                    />
                                ))}
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
                        sx={{ width: "100%" }}
                    >
                        <MenuItem value="All Commodities">All Commodities</MenuItem>
                        {availableCommodities.map((commodity) => (
                            <MenuItem key={commodity} value={commodity}>
                                {commodity}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {}
            <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                    <FormLabel
                        component="legend"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "rgba(47, 113, 100, 1)",
                            mb: 1
                        }}
                    >
                        Select Programs
                    </FormLabel>
                    <Select
                        multiple
                        value={selectedPrograms}
                        onChange={handleProgramChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                    <Chip
                                        key={value}
                                        label={value}
                                        onDelete={() => {
                                            if (selectedPrograms.length > 1) {
                                                setSelectedPrograms(selectedPrograms.filter((item) => item !== value));
                                            } else {
                                                setSelectedPrograms(["All Programs"]);
                                            }
                                        }}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        sx={{
                                            borderRadius: 1,
                                            borderColor: "lightgray",
                                            color: "rgba(47, 113, 100, 1)"
                                        }}
                                    />
                                ))}
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
                        sx={{ width: "100%" }}
                    >
                        <MenuItem value="All Programs">All Programs</MenuItem>
                        {availablePrograms.map((program) => (
                            <MenuItem key={program} value={program}>
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