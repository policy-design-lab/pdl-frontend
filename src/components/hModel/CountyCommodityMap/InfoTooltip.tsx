import React from "react";
import { Tooltip, IconButton, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface InfoTooltipProps {
    title: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ title }) => {
    const formattedContent = (
        <React.Fragment>
            {title.split('\n\n').map((paragraph, index) => (
                <Typography 
                    key={index} 
                    variant="body2" 
                    style={{ 
                        marginBottom: index < title.split('\n\n').length - 1 ? '8px' : 0,
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-line'
                    }}
                >
                    {paragraph}
                </Typography>
            ))}
        </React.Fragment>
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
