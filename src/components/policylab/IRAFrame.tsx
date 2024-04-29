import { Tabs, Tab, Box, Typography, Divider, Grid } from "@mui/material";
import * as React from "react";
import mockup from "../../images/mockup.png";
import { CustomTab } from "../shared/CustomTab";

export default function IRAFrame(): JSX.Element {
    const [value, setValue] = React.useState(0);
    const tabStyle = { fontSize: "1.5em" };
    const selectedStyle = { color: "#2F7164 !important", fontWeight: 600 };
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    function TabPanel({ v, index, title }: { v: any; index: any; title: string }) {
        return (
            <Box role="tabpanel" hidden={v !== index}>
                {v === index && (
                    <Grid
                        container
                        xs={12}
                        sx={{
                            display: "flex",
                            my: 3,
                            backgroundColor: "white",
                            minHeight: "50vh",
                            justifyContent: "center"
                        }}
                    >
                        <Grid>
                            <h2>{title}</h2>
                        </Grid>
                        <Grid>
                            <Box
                                component="img"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                                src={mockup}
                            />
                        </Grid>
                    </Grid>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", mt: 1, backgroundColor: "white" }}>
            <Box display="flex" justifyContent="center" sx={{ borderBottom: 1, borderColor: "divider", mx: 6 }}>
                <Tabs variant="scrollable" value={value} onChange={handleChange} scrollButtons="auto" sx={{ mt: 3 }}>
                    <CustomTab label={<Box>EQIP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>CSP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <CustomTab label={<Box>RCPP</Box>} customSx={tabStyle} selectedSX={selectedStyle} />
                </Tabs>
            </Box>
            {/* NOTE: Because of divider, the index are increased by 2 */}
            <TabPanel v={value} index={0} title="EQIP" />
            <TabPanel v={value} index={2} title="CSP" />
            <TabPanel v={value} index={4} title="RCPP" />
        </Box>
    );
}
