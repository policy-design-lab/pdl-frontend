import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface InfoTooltipProps {
    title: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ title }) => {
    return (
        <Tooltip
            title={title}
            arrow
            placement="top"
            sx={{
                maxWidth: 300,
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
