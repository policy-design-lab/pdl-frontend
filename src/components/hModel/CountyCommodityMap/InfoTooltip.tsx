import React from "react";
import { Tooltip, IconButton, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface InfoTooltipProps {
    title: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ title }) => {
    const paragraphs = title.split("\n\n");
    const formattedContent = (
        <>
            {paragraphs.map((paragraph, index) => (
                <Typography
                    key={`tooltip-paragraph-${paragraph.slice(0, 20).replace(/\s/g, "-")}`}
                    variant="body2"
                    style={{
                        marginBottom: index < paragraphs.length - 1 ? "8px" : 0,
                        fontSize: "0.8rem",
                        whiteSpace: "pre-line"
                    }}
                >
                    {paragraph}
                </Typography>
            ))}
        </>
    );

    return (
        <Tooltip
            title={formattedContent}
            arrow
            placement="top"
            sx={{
                maxWidth: 350,
                fontSize: "0.8rem"
            }}
        >
            <IconButton
                size="small"
                sx={{
                    color: "rgba(47, 113, 100, 0.7)",
                    padding: "2px",
                    marginLeft: "4px",
                    verticalAlign: "middle"
                }}
            >
                <InfoIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default InfoTooltip;
