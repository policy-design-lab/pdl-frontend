import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import GridOnIcon from "@mui/icons-material/GridOn";
import { BRAND_GREEN, BRAND_GREEN_10, BRAND_GREEN_20 } from "./colors";

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
                            "backgroundColor": BRAND_GREEN_10,
                            "color": BRAND_GREEN,
                            "&:hover": {
                                backgroundColor: BRAND_GREEN_20
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
