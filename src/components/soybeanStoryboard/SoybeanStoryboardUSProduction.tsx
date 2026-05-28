import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SoybeanStoryboardProductionOverview, { ProductionDetailColumn } from "./SoybeanStoryboardProductionOverview";
import { STATE_FIPS_TO_NAME } from "../../utils/countyGeo";
import {
    buildProductionFrames,
    calculateGrowthPercentage,
    formatAcresValue,
    formatCompactAcres,
    formatPercentage,
    formatUsCountyName,
    getCanLoadHistoricalFrames,
    getHistoricalFrameRange,
    getLatestYear,
    getPlantedAcresForYear,
    getProductionGrowthLabel,
    getProductionTrendPoints,
    getSortedYears,
    isFiniteNumber,
    PRODUCTION_SEGMENT_TABS,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SoybeanPlantedAcresCountryRecord,
    SoybeanPlantedAcresSummaryRecord,
    SoybeanYearRecord,
    ProductionRankingRow
} from "./soybeanApi";

const FALLBACK_TOP_STATES = ["Illinois", "Indiana", "North Dakota", "South Dakota", "Missouri"];
const DETAIL_COLUMNS: ProductionDetailColumn[] = [
    {
        key: "county",
        label: "COUNTY",
        sortValue: (row) => row.county || row.name,
        value: (row) => row.county || row.name
    },
    {
        key: "state",
        label: "STATE",
        sortValue: (row) => row.state || SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        value: (row) => row.state || SOYBEAN_STORYBOARD_NEED_DATA_LABEL
    },
    {
        key: "area",
        label: "AREA PLANTED",
        sortValue: (row) => row.area,
        value: (row) => formatAcresValue(row.area)
    }
];

type SoybeanStoryboardUSProductionProps = {
    isPlantedAcresLoading: boolean;
    onRequestHistoricalFrames: (startYear: string, endYear: string) => Promise<void>;
    plantedAcres: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>;
    plantedAcresSummary: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>;
};

function getTopStateRows(
    plantedAcres: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>,
    plantedAcresSummary: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>,
    year: string
): ProductionRankingRow[] {
    const summaryRecord = plantedAcresSummary[year];
    const summaryYears = getSortedYears(plantedAcresSummary);
    const baselineYear = summaryYears[0];
    if (summaryRecord && Array.isArray(summaryRecord.states)) {
        return summaryRecord.states
            .map((record) => {
                const baselineRecord = baselineYear
                    ? plantedAcresSummary[baselineYear]?.states?.find((s) => s.state === record.state)
                    : null;
                const growth = calculateGrowthPercentage(
                    [baselineRecord?.totalAcres, record.totalAcres].filter(isFiniteNumber)
                );
                return {
                    area: formatCompactAcres(record.totalAcres),
                    areaValue: record.totalAcres,
                    growth: formatPercentage(growth, 0),
                    key: record.state,
                    label: record.state,
                    totalAcres: record.totalAcres
                };
            })
            .sort((rowA, rowB) => (rowB.totalAcres || 0) - (rowA.totalAcres || 0))
            .slice(0, 5)
            .map(({ area, areaValue, growth, key, label }) => ({ area, areaValue, growth, key, label }));
    }

    const stateTotals = getPlantedAcresForYear(plantedAcres, year).reduce<Record<string, number>>((totals, record) => {
        const stateFips = record.id.slice(0, 2);
        if (stateFips && isFiniteNumber(record.totalAcres)) {
            totals[stateFips] = (totals[stateFips] || 0) + record.totalAcres;
        }
        return totals;
    }, {});
    return Object.entries(stateTotals)
        .sort(([, totalA], [, totalB]) => totalB - totalA)
        .slice(0, 5)
        .map(([stateFips, total]) => ({
            area: formatCompactAcres(total),
            areaValue: total,
            growth: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
            key: stateFips,
            label: STATE_FIPS_TO_NAME[stateFips] || stateFips
        }));
}

export default function SoybeanStoryboardUSProduction({
    isPlantedAcresLoading,
    onRequestHistoricalFrames,
    plantedAcres,
    plantedAcresSummary
}: SoybeanStoryboardUSProductionProps): JSX.Element {
    const plantedAcresYear = React.useMemo(() => getLatestYear(plantedAcres), [plantedAcres]);
    const productionFrames = React.useMemo(
        () =>
            buildProductionFrames(plantedAcres, "county", (record) => {
                const state = STATE_FIPS_TO_NAME[record.id.slice(0, 2)];
                return {
                    area: record.totalAcres,
                    county: formatUsCountyName(record.name),
                    id: record.id,
                    idType: record.idType,
                    name: state ? `${formatUsCountyName(record.name)}, ${state}` : formatUsCountyName(record.name),
                    regionType: record.level,
                    state
                };
            }),
        [plantedAcres]
    );
    const { trendPoints, trendYears } = React.useMemo(
        () => getProductionTrendPoints(plantedAcresSummary, plantedAcresYear),
        [plantedAcresSummary, plantedAcresYear]
    );
    const summaryYears = React.useMemo(() => getSortedYears(plantedAcresSummary), [plantedAcresSummary]);
    const canLoadHistoricalFrames = React.useMemo(
        () => getCanLoadHistoricalFrames(summaryYears, plantedAcres),
        [plantedAcres, summaryYears]
    );
    const growthYearsLabel = getProductionGrowthLabel(trendYears);
    return (
        <SoybeanStoryboardProductionOverview
            card={{
                buttonLabel: "View yearly change",
                label: "U.S Total area planted (ACRES)"
            }}
            canLoadHistoricalFrames={canLoadHistoricalFrames}
            detailColumns={DETAIL_COLUMNS}
            detailFileNamePrefix="us-soybean-production"
            geography="us"
            isDetailLoading={isPlantedAcresLoading}
            legend={{
                subtitle: "Soybean Area Planted",
                titleStrong: `${plantedAcresYear} U.S`
            }}
            mapAriaLabel="U.S soybean area planted county map"
            onRequestHistoricalFrames={() => {
                const [startYear, endYear] = getHistoricalFrameRange(summaryYears, plantedAcresYear);
                return onRequestHistoricalFrames(startYear, endYear);
            }}
            overlayNote="Hover the map to view details"
            productionFrames={productionFrames}
            rankingForYear={(year) => {
                const topStates = getTopStateRows(plantedAcres, plantedAcresSummary, year);
                return {
                    growthLabel: growthYearsLabel,
                    label: "STATE",
                    rows:
                        topStates.length > 0
                            ? topStates
                            : FALLBACK_TOP_STATES.map((state) => ({
                                  area: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
                                  areaValue: null,
                                  growth: SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
                                  key: state,
                                  label: state
                              })),
                    title: "Top 5 States Ranking"
                };
            }}
            secondarySidebarContent={
                <Box className="soybean-storyboard-production-info-card soybean-storyboard-production-info-card-compact">
                    <Box className="soybean-storyboard-production-info-card-header">
                        <Typography className="soybean-storyboard-production-info-card-title">
                            Counties Newly Planted Soybean (20Y)
                        </Typography>
                        <Typography className="soybean-storyboard-production-info-card-link">View more ↗</Typography>
                    </Box>
                    <Typography className="soybean-storyboard-production-info-card-emphasis">
                        {SOYBEAN_STORYBOARD_NEED_DATA_LABEL}
                    </Typography>
                </Box>
            }
            tabs={PRODUCTION_SEGMENT_TABS}
            title="U.S Soybean Production"
            trendPoints={trendPoints}
        />
    );
}
