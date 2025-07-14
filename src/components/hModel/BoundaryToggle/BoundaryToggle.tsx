import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    "& .MuiToggleButtonGroup-grouped": {
        "margin": theme.spacing(0.5),
        "border": 0,
        "&.Mui-disabled": {
            border: 0
        },
        "&:not(:first-of-type)": {
            borderRadius: theme.shape.borderRadius
        },
        "&:first-of-type": {
            borderRadius: theme.shape.borderRadius
        }
    }
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    "color": "rgba(0, 0, 0, 0.6)",
    "backgroundColor": "rgba(255, 255, 255, 0.9)",
    "border": "1px solid rgba(47, 113, 100, 0.3)",
    "borderRadius": theme.shape.borderRadius,
    "padding": theme.spacing(1, 2),
    "minWidth": "120px",
    "&.Mui-selected": {
        "color": "#FFFFFF",
        "backgroundColor": "rgba(47, 113, 100, 1)",
        "&:hover": {
            backgroundColor: "rgba(47, 113, 100, 0.8)"
        }
    },
    "&:hover": {
        backgroundColor: "rgba(47, 113, 100, 0.1)"
    },
    "& .MuiToggleButton-label": {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(0.5)
    }
}));

export type BoundaryType = "county" | "congressional-district";

interface BoundaryToggleProps {
    selectedBoundary: BoundaryType;
    onBoundaryChange: (boundary: BoundaryType) => void;
    disabled?: boolean;
}

export const BoundaryToggle: React.FC<BoundaryToggleProps> = ({
    selectedBoundary,
    onBoundaryChange,
    disabled = false
}) => {
    const handleBoundaryChange = (event: React.MouseEvent<HTMLElement>, newBoundary: BoundaryType | null) => {
        if (newBoundary !== null) {
            onBoundaryChange(newBoundary);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "medium", color: "rgba(0, 0, 0, 0.7)" }}>
                Boundary Type
            </Typography>
            <StyledToggleButtonGroup
                value={selectedBoundary}
                exclusive
                onChange={handleBoundaryChange}
                aria-label="boundary type selection"
                disabled={disabled}
            >
                <StyledToggleButton value="county" aria-label="county boundaries">
                    <LocationCityIcon sx={{ fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                        County
                    </Typography>
                </StyledToggleButton>
                <StyledToggleButton value="congressional-district" aria-label="congressional district boundaries">
                    <AccountBalanceIcon sx={{ fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                        Congressional District
                    </Typography>
                </StyledToggleButton>
            </StyledToggleButtonGroup>
        </Box>
    );
};

export default BoundaryToggle;
