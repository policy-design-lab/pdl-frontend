import { useState, useCallback } from "react";
import { isLoadingEnabled, isChunkedProcessingEnabled, getUIConfig, shouldLogPerformanceMetrics } from "./configUtil";

interface UseConfigurableLoadingReturn {
    isProcessing: boolean;
    processingMessage: string;
    startLoading: (message?: string) => void;
    stopLoading: () => void;
    processWithLoading: (processFn: () => Promise<unknown> | unknown, message?: string) => Promise<unknown>;
    processInChunks: (
        data: unknown[],
        chunkProcessor: (chunk: unknown[]) => Promise<unknown> | unknown,
        message?: string
    ) => Promise<unknown[]>;
}

export const useConfigurableLoading = (): UseConfigurableLoadingReturn => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("Processing...");

    const startLoading = useCallback((message = "Processing...") => {
        if (isLoadingEnabled()) {
            setIsProcessing(true);
            setProcessingMessage(message);

            if (shouldLogPerformanceMetrics()) {
                // eslint-disable-next-line no-console
                console.time(`Loading: ${message}`);
            }
        }
    }, []);

    const stopLoading = useCallback(() => {
        if (isLoadingEnabled()) {
            if (shouldLogPerformanceMetrics()) {
                // eslint-disable-next-line no-console
                console.timeEnd(`Loading: ${processingMessage}`);
            }
            setIsProcessing(false);
        }
    }, [processingMessage]);

    const processWithLoading = useCallback(
        async (processFn: () => Promise<unknown> | unknown, message = "Processing...") => {
            if (!isLoadingEnabled()) {
                return processFn();
            }

            startLoading(message);
            try {
                const config = getUIConfig();

                if (config.performance.useRequestAnimationFrame) {
                    return new Promise((resolve, reject) => {
                        requestAnimationFrame(async () => {
                            try {
                                const result = await processFn();
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    });
                }
                return processFn();
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    const processInChunks = useCallback(
        async (
            data: unknown[],
            chunkProcessor: (chunk: unknown[]) => Promise<unknown> | unknown,
            message = "Processing data..."
        ) => {
            if (!isChunkedProcessingEnabled()) {
                return chunkProcessor(data);
            }

            const config = getUIConfig();
            const chunkSize = Math.max(1, Math.floor(data.length / config.loadingStates.chunkSize));
            const chunks: unknown[][] = [];

            for (let i = 0; i < data.length; i += chunkSize) {
                chunks.push(data.slice(i, i + chunkSize));
            }

            const processChunksSequentially = async (): Promise<unknown[]> => {
                const sequentialResults: unknown[] = [];

                for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
                    if (config.loadingStates.enableProgressMessages) {
                        setProcessingMessage(`${message} (${chunkIndex + 1}/${chunks.length})`);
                    }

                    const chunkResult = await new Promise((resolve) => {
                        const processChunk = async (): Promise<void> => {
                            try {
                                const result = await chunkProcessor(chunks[chunkIndex]);
                                resolve(result);
                            } catch (error) {
                                // eslint-disable-next-line no-console
                                console.error("Error processing chunk:", error);
                                resolve(null);
                            }
                        };

                        if (config.performance.useRequestAnimationFrame) {
                            requestAnimationFrame(() => {
                                processChunk().catch((error) => {
                                    // eslint-disable-next-line no-console
                                    console.error("Error in processChunk:", error);
                                });
                            });
                        } else {
                            setTimeout(() => {
                                processChunk().catch((error) => {
                                    // eslint-disable-next-line no-console
                                    console.error("Error in processChunk:", error);
                                });
                            }, 0);
                        }
                    });

                    if (chunkResult !== null) {
                        sequentialResults.push(chunkResult);
                    }
                }

                return sequentialResults;
            };

            return processChunksSequentially();
        },
        []
    );

    return {
        isProcessing: isLoadingEnabled() ? isProcessing : false,
        processingMessage,
        startLoading,
        stopLoading,
        processWithLoading,
        processInChunks
    };
};
