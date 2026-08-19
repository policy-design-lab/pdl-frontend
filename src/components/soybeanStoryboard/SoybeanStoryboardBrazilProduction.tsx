import React from "react";
import SoybeanStoryboardProductionOverview, { ProductionDetailColumn } from "./SoybeanStoryboardProductionOverview";
import {
    buildProductionFrames,
    buildTopStateRankingRows,
    formatAcresValue,
    formatBrazilMunicipalityName,
    getBrazilStateAbbrev,
    getBrazilStateName,
    getCanLoadHistoricalFrames,
    getHistoricalFrameRange,
    getLatestYear,
    getPlantedAcresForYear,
    getProductionGrowthLabel,
    getProductionTrendPoints,
    getSortedYears,
    PRODUCTION_SEGMENT_TABS,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SoybeanPlantedAcresCountryRecord,
    SoybeanPlantedAcresSummaryRecord,
    SoybeanYearRecord
} from "./soybeanApi";

const DETAIL_COLUMNS: ProductionDetailColumn[] = [
    {
        key: "municipality",
        label: "MUNICIPALITY",
        sortValue: (row) => row.municipality || row.name,
        value: (row) => row.municipality || row.name
    },
    {
        key: "state",
        label: "STATE",
        sortValue: (row) => row.state || SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
        value: (row) => row.state || SOYBEAN_STORYBOARD_NEED_DATA_LABEL
    },
    {
        key: "area",
        label: "ACRES",
        sortValue: (row) => row.area,
        value: (row) => formatAcresValue(row.area)
    }
];

type SoybeanStoryboardBrazilProductionProps = {
    isPlantedAcresLoading: boolean;
    onRequestHistoricalFrames: (startYear: string, endYear: string) => Promise<void>;
    plantedAcres: SoybeanYearRecord<SoybeanPlantedAcresCountryRecord>;
    plantedAcresSummary: SoybeanYearRecord<SoybeanPlantedAcresSummaryRecord>;
};

export default function SoybeanStoryboardBrazilProduction({
    isPlantedAcresLoading,
    onRequestHistoricalFrames,
    plantedAcres,
    plantedAcresSummary
}: SoybeanStoryboardBrazilProductionProps): JSX.Element {
    const plantedAcresYear = React.useMemo(() => getLatestYear(plantedAcres), [plantedAcres]);
    const productionFrames = React.useMemo(
        () =>
            buildProductionFrames(plantedAcres, "municipality", (record) => {
                const municipality = formatBrazilMunicipalityName(record.name);
                const state = getBrazilStateAbbrev(record.name, record.id);
                return {
                    area: record.totalAcres,
                    id: record.id,
                    idType: record.idType,
                    municipality,
                    name: state ? `${municipality}, ${state}` : municipality,
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
                label: "Brazil Total area planted (ACRES)"
            }}
            canLoadHistoricalFrames={canLoadHistoricalFrames}
            detailColumns={DETAIL_COLUMNS}
            detailFileNamePrefix="brazil-soybean-production"
            geography="brazil"
            isDetailLoading={isPlantedAcresLoading}
            legend={{
                regionLabel: "Brazil",
                subtitle: "Area Planted to Soybeans"
            }}
            mapAriaLabel="Brazil soybean area planted municipality map"
            onRequestHistoricalFrames={() => {
                const [startYear, endYear] = getHistoricalFrameRange(summaryYears, plantedAcresYear);
                return onRequestHistoricalFrames(startYear, endYear);
            }}
            overlayNote="Hover over areas of the map to view details"
            productionFrames={productionFrames}
            rankingForYear={(year) => {
                const years = getSortedYears(plantedAcres);
                const baselineYear = years[0];
                const baselineRecords = getPlantedAcresForYear(plantedAcres, baselineYear);
                const currentRecords = getPlantedAcresForYear(plantedAcres, year);
                const hasBaseline = Boolean(baselineYear && baselineYear !== year);
                return {
                    growthLabel: growthYearsLabel,
                    label: "STATE",
                    rows: buildTopStateRankingRows(
                        currentRecords,
                        baselineRecords,
                        hasBaseline,
                        (record) => getBrazilStateAbbrev(record.name, record.id),
                        getBrazilStateName
                    ),
                    title: "Top 5 States Ranked by Area Planted"
                };
            }}
            tabs={PRODUCTION_SEGMENT_TABS}
            title="Brazilian Soybean Production"
            trendPoints={trendPoints}
        />
    );
}
