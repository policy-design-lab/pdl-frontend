import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type MapLoadingOverlayProps = {
    backgroundColor?: string;
    label: string;
    textColor?: string;
    zIndex?: number;
};

export default function MapLoadingOverlay({
    backgroundColor = "rgba(255, 255, 255, 0.9)",
    label,
    textColor = "#2F7164",
    zIndex = 1200
}: MapLoadingOverlayProps): JSX.Element {
    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor,
                zIndex,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5
            }}
        >
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: textColor }}>
                {label}
            </Typography>
        </Box>
    );
}
