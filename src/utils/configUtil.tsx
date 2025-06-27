import uiConfig from "./uiConfig.json";

export interface UIConfig {
    loadingStates: {
        enabled: boolean;
        enableChunkedProcessing: boolean;
        enableProgressMessages: boolean;
        enableLoadingOverlay: boolean;
        chunkSize: number;
        heavyOperationThresholds: {
            multipleYears: number;
            complexCommodityFilters: number;
            complexProgramFilters: number;
        };
    };
    animations: {
        enabled: boolean;
        fadeTimeout: number;
        backdropBlur: boolean;
    };
    performance: {
        useRequestAnimationFrame: boolean;
        useRequestIdleCallback: boolean;
        idleCallbackTimeout: number;
    };
    debugging: {
        logChunkProcessing: boolean;
        logPerformanceMetrics: boolean;
    };
}

export const getUIConfig = (): UIConfig => {
    return uiConfig as UIConfig;
};

export const isLoadingEnabled = (): boolean => {
    const config = getUIConfig();
    return config.loadingStates.enabled;
};

export const isChunkedProcessingEnabled = (): boolean => {
    const config = getUIConfig();
    return config.loadingStates.enabled && config.loadingStates.enableChunkedProcessing;
};

export const isLoadingOverlayEnabled = (): boolean => {
    const config = getUIConfig();
    return config.loadingStates.enabled && config.loadingStates.enableLoadingOverlay;
};

export const getHeavyOperationThresholds = () => {
    const config = getUIConfig();
    return config.loadingStates.heavyOperationThresholds;
};

export const getChunkSize = (): number => {
    const config = getUIConfig();
    return config.loadingStates.chunkSize;
};

export const shouldLogChunkProcessing = (): boolean => {
    const config = getUIConfig();
    return config.debugging.logChunkProcessing;
};

export const shouldLogPerformanceMetrics = (): boolean => {
    const config = getUIConfig();
    return config.debugging.logPerformanceMetrics;
};
