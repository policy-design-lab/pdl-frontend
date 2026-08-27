import * as topojson from "topojson-client";
import { worldGeographyUrl } from "./constants";

let cachedFeatures: any[] | null = null;
let cachedFeaturesPromise: Promise<any[]> | null = null;

export function normalizeCountryId(id: string | number | null | undefined): string {
    if (id === null || id === undefined || id === "") {
        return "";
    }
    return `${id}`.padStart(3, "0");
}

export async function loadWorldFeatures(): Promise<any[]> {
    if (cachedFeatures) {
        return cachedFeatures;
    }
    if (cachedFeaturesPromise) {
        return cachedFeaturesPromise;
    }
    cachedFeaturesPromise = fetch(worldGeographyUrl)
        .then((response) => response.json())
        .then((topology) => {
            const geoFeatures = topojson
                .feature(topology, topology.objects.countries)
                .features.filter((item: any) => normalizeCountryId(item.id) !== "010");

            cachedFeatures = geoFeatures;
            return geoFeatures;
        });
    return cachedFeaturesPromise;
}
