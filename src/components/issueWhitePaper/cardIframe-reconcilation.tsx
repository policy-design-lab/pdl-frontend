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
    aspectRatio?: number;
    midDescription?: string | undefined;
    midChart?: string | undefined;
    midChartAspectRatio?: number;
    endDescription?: string | undefined;
}

export default function CardIFrameReconciliation({
    id,
    title,
    author,
    date,
    description,
    link,
    iframeTitle,
    iframeLink,
    iframeWidth,
    iframeHeight,
    midDescription,
    midChart,
    midChartAspectRatio,
    endDescription,
    aspectRatio = 0.52
}: CardIFrameProps): JSX.Element {
    const [responsiveHeight, setResponsiveHeight] = React.useState(iframeHeight);
    const [midChartHeight, setMidChartHeight] = React.useState(iframeHeight);

    React.useEffect(() => {
        const calculatedHeight = Math.floor(iframeWidth * aspectRatio);
        setResponsiveHeight(calculatedHeight);
    }, [iframeWidth, aspectRatio, iframeHeight]);

    React.useEffect(() => {
        if (midChartAspectRatio) {
            const calculatedMidHeight = Math.floor(iframeWidth * midChartAspectRatio);
            setMidChartHeight(calculatedMidHeight);
        } else {
            setMidChartHeight(responsiveHeight);
        }
    }, [iframeWidth, midChartAspectRatio, responsiveHeight]);
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
                <Grid className="inCardContainer subItems" container xs={12} sm={12} sx={{ display: "flex", mt: 0 }}>
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
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        className="inCardContainer subItems"
                        sx={{ justifyContent: "space-between" }}
                    >
                        <Typography variant="body1" component="div">
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </Typography>
                    </Grid>
                )}
                <Grid
                    className="inCardContainer subItems"
                    container
                    xs={12}
                    sm={12}
                    sx={{ display: "flex", justifyContent: "center", marginBottom: 0 }}
                >
                    <iframe
                        title={iframeTitle}
                        width={iframeWidth}
                        height={responsiveHeight}
                        src={iframeLink}
                        style={{ border: "none" }}
                        allowFullScreen
                    />
                </Grid>
                {midDescription && (
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        className="inCardContainer subItems"
                        sx={{ justifyContent: "space-between", margin: "0rem auto 1rem auto" }}
                    >
                        <Typography variant="body1" component="div">
                            <div dangerouslySetInnerHTML={{ __html: midDescription }} />
                        </Typography>
                    </Grid>
                )}
                {midChart && (
                    <Grid
                        className="inCardContainer subItems"
                        container
                        xs={12}
                        sm={12}
                        sx={{ display: "flex", justifyContent: "center", marginBottom: 0 }}
                    >
                        <iframe
                            title={iframeTitle}
                            width={iframeWidth}
                            height={midChartHeight}
                            src={midChart}
                            style={{ border: "none" }}
                            allowFullScreen
                        />
                    </Grid>
                )}
                {endDescription && (
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        className="inCardContainer subItems"
                        sx={{ justifyContent: "space-between", margin: "0rem auto 1rem auto" }}
                    >
                        <Typography variant="body1" component="div">
                            <div dangerouslySetInnerHTML={{ __html: endDescription }} />
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
}
