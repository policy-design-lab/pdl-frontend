import { config } from "../../../app.config";
import { getJsonDataFromUrl } from "../../../utils/apiutil";
import { CountyPayload, CountyRecord } from "./types";

const countyYearPromises = new Map<string, Promise<CountyRecord[]>>();

export function loadCropInsuranceCountyData(years: string[]): Promise<CountyPayload> {
    const requested = Array.from(new Set(years)).sort();
    const missing = requested.filter((year) => !countyYearPromises.has(year));
    if (missing.length > 0) {
        const params = missing.map((year) => `year=${encodeURIComponent(year)}`).join("&");
        const url =
            `${config.apiUrl}/titles/title-xi/programs/crop-insurance/county-distribution` +
            `?${params}&listCommodities=true`;
        const request = getJsonDataFromUrl(url) as Promise<CountyPayload>;
        missing.forEach((year) => {
            const promise = request
                .then((payload) => payload[year] ?? [])
                .catch((error) => {
                    countyYearPromises.delete(year);
                    throw error;
                });
            countyYearPromises.set(year, promise);
        });
    }
    return Promise.all(
        requested.map((year) =>
            (countyYearPromises.get(year) as Promise<CountyRecord[]>).then(
                (records) => [year, records] as [string, CountyRecord[]]
            )
        )
    ).then((entries) => {
        const payload: CountyPayload = {};
        entries.forEach(([year, records]) => {
            payload[year] = records;
        });
        return payload;
    });
}
