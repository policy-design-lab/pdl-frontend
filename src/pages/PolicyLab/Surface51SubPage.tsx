import { Box, Typography, Grid } from "@mui/material";
import * as React from "react";
import AleskiThesis from "../../files/Aleski_Thesis.pdf";

export default function Surface51SubPage({styleClass}:{styleClass:any}): JSX.Element {
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
        <div>
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
                    Proof-of-Concept: Policy Design
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
                    Visualizing potential design changes for a farm payment program
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
                            Demonstrating the potential impacts of changes to farm policy design
                        </Typography>
                        <Typography sx={{ fontSize: "1.125rem", px: 3, py: 3 }}>
                            The following visualizes the modeling of possible changes in the policy design of a specific
                            farm payment program, Agriculture Risk Coverage, County Option (ARC-CO). It provides an
                            initial demonstration or example for how revising program calculations can impact payments
                            to farmers
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
                                Current policy design for ARC-CO
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
                            <Typography sx={{ color: "#000000DE", fontSize: "1.125rem", px: 3, pt: 1, pb: 3 }}>
                                The visualization below presents two different design options for ARC-CO:
                            </Typography>

                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, py: 0.5 }}>
                                (1) Redesigned policy: Adjusted ARC-CO
                            </Typography>
                            <Typography sx={{ fontSize: "1.125rem", px: 3, pb: 3, pt: 0.5 }}>
                                For farmers enrolling in program and adopting cover crops on acres associated, the
                                actual revenue calculation in the crop year is discounted or reduced by <b>$50</b> per
                                acre to account for cost of cover crop adoption.
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", px: 3, py: 0.5 }}>
                                (2) Redesigned policy: Enhanced ARC-CO
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
                    <Grid xs={12} md={8}>
                        <div className={styleClass.iframeContainer}>
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
                </Grid>
            </Box>
        </div>
    );
}
