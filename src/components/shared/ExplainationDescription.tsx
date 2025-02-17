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
                color: "#2F7164",
                borderRadius: 1,
                mb: 2,
                pt: 1,
                pl: 2,
                pr: 1
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
                            position: "relative"
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
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)"
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
