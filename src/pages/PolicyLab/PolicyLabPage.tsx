import { Box, Divider, Tabs } from "@mui/material";
import React from "react";
import { makeStyles } from "@mui/styles";
import NavBar from "../../components/NavBar";
import "../../styles/issueWhitePaper.css";
import Surface51SubPage from "./Surface51SubPage";
import { CustomTab } from "../../components/shared/CustomTab";
import HouseProjectionSubPage from "./HouseProjectionSubPage";

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
    const [value, setValue] = React.useState(0);
    const classes = useStyles();
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const tabStyle = { fontSize: "1.5em" };
    const selectedStyle = { color: "#2F7164 !important", fontWeight: 600 };
    return (
        <Box sx={{ width: "100%", backgroundColor: "#ECF0EE" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(255, 255, 255, 1)" ftColor="rgba(47, 113, 100, 1)" logo="light" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <Box display="flex" justifyContent="center" sx={{ borderBottom: 0, borderColor: "divider", mx: 4 }}>
                {" "}
                <Tabs variant="scrollable" value={value} onChange={handleChange} scrollButtons="auto" sx={{ mt: 4 }}>
                    <CustomTab label={<Box>Policy Design</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab
                        label={<Box>House Outlay Projection</Box>}
                        customSx={tabStyle}
                        selectedSX={selectedStyle}
                    />
                </Tabs>
            </Box>
            <Surface51SubPage styleClass={classes} v={value} index={0} />
            <HouseProjectionSubPage styleClass={classes} v={value} index={2} />
        </Box>
    );
}
