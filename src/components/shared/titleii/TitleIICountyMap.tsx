import React, { useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { ShortFormat } from "../ConvertionFormats";
import DrawLegend from "../DrawLegend";
import { getCountyPercentiles } from "../../../utils/countyLegendConfig";
import CountyChoroplethMap, { CountyLegendContext, CountyTooltipContext } from "../countyMap/CountyChoroplethMap";
import SparseCountyLegend from "../countyMap/SparseCountyLegend";
import { buildCountyColorScale, getSparseCountyEntries } from "../../../utils/countyColorScale";
import { getPracticeTotal } from "./PracticeMethods";
import {
    formatPracticeSelection,
    getActivePractices,
    getCategoryLabel,
    getCategoryPayment,
    getCategoryPercentageNationwide,
    stripPracticeCode,
    TitleIICountyProgram
} from "./TitleIICountyMethods";
import { TitleIICountyDistribution, TitleIICountyRecord } from "./Interface";
import { TITLE_II_MAP_COLOR, TEXT_DIM } from "../colors";

interface TitleIICountyMapProps {
    program: TitleIICountyProgram;
    category: string;
    year: string;
    countyData: TitleIICountyDistribution;
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedState: string;
    onStateChange: (state: string) => void;
    selectedPractices?: string[];
    legendPaddingTop?: number;
    controlsComponent?: React.ReactNode;
}

const TitleIICountyMap = ({
    program,
    category,
    year,
    countyData,
    stateCodes,
    allStates,
    selectedState,
    onStateChange,
    selectedPractices = [],
    legendPaddingTop = 24,
    controlsComponent = null
}: TitleIICountyMapProps): JSX.Element => {
    const countyPercentiles = getCountyPercentiles("default");
    const categoryLabel = getCategoryLabel(program, category);

    const activePractices = useMemo(() => getActivePractices(selectedPractices), [selectedPractices]);

    const valueAccessor = useCallback(
        (county: TitleIICountyRecord) => {
            if (!activePractices.length) {
                return getCategoryPayment(program, county, category);
            }
            return activePractices.reduce((total, practice) => total + getPracticeTotal(county, practice), 0);
        },
        [program, category, activePractices]
    );

    const quantizeArrayForScale = useMemo(() => {
        const values: number[] = [];
        if (countyData && countyData[year]) {
            countyData[year].forEach((county: TitleIICountyRecord) => {
                const stateName = stateCodes[county.state] || county.state;
                if (selectedState !== "All States" && stateName !== selectedState) {
                    return;
                }
                const value = valueAccessor(county);
                if (Number.isFinite(value)) {
                    values.push(value);
                }
            });
        }
        return values;
    }, [countyData, year, selectedState, stateCodes, valueAccessor]);

    const { mode, colorScale, highlightColor } = useMemo(
        () => buildCountyColorScale(quantizeArrayForScale, countyPercentiles, TITLE_II_MAP_COLOR),
        [quantizeArrayForScale, countyPercentiles]
    );

    const practiceSummary = formatPracticeSelection(selectedPractices);

    const titleElement = (): JSX.Element => (
        <Box>
            <Typography noWrap variant="h6">
                <strong>{categoryLabel}</strong> Benefits from <strong>{year}</strong>
                {practiceSummary && (
                    <span>
                        {" - "}
                        <strong>{practiceSummary}</strong>
                    </span>
                )}
                {selectedState !== "All States" && <span> - {selectedState}</span>}
            </Typography>
            <Typography noWrap style={{ fontSize: "0.5em", color: TEXT_DIM, textAlign: "center" }}>
                <i>In any county that appears in gray, there is no available data</i>
            </Typography>
        </Box>
    );

    const renderTooltip = useCallback(
        ({ geo, countyData: record, value, classes }: CountyTooltipContext) => {
            if (!record) {
                return (
                    <div className="map_tooltip">
                        <div className={classes.tooltip_header}>
                            <b>{geo.properties?.name || "Unknown County"}</b>
                        </div>
                        <table className={classes.tooltip_table}>
                            <tbody>
                                <tr>
                                    <td className={classes.tooltip_topcell_left}>No data available</td>
                                    <td className={classes.tooltip_topcell_right}>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            }

            const stateName = stateCodes[record.state] || record.state;
            const nationwidePercentage = getCategoryPercentageNationwide(program, record, category);

            return (
                <div className="map_tooltip">
                    <div className={classes.tooltip_header}>
                        <b>
                            {record.countyName}, {stateName}
                        </b>
                    </div>
                    <table className={classes.tooltip_table}>
                        <tbody>
                            <tr>
                                <td className={classes.tooltip_topcell_left}>Benefits:</td>
                                <td className={classes.tooltip_topcell_right}>
                                    ${ShortFormat(value || 0, undefined, 2)}
                                </td>
                            </tr>
                            <tr>
                                <td className={classes.tooltip_regularcell_left}>PCT. Nationwide:</td>
                                <td className={classes.tooltip_regularcell_right}>
                                    {nationwidePercentage ? `${nationwidePercentage} %` : "0%"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {activePractices.length > 0 && (
                        <table className={classes.tooltip_table}>
                            <tbody>
                                {activePractices.map((practice) => (
                                    <tr key={practice}>
                                        <td className={classes.tooltip_regularcell_left}>
                                            {stripPracticeCode(practice)}:
                                        </td>
                                        <td className={classes.tooltip_regularcell_right}>
                                            ${ShortFormat(getPracticeTotal(record, practice), undefined, 2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        },
        [stateCodes, program, category, activePractices]
    );

    const legendComponent = useCallback(
        ({ quantizeArray, zeroPoints, countyDataMap, countyValueMap }: CountyLegendContext) => {
            if (mode !== "quantile") {
                return (
                    <Box sx={{ pt: legendPaddingTop, width: "100%" }}>
                        <SparseCountyLegend
                            title={titleElement()}
                            entries={
                                mode === "sparse"
                                    ? getSparseCountyEntries(countyValueMap, countyDataMap, stateCodes)
                                    : []
                            }
                            highlightColor={highlightColor}
                            emptyMessage={`${categoryLabel} county data in ${year} is unavailable.`}
                        />
                    </Box>
                );
            }
            return (
                <Box sx={{ pt: legendPaddingTop, width: "100%" }}>
                    <DrawLegend
                        isRatio={false}
                        notDollar={false}
                        colorScale={colorScale}
                        title={titleElement()}
                        programData={quantizeArray}
                        prepColor={TITLE_II_MAP_COLOR}
                        emptyState={zeroPoints}
                        useQuantileSpread
                        quantilePercentiles={countyPercentiles}
                    />
                </Box>
            );
        },
        [mode, highlightColor, categoryLabel, colorScale, countyPercentiles, year, selectedState, stateCodes]
    );

    return (
        <CountyChoroplethMap
            countyData={countyData}
            year={year}
            stateCodes={stateCodes}
            allStates={allStates}
            selectedState={selectedState}
            onStateChange={onStateChange}
            valueAccessor={valueAccessor}
            colorScale={colorScale}
            renderTooltip={renderTooltip}
            legendComponent={legendComponent}
            controlsComponent={controlsComponent}
            tooltipId={`${program.name.toLowerCase()}-county-map-tooltip`}
        />
    );
};

export default React.memo(TitleIICountyMap);
