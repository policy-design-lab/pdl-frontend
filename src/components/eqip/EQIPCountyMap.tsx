import React, { useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import { ShortFormat } from "../shared/ConvertionFormats";
import DrawLegend from "../shared/DrawLegend";
import { getCountyPercentiles } from "../../utils/countyLegendConfig";
import CountyChoroplethMap, { CountyTooltipContext } from "../shared/countyMap/CountyChoroplethMap";
import { getPracticeTotal } from "../shared/titleii/PracticeMethods";
import {
    EQIP_MAP_COLOR,
    formatPracticeSelection,
    getCategoryPayment,
    getCategoryPercentageNationwide,
    getCategoryThresholds,
    isTotalCategory
} from "./EQIPCategoryMethods";
import { TEXT_DIM, TEXT_FAINT } from "../shared/colors";

const computeQuantileThresholds = (quantizeArray: number[], countyPercentiles: number[]): number[] | null => {
    const nonZeroData = quantizeArray.filter((v) => v !== 0);
    if (nonZeroData.length < 5) return null;
    const sorted = [...nonZeroData].sort((a, b) => a - b);
    const p = (arr: number[], pct: number) => {
        const idx = (pct / 100) * (arr.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        if (lo === hi) return arr[lo];
        return arr[lo] * (1 - (idx - lo)) + arr[hi] * (idx - lo);
    };
    return countyPercentiles.map((pct) => p(sorted, pct));
};

interface EQIPCountyMapProps {
    category: string;
    year: string;
    countyData: any;
    stateCodes: Record<string, string>;
    allStates: any[];
    selectedState: string;
    onStateChange: (state: string) => void;
    selectedPractices?: string[];
    legendPaddingTop?: number;
    controlsComponent?: React.ReactNode;
}

const EQIPCountyMap = ({
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
}: EQIPCountyMapProps): JSX.Element => {
    const countyPercentiles = getCountyPercentiles("default");

    const activePractices = useMemo(
        () => selectedPractices.filter((practice) => practice && practice !== "All Practices"),
        [selectedPractices]
    );

    const valueAccessor = useCallback(
        (county: any) => {
            if (!activePractices.length) {
                return getCategoryPayment(county, category);
            }
            return activePractices.reduce((total, practice) => total + getPracticeTotal(county, practice), 0);
        },
        [category, activePractices]
    );

    const quantizeArrayForScale = useMemo(() => {
        const values: number[] = [];
        if (countyData && countyData[year]) {
            countyData[year].forEach((county: any) => {
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

    const colorScale = useMemo(() => {
        const quantileScale = computeQuantileThresholds(quantizeArrayForScale, countyPercentiles);
        const customScale = quantileScale || getCategoryThresholds(category);
        return d3.scaleThreshold(customScale, EQIP_MAP_COLOR);
    }, [quantizeArrayForScale, countyPercentiles, category]);

    const practiceSummary = formatPracticeSelection(selectedPractices);

    const titleElement = (): JSX.Element => (
        <Box>
            <Typography noWrap variant="h6">
                <strong>{isTotalCategory(category) ? "Total EQIP" : category}</strong> Benefits from{" "}
                <strong>{year}</strong>
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
            const nationwidePercentage = getCategoryPercentageNationwide(record, category);

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
                                            {practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "")}:
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
        [stateCodes, category, activePractices]
    );

    const legendComponent = useCallback(
        ({ quantizeArray, zeroPoints }: { quantizeArray: number[]; zeroPoints: any }) => {
            if (quantizeArray.length === 0) {
                return (
                    <Box sx={{ pt: legendPaddingTop, width: "100%" }}>
                        {titleElement()}
                        <Box display="flex" justifyContent="center">
                            <Typography sx={{ color: TEXT_FAINT, fontWeight: 700 }}>
                                {isTotalCategory(category) ? "Total EQIP" : category} county data in {year} is
                                unavailable.
                            </Typography>
                        </Box>
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
                        prepColor={EQIP_MAP_COLOR}
                        emptyState={zeroPoints}
                        useQuantileSpread
                        quantilePercentiles={countyPercentiles}
                    />
                </Box>
            );
        },
        [category, colorScale, countyPercentiles, year, selectedState]
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
            tooltipId="eqip-county-map-tooltip"
        />
    );
};

export default React.memo(EQIPCountyMap);
