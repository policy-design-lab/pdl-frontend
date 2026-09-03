import { FormControl, FormLabel, Select, MenuItem, Chip, Box, Divider } from "@mui/material";
import React from "react";
import InfoTooltip from "../InfoTooltip";
import { reconcileAllSentinel, removeWithSentinelFallback } from "./multiSelectUtils";
import {
    activeSelectHighlight,
    autoHeightChipContainerStyle,
    autoHeightSelectStyle,
    chipContainerStyle,
    chipStyle,
    formControlFocusStyle,
    formLabelStyle,
    menuItemStyle,
    selectStyle
} from "./selectorStyles";

interface MultiChipSelectProps {
    label: string;
    tooltip?: string;
    options: string[];
    selected: string[];
    allSentinel: string;
    allSentinelLabel?: string;
    onChange: (next: string[]) => void;
    disabled?: boolean;
    maxMenuHeight?: number;
    autoHeight?: boolean;
}

const MultiChipSelect: React.FC<MultiChipSelectProps> = ({
    label,
    tooltip,
    options,
    selected,
    allSentinel,
    allSentinelLabel,
    onChange,
    disabled = false,
    maxMenuHeight = 300,
    autoHeight = false
}) => {
    const handleChange = (event: { target: { value: unknown } }) => {
        onChange(reconcileAllSentinel(event.target.value as string[], selected, allSentinel));
    };
    const isFiltered = selected.length > 0 && !selected.includes(allSentinel);
    const containerStyle = autoHeight ? autoHeightChipContainerStyle : chipContainerStyle;
    const controlStyle = autoHeight ? autoHeightSelectStyle : selectStyle;
    return (
        <FormControl fullWidth sx={formControlFocusStyle} disabled={disabled}>
            <FormLabel component="legend" sx={formLabelStyle}>
                {label}
                {tooltip ? <InfoTooltip title={tooltip} /> : null}
            </FormLabel>
            <Select
                multiple
                value={selected}
                onChange={handleChange}
                renderValue={(value) => (
                    <Box sx={containerStyle}>
                        {(value as string[]).map((item) => (
                            <Chip
                                key={item}
                                label={item}
                                onDelete={() => onChange(removeWithSentinelFallback(selected, item, allSentinel))}
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
                            maxHeight: maxMenuHeight,
                            overflowY: "auto"
                        }
                    }
                }}
                sx={{
                    ...(controlStyle as Record<string, unknown>),
                    width: "100%",

                    ...(isFiltered && activeSelectHighlight)
                }}
                key={`multi-chip-select-${label}-${selected.join("|")}`}
            >
                <MenuItem
                    value={allSentinel}
                    sx={{
                        ...menuItemStyle,
                        fontWeight: "bold",
                        bgcolor: selected[0] !== allSentinel ? "rgba(47, 113, 100, 0.1)" : "inherit"
                    }}
                >
                    {allSentinelLabel ?? allSentinel}
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                {options.map((option) => (
                    <MenuItem
                        key={option}
                        value={option}
                        sx={{
                            ...menuItemStyle,
                            ...(selected.includes(option) && {
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
                            })
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
export default MultiChipSelect;
