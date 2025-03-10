import { Button, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import DownloadIcon from "@mui/icons-material/Download";

interface CardIFrameProps {
    id: string;
    title: string;
    author: string;
    date: string;
    description?: string | undefined;
    link?: any;
    iframeTitle: string;
    iframeLink: string;
    iframeWidth: number;
    iframeHeight: number;
}

export default function CardIFrame({
    id,
    title,
    author,
    date,
    description,
    link,
    iframeTitle,
    iframeLink,
    iframeWidth,
    iframeHeight
}: CardIFrameProps): JSX.Element {
    const useStyles = makeStyles(() => ({
        downloadButton: {
            "&:hover": {
                backgroundColor: "transparent"
            }
        }
    }));
    const classes = useStyles();

    return (
        <Grid id={id} container className="paperCard" sx={{ display: "flex", justifyContent: "space-between" }}>
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
                        {link && (
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
                                        <DownloadIcon sx={{ mx: 1, mt: 2 }} />
                                    </Button>
                                </a>
                            </Grid>
                        )}
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
                {description && (
                    <Grid item xs={12} sm={12} className="inCardContainer subItems" sx={{ justifyContent: "center" }}>
                        <Typography variant="body1" component="div">
                            {description}
                        </Typography>
                    </Grid>
                )}
                <Grid
                    className="inCardContainer subItems"
                    container
                    xs={12}
                    sm={12}
                    sx={{ display: "flex", justifyContent: "center" }}
                >
                    <iframe
                        title={iframeTitle}
                        width={iframeWidth}
                        height={iframeHeight}
                        src={iframeLink}
                        style={{ border: "none" }}
                        allowFullScreen
                    />
                </Grid>
            </Grid>
        </Grid>
    );
}
