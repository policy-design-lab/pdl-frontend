import { useCallback, useEffect, useRef, useState } from "react";
import { getJsonDataFromUrl } from "../../../utils/apiutil";
import { TitleIICountyProgram } from "./TitleIICountyMethods";
import { TitleIICountyDistribution } from "./Interface";

const countyDataMemoryCache = new Map<string, TitleIICountyDistribution>();
const countyDataInFlightCache = new Map<string, Promise<TitleIICountyDistribution>>();

const hasRecords = (payload: TitleIICountyDistribution): boolean =>
    Object.values(payload).some((records) => Array.isArray(records) && records.length > 0);

const fetchCountyData = (url: string): Promise<TitleIICountyDistribution> => {
    const inFlight = countyDataInFlightCache.get(url);
    if (inFlight) {
        return inFlight;
    }
    const request = getJsonDataFromUrl(url)
        .then((response) => {
            const resolved: TitleIICountyDistribution = response && !Array.isArray(response) ? response : {};
            if (hasRecords(resolved)) {
                countyDataMemoryCache.set(url, resolved);
            }
            return resolved;
        })
        .finally(() => {
            countyDataInFlightCache.delete(url);
        });
    countyDataInFlightCache.set(url, request);
    return request;
};

export interface UseTitleIICountyDataResult {
    countyData: TitleIICountyDistribution;
    isLoading: boolean;
    hasLoaded: boolean;
    requestCountyData: () => void;
}

export default function useTitleIICountyData(program: TitleIICountyProgram): UseTitleIICountyDataResult {
    const [countyData, setCountyData] = useState<TitleIICountyDistribution>({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const requestedRef = useRef<string | null>(null);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    const load = useCallback(() => {
        const url = program.countyDistributionUrl;
        if (requestedRef.current === url) {
            return;
        }
        requestedRef.current = url;
        const cached = countyDataMemoryCache.get(url);
        if (cached) {
            setCountyData(cached);
            setHasLoaded(true);
            return;
        }
        setIsLoading(true);
        fetchCountyData(url)
            .then((resolved) => {
                if (!mountedRef.current) return;
                setCountyData(resolved);
                setHasLoaded(true);
            })
            .catch(() => {
                if (!mountedRef.current) return;
                setCountyData({});
                setHasLoaded(true);
            })
            .finally(() => {
                if (mountedRef.current) {
                    setIsLoading(false);
                }
            });
    }, [program]);

    const requestCountyData = useCallback(() => {
        load();
    }, [load]);

    return { countyData, isLoading, hasLoaded, requestCountyData };
}
