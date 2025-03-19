import React from "react";
import { Box, FormLabel, ToggleButton, ToggleButtonGroup } from "@mui/material";

const ViewModeSelector = ({ viewMode, setViewMode, proposedPolicyName, setProposedPolicyName }) => {
    const handleViewModeChange = (event, newValue) => {
        event.preventDefault();
        if (newValue) {
            setViewMode(newValue);
            if (newValue === "proposed" && !proposedPolicyName) {
                setProposedPolicyName("2025 Policy");
            }
        }
    };
    return (
        <Box>
            <FormLabel
                component="legend"
                sx={{
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    color: "rgba(47, 113, 100, 1)",
                    mb: 1
                }}
            >
                Data View Mode
            </FormLabel>
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                sx={{
                    display: "flex",
                    width: "100%",
                    maxWidth: "600px"
                }}
            >
                <ToggleButton
                    value="current"
                    sx={{
                        "flex": 1,
                        "color": viewMode === "current" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                        "backgroundColor": viewMode === "current" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                        "fontWeight": viewMode === "current" ? "bold" : "normal",
                        "border": "1px solid rgba(47, 113, 100, 0.5)",
                        "p": 1.5,
                        "&:hover": {
                            backgroundColor: "rgba(47, 113, 100, 0.05)"
                        }
                    }}
                >
                    Current Policy
                </ToggleButton>
                <ToggleButton
                    value="proposed"
                    sx={{
                        "flex": 1,
                        "color": viewMode === "proposed" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                        "backgroundColor": viewMode === "proposed" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                        "fontWeight": viewMode === "proposed" ? "bold" : "normal",
                        "border": "1px solid rgba(47, 113, 100, 0.5)",
                        "p": 1.5,
                        "&:hover": {
                            backgroundColor: "rgba(47, 113, 100, 0.05)"
                        }
                    }}
                >
                    Proposed: 2025 Policy
                </ToggleButton>
                <ToggleButton
                    value="difference"
                    sx={{
                        "flex": 1,
                        "color": viewMode === "difference" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                        "backgroundColor": viewMode === "difference" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                        "fontWeight": viewMode === "difference" ? "bold" : "normal",
                        "border": "1px solid rgba(47, 113, 100, 0.5)",
                        "p": 1.5,
                        "&:hover": {
                            backgroundColor: "rgba(47, 113, 100, 0.05)"
                        }
                    }}
                >
                    Policy Differences
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};
export default ViewModeSelector;
