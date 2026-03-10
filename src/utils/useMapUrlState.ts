import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type MapLevel = "state" | "county";

interface MapUrlStateOptions {
    mapIds: string[];
    defaultMapId: string;
    defaultLevel?: MapLevel;
    mapParam?: string;
    levelParam?: string;
}

const normalizeLevel = (value: string | null | undefined, fallback: MapLevel): MapLevel => {
    if (value === "state" || value === "county") {
        return value;
    }
    return fallback;
};

const normalizeMapId = (value: string | null | undefined, mapIds: string[], fallback: string): string => {
    if (value && mapIds.includes(value)) {
        return value;
    }
    return fallback;
};

export const useMapUrlState = ({
    mapIds,
    defaultMapId,
    defaultLevel = "state",
    mapParam = "map",
    levelParam = "level"
}: MapUrlStateOptions) => {
    const [params, setParams] = useSearchParams();

    const mapId = useMemo(
        () => normalizeMapId(params.get(mapParam), mapIds, defaultMapId),
        [params, mapParam, mapIds, defaultMapId]
    );

    const level = useMemo(
        () => normalizeLevel(params.get(levelParam), defaultLevel),
        [params, levelParam, defaultLevel]
    );

    const setMapId = useCallback(
        (nextMapId: string, options: { replace?: boolean } = {}) => {
            const next = new URLSearchParams(params);
            next.set(mapParam, normalizeMapId(nextMapId, mapIds, defaultMapId));
            next.set(levelParam, level);
            setParams(next, { replace: options.replace ?? true });
        },
        [params, setParams, mapParam, levelParam, mapIds, defaultMapId, level]
    );

    const setLevel = useCallback(
        (nextLevel: MapLevel, options: { replace?: boolean } = {}) => {
            const next = new URLSearchParams(params);
            next.set(levelParam, normalizeLevel(nextLevel, defaultLevel));
            next.set(mapParam, mapId);
            setParams(next, { replace: options.replace ?? true });
        },
        [params, setParams, mapParam, levelParam, mapId, defaultLevel]
    );

    const setMapAndLevel = useCallback(
        (nextMapId: string, nextLevel: MapLevel, options: { replace?: boolean } = {}) => {
            const next = new URLSearchParams(params);
            next.set(mapParam, normalizeMapId(nextMapId, mapIds, defaultMapId));
            next.set(levelParam, normalizeLevel(nextLevel, defaultLevel));
            setParams(next, { replace: options.replace ?? true });
        },
        [params, setParams, mapParam, levelParam, mapIds, defaultMapId, defaultLevel]
    );

    return { mapId, level, setMapId, setLevel, setMapAndLevel };
};
