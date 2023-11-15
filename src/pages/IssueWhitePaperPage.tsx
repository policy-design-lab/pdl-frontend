import * as React from "react";
import { Box, createTheme, ThemeProvider, Typography, Grid, Tabs, Tab } from "@mui/material";
import NavBar from "../components/NavBar";
import "../styles/issueWhitePaper.css";
import Footer from "../components/Footer";
import CardPaper from "../components/issueWhitePaper/cardPaper";
import CardIFrame from "../components/issueWhitePaper/cardIframe";

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
                                pt: 3.5,
                                display: "none" // comment out this line to show the switch tabs!
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
                                        {/* Copy card components and make new ones! */}
                                        <CardIFrame
                                            title="ISSUE BRIEF: What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                            iframeTitle="What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                            author="Professor Jonathan Coppess"
                                            date="Nov. 15 2023"
                                            link="https://policydesignlab.ncsa.illinois.edu/" // replace this to PDF link
                                            iframeLink="https://datawrapper.dwcdn.net/jeiT4/5/"
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
                                    >
                                        {/* Copy card components and make new ones! */}
                                        <CardPaper
                                            title="Lorem ipsum dolor sit amet consectetur sit amet consectetur."
                                            author="Professor Coppess"
                                            date="Nov. 2 2023"
                                            link="https://drive.google.com/file/d/0B28Gtf1n8u8DUnF2cTliTXo2Y1E/view?resourcekey=0-pd6Q3GLnI09wt1u5EoGAAQ"
                                        />
                                    </Grid>
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
