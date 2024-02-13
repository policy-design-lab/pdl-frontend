import React from "react";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Map from "../components/surface51/components/Map";

export default function Surface51Page(): JSX.Element {
    const defaultTheme = createTheme({
        spacing: 8
    });
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
                    <h5>Will styling and add more components to this page after Surface 51 finalize.</h5>
                    <Map />
                </Box>
                <Footer />
            </Box>
        </ThemeProvider>
    );
}
