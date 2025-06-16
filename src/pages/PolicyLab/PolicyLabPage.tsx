import { Box, Divider, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/issueWhitePaper.css";
import Surface51SubPage from "./Surface51SubPage";
import { CustomTab } from "../../components/shared/CustomTab";
import HouseProjectionSubPage from "./Proposals/HouseProjectionSubPage";

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
    const { tab, subtab } = useParams();
    const navigate = useNavigate();
    const [value, setValue] = React.useState(0);
    const classes = useStyles();

    useEffect(() => {
        if (tab === "proposal-analysis") {
            setValue(1);
        } else if (tab === "proof-of-concept") {
            setValue(0);
        } else if (tab === "arc-plc-payments" || tab === "eqip-projection") {
            setValue(1);
        } else if (!tab) {
            setValue(0);
        }
    }, [tab]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 0) {
            navigate("/policy-lab/proof-of-concept");
        } else if (newValue === 1) {
            navigate("/policy-lab/proposal-analysis");
        }
    };

    const tabStyle = { fontSize: "1.5em" };
    const selectedStyle = { color: "#2F7164 !important", fontWeight: 600 };
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <Box display="flex" justifyContent="center" sx={{ borderBottom: 0, borderColor: "divider", mx: 4 }}>
                <Tabs variant="scrollable" value={value} onChange={handleChange} scrollButtons="auto" sx={{ mt: 4 }}>
                    <CustomTab label={<Box>Proof of Concept</Box>} customsx={tabStyle} selectedsx={selectedStyle} />
                    <CustomTab label={<Box>Proposal Analysis</Box>} customsx={tabStyle} selectedsx={selectedStyle} />
                </Tabs>
            </Box>
            <Surface51SubPage styleClass={classes} v={value} index={0} />
            <HouseProjectionSubPage
                v={value}
                index={1}
                subtab={
                    tab === "arc-plc-payments" ?
                        "arc-plc-payments" :
                        tab === "eqip-projection" ?
                        "eqip-projection" :
                        subtab
                }
            />
        </Box>
    );
}
