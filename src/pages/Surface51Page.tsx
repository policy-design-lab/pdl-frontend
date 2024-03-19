import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "@mui/styles";
import NavBar from "../components/NavBar";
import AleskiThesis from "../files/Aleski_Thesis.pdf";

const useStyles = makeStyles(() => ({
    iframeContainer: {
        "height": window.innerHeight > 900 ? "150vh" : "100vh",
        "backgroundColor": "white",
        "padding": 0,
        "margin": 0,
        "& iframe": {
            "width": "100%",
            "min-height": "100%",
            "border": "none"
        }
    }
}));
export default function Surface51Page(): JSX.Element {
    const classes = useStyles();
    const iframeLink = "https://surface51.github.io/policy-design-lab/";
    const iframeTitle = "Surface51 Policy Design Lab";
    function TrendIcon({ bkColor, fontColor, text }) {
        return (
            <Box
                sx={{
                    display: "inline-block",
                    ml: 1,
                    px: 1,
                    textAlign: "center",
                    backgroundColor: bkColor,
                    color: `${fontColor} !important`,
                    fontSize: "0.85em",
                    borderRadius: "1rem"
                }}
            >
                {text}
            </Box>
        );
    }
    return (
        <Box sx={{ width: "100%", backgroundColor: "#ECF0EE" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <Box>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: "#242424",
                        mt: 4.5,
                        textAlign: "center"
                    }}
                >
                    Adjusted ARC-CO Payments
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 400,
                        fontSize: "0.875rem",
                        color: "#00000099",
                        mb: 4.5,
                        textAlign: "center"
                    }}
                >
                    Title II Commodities Programs Policy Design
                </Typography>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{ backgroundColor: "#2F7164", color: "white", borderRadius: 1, mb: 4.5 }}
                    >
                        <Typography sx={{ fontWeight: 500, fontSize: "1.25rem", px: 3, py: 0.5 }}>
                            Why we redesign this policy?
                        </Typography>
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            Agriculture Risk Coverage, County Option (ARC-CO): Revising program calculations will change
                            payment rates and expectations; policy design can help encourage practice adoption or
                            improve expected benefits to farmers
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid
                        container
                        xs={12}
                        md={8}
                        sx={{
                            color: "#000000B2 !important",
                            backgroundColor: "white",
                            borderRadius: 1,
                            mb: 4.5,
                            px: 3,
                            py: 3
                        }}
                    >
                        <Grid item md={6}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, pt: 1, pb: 0.5 }}>
                                What is Agriculture Risk Coverage, County Option (ARC-CO)?
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                                It provides income supporting payments to farmers who enroll eligible acres. Payments
                                are triggered when a crop’s revenue (Prices x Yields) falls below a historical
                                benchmark.
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, py: 0.5 }}>
                                ARC-CO current calculation:
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Benchmark = 5-year Olympic (drop highest and lowest year) average of national average
                                prices and county average yields.
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Guarantee = <b>86%</b> of Benchmark.{" "}
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Payment Rate = Difference between actual revenue in the year (national average prices X
                                county average yields) and the Guarantee; not to exceed <b>10%</b> of benchmark
                            </Typography>
                        </Grid>
                        <Grid item md={6} sx={{ borderLeft: "1px solid #0000001F" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, pt: 1, pb: 0.5 }}>
                                What is Adjusted ARC-CO?
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                                For farmers enrolling in program and adopting cover crops on acres associated, the
                                actual revenue calculation in the crop year is discounted or reduced by <b>$50</b> per
                                acre to account for cost of cover crop adoption.
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, py: 0.5 }}>
                                Enhanced ARC-CO (EARC-CO) calculation:
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Benchmark = 5-year Olympic (drop highest and lowest year) average of national average
                                prices and county average yields.{" "}
                                <TrendIcon bkColor="#00000014" fontColor="#000000DE" text="Unchanged" />
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Guarantee = <b>90%</b> of Benchmark{" "}
                                <TrendIcon bkColor="#2F7164" fontColor="white" text="Increased" />
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, py: 0.5 }}>
                                Payment Rate = Difference between actual revenue in the year (national average prices X
                                county average yields) and the Guarantee; not to exceed <b>15%</b> of benchmark{" "}
                                <TrendIcon bkColor="#2F7164" fontColor="white" text="Increased" />
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2} />
                    <Grid item xs={12} md={8}>
                        <div className={classes.iframeContainer}>
                            <iframe id="surface51-iframe" title={iframeTitle} src={iframeLink} allowFullScreen />
                        </div>
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ backgroundColor: "white", borderRadius: 1, mt: 4.5 }}>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            textAlign: "center",
                            py: "1rem"
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", px: 3, py: 0.5, color: "#2F7164" }}>
                            Related Paper:
                        </Typography>

                        <Typography sx={{ fontWeight: 400, fontSize: "1.125rem", color: "#333333" }}>
                            <a href={AleskiThesis} target="blank" style={{ color: "#333333" }}>
                                Harvesting Data A Methodology For Analyzing Innovations In Agricultural Policy
                            </a>{" "}
                            By Aleksi Knepp
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            borderTop: "1px solid #0000001F",
                            textAlign: "center",
                            color: "#00000080",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            mb: 3
                        }}
                    >
                        Copyright
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
