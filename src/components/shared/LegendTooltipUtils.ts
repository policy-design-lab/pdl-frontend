import fipsToState from "../../files/maps/fipsToStateMap";

export interface RawRegionData {
    fips: string;
    name: string;
    state: string;
    value: number;
}

interface RegionDataItem {
    hasData?: boolean;
    value?: number;
    state?: string;
    stateFIPS?: string;
    name?: string;
}

export interface TooltipData {
    percentileRange: string;
    regionCount: number;
    minRegion: string | { name: string; value: number; state?: string; fips?: string };
    maxRegion: string | { name: string; value: number; state?: string; fips?: string };
    rectIndex: number;
}

export const getStateFromFips = (fips: string, stateCodeToName: Record<string, string>): string => {
    if (!fips) return "";
    const stateCode = fips.substring(0, 2);
    const stateAbbr = fipsToState[stateCode] || "";
    return stateCodeToName[stateAbbr] || "";
};

export const getRegionInfoFromFips = (fips: string): { name: string; stateCode: string } => {
    const defaultResult = { name: "Unknown Region", stateCode: "" };
    if (!fips) return defaultResult;
    if (fips.includes("-")) {
        const parts = fips.split("-");
        if (parts.length >= 2) {
            return {
                name: `Region ${parts[1]}`,
                stateCode: parts[0].toUpperCase()
            };
        }
    }
    if (fips.length === 5) {
        const stateCode = fips.substring(0, 2);
        const regionCode = fips.substring(2);
        return {
            name: `Region ${regionCode}`,
            stateCode
        };
    }
    return defaultResult;
};

export const formatRegionName = (name: string, regionType = "County"): string => {
    if (!name) return `Unknown ${regionType}`;
    if (name.toLowerCase().includes(regionType.toLowerCase())) return name;
    return name;
};

export const getStateFromFipsEnhanced = (fips: string, stateCodeToName: Record<string, string>): string => {
    return getStateFromFips(fips, stateCodeToName);
};

export const getRegionNameFromFips = (fips: string, regionType = "County"): string => {
    const info = getRegionInfoFromFips(fips);
    return formatRegionName(info.name, regionType);
};

