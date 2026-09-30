import React from "react";
import { Box, CircularProgress, Backdrop, LinearProgress, Fade } from "@mui/material";
import { isLoadingOverlayEnabled, getUIConfig } from "../../utils/configUtil";
import { SHADOW_MEDIUM, WHITE_30 } from "../shared/colors";

interface ConfigurableLoadingOverlayProps {
    isProcessing: boolean;
    processingMessage: string;
    showProgressBar?: boolean;
    zIndex?: number;
}

export const ConfigurableLoadingOverlay: React.FC<ConfigurableLoadingOverlayProps> = ({
    isProcessing,
    processingMessage,
    showProgressBar = true,
    zIndex = 2000
}) => {
    if (!isLoadingOverlayEnabled()) {
        return null;
    }

    const config = getUIConfig();

    return (
        <Backdrop
            sx={{
                color: "#fff",
                zIndex,
                backgroundColor: SHADOW_MEDIUM,
                backdropFilter: config.animations.backdropBlur ? "blur(2px)" : "none"
            }}
            open={isProcessing}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2
                }}
            >
                <CircularProgress color="inherit" size={48} thickness={4} />
                {config.animations.enabled ? (
                    <Fade in={isProcessing} timeout={config.animations.fadeTimeout}>
                        <Box
                            sx={{
                                textAlign: "center",
                                fontSize: "1.1rem",
                                fontWeight: 500
                            }}
                        >
                            {processingMessage}
                        </Box>
                    </Fade>
                ) : (
                    <Box
                        sx={{
                            textAlign: "center",
                            fontSize: "1.1rem",
                            fontWeight: 500
                        }}
                    >
                        {processingMessage}
                    </Box>
                )}
                {showProgressBar && (
                    <LinearProgress
                        sx={{
                            "width": 200,
                            "height": 6,
                            "borderRadius": 3,
                            "backgroundColor": WHITE_30,
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: "#fff",
                                borderRadius: 3
                            }
                        }}
                    />
                )}
            </Box>
        </Backdrop>
    );
};
