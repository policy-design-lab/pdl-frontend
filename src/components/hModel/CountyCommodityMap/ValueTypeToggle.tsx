import React from "react";
import { Box, FormLabel, FormControlLabel, Switch } from "@mui/material";

const ValueTypeToggle = ({ showMeanValues, setShowMeanValues, disabled = false }) => {
    const handleMeanValueToggle = (event) => {
        setShowMeanValues(event.target.checked);
    };
    React.useEffect(() => {
        if (disabled && showMeanValues) {
            setShowMeanValues(false);
        }
    }, [disabled, showMeanValues, setShowMeanValues]);

    return (
        <Box>
            <FormLabel
                component="legend"
                sx={{
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    color: disabled ? "rgba(0, 0, 0, 0.38)" : "rgba(47, 113, 100, 1)",
                    mb: 1
                }}
            >
                Value Type
            </FormLabel>
            <FormControlLabel
            control={
                <Switch
                    checked={showMeanValues}
                    onChange={handleMeanValueToggle}
                    disabled={disabled}
                    sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "rgba(47, 113, 100, 1)"
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "rgba(47, 113, 100, 0.5)"
                        }
                    }}
                />
            }
            label={showMeanValues ? "Mean Payment Rate ($/acre)" : "Total Payments ($)"}
            sx={{ color: disabled ? "rgba(0, 0, 0, 0.38)" : "rgba(47, 113, 100, 1)" }}
        />
        </Box>
    );
};

export default ValueTypeToggle;
