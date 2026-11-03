import React from "react";
import Box from "@mui/material/Box";
import MapTableWithLevelSwitch from "../MapTableWithLevelSwitch";
import { MapLevel } from "../../../utils/useMapUrlState";
import PracticeSelector from "./PracticeSelector";
import TitleIICountyMap from "./TitleIICountyMap";
import TitleIICountyTable from "./TitleIICountyTable";
import { getCountyTableTitle, isTotalCategory, TitleIICountyProgram } from "./TitleIICountyMethods";
import { UseTitleIICountyDataResult } from "./useTitleIICountyData";

interface TitleIIMapSectionProps {
    program: TitleIICountyProgram;
    category: string;
    year: string;
    visible: boolean;
    stateMapComponent: React.ReactNode;
    county: UseTitleIICountyDataResult;
    countyPracticeOptions: string[];
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedCountyState: string;
    onCountyStateChange: (state: string) => void;
    level: MapLevel;
    onLevelChange: (level: MapLevel) => void;
}

const TitleIIMapSection = ({
    program,
    category,
    year,
    visible,
    stateMapComponent,
    county,
    countyPracticeOptions,
    stateCodes,
    allStates,
    selectedCountyState,
    onCountyStateChange,
    level,
    onLevelChange
}: TitleIIMapSectionProps): JSX.Element => {
    const isTotal = isTotalCategory(program, category);
    const selectedPractices = isTotal ? county.selectedPractices : [];
    return (
        <Box component="div" sx={{ width: "100%", m: "auto", display: visible ? "block" : "none" }}>
            <MapTableWithLevelSwitch
                stateMapComponent={stateMapComponent}
                countyMapComponent={
                    visible ? (
                        <TitleIICountyMap
                            program={program}
                            category={category}
                            year={year}
                            countyData={county.countyData}
                            stateCodes={stateCodes}
                            allStates={allStates}
                            selectedState={selectedCountyState}
                            onStateChange={onCountyStateChange}
                            selectedPractices={selectedPractices}
                            controlsComponent={
                                isTotal ? (
                                    <PracticeSelector
                                        practices={countyPracticeOptions}
                                        selected={county.selectedPractices}
                                        onChange={county.setSelectedPractices}
                                        disabled={county.isLoading}
                                    />
                                ) : null
                            }
                        />
                    ) : null
                }
                stateContentComponent={null}
                countyTableComponent={
                    visible ? (
                        <TitleIICountyTable
                            program={program}
                            category={category}
                            tableTitle={getCountyTableTitle(program, category, year, county.selectedPractices)}
                            stateCodes={stateCodes}
                            countyData={county.countyData}
                            year={year}
                            selectedState={selectedCountyState}
                            onStateChange={onCountyStateChange}
                            selectedPractices={selectedPractices}
                        />
                    ) : null
                }
                countyDataLoading={county.isLoading}
                onCountyDataRequest={county.requestCountyData}
                hasCountyData={county.hasLoaded}
                level={level}
                onLevelChange={onLevelChange}
                mapAreaWidth="100%"
            />
        </Box>
    );
};

export default TitleIIMapSection;
