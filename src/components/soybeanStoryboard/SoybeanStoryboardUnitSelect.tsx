import React from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { SoybeanQuantityUnit } from "./soybeanApi";

type SoybeanStoryboardUnitOption = {
    value: SoybeanQuantityUnit;
    label: string;
};

const DEFAULT_UNIT_OPTIONS: SoybeanStoryboardUnitOption[] = [
    { value: "mmt", label: "MMT" },
    { value: "bushels", label: "Bushels" }
];

type SoybeanStoryboardUnitSelectProps = {
    value: SoybeanQuantityUnit;
    onChange: (unit: SoybeanQuantityUnit) => void;
    options?: SoybeanStoryboardUnitOption[];
    label?: string;
    className?: string;
    selectWrapClassName?: string;
};

export default function SoybeanStoryboardUnitSelect({
    value,
    onChange,
    options = DEFAULT_UNIT_OPTIONS,
    label = "Units:",
    className,
    selectWrapClassName
}: SoybeanStoryboardUnitSelectProps): JSX.Element {
    const handleChange = (event: SelectChangeEvent<SoybeanQuantityUnit>) => {
        onChange(event.target.value as SoybeanQuantityUnit);
    };
    return (
        <Box className={className ? `soybean-storyboard-unit-select ${className}` : "soybean-storyboard-unit-select"}>
            <Typography className="soybean-storyboard-utilization-control-label">{label}</Typography>
            <FormControl
                variant="standard"
                size="small"
                className={
                    selectWrapClassName
                        ? `soybean-storyboard-utilization-select-wrap ${selectWrapClassName}`
                        : "soybean-storyboard-utilization-select-wrap"
                }
            >
                <Select
                    value={value}
                    onChange={handleChange}
                    className="soybean-storyboard-utilization-select"
                    MenuProps={{
                        PaperProps: { className: "soybean-storyboard-utilization-menu-paper" }
                    }}
                >
                    {options.map((option) => (
                        <MenuItem
                            key={option.value}
                            className="soybean-storyboard-utilization-menu-item"
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
