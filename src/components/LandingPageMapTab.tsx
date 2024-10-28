import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { createTheme, styled, Typography, ThemeProvider } from "@mui/material";
import Divider from "@mui/material/Divider";
import LandingPageTotalMap from "./LandingPageTotalMap";
import LandingPageProgramMap from "./LandingPageProgramMap";
import LandingDisplay from "./LandingDisplay";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2F7164"
        }
    }
});

function TabPanel({
    value,
    index,
    title,
    allStates,
    stateCodes,
    allPrograms,
    summary
}: {
    value: any;
    index: any;
    title: string;
    allStates: any;
    stateCodes: any;
    allPrograms: any;
    summary: any;
}) {
    return (
        <div>
            {window.innerWidth > 1679 ? (
                <Box role="tabpanel" hidden={value !== index}>
                    {value === index && (
                        <Box
                            sx={{
                                width: "70%",
                                mx: "auto"
                            }}
                        >
                            {title.includes("All Programs") && (
                                <LandingPageTotalMap
                                    programTitle={title}
                                    allStates={allStates}
                                    stateCodes={stateCodes}
                                    allPrograms={allPrograms}
                                    summary={summary}
                                />
                            )}
                            {!title.includes("All Programs") && (
                                <LandingPageProgramMap
                                    programTitle={title}
                                    allStates={allStates}
                                    stateCodes={stateCodes}
                                    allPrograms={allPrograms}
                                    summary={summary}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            ) : (
                <Box role="tabpanel" hidden={value !== index}>
                    {value === index && (
                        <Box
                            sx={{
                                width: "80%",
                                mx: "auto"
                            }}
                        >
                            {title.includes("All Programs") && (
                                <LandingPageTotalMap
                                    programTitle={title}
                                    allStates={allStates}
                                    stateCodes={stateCodes}
                                    allPrograms={allPrograms}
                                    summary={summary}
                                />
                            )}
                            {!title.includes("All Programs") && (
                                <LandingPageProgramMap
                                    programTitle={title}
                                    allStates={allStates}
                                    stateCodes={stateCodes}
                                    allPrograms={allPrograms}
                                    summary={summary}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            )}
            {value === index && (
                <Box sx={{ width: "100%" }}>
                    {" "}
                    <LandingDisplay programTitle={title} />{" "}
                </Box>
            )}
        </div>
    );
}

export default function LandingPageMapTab({
    allStates,
    stateCodes,
    allPrograms,
    summary
}: {
    allStates: any;
    stateCodes: any;
    allPrograms: any;
    summary: any;
}): JSX.Element {
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

    const totals = React.useMemo(() => {
        return {
            allProgramTotal: allPrograms.reduce(
                (sum, state) => sum + Number(state["18-22 All Programs Total"] || 0),
                0
            ),
            titleITotal: allPrograms.reduce((sum, state) => sum + Number(state["Title I Total"] || 0), 0),
            titleIITotal: allPrograms.reduce((sum, state) => sum + Number(state["Title II Total"] || 0), 0),
            cropTotal: allPrograms.reduce((sum, state) => sum + Number(state["Crop Insurance Total"] || 0), 0),
            snapTotal: allPrograms.reduce((sum, state) => sum + Number(state["SNAP Total"] || 0), 0)
        };
    }, [allPrograms]);
    const formatBillions = (value: number) => {
        return `$${(value / 1000000000.0).toFixed(2)}B`;
    };

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
                            <Typography variant="h4" className="smallCaps" style={{ textAlign: "center" }}>
                                <strong>Farm Bill Data</strong>
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ my: 1, color: "#00000099", fontStyle: "normal", fontSize: "1rem" }}
                            >
                                Map Visualization
                            </Typography>
                        </Box>
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>All Programs</Typography>
                                    <br />
                                    <Typography>{formatBillions(totals.allProgramTotal)}</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Title I: Commodities</Typography>
                                    <br />
                                    <Typography>{formatBillions(totals.titleITotal)}</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Title II: Conservation</Typography>
                                    <br />
                                    <Typography>{formatBillions(totals.titleIITotal)}</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Crop Insurance</Typography>
                                    <br />
                                    <Typography>{formatBillions(totals.cropTotal)}</Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                        <CustomTab
                            label={
                                <Box>
                                    <Typography>Supplemental Nutrition Assistance Program</Typography>
                                    <br />
                                    <Typography>{formatBillions(totals.snapTotal)}</Typography>
                                </Box>
                            }
                        />
                    </Tabs>
                </ThemeProvider>
            </Box>
            <TabPanel
                value={value}
                index={0}
                title="All Programs"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
            <TabPanel
                value={value}
                index={2}
                title="All Programs"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
            <TabPanel
                value={value}
                index={4}
                title="Title I: Commodities"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
            <TabPanel
                value={value}
                index={6}
                title="Title II: Conservation"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
            <TabPanel
                value={value}
                index={8}
                title="Crop Insurance"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
            <TabPanel
                value={value}
                index={10}
                title="Supplemental Nutrition Assistance Program (SNAP)"
                allStates={allStates}
                stateCodes={stateCodes}
                allPrograms={allPrograms}
                summary={summary}
            />
        </Box>
    );
}
