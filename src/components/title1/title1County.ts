export interface Title1CountySelector {
    subtitle?: string;
    program?: string;
    subprogram?: string;
}

export interface Title1CountyColumnConfig {
    accessor: string;
    header: string;
    type: "currency" | "number" | "percent";
    tooltip?: string;
}

export type Title1CountyDatasetKey = "titleI" | "subtitleA" | "subtitleD" | "subtitleE";

export const title1CountyEndpointByKey: Record<Title1CountyDatasetKey, string> = {
    titleI: "titles/title-i/county-distribution",
    subtitleA: "titles/title-i/subtitles/subtitle-a/county-distribution",
    subtitleD: "titles/title-i/subtitles/subtitle-d/county-distribution",
    subtitleE: "titles/title-i/subtitles/subtitle-e/county-distribution"
};

export const getTitle1CountyScopedRecord = (countyRecord: any, selector: Title1CountySelector): any => {
    if (!countyRecord) {
        return null;
    }
    if (selector.program && selector.subprogram) {
        const programRecord = countyRecord.programs?.find((entry: any) => entry.programName === selector.program);
        if (!programRecord) {
            return null;
        }
        return programRecord.subPrograms?.find((entry: any) => entry.subProgramName === selector.subprogram) || null;
    }
    if (selector.program) {
        return countyRecord.programs?.find((entry: any) => entry.programName === selector.program) || null;
    }
    return countyRecord;
};

export const getTitle1CountyMetricValue = (
    countyRecord: any,
    selector: Title1CountySelector,
    accessor: string
): number | null => {
    const scopedRecord = getTitle1CountyScopedRecord(countyRecord, selector);
    if (!scopedRecord) {
        return null;
    }
    const value = Number(scopedRecord[accessor]);
    return Number.isFinite(value) ? value : null;
};

export const formatTitle1Percent = (value: number): string =>
    `${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
