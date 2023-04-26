import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardMedia, Grid } from "@mui/material";
import ncsa from "../images/logos/ncsa logo.png";
import aces from "../images/logos/aces logo.png";
import isee from "../images/logos/isee logo.png";
import igpa from "../images/logos/igpa logo.png";

function ISEELogo() {
    return (
        <div>
            <CardMedia component="img" image={isee} sx={{ maxWidth: "300px", mb: 3 }} />
        </div>
    );
}

function ACESLogo() {
    return (
        <div>
            <CardMedia component="img" image={aces} sx={{ maxWidth: "300px", mb: 3 }} />
        </div>
    );
}

function IGPALogo() {
    return (
        <div>
            <CardMedia component="img" image={igpa} sx={{ maxWidth: "300px", mb: 3 }} />
        </div>
    );
}

function NCSALogo() {
    return (
        <div>
            <CardMedia component="img" image={ncsa} sx={{ maxWidth: "300px", mb: 3 }} />
        </div>
    );
}

export default function Footer(): JSX.Element {
    return (
        <Box
            component="footer"
            sx={{
                mt: 12,
                pt: 3,
                backgroundColor: "#ECF0EE"
            }}
        >
            <Grid container>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            flexDirection: "row",
                            justifyContent: "center",
                            px: 6
                        }}
                    >
                        <Box sx={{ display: "flex", flexWrap: "wrap", m: 0.5, flexDirection: "column" }}>
                            <Typography variant="h6" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                <strong>FARM BILL MAP DATA</strong>
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Total Farm Bill Benefits
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Conservation Programs (Title II)
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Commodities Programs (Title I)
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Crop Insurance
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Supplemental Nutrition Assistance Program (SNAP)
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", m: 0.5, flexDirection: "column" }}>
                            <Typography variant="h6" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                <strong>RELATED RESOURCES</strong>
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Senate Committee on Agriculture, Nutrition, and Forestry
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                House Agriculture Committee
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                U.S. Department of Agriculture
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                farmdoc
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", m: 0.5, flexDirection: "column" }}>
                            <Typography variant="h6" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                <strong>ABOUT US</strong>
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                Data Resource
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mx: 2, my: 1, color: "#242424" }}>
                                PDL Team
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", m: 2, flexDirection: "column" }}>
                            <ACESLogo />
                            <ISEELogo />
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", m: 2, flexDirection: "column" }}>
                            <NCSALogo />
                            <IGPALogo />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Grid sx={{ display: "flex", p: 1, bgcolor: "#2F7164" }}>
                <Box sx={{ flexGrow: 1, ml: 10 }}>
                    <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                        COPYRIGHT © 2022 UNIVERSITY OF ILLINOIS. ALL RIGHTS RESERVED
                    </Typography>
                </Box>
                <Box sx={{ mr: 3 }}>
                    <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                        PRIVACY STATEMENT & TERMS OF USE
                    </Typography>
                </Box>
                <Box sx={{ mr: 3 }}>
                    <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                        IMAGE ATTRIBUTION
                    </Typography>
                </Box>
            </Grid>
        </Box>
    );
}
