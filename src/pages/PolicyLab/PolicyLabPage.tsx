import { Box, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/issueWhitePaper.css";
import Surface51SubPage from "./Surface51SubPage";
import { CustomTab } from "../../components/shared/CustomTab";
import HouseProjectionSubPage from "./Proposals/HouseProjectionSubPage";
import ReconciliationSubPage from "./Reconciliation/ReconciliationSubPage";

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
    const { tab, subtab, subsubtab } = useParams();
    const navigate = useNavigate();
    const [value, setValue] = React.useState(0);
    const classes = useStyles();

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath === "/policy-lab/2025-reconciliation-farm-bill") {
            setValue(2);
        } else if (currentPath.startsWith("/policy-lab/2025-reconciliation-farm-bill/title-i")) {
            setValue(2);
        } else if (tab === "proposal-analysis") {
            setValue(1);
        } else if (tab === "2025-reconciliation-farm-bill" || tab === "title-i") {
            setValue(2);
        } else if (tab === "proof-of-concept") {
            setValue(0);
        } else if (tab === "arc-plc-payments" || tab === "eqip-projection") {
            setValue(1);
        } else if (!tab || currentPath === "/policy-lab") {
            setValue(0);
        }
    }, [tab, subtab, subsubtab]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 0) {
            navigate("/policy-lab/proof-of-concept");
        } else if (newValue === 1) {
            navigate("/policy-lab/proposal-analysis");
        } else if (newValue === 2) {
            navigate("/policy-lab/2025-reconciliation-farm-bill");
        }
    };

    const tabStyle = { fontSize: "1.2em" };
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
                    <CustomTab
                        label={<Box>2025 Reconciliation Farm Bill</Box>}
                        customsx={tabStyle}
                        selectedsx={selectedStyle}
                    />
                </Tabs>
            </Box>
            <Surface51SubPage styleClass={classes} v={value} index={0} />
            <HouseProjectionSubPage
                v={value}
                index={1}
                subtab={(() => {
                    if (tab === "arc-plc-payments") {
                        return "arc-plc-payments";
                    }
                    if (tab === "eqip-projection") {
                        return "eqip-projection";
                    }
                    if (tab === "proposal-analysis") {
                        return subtab;
                    }
                    return undefined;
                })()}
            />
            <ReconciliationSubPage
                v={value}
                index={2}
                subtab={(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath === "/policy-lab/2025-reconciliation-farm-bill") {
                        return undefined;
                    }
                    if (
                        tab === "2025-reconciliation-farm-bill" &&
                        subtab === "title-i" &&
                        subsubtab === "arc-plc-payments"
                    ) {
                        return "arc-plc-payments";
                    }
                    if (tab === "2025-reconciliation-farm-bill" && subtab === "title-i" && !subsubtab) {
                        return "title-i";
                    }
                    if (tab === "title-i" && subtab === "arc-plc-payments") {
                        return "arc-plc-payments";
                    }
                    if (tab === "title-i" && !subtab) {
                        return "title-i";
                    }
                    if (tab === "2025-reconciliation-farm-bill") {
                        return subtab;
                    }
                    return undefined;
                })()}
            />
        </Box>
    );
}
