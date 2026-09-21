import React from "react";
import { Box } from "@mui/material";
import { CSVLink } from "react-csv";

interface ExportCsvButtonProps {
    data: string | any[];
    filename: string;
    label?: string;
    sx?: Record<string, unknown>;
}

const ExportCsvButton = ({
    data,
    filename,
    label = "Export This Table to CSV",
    sx
}: ExportCsvButtonProps): JSX.Element => (
    <Box
        component={CSVLink}
        data={data}
        filename={filename}
        sx={{
            backgroundColor: "rgba(47, 113, 100, 1)",
            padding: "8px 16px",
            borderRadius: "4px",
            color: "#fff",
            textDecoration: "none",
            display: "block",
            cursor: "pointer",
            marginBottom: "1em",
            textAlign: "center",
            ...sx
        }}
    >
        {label}
    </Box>
);

export default ExportCsvButton;
