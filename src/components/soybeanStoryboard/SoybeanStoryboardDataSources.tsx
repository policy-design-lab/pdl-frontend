import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

export type SoybeanStoryboardDataSource = {
    href: string;
    label: string;
};

type SoybeanStoryboardDataSourcesProps = {
    align?: "left" | "right";
    label?: string;
    sources: SoybeanStoryboardDataSource[];
};

export default function SoybeanStoryboardDataSources({
    align = "left",
    label,
    sources
}: SoybeanStoryboardDataSourcesProps): JSX.Element | null {
    if (sources.length === 0) {
        return null;
    }
    const resolvedLabel = label || (sources.length > 1 ? "Sources" : "Source");
    const className = [
        "soybean-storyboard-data-sources",
        align === "right" ? "soybean-storyboard-data-sources-right" : ""
    ]
        .filter(Boolean)
        .join(" ");
    return (
        <Box className={className}>
            <Typography component="span" className="soybean-storyboard-data-sources-label">
                {resolvedLabel}:
            </Typography>
            {sources.map((source) => (
                <Box
                    key={source.href + source.label}
                    component="a"
                    className="soybean-storyboard-data-sources-link"
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {source.label}
                    <OpenInNewRoundedIcon className="soybean-storyboard-data-sources-icon" />
                </Box>
            ))}
        </Box>
    );
}
