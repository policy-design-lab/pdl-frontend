import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import GridOnIcon from "@mui/icons-material/GridOn";

interface MapLevelSwitchProps {
    level: "state" | "county";
    onLevelChange: (level: "state" | "county") => void;
    disabled?: boolean;
}

const MapLevelSwitch = ({ level, onLevelChange, disabled = false }: MapLevelSwitchProps): JSX.Element => {
    const handleChange = (event: React.MouseEvent<HTMLElement>, newLevel: "state" | "county" | null) => {
        if (newLevel !== null) {
            onLevelChange(newLevel);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 2,
                mb: 2
            }}
        >
            <Typography variant="body2" sx={{ color: "#666" }}>
                View by:
            </Typography>
            <ToggleButtonGroup
                value={level}
                exclusive
                onChange={handleChange}
                aria-label="map level toggle"
                disabled={disabled}
                size="small"
                sx={{
                    "& .MuiToggleButton-root": {
                        "px": 2,
                        "py": 0.5,
                        "textTransform": "none",
                        "&.Mui-selected": {
                            "backgroundColor": "rgba(47, 113, 100, 0.1)",
                            "color": "#2F7164",
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.2)"
                            }
                        }
                    }
                }}
            >
                <ToggleButton value="state" aria-label="state level">
                    <MapIcon sx={{ mr: 0.5, fontSize: "1.2rem" }} />
                    State
                </ToggleButton>
                <ToggleButton value="county" aria-label="county level">
                    <GridOnIcon sx={{ mr: 0.5, fontSize: "1.2rem" }} />
                    County
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default MapLevelSwitch;
