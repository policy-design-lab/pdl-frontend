import React from "react";
import { projectCountyByCommodity } from "./projectCountyByCommodity";
import { resolveYearKeys, YearResolution } from "./resolveYearKeys";
import { CountyPayload, ProjectedCountyPayload } from "./types";

interface UseCropInsuranceCountyProjectionParams {
    rawCountyData: CountyPayload;
    selectedYears: string[];
    selectedCrops: string[];
    isVisible: boolean;
}

interface UseCropInsuranceCountyProjectionResult {
    projected: ProjectedCountyPayload | null;
    yearResolution: YearResolution;
    resolvedYearKey: string;
    yearKeys: string[];
}

export function useCropInsuranceCountyProjection({
    rawCountyData,
    selectedYears,
    selectedCrops,
    isVisible
}: UseCropInsuranceCountyProjectionParams): UseCropInsuranceCountyProjectionResult {
    const payloadKey = Object.keys(rawCountyData ?? {})
        .sort()
        .join("|");
    const yearsKey = [...selectedYears].sort().join("|");
    const cropsKey = [...selectedCrops].sort().join(",");
    const yearResolution = React.useMemo(
        () => resolveYearKeys(yearsKey ? yearsKey.split("|") : [], payloadKey ? payloadKey.split("|") : []),
        [yearsKey, payloadKey]
    );
    const yearKeys = yearResolution.status === "ok" ? yearResolution.keys : [];
    const resolvedYearKey = yearKeys.length > 0 ? yearKeys[0] : "";
    const memoKey = yearResolution.status === "ok" ? `${yearKeys.join("|")}::${cropsKey}` : "";
    const cacheRef = React.useRef<{ key: string; value: ProjectedCountyPayload } | null>(null);
    const projected = React.useMemo(() => {
        if (yearResolution.status !== "ok" || !rawCountyData) {
            return null;
        }
        if (cacheRef.current && cacheRef.current.key === memoKey) {
            return cacheRef.current.value;
        }
        if (!isVisible) {
            return null;
        }
        const value = projectCountyByCommodity(
            rawCountyData,
            yearResolution.keys,
            cropsKey ? cropsKey.split(",") : [],
            yearResolution.yearCount
        );
        cacheRef.current = { key: memoKey, value };
        return value;
    }, [memoKey, isVisible, rawCountyData, yearResolution, cropsKey]);
    return { projected, yearResolution, resolvedYearKey, yearKeys };
}

export default useCropInsuranceCountyProjection;
