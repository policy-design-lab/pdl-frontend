import { Box } from "@mui/material";
import React from "react";
import NavBar from "../components/NavBar";
import NavSearchBar from "../components/shared/NavSearchBar";

export default function Surface51Page(): JSX.Element {
    const iframeLink = "https://surface51.github.io/policy-design-lab/";
    const iframeTitle = "Surface51 Policy Design Lab";
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
                <NavBar bkColor="rgba(47, 113, 100, 1)" ftColor="rgba(255, 255, 255, 1)" logo="dark" />
            </Box>
            <Box sx={{ height: "64px" }} />
            <iframe
                title={iframeTitle}
                src={iframeLink}
                allowFullScreen
                style={{ width: "100%", height: "100vh", border: "none" }}
            />
        </Box>
    );
}
