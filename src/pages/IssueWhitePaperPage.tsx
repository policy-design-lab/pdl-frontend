import * as React from "react";
import { Box, createTheme, ThemeProvider, Typography, Grid, Tabs, Tab } from "@mui/material";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/issueWhitePaper.css";
import Footer from "../components/Footer";
import CardIFrame from "../components/issueWhitePaper/cardIframe";
import WhatFarmsStand from "../files/issues/What_Farmers_Stand.pdf";
import CardPaper from "../components/issueWhitePaper/cardPaper";
import KnowTheScore from "../files/issues/Know_the_Score.pdf";

export default function IssueWhitePaperPage(): JSX.Element {
    const { id } = useParams();
    const [cardId, setCardId] = React.useState<string>("");
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

    React.useEffect(() => {
        if (id) {
            setCardId(id);
        }
    }, [id]);
    React.useEffect(() => {
        if (cardId) {
            if (cardId.includes("white-paper")) setTab(1);
            else setTab(0);
            const element = document.getElementById(cardId);
            if (element) {
                let offsetPosition = 0;
                if (cardId.includes("white-paper")) {
                    const offset = 20; // offset for white paper because of the iframe on the issue part
                    const elementPosition = element.getBoundingClientRect().top;
                    offsetPosition = elementPosition - offset;
                }
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    }, [cardId]);
    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                    <NavBar bkColor="#2F7164" ftColor="#FFFFFF" logo="dark" />
                </Box>
                <Box
                    sx={{
                        minHeight: "80vh" // since paper section is not full height, set min height to 100vh
                    }}
                >
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
                                                id="issue-projected-allocation-of-remaining-ira"
                                                title="ISSUE BRIEF: Projected Allocation of Remaining Inflation Reduction Act Conservation Investments"
                                                iframeTitle="Projected Allocation of Remaining Inflation Reduction Act Conservation Investments"
                                                author="Professor Jonathan Coppess, Policy Design Lab, University of Illinois"
                                                date="March 2025"
                                                description="The interactive map updates earlier projections of the potential allocation of remaining Inflation Reduction Act appropriations for conservation programs based on an estimate of how much funding may remain that could potentially be spent; projected allocations were made using a combination of historic allocations from both the Farm Bill and the IRA."
                                                iframeLink="https://datawrapper.dwcdn.net/8siz1/7/"
                                                iframeWidth={iframeWidth}
                                                iframeHeight={iframeHeight}
                                            />
                                            <CardIFrame
                                                id="issue-what-farmers-stand"
                                                title="ISSUE BRIEF: What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                                iframeTitle="What Farmers Stand to Lose in the Farm Bill If Congress Eliminates Conservation Investments"
                                                author="Professor Jonathan Coppess, Policy Design Lab, University of Illinois"
                                                date="Nov. 15 2023"
                                                description="As Congress considers reauthorizing the Farm Bill, vital resources that are available to farmers and ranchers today are at risk — specifically the $18 billion investment from the Inflation Reduction Act (IRA) for the U.S. Department of Agriculture’s (USDA) popular conservation programs. This issue brief provides a first look at what farmers stand to lose in each state if these investments are eliminated by Congress."
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
                                        >
                                            <CardPaper
                                                id="white-paper-know-the-score"
                                                title="Know the Score: The Hidden Costs of Repurposing Farm Conservation Investments"
                                                description="In the pending farm bill reauthorization, potential efforts to repurpose recent investments in farm conservation programs are plagued by hidden costs from obscure budget rules that risk farmers losing much, if not all, of the investments; this white paper discusses those hidden costs and the risks to conservation assistance to farmers."
                                                author="Professor Jonathan Coppess, Policy Design Lab, University of Illinois"
                                                date="May 2024"
                                                link={KnowTheScore}
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
                </Box>
                <Footer />
            </Box>
        </ThemeProvider>
    );
}
