import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../../app.config";
import { getJsonDataFromUrl } from "../../utils/apiutil";
import { ALL_PRACTICES } from "../shared/titleii/PracticeSelector";
import { enrichCountyRecords, loadCountyNames } from "./EQIPCategoryMethods";

const COUNTY_DISTRIBUTION_PATH = "/titles/title-ii/programs/eqip/county-distribution";

export const buildCountyDistributionUrl = (): string => `${config.apiUrl}${COUNTY_DISTRIBUTION_PATH}`;

const hasRecords = (payload: Record<string, unknown>): boolean =>
    Object.values(payload).some((records) => Array.isArray(records) && records.length > 0);

interface UseEQIPCountyPracticesResult {
    selectedPractices: string[];
    setSelectedPractices: (practices: string[]) => void;
    countyData: Record<string, unknown>;
    isLoading: boolean;
    hasLoaded: boolean;
    requestCountyData: () => void;
}

export default function useEQIPCountyPractices(cacheKeyPrefix: string): UseEQIPCountyPracticesResult {
    const [selectedPractices, setSelectedPracticesState] = useState<string[]>([ALL_PRACTICES]);
    const [countyData, setCountyData] = useState<Record<string, unknown>>({});
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
        const url = buildCountyDistributionUrl();
        if (requestedRef.current === url) {
            return;
        }
        requestedRef.current = url;
        const cacheKey = `${cacheKeyPrefix}${url}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setCountyData(JSON.parse(cached));
                setHasLoaded(true);
                return;
            }
        } catch {
            sessionStorage.removeItem(cacheKey);
        }
        setIsLoading(true);
        Promise.all([getJsonDataFromUrl(url), loadCountyNames()])
            .then(([response, countyNames]) => {
                if (!mountedRef.current) return;
                const raw = response && !Array.isArray(response) ? response : {};
                const resolved = enrichCountyRecords(raw, countyNames);
                setCountyData(resolved);
                setHasLoaded(true);
                if (hasRecords(resolved)) {
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify(resolved));
                    } catch {
                        console.error("error in caching");
                    }
                }
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
    }, [cacheKeyPrefix]);

    const requestCountyData = useCallback(() => {
        load();
    }, [load]);

    const setSelectedPractices = useCallback((practices: string[]) => {
        setSelectedPracticesState(practices);
    }, []);

    return { selectedPractices, setSelectedPractices, countyData, isLoading, hasLoaded, requestCountyData };
}
