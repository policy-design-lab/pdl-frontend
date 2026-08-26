import React from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";

type SoybeanStoryboardYearSelectProps = {
    value: string;
    years: string[];
    onChange: (year: string) => void;
    label?: string;
    className?: string;
    selectWrapClassName?: string;
};

export default function SoybeanStoryboardYearSelect({
    value,
    years,
    onChange,
    label = "Year:",
    className,
    selectWrapClassName
}: SoybeanStoryboardYearSelectProps): JSX.Element {
    const handleChange = (event: SelectChangeEvent<string>) => {
        onChange(event.target.value);
    };
    const yearOptions = years.length > 0 ? years : [value];
    return (
        <Box className={className ? `soybean-storyboard-year-select ${className}` : "soybean-storyboard-year-select"}>
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
                    {yearOptions.map((yearOption) => (
                        <MenuItem
                            key={yearOption}
                            className="soybean-storyboard-utilization-menu-item"
                            value={yearOption}
                        >
                            {yearOption}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
