import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const URL_VALUE_SEPARATOR = "|";

const optionAsToken = (option: string): string => option;

const isSameSelection = (first: string[], second: string[]): boolean =>
    first.length === second.length && first.every((value) => second.includes(value));

interface UrlMultiSelectOptions {
    param: string;
    options: string[];
    defaultSelected: string[];
    toToken?: (option: string) => string | null;
    enabled?: boolean;
}

export const useUrlMultiSelect = ({
    param,
    options,
    defaultSelected,
    toToken = optionAsToken,
    enabled = true
}: UrlMultiSelectOptions): [string[], (next: string[]) => void] => {
    const [params, setParams] = useSearchParams();
    const rawValue = params.get(param);

    useEffect(() => {
        if (!enabled && rawValue !== null) {
            setParams(
                (current) => {
                    const updated = new URLSearchParams(current);
                    updated.delete(param);
                    return updated;
                },
                { replace: true }
            );
        }
    }, [enabled, rawValue, param, setParams]);

    const selected = useMemo(() => {
        if (!enabled || !rawValue) {
            return defaultSelected;
        }
        const optionByToken = new Map(options.map((option): [string | null, string] => [toToken(option), option]));
        const tokens = Array.from(new Set(rawValue.split(URL_VALUE_SEPARATOR)));
        const restored = tokens.map((token) => optionByToken.get(token));
        return restored.every(Boolean) ? (restored as string[]) : defaultSelected;
    }, [enabled, rawValue, options, defaultSelected, toToken]);

    const setSelected = useCallback(
        (next: string[]) => {
            setParams(
                (current) => {
                    const updated = new URLSearchParams(current);
                    if (isSameSelection(next, defaultSelected)) {
                        updated.delete(param);
                    } else {
                        updated.set(param, next.map(toToken).join(URL_VALUE_SEPARATOR));
                    }
                    return updated;
                },
                { replace: true }
            );
        },
        [setParams, param, defaultSelected, toToken]
    );

    return [selected, setSelected];
};
