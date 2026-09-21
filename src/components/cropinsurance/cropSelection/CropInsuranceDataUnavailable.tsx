import React from "react";
import { Box, Button, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface CropInsuranceDataUnavailableProps {
    reason: string;
    selectedYears: string[];
    onResetYears: () => void;
}

const CropInsuranceDataUnavailable: React.FC<CropInsuranceDataUnavailableProps> = ({
    reason,
    selectedYears,
    onResetYears
}) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1.5,
            px: 3,
            py: 6,
            mb: 3,
            backgroundColor: "#ECF0EE",
            borderRadius: "4px",
            border: "1px solid rgba(47, 113, 100, 0.2)"
        }}
    >
        <InfoOutlinedIcon sx={{ color: "rgba(47, 113, 100, 1)", fontSize: "2rem" }} />
        <Typography variant="h6" sx={{ color: "#2F7164" }}>
            Data not available for this year selection
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", maxWidth: "42rem" }}>
            {reason}
        </Typography>
        {selectedYears.length > 0 && (
            <Typography variant="body2" sx={{ color: "#888" }}>
                Currently selected: {selectedYears.join(", ")}
            </Typography>
        )}
        <Button
            onClick={onResetYears}
            sx={{
                "mt": 1,
                "color": "rgba(47, 113, 100, 1)",
                "border": "1px solid rgba(47, 113, 100, 0.5)",
                "textTransform": "none",
                "&:hover": {
                    backgroundColor: "rgba(47, 113, 100, 0.05)"
                }
            }}
        >
            Reset year selection
        </Button>
    </Box>
);

export default CropInsuranceDataUnavailable;
