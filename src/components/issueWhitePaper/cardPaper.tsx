import { Button, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import DownloadIcon from "@mui/icons-material/Download";

export default function CardPaper({ title, description, author, date, link }): JSX.Element {
    const useStyles = makeStyles(() => ({
        downloadButton: {
            "&:hover": {
                backgroundColor: "transparent"
            }
        }
    }));
    const classes = useStyles();
    return (
        <Grid
            container
            className="paperCard"
            sx={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}
        >
            <Grid container xs={12} sm={12}>
                <Grid className="inCardContainer mainItems" container xs={12} sm={12}>
                    <Grid
                        container
                        xs={12}
                        sm={12}
                        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                        <Grid item xs={12} sm={9}>
                            <Typography variant="h3" component="div">
                                {title}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ display: "flex", justifyContent: "end" }}>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                                <Button
                                    variant="contained"
                                    className={classes.downloadButton}
                                    sx={{
                                        border: "2px solid #2F7164",
                                        backgroundColor: "transparent",
                                        color: "#2F7164",
                                        minWidth: 15,
                                        minHeight: 4,
                                        borderRadius: 0
                                    }}
                                >
                                    <Typography variant="subtitle1">
                                        <strong>Download PDF</strong>
                                    </Typography>{" "}
                                    <DownloadIcon sx={{ mx: 1, my: 2 }} />
                                </Button>
                            </a>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid className="inCardContainer subItems" container xs={12} sm={12} sx={{ display: "flex" }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1" component="div">
                            Author: {author}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "end" }}>
                        <Typography variant="body1" component="div">
                            Date: {date}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    className="inCardContainer subItems"
                    sx={{ justifyContent: "space-between" }}
                >
                    <Typography variant="body1" component="div">
                        {description}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    );
}
