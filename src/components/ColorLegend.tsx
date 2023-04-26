import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function ColorLegend({
    color1,
    color2,
    color3,
    color4,
    color5
}: {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
}): JSX.Element {
    return (
        <div style={{ width: "100%" }}>
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 1,
                        m: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1
                    }}
                >
                    <Typography sx={{ mr: 2 }}>Quantile:</Typography>
                    <Box sx={{ bgcolor: color1, minWidth: 100 }}>
                        <Typography sx={{ mx: 1 }}>0%</Typography>
                    </Box>
                    <Box sx={{ bgcolor: color2, minWidth: 100 }}>
                        <Typography sx={{ mx: 1 }}>20%</Typography>
                    </Box>
                    <Box sx={{ bgcolor: color3, minWidth: 100 }}>
                        <Typography sx={{ mx: 1 }}>40%</Typography>
                    </Box>
                    <Box sx={{ bgcolor: color4, minWidth: 100 }}>
                        <Typography sx={{ mx: 1 }}>60%</Typography>
                    </Box>
                    <Box sx={{ bgcolor: color5, minWidth: 100 }}>
                        <Typography sx={{ mx: 1 }}>80%</Typography>
                    </Box>
                    <Typography sx={{ mx: 1 }}>100%</Typography>
                </Box>
            </Box>
        </div>
    );
}
