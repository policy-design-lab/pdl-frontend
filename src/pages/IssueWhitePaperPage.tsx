// RELEASE NOTE Nov 16: hide issue/switch panel because client only has one issue brief available. Unhide this after white paper is available.
import * as React from "react";
import { Box, createTheme, ThemeProvider, Typography, Grid, Tabs, Tab } from "@mui/material";
import NavBar from "../components/NavBar";
import "../styles/issueWhitePaper.css";
import Footer from "../components/Footer";
import CardIFrame from "../components/issueWhitePaper/cardIframe";
import WhatFarmsStand from "../files/issues/What_Farmers_Stand.pdf";

export default function IssueWhitePaperPage(): JSX.Element {
    const [tab, setTab] = React.useState(0);

    const defaultTheme = createTheme({
        spacing: 8
    });
    const switchBarTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const iframeWidth = window.innerWidth * 0.9;
    const iframeHeight = window.innerWidth > 1679 ? window.innerHeight * 0.92 : window.innerHeight * 0.95;

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                    <NavBar bkColor="#2F7164" ftColor="#FFFFFF" logo="dark" />
                </Box>
                <Box
                    className="MainContent"
                    sx={{
                        position: "relative",
                        top: 0,
                        width: "90%",
                        m: "0 auto",
                        pt: 10,
                        pb: 1
                    }}
                >
                    <Box component="div">
                        <Grid
                            container
                            columns={{ xs: 12 }}
                            sx={{
                                pt: 3.5
                                // display: "none"
                            }}
                        >
                            <Tabs
                                className="titleTabGroup"
                                value={tab}
                                onChange={switchBarTable}
                                sx={{
                                    "& .MuiTabs-textColorPrimary": {
                                        color: "#00000080"
                                    },
                                    "& .MuiTabs-indicator": {
                                        backgroundColor: "#00000080",
                                        color: "pink"
                                    }
                                }}
                            >
                                <Tab
                                    className="titleTab"
                                    value={0}
                                    label="ISSUE BRIEF"
                                    sx={{
                                        "textTransform": "uppercase",
                                        "fontSize": 24,
                                        "fontWeight": 400,
                                        "&.Mui-selected": {
                                            color: "#000000DE"
                                        }
                                    }}
                                />
                                <Tab
                                    className="titleTab"
                                    value={1}
                                    label="WHITE PAPERS"
                                    sx={{
                                        "textTransform": "uppercase",
                                        "fontSize": 24,
                                        "fontWeight": 400,
                                        "&.Mui-selected": {
                                            color: "#000000DE"
                                        }
                                    }}
                                />
                            </Tabs>
                        </Grid>
                        <Grid
                            container
                            columns={{ xs: 12 }}
                            sx={{
                                marginTop: 2,
                                borderTop: "1px #CBCBCB solid"
                            }}
                        >
                            <Box sx={{ display: tab !== 0 ? "none" : "div" }}>
                                <Grid
                                    container
                                    columns={{ xs: 12 }}
                                    className="FullListContainer"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start"
                                    }}
                                >
                                    <Grid
                                        container
                                        xs={12}
                                        justifyContent="flex-start"
                                        sx={{ display: "flex", width: "100%" }}
                                    >
                                        <CardIFrame
                                            title="ISSUE BRIEF: What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                            iframeTitle="What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                            author="Professor Jonathan Coppess"
                                            date="Nov. 15 2023"
                                            link={WhatFarmsStand}
                                            iframeLink="https://datawrapper.dwcdn.net/jeiT4/5/"
                                            iframeWidth={iframeWidth}
                                            iframeHeight={iframeHeight}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ display: tab !== 1 ? "none" : "div" }}>
                                <Grid
                                    container
                                    columns={{ xs: 12 }}
                                    className="FullListContainer"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start"
                                    }}
                                >
                                    <Grid
                                        container
                                        xs={12}
                                        justifyContent="flex-start"
                                        sx={{ display: "flex", width: "100%" }}
                                    />
                                </Grid>
                            </Box>
                        </Grid>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                        sx={{ color: "#000000DE", fontSize: "1em", mt: 5, fontStyle: "italic", fontWeight: "400" }}
                    >
                        More publication coming soon ...
                    </Typography>
                </Box>
                <Footer />
            </Box>
        </ThemeProvider>
    );
}
