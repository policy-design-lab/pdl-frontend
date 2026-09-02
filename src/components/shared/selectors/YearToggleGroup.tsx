import { Box, FormLabel, ToggleButton } from "@mui/material";
import React from "react";
import InfoTooltip from "../InfoTooltip";
import { formLabelStyleBasic, toggleButtonSx } from "./selectorStyles";

interface YearToggleGroupProps {
    label?: string;
    tooltip?: string;
    years: string[];
    selectedIndices: number[];
    onToggle: (index: number) => void;
    minButtonWidth?: number;
    disabledIndices?: number[];
    disabledTitle?: string;
}

const YearToggleGroup: React.FC<YearToggleGroupProps> = ({
    label,
    tooltip,
    years,
    selectedIndices,
    onToggle,
    minButtonWidth = 80,
    disabledIndices = [],
    disabledTitle
}) => (
    <>
        {label ? (
            <FormLabel component="legend" sx={formLabelStyleBasic}>
                {label}
                {tooltip ? <InfoTooltip title={tooltip} /> : null}
            </FormLabel>
        ) : null}
        <Box
            sx={{
                "display": "flex",
                "width": "100%",
                "flexWrap": "wrap",
                "gap": "4px",
                ".MuiToggleButton-root": {
                    borderRadius: "4px !important"
                }
            }}
        >
            {years.map((year, index) => {
                const isDisabled = disabledIndices.includes(index);
                return (
                    <ToggleButton
                        key={`year-${year}`}
                        value={index}
                        selected={selectedIndices.includes(index)}
                        disabled={isDisabled}
                        title={isDisabled ? disabledTitle : undefined}
                        onClick={() => {
                            onToggle(index);
                        }}
                        sx={{
                            ...toggleButtonSx(selectedIndices.includes(index)),
                            "flex": 1,
                            "minWidth": `${minButtonWidth}px`,
                            "marginBottom": "4px",
                            "&.Mui-disabled": {
                                color: "rgba(47, 113, 100, 0.3)",
                                borderColor: "rgba(47, 113, 100, 0.15)"
                            }
                        }}
                    >
                        {year}
                    </ToggleButton>
                );
            })}
        </Box>
    </>
);

export default YearToggleGroup;
