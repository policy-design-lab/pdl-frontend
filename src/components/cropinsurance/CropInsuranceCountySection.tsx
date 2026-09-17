import React from "react";
import { Box, Grid } from "@mui/material";
import MapTableWithLevelSwitch from "../shared/MapTableWithLevelSwitch";
import CropInsuranceCountyMap from "./CropInsuranceCountyMap";
import CropInsuranceCountyTable from "./CropInsuranceCountyTable";
import CropInsuranceCountyFilters from "./cropSelection/CropInsuranceCountyFilters";
import CropInsuranceDataUnavailable from "./cropSelection/CropInsuranceDataUnavailable";
import useCropInsuranceCountyProjection from "./cropSelection/useCropInsuranceCountyProjection";
import { ALL_CROPS_SENTINEL } from "./cropSelection/commodityMapping";
import { DEFAULT_SELECTED_YEARS } from "./cropSelection/resolveYearKeys";
import { CountyPayload } from "./cropSelection/types";

interface CropInsuranceCountySectionProps {
    attribute: string;
    metricLabel: string;
    countyTableTitle: string;
    countyTableAttributes: string[];
    stateMapComponent: React.ReactNode;
    stateContentComponent: React.ReactNode;
    mapColor: [string, string, string, string, string];
    countyDistributionData: CountyPayload;
    stateCodesData: Record<string, string>;
    allStatesData: any[];
    selectedCountyState: string;
    onCountyStateChange: (state: string) => void;
    countyDataLoading: boolean;
    onCountyDataRequest: (years: string[]) => void;
    hasCountyData: boolean;
    level: "state" | "county";
    onLevelChange: (level: "state" | "county") => void;
    isVisible: boolean;
}

const CropInsuranceCountySection = ({
    attribute,
    metricLabel,
    countyTableTitle,
    countyTableAttributes,
    stateMapComponent,
    stateContentComponent,
    mapColor,
    countyDistributionData,
    stateCodesData,
    allStatesData,
    selectedCountyState,
    onCountyStateChange,
    countyDataLoading,
    onCountyDataRequest,
    hasCountyData,
    level,
    onLevelChange,
    isVisible
}: CropInsuranceCountySectionProps): JSX.Element => {
    const [selectedYears, setSelectedYears] = React.useState<string[]>(DEFAULT_SELECTED_YEARS);
    const [selectedCrops, setSelectedCrops] = React.useState<string[]>([ALL_CROPS_SENTINEL]);

    const { projected, yearResolution, resolvedYearKey, yearKeys } = useCropInsuranceCountyProjection({
        rawCountyData: countyDistributionData,
        selectedYears,
        selectedCrops,
        isVisible: isVisible && level === "county"
    });

    const handleResetYears = React.useCallback(() => {
        setSelectedYears(DEFAULT_SELECTED_YEARS);
    }, []);

    const requestCountyData = React.useCallback(() => {
        onCountyDataRequest(selectedYears);
    }, [onCountyDataRequest, selectedYears]);

    React.useEffect(() => {
        if (isVisible && level === "county") {
            onCountyDataRequest(selectedYears);
        }
    }, [isVisible, level, selectedYears, onCountyDataRequest]);

    const isUnavailable = yearResolution.status === "unavailable";
    const countyData = projected ?? {};
    const activeCrops = selectedCrops.includes(ALL_CROPS_SENTINEL) ? [] : selectedCrops;

    return (
        <MapTableWithLevelSwitch
            stateMapComponent={stateMapComponent}
            countyControlsComponent={
                <CropInsuranceCountyFilters
                    selectedYears={selectedYears}
                    selectedCrops={selectedCrops}
                    onYearsChange={setSelectedYears}
                    onCropsChange={setSelectedCrops}
                />
            }
            countyUnavailableComponent={
                isUnavailable ? (
                    <CropInsuranceDataUnavailable
                        reason={yearResolution.reason}
                        selectedYears={yearResolution.selected}
                        onResetYears={handleResetYears}
                    />
                ) : null
            }
            countyMapComponent={
                <CropInsuranceCountyMap
                    attribute={attribute}
                    year={resolvedYearKey}
                    mapColor={mapColor}
                    countyPerformance={countyData}
                    stateCodes={stateCodesData}
                    allStates={allStatesData}
                    selectedState={selectedCountyState}
                    onStateChange={onCountyStateChange}
                    selectedCrops={activeCrops}
                    yearKeys={yearKeys}
                    metricLabel={metricLabel}
                />
            }
            stateContentComponent={stateContentComponent}
            countyTableComponent={
                <Grid container justifyContent="center">
                    <Grid item xs={12}>
                        <Box className="chartArea" component="div" sx={{ width: "100%", m: "auto" }}>
                            <CropInsuranceCountyTable
                                tableTitle={countyTableTitle}
                                attributes={countyTableAttributes}
                                skipColumns={[]}
                                stateCodes={stateCodesData}
                                countyData={countyData}
                                year={resolvedYearKey}
                                selectedState={selectedCountyState}
                                onStateChange={onCountyStateChange}
                                selectedCrops={activeCrops}
                                yearKeys={yearKeys}
                                attribute={attribute}
                            />
                        </Box>
                    </Grid>
                </Grid>
            }
            countyDataLoading={countyDataLoading}
            onCountyDataRequest={requestCountyData}
            hasCountyData={hasCountyData}
            level={level}
            onLevelChange={onLevelChange}
        />
    );
};

export default CropInsuranceCountySection;
