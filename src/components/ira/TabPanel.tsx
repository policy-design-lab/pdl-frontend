import {
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
    Typography
} from "@mui/material";
import React, { useState } from "react";
import { styled } from "@mui/system";
import IRAMap from "./IRAMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollar, faPercentage } from "@fortawesome/free-solid-svg-icons";
import IRADollarTable from "./IRADollarTable";
import IRAPercentageTable from "./IRAPercentageTable";

function TabPanel({
    v,
    index,
    title,
    stateDistributionData,
    stateCodes,
    allStates,
    practiceNames,
    summaryData
}: {
    v: any;
    index: any;
    title: string;
    stateDistributionData: {};
    stateCodes: any;
    allStates: any;
    practiceNames: any;
    summaryData: any;
}): JSX.Element {
    const [tab, setTab] = React.useState(0);
    const years = stateDistributionData ? Object.keys(stateDistributionData).map(Number) : [];
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const [isPlaying, setIsPlaying] = useState(false);
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
    const [selectedYear, setSelectedYear] = useState(minYear);
    const [selectedPredict, setSelectedPredict] = useState("Min");
    const [selectedPractices, setSelectedPractices] = useState([]);
    const mapColor = ["#F0F9E8", "#BAE4BC", "#7BCCC4", "#43A2CA", "#0868AC"]; // title II color

    const StyledGrid = styled(Grid)(({ theme }) => ({
        ".offset-md-1": {
            marginLeft: theme.spacing(1 * 8)
        }
    }));
    const switchChartTable = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };
    React.useEffect(() => {
        if (years.length) {
            setSelectedYear(minYear);
        }
    }, [minYear]);
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };
    const marks = years.map((year) => ({
        value: year,
        label: year.toString()
    }));

    const currentPractices = practiceNames[selectedYear];
    const practices: any[] = ["Total", ...currentPractices];
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
    React.useEffect(() => {
        if (selectedPractices.length === 0) {
            setSelectedPractices(["Total"]);
        }
    }, [selectedPractices]);

    const handlePredictChange = (event) => {
        setSelectedPredict(event.target.value);
    };

    // auto play settings
    const startAutoplay = React.useCallback(() => {
        if (!isPlaying) {
            setIsPlaying(true);
            const id = setInterval(() => {
                setSelectedYear((prevYear) => {
                    const nextYear = prevYear + 1;
                    return nextYear > maxYear ? minYear : nextYear;
                });
            }, 1500); // 1.5 second autoplay interval
            setIntervalId(id);
        }
    }, [isPlaying, maxYear, minYear]);
    const stopAutoplay = React.useCallback(() => {
        if (isPlaying && intervalId !== null) {
            clearInterval(intervalId);
            setIsPlaying(false);
        }
    }, [isPlaying, intervalId]);
    React.useEffect(() => {
        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    return (
        <Box role="tabpanel" hidden={v !== index}>
            {v === index && (
                <Box>
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
                        <Grid item xs={12} md={7} className="offset-md-1">
                            {selectedYear ? (
                                <Box sx={{ padding: 2 }}>
                                    {selectedYear && (
                                        <Box>
                                            <IRAMap
                                                subtitle={title}
                                                year={selectedYear.toString()}
                                                statePerformance={stateDistributionData}
                                                practices={selectedPractices}
                                                stateCodes={stateCodes}
                                                allStates={allStates}
                                                mapColor={mapColor}
                                                predict={selectedPredict}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="h6">No data.</Typography>
                            )}
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={2}>
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
                            {/* <Box sx={{ marginTop: 2, display: "flex", gap: 2 }}>
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
                        )} */}
                        </Grid>
                    </StyledGrid>
                    <StyledGrid
                        container
                        spacing={2}
                        xs={12}
                        sx={{
                            display: "flex",
                            my: 3,
                            backgroundColor: "white",
                            minHeight: "50vh",
                            justifyContent: "center",
                            position: "relative"
                        }}
                    >
                        <Grid
                            item
                            xs={12}
                            md={9}
                            className="offset-md-1"
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
                                aria-label="CropInsurance toggle button group"
                                sx={{
                                    mr: 2,
                                    mb: -7, // fake the button to align with the table header
                                    position: "relative",
                                    backgroundColor: "white",
                                    borderRadius: "4px",
                                    boxShadow: 1
                                }}
                            >
                                <ToggleButton value={0}>
                                    <FontAwesomeIcon icon={faDollar} />
                                </ToggleButton>
                                <ToggleButton value={1}>
                                    <FontAwesomeIcon icon={faPercentage} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12} md={9} className="offset-md-1" sx={{ display: tab !== 0 ? "none" : "div" }}>
                            <IRADollarTable
                                tableTitle={`${title} IRA Data ($) By States in ${selectedYear}`}
                                year={selectedYear.toString()}
                                IRAData={stateDistributionData}
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
                        <Grid item xs={12} md={9} className="offset-md-1" sx={{ display: tab !== 1 ? "none" : "div" }}>
                            <IRAPercentageTable
                                tableTitle={`${title} IRA Data (%) By States in ${selectedYear}`}
                                year={selectedYear.toString()}
                                IRAData={stateDistributionData}
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
                    </StyledGrid>
                </Box>
            )}
        </Box>
    );
}

export default TabPanel;
