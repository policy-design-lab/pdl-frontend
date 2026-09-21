import React from "react";
import { Box, Typography } from "@mui/material";

export const LOSS_RATIO_THRESHOLDS = [0.6, 0.8, 1.0001, 1.5]; // PI requests the loss ratio to have specific thresholds that are different from the value-based attributes

export const getLossRatioColors = (mapColor: [string, string, string, string, string]): string[] => [
    mapColor[4],
    mapColor[3],
    "#E8C9A3",
    "#B65700",
    "#662500"
];

export const AVERAGE_ATTRIBUTES = ["averageLiabilitiesInDollars", "averageInsuredAreaInAcres"];

export const AVERAGE_BASIS_NOTE = "Averaged per year = total across selected years / number of years selected";

export const AVERAGE_METRIC_TOOLTIP = AVERAGE_BASIS_NOTE;

export const LOSS_RATIO_NOTE = "Loss Ratio = Total Indemnities / Total Premium";

export const PRF_ACRES_NOTE = "(Average acres includes acres insured by Pasture, Rangeland, and Forage (PRF) policies)";

export const getHighlightPillSx = (fontWeight = 400): Record<string, unknown> => ({
    color: "#2F7164",
    backgroundColor: "rgba(47, 113, 100, 0.12)",
    border: "1px solid rgba(47, 113, 100, 0.28)",
    borderRadius: "999px",
    px: 1.25,
    py: 0.35,
    fontWeight
});

export const HighlightPill = ({
    children,
    fontWeight = 400
}: {
    children: React.ReactNode;
    fontWeight?: number;
}): JSX.Element => (
    <Box display="flex" justifyContent="center" mb={2}>
        <Typography noWrap variant="subtitle2" sx={getHighlightPillSx(fontWeight)}>
            {children}
        </Typography>
    </Box>
);

export const NetFarmerBenefitNote = (): JSX.Element => (
    <>
        <b>Net Farmer Benefit = Total Indemnities - Farmer Paid Premium</b> (If Total Indemnities = Farmer Paid Premium,
        Net Farmer Benefits = $0)
    </>
);

export const PrfAcresCaption = (): JSX.Element => (
    <Box display="flex" justifyContent="center">
        <Typography noWrap variant="subtitle2" sx={{ color: "#AAA" }}>
            {PRF_ACRES_NOTE}
        </Typography>
    </Box>
);
