import {
    Switch,
    FormControlLabel,
    Box,
    Button,
    Chip,
    FormControl,
    Grid,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    Slider,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import React, { useState } from "react";
import { styled } from "@mui/system";
import { CurrencyDollar, Percent } from "react-bootstrap-icons";

import useWindowSize from "../shared/WindowSizeHook";
import IRADollarMap from "./IRADollarMap";
import IRADollarTable from "./IRADollarTable";
import IRAPercentageTable from "./IRAPercentageTable";
import IRAPredictedMap from "./IRAPredictedMap";
import IRAPredictedDollarTable from "./IRAPredictedDollarTable";
import IRAPredictedPercentageTable from "./IRAPredictedPercentageTable";

function TabPanel({
    v,
    index,
    title,
    stateDistributionData,
    predictedData,
    predictedYear, // Make predictedYear as a fixed string for version 1
    stateCodes,
    allStates,
    practiceNames,
    summaryData
}: {
    v: any;
    index: any;
    title: string;
    stateDistributionData: any;
    predictedData: any;
    predictedYear: string;
    stateCodes: any;
    allStates: any;
    practiceNames: any;
    summaryData: any;
}): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const [isPredictionOn, setIsPredictionOn] = useState(false);
    const years = stateDistributionData ? Object.keys(stateDistributionData).map(Number) : [];
    const [updatedData, setUpdatedData] = useState(stateDistributionData);
    const [updatedPredictedData, setUpdatedPredictedData] = useState(predictedData);
    const minYear = 2023;
    const maxYear = Math.max(...years);
    const [isPlaying, setIsPlaying] = useState(false);
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
    const [selectedYear, setSelectedYear] = useState(minYear.toString());
    const [selectedPredict, setSelectedPredict] = useState("Min");
    const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
    const [practices, setPractices] = useState<string[]>([]);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"]; // title II color
    const the = useTheme();
    const isSmallScreen = useMediaQuery(the.breakpoints.down("sm"));
    const windowSize = useWindowSize();
    const updateData = () => {
        setUpdatedData(stateDistributionData);
    };
    const updatePredictedData = () => {
        setUpdatedPredictedData(predictedData);
    };
    const StyledGrid = styled(Grid)(({ theme }) => ({
        ".offset-sm-1": {
            marginLeft: theme.spacing(1 * 8)
        }
    }));
    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isOn = event.target.checked;
        setIsPredictionOn(isOn);
        const year = isOn ? predictedYear : minYear;
        setSelectedYear(year);
        const currentPractices = practiceNames[year].slice().sort((a, b) => a.localeCompare(b));
        const newPractices = ["Total", ...currentPractices];
        setPractices(newPractices);
        const overlapped_practices: string[] = newPractices.filter((element) => selectedPractices.includes(element));
        setSelectedPractices(overlapped_practices.length === 0 ? ["Total"] : overlapped_practices);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };
    const marks = years.map((year) => ({
        value: year,
        label: year.toString()
    }));
    const handlePracticeChange = (event) => {
        const {
            target: { value }
        } = event;
        let selected = typeof value === "string" ? value.split(",") : value;
        const total_index = selected.findIndex((element) => element.indexOf("Total") !== -1);
        if (selected.includes("Total") && selected.length > 1 && total_index === 0) {
            // select Total first then other practices
            selected = selected.filter((practice) => practice !== "Total");
        } else if (selected.includes("Total") && selected.length > 1 && total_index === selected.length - 1) {
            // select Total after other practices are selected
            selected = ["Total"];
        } else if (selected.includes("Total") && selected.length === 1) {
            selected = ["Total"];
        } else if (selected.length === 0) {
            selected = ["Total"];
        }

        setSelectedPractices(selected);
    };
    const handleRemovePractice = (practiceToRemove) => {
        setSelectedPractices((prevPractices) => {
            const newPractices = prevPractices.filter((practice) => practice !== practiceToRemove);
            // Ensure "Total" is re-selected if no other items remain
            return newPractices.length === 0 ? ["Total"] : newPractices;
        });
    };
    const handlePredictChange = (event) => {
        setSelectedPredict(event.target.value);
    };

    // auto play settings
    // const startAutoplay = React.useCallback(() => {
    //     if (!isPlaying) {
    //         setIsPlaying(true);
    //         const id = setInterval(() => {
    //             setSelectedYear((prevYear) => {
    //                 const nextYear = prevYear + 1;
    //                 return nextYear > maxYear ? minYear : nextYear;
    //             });
    //         }, 1500); // 1.5 second autoplay interval
    //         setIntervalId(id);
    //     }
    // }, [isPlaying, maxYear, minYear]);
    // const stopAutoplay = React.useCallback(() => {
    //     if (isPlaying && intervalId !== null) {
    //         clearInterval(intervalId);
    //         setIsPlaying(false);
    //     }
    // }, [isPlaying, intervalId]);
    // React.useEffect(() => {
    //     return () => {
    //         if (intervalId !== null) {
    //             clearInterval(intervalId);
    //         }
    //     };
    // }, [intervalId]);

    React.useEffect(() => {
        if (years.length) {
            setSelectedYear(minYear);
        }
        if (Object.keys(practiceNames).length > 0) {
            const currentPractices = isPredictionOn
                ? practiceNames[predictedYear].sort((a, b) => a.localeCompare(b))
                : practiceNames[minYear].sort((a, b) => a.localeCompare(b));
            setPractices(["Total", ...currentPractices]);
            if (selectedPractices.length === 0) {
                setSelectedPractices(["Total"]);
            }
        }
    }, [minYear, selectedYear, selectedPractices, practiceNames]);
    React.useEffect(() => {
        updateData();
        updatePredictedData();
    }, [selectedPractices, selectedYear, isPredictionOn]);
    return (
        <Box role="tabpanel" hidden={v !== index}>
            {v === index && (
                <Grid container sx={{ mt: 0, mx: 20, width: "auto", justifyContent: "center" }}>
                    {/* maps */}
                    {isPredictionOn && (
                        <Grid item xs={12} sm={isSmallScreen ? 12 : 8} className="offset-sm-1">
                            <StyledGrid
                                container
                                spacing={2}
                                xs={12}
                                sx={{
                                    display: "flex",
                                    my: 3,
                                    backgroundColor: "white",
                                    minHeight: "50vh",
                                    justifyContent: "center"
                                }}
                            >
                                <Grid item>
                                    {selectedYear ? (
                                        <Box sx={{ padding: 2 }}>
                                            {selectedYear && (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={12}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        position: "relative"
                                                    }}
                                                >
                                                    {Object.keys(updatedPredictedData).length > 0 && (
                                                        <IRAPredictedMap
                                                            subtitle={title}
                                                            year={predictedYear}
                                                            predictedPerformance={updatedPredictedData}
                                                            practices={selectedPractices}
                                                            stateCodes={stateCodes}
                                                            allStates={allStates}
                                                            mapColor={mapColor}
                                                            predict={selectedPredict}
                                                            summary={summaryData}
                                                        />
                                                    )}
                                                </Grid>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="h6">No data.</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={1} />
                            </StyledGrid>
                        </Grid>
                    )}
                    {!isPredictionOn && (
                        <Grid item xs={12} sm={isSmallScreen ? 12 : 8} className="offset-sm-1">
                            <StyledGrid
                                container
                                spacing={2}
                                xs={12}
                                sx={{
                                    display: "flex",
                                    my: 3,
                                    backgroundColor: "white",
                                    minHeight: "50vh",
                                    justifyContent: "center"
                                }}
                            >
                                <Grid item>
                                    {selectedYear ? (
                                        <Box sx={{ padding: 2 }}>
                                            {selectedYear && (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={12}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        position: "relative"
                                                    }}
                                                >
                                                    <IRADollarMap
                                                        subtitle={title}
                                                        year={selectedYear.toString()}
                                                        statePerformance={updatedData}
                                                        practices={selectedPractices}
                                                        stateCodes={stateCodes}
                                                        allStates={allStates}
                                                        mapColor={mapColor}
                                                        predict={selectedPredict}
                                                        summary={summaryData}
                                                    />
                                                </Grid>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="h6">No data.</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={1} />
                                {/* <Grid item xs={2}>
                                     <Box sx={{ marginTop: 2, display: "flex", gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={startAutoplay} disabled={isPlaying}>
                                Start Autoplay
                            </Button>
                            <Button variant="contained" color="secondary" onClick={stopAutoplay} disabled={!isPlaying}>
                                Stop Autoplay
                            </Button>
                        </Box>  */}

                                {/* {selectedYear !== 2023 && (
                            <FormControl fullWidth>
                                <InputLabel id="predict-select-label">Min/Max</InputLabel>
                                <Select
                                    labelId="predict-select-label"
                                    value={selectedPredict}
                                    label="Predict"
                                    onChange={handlePredictChange}
                                >
                                    {["Min", "Max"].map((predict) => (
                                        <MenuItem key={predict} value={predict}>
                                            {predict}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                                </Grid> 
                                */}
                            </StyledGrid>
                        </Grid>
                    )}
                    <Grid item sm={1} />
                    {/* controls */}
                    <Grid item xs={12} sm={2}>
                        <StyledGrid
                            container
                            spacing={2}
                            xs={12}
                            sx={{
                                display: "flex",
                                my: 3,
                                ml: 10,
                                backgroundColor: "white",
                                justifyContent: "left"
                            }}
                        >
                            <FormControlLabel
                                control={<Switch checked={isPredictionOn} onChange={handleSwitchChange} />}
                                label={
                                    <Typography
                                        sx={{ fontWeight: "bold", fontSize: "1.25rem", color: "rgba(47, 113, 100, 1)" }}
                                    >
                                        {`${predictedYear} Prediction`}
                                    </Typography>
                                }
                                sx={{ mt: 3, mb: 10, fontStyle: "bold", color: "rgba(47, 113, 100, 1)" }}
                            />
                            <FormControl fullWidth>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Select Practice
                                </Typography>
                                <Select
                                    labelId="practice-select-label"
                                    multiple
                                    value={selectedPractices}
                                    onChange={handlePracticeChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    sx={{
                                                        borderRadius: 1,
                                                        borderColor: "lightgray",
                                                        color: "rgba(47, 113, 100, 1)"
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 600
                                            }
                                        }
                                    }}
                                >
                                    {practices.map((practice) => (
                                        <MenuItem key={practice} value={practice}>
                                            {practice}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ mt: 2 }}>
                                {selectedPractices.map((practice) => (
                                    <Button
                                        key={practice}
                                        variant="contained"
                                        onClick={() => handleRemovePractice(practice)}
                                        sx={{ mr: 1, mb: 1, backgroundColor: "rgba(47, 113, 100, 1)" }}
                                    >
                                        {practice} &times;
                                    </Button>
                                ))}
                            </Box>

                            {/* <Typography variant="h6">Select Year</Typography> */}
                            {/* NOTE: First version don't need to select option larger than 2023, but practice needs this to change names, thus just hide it */}
                            <Slider
                                value={selectedYear}
                                onChange={handleYearChange}
                                min={minYear}
                                max={maxYear}
                                step={1}
                                marks={marks}
                                valueLabelDisplay="on"
                                sx={{ marginTop: 2, marginBottom: 4, display: "none" }}
                            />
                        </StyledGrid>
                    </Grid>

                    {/* Tables */}
                    {isPredictionOn && (
                        <Grid item xs={12} sm={12}>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    position: "relative"
                                }}
                            >
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="IRA toggle button group"
                                    sx={{
                                        mb: -3,
                                        position: "relative",
                                        backgroundColor: "white",
                                        borderRadius: "4px",
                                        boxShadow: 1
                                    }}
                                >
                                    <ToggleButton value={0}>
                                        <CurrencyDollar style={{ fontSize: "1.25rem", color: "#2F7164" }} />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <Percent style={{ fontSize: "1.25rem", color: "#2F7164" }} />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                className="offset-sm-1"
                                sx={{ display: tab !== 0 ? "none" : "div" }}
                            >
                                {Object.keys(updatedPredictedData).length > 0 && (
                                    <IRAPredictedDollarTable
                                        key={`${selectedPractices.join(",")}-${selectedYear}-${isPredictionOn}`}
                                        tableTitle={`${title} IRA Predicted Data ($) By States in ${predictedYear}`}
                                        year={predictedYear}
                                        IRAPredictedData={updatedPredictedData}
                                        skipColumns={[]}
                                        stateCodes={stateCodes}
                                        practices={selectedPractices}
                                        predict={selectedPredict}
                                        colors={[]}
                                        attributes={["predictedTotalPaymentInDollars"]}
                                    />
                                )}
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                className="offset-sm-1"
                                sx={{ display: tab !== 1 ? "none" : "div" }}
                            >
                                {Object.keys(updatedPredictedData).length > 0 && (
                                    <IRAPredictedPercentageTable
                                        key={`${selectedPractices.join(",")}-${selectedYear}-${isPredictionOn}`}
                                        tableTitle={`${title} IRA Predicted Data (%) By States in ${selectedYear}`}
                                        year={predictedYear}
                                        IRAPredictedData={updatedPredictedData}
                                        summary={summaryData}
                                        skipColumns={[]}
                                        stateCodes={stateCodes}
                                        practices={selectedPractices}
                                        predict={selectedPredict}
                                        colors={[]}
                                        attributes={["predictedTotalPaymentInDollars"]}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    )}
                    {!isPredictionOn && (
                        <Grid item xs={12} sm={12}>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    position: "relative"
                                }}
                            >
                                <ToggleButtonGroup
                                    className="ChartTableToggle"
                                    value={tab}
                                    exclusive
                                    onChange={switchChartTable}
                                    aria-label="IRA toggle button group"
                                    sx={{
                                        mb: -3,
                                        position: "relative",
                                        backgroundColor: "white",
                                        borderRadius: "4px",
                                        boxShadow: 1
                                    }}
                                >
                                    <ToggleButton value={0}>
                                        <CurrencyDollar style={{ fontSize: "1.25rem", color: "#2F7164" }} />
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <Percent style={{ fontSize: "1.25rem", color: "#2F7164" }} />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                className="offset-sm-1"
                                sx={{ display: tab !== 0 ? "none" : "div" }}
                            >
                                <IRADollarTable
                                    key={`${selectedPractices.join(",")}-${selectedYear}-${isPredictionOn}`}
                                    tableTitle={`${title} IRA Data ($) By States in ${selectedYear}`}
                                    year={selectedYear.toString()}
                                    IRAData={updatedData}
                                    skipColumns={[]}
                                    stateCodes={stateCodes}
                                    practices={selectedPractices}
                                    predict={selectedPredict}
                                    colors={[]}
                                    attributes={[
                                        "totalPaymentInDollars",
                                        "practiceInstanceCount",
                                        "totalPracticeInstanceCount"
                                    ]}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                className="offset-sm-1"
                                sx={{ display: tab !== 1 ? "none" : "div" }}
                            >
                                <IRAPercentageTable
                                    key={`${selectedPractices.join(",")}-${selectedYear}-${isPredictionOn}`}
                                    tableTitle={`${title} IRA Data (%) By States in ${selectedYear}`}
                                    year={selectedYear.toString()}
                                    IRAData={updatedData}
                                    summary={summaryData}
                                    skipColumns={[]}
                                    stateCodes={stateCodes}
                                    practices={selectedPractices}
                                    predict={selectedPredict}
                                    colors={[]}
                                    attributes={[
                                        "totalPaymentInDollars",
                                        "practiceInstanceCount",
                                        "totalPracticeInstanceCount"
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
}

export default TabPanel;
