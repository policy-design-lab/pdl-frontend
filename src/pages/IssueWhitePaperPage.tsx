import * as React from "react";
import { Box, createTheme, ThemeProvider, Typography, Grid, Tabs, Tab } from "@mui/material";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/issueWhitePaper.css";
import Footer from "../components/Footer";
import WhatFarmsStand from "../files/issues/What_Farmers_Stand.pdf";
import CardPaper from "../components/issueWhitePaper/cardPaper";
import KnowTheScore from "../files/issues/Know_the_Score.pdf";
import CardIFrameReconciliation from "../components/issueWhitePaper/cardIframe-reconcilation";
import CardIFrame from "../components/issueWhitePaper/cardIframe";

export default function IssueWhitePaperPage(): JSX.Element {
    const { id } = useParams();
    const [cardId, setCardId] = React.useState<string>("");
    const [tab, setTab] = React.useState(0);
    const [dimensions, setDimensions] = React.useState({
        width: window.innerWidth * 0.9,
        height: Math.floor(window.innerWidth * 0.9 * 0.6)
    });
    const defaultTheme = createTheme({
        spacing: 8
    });
    const switchBarTable = (_event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    React.useEffect(() => {
        const calculateResponsiveDimensions = () => {
            const newWidth = window.innerWidth * 0.9;
            const aspectRatio = 0.4;
            const newHeight = Math.floor(newWidth * aspectRatio);
            setDimensions({
                width: newWidth,
                height: newHeight
            });
        };
        calculateResponsiveDimensions();
        const handleResize = () => {
            calculateResponsiveDimensions();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
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
                                            <CardIFrameReconciliation
                                                id="issue-reviewing-projections-for-the-additional-conservation-investments-from-the-reconciliation-farm-bill"
                                                title="ISSUE BRIEF: Reviewing Projections for the Additional Conservation Investments from the Reconciliation Farm Bill"
                                                iframeTitle="Reviewing Projections for the Additional Conservation Investments from the Reconciliation Farm Bill"
                                                author="Professor Jonathan Coppess, Policy Design Lab, University of Illinois"
                                                date="August 2025"
                                                description="<b>INCREASED POTENTIAL INVESTMENTS FOR CONSERVATION.</b> <p>In the recently-enacted Reconciliation Farm Bill (P.L. 119-21), Congress increased total available funding for investing in conservation on America's farms, including for working lands practices that increase resilience to extreme weather, improve soil health, and reduce greenhouse gas emissions—all while boosting farm productivity. During the next 10 federal fiscal years (FY2026 to FY2035), farmers will have access to an additional $18 billion in conservation funding. The interactive map provides initial projections of the potential allocations for those new conservation funds to each State.</p>"
                                                iframeLink="https://datawrapper.dwcdn.net/HG50w/1/"
                                                iframeWidth={dimensions.width}
                                                iframeHeight={dimensions.height}
                                                midDescription="<p>The projections are for the increased budget authority to four conservation programs: Environmental Quality Incentives Program (EQIP); Conservation Stewardship Program (CSP); Agricultural Conservation Easement Program ACEP); and the Regional Conservation Partnership Program (RCPP). The map provides projections for increases in each program and State based on historic allocations for each program and the increased budget authority in the statute.</p> <p> If maintained, these funds will support working lands practices that increase resilience to extreme weather, improve soil health, and reduce greenhouse gas emissions—all while boosting farm productivity. The increased level of conservation investment represents a trade-off, however. Congress eliminated the additional conservation investments made by the Inflation Reduction Act (and reviewed in earlier Issue Briefs), using those funds to increase budget authority for the programs over the longer term. In short, the short-term temporary gains in conservation spending were traded for longer-term funding that is expected to be permanent. For this trade-off to be good for farmers, however, the long-term funding must be protected and sustained. </p><p> The increases represent a total potential investment in conservation of over $56 billion in the next ten years and should continue long into the future so long as a future Congress does not cut the funding or eliminate programs. The map also includes each State's projected allocation of the ten-year total funding available. </p><b>CONSERVATION RESERVE PROGRAM AT RISK OF EXPIRATION.</b> <p>A potential risk to conservation remains. The Reconciliation Farm Bill did not include a reauthorization or extension of the Conservation Reserve Program (CRP), the nation's oldest and most prominent farm conservation program. Without further action by Congress, CRP will expire on September 30, 2025. The following chart illustrates what is at risk if CRP expires, including the acres that could come out of the program and the lost investment in terms of potential funding that could be lost.</p>"
                                                midChart="https://datawrapper.dwcdn.net/GKiCP/2/"
                                                midChartAspectRatio={0.6}
                                                endDescription="CRP works through ten-year contracts, which will continue until they expire, but if Congress does not reauthorize the program those contracts expire. As contracts expire, the acres leave the program and could go back into production; acres leaving the program represent the loss of 10-years of rental payments, as well as the lost conservation investments previously made when those acres were enrolled. The consequences of CRP expiration could be extraordinary given experiences of the past, from the Dust Bowl to the erosion crisis of the 1970s and 1980s."
                                            />
                                            <CardIFrame
                                                id="issue-projected-allocation-of-remaining-ira"
                                                title="ISSUE BRIEF: Projected Allocation of Remaining Inflation Reduction Act Conservation Investments"
                                                iframeTitle="Projected Allocation of Remaining Inflation Reduction Act Conservation Investments"
                                                author="Professor Jonathan Coppess, Policy Design Lab, University of Illinois"
                                                date="March 2025"
                                                description="The interactive map updates earlier projections of the potential allocation of remaining Inflation Reduction Act appropriations for conservation programs based on an estimate of how much funding may remain that could potentially be spent; projected allocations were made using a combination of historic allocations from both the Farm Bill and the IRA."
                                                iframeLink="https://datawrapper.dwcdn.net/8siz1/7/"
                                                iframeWidth={dimensions.width}
                                                iframeHeight={dimensions.height}
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
                                                iframeWidth={dimensions.width}
                                                iframeHeight={dimensions.height}
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