export const processRegionsInRange = (
    regionData: Record<string, number | RegionDataItem>,
    min: number,
    max: number,
    stateCodeToName: Record<string, string>,
    regionType = "County"
): {
    regionsInRange: RawRegionData[];
    minRegion: RawRegionData;
    maxRegion: RawRegionData;
    regionCount: number;
} => {
    const regionsInRange: RawRegionData[] = [];
    let highestValueRegion: RawRegionData | null = null;
    let highestValue = -Infinity;
    let lowestValueRegion: RawRegionData | null = null;
    let lowestValue = Infinity;
    let maxValueInData = -Infinity;
    Object.entries(regionData).forEach(([fips, region]) => {
        if (!region || (typeof region === "object" && !region.hasData)) return;
        const regionValue = typeof region === "number" ? region : region.value;
        if (regionValue !== undefined && regionValue !== null && Number.isFinite(regionValue)) {
            maxValueInData = Math.max(maxValueInData, regionValue);
            if (regionValue > highestValue) {
                highestValue = regionValue;
                let stateName = "";
                let regionName = "";
                if (typeof region === "object") {
                    if (region.state && region.state !== "All States") {
                        stateName = region.state;
                    } else if (region.stateFIPS) {
                        stateName = getStateFromFips(region.stateFIPS, stateCodeToName);
                    } else if (fips) {
                        stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                    }
                    if (region.name) {
                        regionName = region.name;
                    } else if (fips) {
                        regionName = getRegionNameFromFips(fips, regionType);
                    } else {
                        regionName = `Unknown ${regionType}`;
                    }
                } else if (fips) {
                    stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                    regionName = getRegionNameFromFips(fips, regionType);
                } else {
                    stateName = "";
                    regionName = `Unknown ${regionType}`;
                }
                highestValueRegion = {
                    fips,
                    name: formatRegionName(regionName, regionType),
                    state: stateName,
                    value: regionValue
                };
            }
            if (regionValue < lowestValue) {
                lowestValue = regionValue;
                let stateName = "";
                let regionName = "";
                if (typeof region === "object") {
                    if (region.state && region.state !== "All States") {
                        stateName = region.state;
                    } else if (region.stateFIPS) {
                        stateName = getStateFromFips(region.stateFIPS, stateCodeToName);
                    } else if (fips) {
                        stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                    }
                    if (region.name) {
                        regionName = region.name;
                    } else if (fips) {
                        regionName = getRegionNameFromFips(fips, regionType);
                    } else {
                        regionName = `Unknown ${regionType}`;
                    }
                } else if (fips) {
                    stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                    regionName = getRegionNameFromFips(fips, regionType);
                } else {
                    stateName = "";
                    regionName = `Unknown ${regionType}`;
                }
                lowestValueRegion = {
                    fips,
                    name: formatRegionName(regionName, regionType),
                    state: stateName,
                    value: regionValue
                };
            }
        }
    });
    const isLastBin = Math.abs(max - maxValueInData) < 0.001;
    try {
        Object.entries(regionData).forEach(([fips, region]) => {
            if (!region || (typeof region === "object" && !region.hasData)) return;
            const regionValue = typeof region === "number" ? region : region.value;
            if (!regionValue && regionValue !== 0) return;
            let stateName = "";
            let regionName = "";
            if (typeof region === "object") {
                if (region.state && region.state !== "All States") {
                    stateName = region.state;
                } else if (region.stateFIPS) {
                    stateName = getStateFromFips(region.stateFIPS, stateCodeToName);
                } else if (fips) {
                    stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                }
                if (region.name) {
                    regionName = region.name;
                } else if (fips) {
                    regionName = getRegionNameFromFips(fips, regionType);
                } else {
                    regionName = `Unknown ${regionType}`;
                }
            } else if (fips) {
                stateName = getStateFromFipsEnhanced(fips, stateCodeToName);
                regionName = getRegionNameFromFips(fips, regionType);
            } else {
                stateName = "";
                regionName = `Unknown ${regionType}`;
            }
            const isInRange = isLastBin ? regionValue >= min : regionValue >= min && regionValue < max;
            if (isInRange) {
                regionsInRange.push({
                    fips,
                    name: formatRegionName(regionName, regionType),
                    state: stateName,
                    value: regionValue
                });
            }
        });
    } catch (error) {
        console.error(`Error processing ${regionType} data:`, error);
    }
    const regionCount = regionsInRange.length;
    let minRegion: RawRegionData = { name: "N/A", value: 0, state: "", fips: "" };
    let maxRegion: RawRegionData = { name: "N/A", value: 0, state: "", fips: "" };
    if (regionCount > 0) {
        regionsInRange.sort((a, b) => a.value - b.value);
        minRegion = { ...regionsInRange[0] };
        maxRegion = { ...regionsInRange[regionsInRange.length - 1] };
        if (minRegion.fips && !minRegion.state) {
            minRegion.state = getStateFromFipsEnhanced(minRegion.fips, stateCodeToName);
        }
        if (maxRegion.fips && !maxRegion.state) {
            maxRegion.state = getStateFromFipsEnhanced(maxRegion.fips, stateCodeToName);
        }
    } else if (min === max && highestValueRegion) {
        minRegion = highestValueRegion;
        maxRegion = highestValueRegion;
        regionsInRange.push(highestValueRegion);
        return {
            regionsInRange,
            minRegion,
            maxRegion,
            regionCount: 1
        };
    } else if (lowestValueRegion && highestValueRegion) {
        minRegion = lowestValueRegion;
        maxRegion = highestValueRegion;
    }
    return { regionsInRange, minRegion, maxRegion, regionCount };
};

export const isRegionObject = (
    region: string | { name: string; value: number; state?: string; fips?: string }
): region is { name: string; value: number; state?: string; fips?: string } => {
    return typeof region !== "string";
};
