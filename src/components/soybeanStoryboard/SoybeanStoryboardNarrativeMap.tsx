import React from "react";
import Box from "@mui/material/Box";

type SoybeanStoryboardNarrativeMapProps = {
    ariaLabel: string;
    banner: React.ReactNode;
    bannerClassName?: string;
    bannerTextClassName?: string;
    children: React.ReactNode;
    frameClassName: string;
    shellClassName?: string;
    svgClassName: string;
    viewBoxHeight: number;
    viewBoxWidth: number;
};

export default function SoybeanStoryboardNarrativeMap({
    ariaLabel,
    banner,
    bannerClassName = "soybean-storyboard-competitor-card",
    bannerTextClassName = "soybean-storyboard-banner-text",
    children,
    frameClassName,
    shellClassName = "",
    svgClassName,
    viewBoxHeight,
    viewBoxWidth
}: SoybeanStoryboardNarrativeMapProps): JSX.Element {
    return (
        <Box className={shellClassName}>
            <Box className={frameClassName}>
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className={svgClassName}
                    role="img"
                    aria-label={ariaLabel}
                >
                    {children}
                </svg>
                <Box className={bannerClassName}>
                    <Box component="div" className={bannerTextClassName}>
                        {banner}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
