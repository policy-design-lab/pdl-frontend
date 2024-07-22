import * as React from "react";
import { CardMedia, createTheme, ThemeProvider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import NavBar from "../components/NavBar";
import forest from "../images/forest.png";
import News from "../components/News";
import Footer from "../components/Footer";
import LandingPageMapTab from "../components/LandingPageMapTab";
import { config } from "../app.config";
import { convertAllState, getJsonDataFromUrl } from "../utils/apiutil";

export default function LandingPage(): JSX.Element {
    // connect to api endpoint
    const [stateCodes, setStateCodes] = React.useState({});
    const [allPrograms, setAllPrograms] = React.useState([]);
    const [allStates, setAllStates] = React.useState([]);
    const [summary, setSummary] = React.useState([]);
    const [isDataReady, setIsDataReady] = React.useState(false);
    const defaultTheme = createTheme();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [stateCodesResponse, allProgramsResponse, allStatesResponse, summaryResponse] = await Promise.all(
                    [
                        getJsonDataFromUrl(`${config.apiUrl}/statecodes`),
                        getJsonDataFromUrl(`${config.apiUrl}/allprograms`),
                        getJsonDataFromUrl(`${config.apiUrl}/states`),
                        getJsonDataFromUrl(`${config.apiUrl}/summary`)
                    ]
                );
                setStateCodes(convertAllState(stateCodesResponse));
                setAllPrograms(allProgramsResponse);
                setAllStates(allStatesResponse);
                setSummary(summaryResponse);
                setIsDataReady(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
    return (
        <ThemeProvider theme={defaultTheme}>
            {isDataReady && (
                <Box sx={{ width: "100%" }}>
                    <NavBar bkColor="rgba(47, 113, 100, 1)" ftColor="rgba(255, 255, 255, 1)" logo="dark" />
                    <div style={{ position: "relative" }}>
                        <CardMedia component="img" src={forest} sx={{ maxHeight: "650px" }} />
                        <Typography
                            variant="h3"
                            sx={{
                                position: "absolute",
                                color: "white",
                                top: "30%",
                                left: "10%"
                            }}
                        >
                            <strong>Understanding</strong>
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                position: "absolute",
                                top: "40%",
                                left: "10%",
                                color: "white"
                            }}
                        >
                            <Box sx={{ color: "#FF8C22" }}>
                                <strong>Policy Design:</strong>
                            </Box>
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                position: "absolute",
                                color: "white",
                                top: "50%",
                                left: "10%"
                            }}
                        >
                            Applying Public Data and Computational Resources to
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                position: "absolute",
                                color: "white",
                                top: "55%",
                                left: "10%"
                            }}
                        >
                            Visualize Federal Agricultural, Conservation and Food Policies
                        </Typography>
                    </div>
                    <LandingPageMapTab
                        allStates={allStates}
                        stateCodes={stateCodes}
                        allPrograms={allPrograms}
                        summary={summary}
                    />
                    <News />
                    <Footer />
                </Box>
            )}
            {!isDataReady && <h1>Loading map data...</h1>}
        </ThemeProvider>
    );
}
