import React from "react";
import SoybeanStoryboardProductionOverview, { ProductionDetailColumn } from "./SoybeanStoryboardProductionOverview";
import {
    buildProductionFrames,
    buildTopRankingRows,
    formatAcresValue,
    formatBrazilMunicipalityName,
    getCanLoadHistoricalFrames,
    getHistoricalFrameRange,
    getLatestYear,
    getPlantedAcresForYear,
    getProductionGrowthLabel,
    getProductionTrendPoints,
    getSortedYears,
    PRODUCTION_SEGMENT_TABS,
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
        key: "area",
        label: "AREA PLANTED",
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
            buildProductionFrames(plantedAcres, "municipality", (record) => ({
                area: record.totalAcres,
                id: record.id,
                idType: record.idType,
                municipality: formatBrazilMunicipalityName(record.name),
                name: formatBrazilMunicipalityName(record.name),
                regionType: record.level
            })),
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
                subtitle: "Soybean Area Planted",
                titleStrong: `${plantedAcresYear} Brazil`
            }}
            mapAriaLabel="Brazil soybean area planted municipality map"
            onRequestHistoricalFrames={() => {
                const [startYear, endYear] = getHistoricalFrameRange(summaryYears, plantedAcresYear);
                return onRequestHistoricalFrames(startYear, endYear);
            }}
            overlayNote="Hover the map to view details"
            productionFrames={productionFrames}
            rankingForYear={(year) => {
                const years = getSortedYears(plantedAcres);
                const baselineYear = years[0];
                const baselineRecords = getPlantedAcresForYear(plantedAcres, baselineYear);
                const currentRecords = getPlantedAcresForYear(plantedAcres, year);
                const hasBaseline = Boolean(baselineYear && baselineYear !== year);
                return {
                    growthLabel: growthYearsLabel,
                    label: "MUNICIPALITY",
                    rows: buildTopRankingRows(
                        currentRecords,
                        baselineRecords,
                        hasBaseline,
                        formatBrazilMunicipalityName
                    ),
                    title: "Top 5 Municipalities Ranking"
                };
            }}
            tabs={PRODUCTION_SEGMENT_TABS}
            title="Brazil Soybean Production"
            trendPoints={trendPoints}
        />
    );
}
