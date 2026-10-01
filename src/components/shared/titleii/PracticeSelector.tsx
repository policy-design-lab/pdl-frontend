import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { BRAND_GREEN } from "../colors";

export const ALL_PRACTICES = "All Practices";

interface PracticeSelectorProps {
    practices: (string | { practiceName: string; practiceCode: string })[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
    disabled?: boolean;
    pt?: number;
}

const PracticeSelector = ({
    practices,
    selected,
    onChange,
    label = "Select Practice",
    disabled = false,
    pt = 4
}: PracticeSelectorProps): JSX.Element => {
    const normalizeSelection = (next: string[]): string[] => {
        if (next.includes(ALL_PRACTICES) && !selected.includes(ALL_PRACTICES)) {
            return [ALL_PRACTICES];
        }
        if (next.length > 1 && next.includes(ALL_PRACTICES)) {
            return next.filter((practice) => practice !== ALL_PRACTICES);
        }
        if (next.length === 0) {
            return [ALL_PRACTICES];
        }
        return next;
    };

    const handleChange = (event) => {
        const { value } = event.target;
        const next = typeof value === "string" ? value.split(",") : value;
        onChange(normalizeSelection(next));
    };

    const handleChipDelete = (practiceToDelete: string) => {
        if (selected.length === 1) {
            onChange([ALL_PRACTICES]);
            return;
        }
        onChange(selected.filter((practice) => practice !== practiceToDelete));
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" pt={pt}>
            <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <FormLabel
                    component="legend"
                    sx={{
                        "mr": 2,
                        "minWidth": "5em",
                        "fontWeight": "bold",
                        "fontSize": "1.25rem",
                        "color": BRAND_GREEN,
                        "&.Mui-focused": { color: "rgba(47, 113, 100, 1) !important" }
                    }}
                >
                    {label}
                </FormLabel>
                <Select
                    multiple
                    disabled={disabled}
                    value={selected}
                    onChange={handleChange}
                    renderValue={(chosen: string[]) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {chosen.map((value) => (
                                <Chip
                                    key={value}
                                    label={value}
                                    onDelete={() => handleChipDelete(value)}
                                    onMouseDown={(event) => {
                                        event.stopPropagation();
                                    }}
                                    sx={{
                                        borderRadius: 1,
                                        borderColor: "lightgray",
                                        color: BRAND_GREEN
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                    sx={{ minWidth: 300 }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                maxHeight: 500,
                                overflowY: "auto",
                                border: "1px solid lightgray",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                bgcolor: "background.paper"
                            }
                        }
                    }}
                >
                    {practices.map((practice) => (
                        <MenuItem
                            key={typeof practice === "string" ? practice : practice.practiceCode}
                            value={typeof practice === "string" ? practice : practice.practiceName}
                        >
                            {typeof practice === "string" ? practice : practice.practiceName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default PracticeSelector;
