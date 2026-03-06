import React, { useState } from "react";
import { Box } from "@mui/material";
import MapLevelSwitch from "./MapLevelSwitch";

interface MapTableWithLevelSwitchProps {
    stateMapComponent: React.ReactNode;
    countyMapComponent: React.ReactNode;
    stateContentComponent: React.ReactNode;
    countyTableComponent: React.ReactNode;
    countyDataLoading: boolean;
    onCountyDataRequest: () => void;
    hasCountyData: boolean;
}

const MapTableWithLevelSwitch = ({
    stateMapComponent,
    countyMapComponent,
    stateContentComponent,
    countyTableComponent,
    countyDataLoading,
    onCountyDataRequest,
    hasCountyData
}: MapTableWithLevelSwitchProps): JSX.Element => {
    const [level, setLevel] = useState<"state" | "county">("state");

    const handleLevelChange = (newLevel: "state" | "county") => {
        setLevel(newLevel);
        if (newLevel === "county" && !hasCountyData) {
            onCountyDataRequest();
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box
                className="mapArea"
                component="div"
                sx={{
                    width: "85%",
                    m: "auto"
                }}
            >
                <Box sx={{ display: level !== "state" ? "none" : "block" }}>{stateMapComponent}</Box>
                <Box sx={{ display: level !== "county" ? "none" : "block" }}>{hasCountyData && countyMapComponent}</Box>
                <MapLevelSwitch level={level} onLevelChange={handleLevelChange} disabled={countyDataLoading} />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    height: 50
                }}
            />
            <Box sx={{ display: level !== "state" ? "none" : "block" }}>{stateContentComponent}</Box>
            <Box sx={{ display: level !== "county" ? "none" : "block" }}>
                <Box
                    className="chartArea"
                    component="div"
                    sx={{
                        width: "100%",
                        m: "auto"
                    }}
                >
                    {hasCountyData && countyTableComponent}
                </Box>
            </Box>
        </Box>
    );
};

export default MapTableWithLevelSwitch;
