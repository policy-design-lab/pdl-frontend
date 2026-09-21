export const MAJOR_CROPS = ["Corn", "Cotton", "Grain Sorghum", "Peanuts", "Rice", "Soybeans", "Wheat"] as const;

export const OTHER_CROPS_ID = "Other Commodities";

export const ALL_CROPS_SENTINEL = "All Commodities";

const MAJOR_CROP_SET = new Set<string>(MAJOR_CROPS);

export function bucketForCommodityName(name: string): string {
    return MAJOR_CROP_SET.has(name) ? name : OTHER_CROPS_ID;
}

export function selectableCrops(): string[] {
    return [...MAJOR_CROPS, OTHER_CROPS_ID];
}

export function isAllCropsSelected(selected: string[]): boolean {
    if (selected.includes(ALL_CROPS_SENTINEL)) {
        return true;
    }
    return selectableCrops().every((crop) => selected.includes(crop));
}
