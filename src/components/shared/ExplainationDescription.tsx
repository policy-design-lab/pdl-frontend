import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronUp, ChevronDown } from "react-bootstrap-icons";

const ExpandableDescription = ({ shortDescription, longDescription }) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <Box
            sx={{
                backgroundColor: "#ECF0EE",
                borderRadius: 1,
                mb: 2,
                pt: 1,
                pb: 1,
                pl: 2,
                pr: 1,
                border: "1px solid #c8d6d0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            lineHeight: 1.6,
                            display: "block",
                            textAlign: "left",
                            position: "relative",
                            color: "#333333",
                            fontWeight: 500
                        }}
                    >
                        <Box component="span" sx={{ display: "inline" }}>
                            {shortDescription}
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                display: expanded ? "none" : "inline",
                                marginLeft: "2px",
                                transition: "opacity 0.2s"
                            }}
                        >
                            ...
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                display: expanded ? "inline" : "none",
                                marginLeft: "2px",
                                transition: "opacity 0.2s"
                            }}
                        >
                            {longDescription}
                        </Box>
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label={expanded ? "show less" : "show more"}
                    sx={{
                        "mt": -0.5,
                        "flexShrink": 0,
                        "color": "#2F7164",
                        "&:hover": {
                            backgroundColor: "rgba(47, 113, 100, 0.1)"
                        }
                    }}
                >
                    {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </IconButton>
            </Box>
        </Box>
    );
};
export default ExpandableDescription;
