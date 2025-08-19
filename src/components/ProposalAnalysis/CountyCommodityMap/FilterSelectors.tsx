import { FormControl, FormLabel, Select, MenuItem, Chip, Grid, Box, Divider } from "@mui/material";
import React from "react";
import noShowStates from "../../../files/maps/noShow-state.json";
import InfoTooltip from "./InfoTooltip";
import { CommodityOrder } from "./CommodityOrder";

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
        if (value.includes("All Program Crops") && !selectedCommodities.includes("All Program Crops")) {
            setSelectedCommodities(["All Program Crops"]);
            return;
        }
        if (value.length === 0) {
            setSelectedCommodities(["All Program Crops"]);
            return;
        }
        const filtered = value.filter((item) => item !== "All Program Crops");
        setSelectedCommodities(filtered);
    };

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

    const selectHeight = "44px";

    const chipContainerHeight = "36px";

    const menuItemStyle = {
        fontSize: "0.875rem",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    };

    const selectStyle = {
        "height": selectHeight,
        "fontSize": "0.875rem",
        "fontFamily": "'Roboto', 'Helvetica', 'Arial', sans-serif",
        "color": "rgba(47, 113, 100, 1)",
        "border": "1px solid rgba(47, 113, 100, 0.5)",
        "backgroundColor": "white",

        ".MuiOutlinedInput-notchedOutline": {
            border: "none"
        },

        "&:hover": {
            backgroundColor: "rgba(47, 113, 100, 0.05)"
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none"
        },
        "& .MuiSelect-select": {
            display: "flex",
            alignItems: "flex-start",
            padding: "0 32px 0 14px",
            height: "100% !important",
            overflow: "hidden"
        },

        "&.Mui-focused": {
            color: "rgba(47, 113, 100, 1)"
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            boxShadow: "none"
        },

        "transition": "all 0.2s ease-in-out",

        "transform": "translateZ(0)",

        "willChange": "transform"
    };

    const chipContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        minHeight: chipContainerHeight,
        height: chipContainerHeight,
        maxHeight: "36px",
        overflow: "hidden",
        alignItems: "center",
        width: "100%",
        transition: "all 0.2s ease-in-out",

        transform: "translateZ(0)",

        position: "relative"
    };

    const chipStyle = {
        borderRadius: 1,
        borderColor: "lightgray",
        color: "rgba(47, 113, 100, 1)",
        transition: "all 0.2s ease-in-out",
        height: "24px",

        transform: "translateZ(0)"
    };

    const formLabelStyle = {
        "fontWeight": "bold",
        "fontSize": "1rem",
        "color": "rgba(47, 113, 100, 1)",
        "mb": 1,
        "display": "flex",
        "alignItems": "center",

        "&.Mui-focused": {
            color: "rgba(47, 113, 100, 1)"
        },

        "&&": {
            color: "rgba(47, 113, 100, 1)"
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <FormControl
                    fullWidth
                    sx={{
                        "& .MuiFormLabel-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiInputBase-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiOutlinedInput-root": {
                            overflow: "hidden",
                            transition: "all 0.2s ease-in-out",
                            transform: "translateZ(0)"
                        }
                    }}
                >
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
                                fontWeight: "bold",
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
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
                <FormControl
                    fullWidth
                    sx={{
                        "& .MuiFormLabel-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiInputBase-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiOutlinedInput-root": {
                            overflow: "hidden",
                            transition: "all 0.2s ease-in-out",
                            transform: "translateZ(0)"
                        }
                    }}
                >
                    <FormLabel component="legend" sx={formLabelStyle}>
                        Select Program Crop
                        <InfoTooltip title="Select the program crop or crops to view payment projections, or select ‘All Program Crops’ to visualize projections for all program crops combined. Program crops are those authorized by Congress to be eligible for ARC-CO and PLC payments and for which base acres exist to be enrolled in a program. The following are the program crops included in the model are and available in the map and table: corn, soybeans, wheat, sorghum, seed cotton, rice, and peanuts." />
                    </FormLabel>
                    <Select
                        multiple
                        value={selectedCommodities}
                        onChange={handleCommodityChange}
                        renderValue={(selected) => (
                            <Box sx={chipContainerStyle}>
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
                                                setSelectedCommodities(["All Program Crops"]);
                                            }
                                        }}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        sx={chipStyle}
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
                        sx={{
                            ...selectStyle,
                            width: "100%",

                            ...(selectedCommodities.length > 0 &&
                                !selectedCommodities.includes("All Program Crops") && {
                                    fontWeight: "bold",
                                    backgroundColor: "rgba(47, 113, 100, 0.1)"
                                })
                        }}
                        key={`commodity-select-${selectedCommodities.join("|")}`}
                    >
                        <MenuItem
                            value="All Program Crops"
                            sx={{
                                ...menuItemStyle,
                                fontWeight: "bold",
                                bgcolor:
                                    selectedCommodities[0] !== "All Program Crops"
                                        ? "rgba(47, 113, 100, 0.1)"
                                        : "inherit"
                            }}
                        >
                            All Program Crops
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        {sortedCommodities.map((commodity) => (
                            <MenuItem
                                key={commodity}
                                value={commodity}
                                sx={{
                                    ...menuItemStyle,
                                    ...(selectedCommodities.includes(commodity) && {
                                        backgroundColor: "rgba(47, 113, 100, 0.1)"
                                    })
                                }}
                            >
                                {commodity}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
                <FormControl
                    fullWidth
                    sx={{
                        "& .MuiFormLabel-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiInputBase-root.Mui-focused": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiOutlinedInput-root": {
                            overflow: "hidden",
                            transition: "all 0.2s ease-in-out",
                            transform: "translateZ(0)"
                        }
                    }}
                >
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
                                fontWeight: "bold",
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
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
