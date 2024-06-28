import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "@mui/styles";
import NavBar from "../../components/NavBar";
import "../../styles/issueWhitePaper.css";
import Surface51SubPage from "./Surface51SubPage";

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
    },
    titleTab: {
        "textTransform": "uppercase",
        "fontSize": "16px !important",
        "&.Mui-selected": {
            color: "#2F7164 !important"
        },
        "&:not(:last-child)": {
            borderRight: "1px solid #ccc"
        }
    },
    titleTabGroup: {
        "& .MuiTabs-textColorPrimary": {
            color: "#00000080 !important"
        },
        "& .MuiTabs-indicator": {
            backgroundColor: "#00000080 !important",
            color: "pink !important"
        }
    }
}));
export default function PolicyLabPage(): JSX.Element {
    // const [tab, setTab] = React.useState(0);
    const classes = useStyles();

    // const switchTab = (event, newTab) => {
    //     if (newTab !== null) {
    //         setTab(newTab);
    //     }
    // };

    return (
        <Box sx={{ width: "100%", backgroundColor: "#ECF0EE" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
            </Box>
            <Box sx={{ height: "64px" }} />
            {/* Based on Jun 10 meeting, moving IRA out of Policy Lab page. Leave the code frame here so that it can be re-used for other model predictions. */}
            {/* <Box>
                <Grid
                    container
                    columns={{ xs: 12 }}
                    sx={{
                        pt: 3.5,
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Tabs className={classes.titleTabGroup} value={tab} onChange={switchTab}>
                        <Tab className={classes.titleTab} value={0} label="Policy Design" />

                        <Tab className={classes.titleTab} value={1} label="Inflation Reduction Act" />
                    </Tabs>
                </Grid>
            </Box> */}
            {/* <Box sx={{ display: tab !== 0 ? "none" : "div" }}> */}
            <Surface51SubPage styleClass={classes} />
            {/* </Box> */}
        </Box>
    );
}
