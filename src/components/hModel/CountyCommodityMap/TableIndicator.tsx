import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TableChartIcon from "@mui/icons-material/TableChart";
import MapIcon from "@mui/icons-material/Map";
import styled from "@emotion/styled";

const IndicatorContainer = styled(Box)`
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(47, 113, 100, 0.9);
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;

    &:hover {
        background-color: rgba(47, 113, 100, 1);
        transform: translateX(-50%) scale(1.05);
    }
`;

const IndicatorText = styled(Typography)`
    color: white;
    margin-right: 8px;
    font-weight: 500;
`;

interface TableIndicatorProps {
    message: string;
    onClick: () => void;
    isAtTop: boolean;
}

const IndicatorIcon = ({ isAtTop, message }: { isAtTop: boolean; message: string }) => {
    return isAtTop ? (
        <MapIcon sx={{ color: "white" }} />
    ) : message.includes("breakdown") ? (
        <TableChartIcon sx={{ color: "white" }} />
    ) : (
        <ArrowDownwardIcon sx={{ color: "white" }} />
    );
};

const TableIndicator: React.FC<TableIndicatorProps> = ({ message, onClick, isAtTop }) => {
    return (
        <IndicatorContainer
            onClick={onClick}
            sx={{
                bottom: isAtTop ? "auto" : "20px",
                top: isAtTop ? "20px" : "auto"
            }}
        >
            <IndicatorText variant="body2">{isAtTop ? "Back to map controls" : message}</IndicatorText>
            <IndicatorIcon isAtTop={isAtTop} message={message} />
        </IndicatorContainer>
    );
};

export default TableIndicator;
