import React from "react";
import { Box, Button, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BRAND_GREEN, BRAND_GREEN_05, SURFACE_MINT, TEXT_MUTED } from "../../shared/colors";

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
            backgroundColor: SURFACE_MINT,
            borderRadius: "4px",
            border: "1px solid rgba(47, 113, 100, 0.2)"
        }}
    >
        <InfoOutlinedIcon sx={{ color: BRAND_GREEN, fontSize: "2rem" }} />
        <Typography variant="h6" sx={{ color: BRAND_GREEN }}>
            Data not available for this year selection
        </Typography>
        <Typography variant="body2" sx={{ color: "#555", maxWidth: "42rem" }}>
            {reason}
        </Typography>
        {selectedYears.length > 0 && (
            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                Currently selected: {selectedYears.join(", ")}
            </Typography>
        )}
        <Button
            onClick={onResetYears}
            sx={{
                "mt": 1,
                "color": BRAND_GREEN,
                "border": "1px solid rgba(47, 113, 100, 0.5)",
                "textTransform": "none",
                "&:hover": {
                    backgroundColor: BRAND_GREEN_05
                }
            }}
        >
            Reset year selection
        </Button>
    </Box>
);

export default CropInsuranceDataUnavailable;
