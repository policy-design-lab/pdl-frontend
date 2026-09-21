import React from "react";
import { Box, Link, Typography } from "@mui/material";

interface DataSourceNoteProps {
    source: string;
    href?: string;
    align?: "left" | "center";
    sx?: Record<string, unknown>;
}

const DataSourceNote = ({ source, href, align = "center", sx }: DataSourceNoteProps): JSX.Element => (
    <Box
        sx={{
            display: "flex",
            justifyContent: align === "center" ? "center" : "flex-start",
            mt: 1,
            mb: 2,
            ...sx
        }}
    >
        <Typography variant="caption" sx={{ color: "#777", fontStyle: "italic" }}>
            {source}
            {href ? (
                <>
                    {" "}
                    <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ color: "#2F7164" }}>
                        {href}
                    </Link>
                </>
            ) : null}
        </Typography>
    </Box>
);

export default DataSourceNote;
