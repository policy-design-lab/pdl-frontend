import React from "react";
import { Box, Typography } from "@mui/material";
import { ShortFormat } from "../ConvertionFormats";
import { SparseCountyEntry } from "../../../utils/countyColorScale";
import { TEXT_DIM, TEXT_FAINT } from "../colors";

interface SparseCountyLegendProps {
    title: React.ReactNode;
    entries: SparseCountyEntry[];
    highlightColor: string;
    emptyMessage: string;
    notDollar?: boolean;
}

const formatValue = (value: number, notDollar: boolean): string => {
    const formatted = ShortFormat(Math.abs(value), undefined, 2);
    const sign = value < 0 ? "-" : "";
    return notDollar ? `${sign}${formatted}` : `${sign}$${formatted}`;
};

const SparseCountyLegend = ({
    title,
    entries,
    highlightColor,
    emptyMessage,
    notDollar = false
}: SparseCountyLegendProps): JSX.Element => {
    const countLabel = entries.length === 1 ? "Only 1 county has data" : `Only ${entries.length} counties have data`;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 560 }}>
            <Box display="flex" justifyContent="center">
                <Typography variant="h5" sx={{ mb: 1 }}>
                    <strong>{title}</strong>
                </Typography>
            </Box>
            {entries.length === 0 ? (
                <Box display="flex" justifyContent="center">
                    <Typography sx={{ color: TEXT_FAINT, fontWeight: 700 }}>{emptyMessage}</Typography>
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" alignItems="center" sx={{ gap: 0.5 }}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent="center" sx={{ gap: 1 }}>
                        <Box sx={{ width: 24, height: 10, bgcolor: highlightColor, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "0.9em" }}>
                            {countLabel}:{" "}
                            {entries.map((entry, index) => (
                                <span key={entry.fips}>
                                    {index > 0 && "; "}
                                    <strong>{entry.label}</strong> ({formatValue(entry.value, notDollar)})
                                </span>
                            ))}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.8em", color: TEXT_DIM }}>
                        Too few counties to build a color scale. Gray areas indicate data is not visible or available.
                        Search in the table for details.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default SparseCountyLegend;
