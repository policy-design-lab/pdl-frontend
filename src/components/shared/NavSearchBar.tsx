import * as React from "react";
import { Grid, IconButton, Typography, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function NavSearchBar({
    bkColor = "rgba(255, 255, 255, 1)",
    brColor = "rgba(205, 205, 205, 0.3)",
    text,
    subtext = ""
}): JSX.Element {
    return (
        <Grid
            container
            sx={{
                border: 1,
                borderLeft: 0,
                borderRight: 0,
                borderColor: brColor,
                padding: 1,
                backgroundColor: bkColor
            }}
        >
            <Grid
                container
                item
                xs={7}
                justifyContent="flex-start"
                sx={{ my: 1, paddingLeft: 3, paddingTop: "0.25em" }}
            >
                <Box display="flex" alignItems="center">
                    <Typography
                        className="NavSearchBar-text"
                        sx={{
                            fontFamily: "Georgia",
                            fontSize: "1em",
                            fontWeight: 700
                        }}
                    >
                        {text}
                    </Typography>
                    <IconButton
                        aria-label="select location"
                        component="label"
                        sx={{ "&:hover": { backgroundColor: "transparent" } }}
                        disableRipple
                    >
                        <ArrowDropDownIcon sx={{ m: 0, p: 0, color: "rgba(63, 63, 63, 1)" }} />
                    </IconButton>
                    {subtext !== "" ? (
                        <Typography
                            className="NavSearchBar-subtext"
                            sx={{
                                fontSize: "0.9em",
                                color: "rgba(0, 0, 0, 0.5)",
                                fontWeight: 400,
                                ml: 3
                            }}
                        >
                            / {subtext}
                        </Typography>
                    ) : null}
                </Box>
            </Grid>
            <Grid container item xs={5} sx={{ flexDirection: "row", my: 1, paddingRight: 3 }} justifyContent="flex-end">
                <Box display="flex" alignItems="center">
                    <SearchIcon
                        sx={{
                            color: "#D3D3D3",
                            backgroundColor: "rgba(242, 245, 244, 1)",
                            borderRadius: "4px",
                            padding: "0.25em"
                        }}
                    />
                </Box>
            </Grid>
        </Grid>
    );
}
