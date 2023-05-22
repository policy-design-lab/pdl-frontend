import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { CardMedia, createTheme, styled, Typography, ThemeProvider } from "@mui/material";
import Divider from "@mui/material/Divider";
import LandingPageMap from "./LandingPageMapUpdatedSNAP";
import AllProgramMap from "./AllProgramMap";
import allPrograms from "../data/allPrograms.json";
import LandingDisplay from "./LandingDisplay";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2F7164"
        }
    }
});

interface TabPanelProps {
    index: number;
    value: number;
    title: string;
}

function TabPanel(props: TabPanelProps) {
    const { value, index, title, ...other } = props;

    return (
        <Box role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box
                    sx={{
                        width: "60%",
                        mx: "auto"
                    }}
                >
                    {title === "All Programs" ? <AllProgramMap /> : <LandingPageMap programTitle={title} />}
                </Box>
            )}
            {value === index && (
                <Box sx={{ width: "100%" }}>
                    {" "}
                    <LandingDisplay programTitle={title} />{" "}
                </Box>
            )}
        </Box>
    );
}

export default function LandingPageMapTab(): JSX.Element {
    const [value, setValue] = React.useState(2);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    interface StyledTabProps {
        label: JSX.Element;
    }

    const CustomTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)({
        textTransform: "none"
    });

    const cur = allPrograms.find((s) => s.State === "Total");
    const allProgramTotal = cur["18-22 All Programs Total"];
    const titleITotal = cur["Title I Total"];
    const titleIITotal = cur["Title II Total"];
    const cropTotal = cur["Crop Insurance Total"];
    const snapTotal = cur["SNAP Total"];

    return (
        <Box sx={{ width: "100%", mt: 5 }}>
            <Box display="flex" justifyContent="center" width="100%" sx={{ borderBottom: 1, borderColor: "divider" }}>
                <ThemeProvider theme={theme}>
                    <Tabs
                        TabIndicatorProps={{ style: { background: "#2F7164" } }}
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        centered
                        className="tab"
                    >
                        <Box sx={{ mt: 1.5, pb: 0, mr: 8 }}>
                            <Typography variant="h4" className="smallCaps">
                                <strong>Farm Bill Data</strong>
                            </Typography>
                            <Typography variant="h6" className="allSmallCaps" sx={{ mt: 1 }}>
                                <strong>Map visualization</strong>
                            </Typography>
                        </Box>
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>All Programs</Typography>
                                    <br />
                                    <Typography>${Number(allProgramTotal / 1000000000.0).toFixed(2)}B</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Title I: Commodities</Typography>
                                    <br />
                                    <Typography>${Number(titleITotal / 1000000000.0).toFixed(2)}B</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Title II: Conservation</Typography>
                                    <br />
                                    <Typography>${Number(titleIITotal / 1000000000.0).toFixed(2)}B</Typography>
                                </Box>
                            }
                        />
                        {/* <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
    					<CustomTab
    						label={
    							<Box>
    								<Typography>Crop Insurance</Typography>
    								<br />
    								<Typography>${Number(cropTotal / 1000000000.0).toFixed(2)}B</Typography>
    							</Box>
    						}
    					/> */}
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Supplemental Nutrition Assistance Program</Typography>
                                    <br />
                                    <Typography>${Number(snapTotal / 1000000000.0).toFixed(2)}B</Typography>
                                </Box>
                            }
                        />
                    </Tabs>
                </ThemeProvider>
            </Box>
            <TabPanel value={value} index={0} title="All Programs" />
            <TabPanel value={value} index={2} title="All Programs" />
            <TabPanel value={value} index={4} title="Title I: Commodities" />
            <TabPanel value={value} index={6} title="Title II: Conservation" />
            {/* <TabPanel value={value} index={8} title="Crop Insurance" /> */}
            <TabPanel value={value} index={8} title="Supplemental Nutrition Assistance Program (SNAP)" />
        </Box>
    );
}
