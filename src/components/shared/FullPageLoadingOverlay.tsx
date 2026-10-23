import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { BRAND_GREEN, TEXT_MUTED, WHITE_80 } from "./colors";

interface FullPageLoadingOverlayProps {
    label: string;
    detail?: string;
    size?: number;
    backgroundColor?: string;
    zIndex?: number;
}

export default function FullPageLoadingOverlay({
    label,
    detail,
    size = 60,
    backgroundColor = WHITE_80,
    zIndex = 9999
}: FullPageLoadingOverlayProps): JSX.Element {
    return (
        <Box
            sx={{
                position: "fixed",
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
                gap: 2
            }}
        >
            <CircularProgress size={size} />
            <Typography variant="h6" sx={{ color: BRAND_GREEN }}>
                {label}
            </Typography>
            {detail ? (
                <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                    {detail}
                </Typography>
            ) : null}
        </Box>
    );
}
