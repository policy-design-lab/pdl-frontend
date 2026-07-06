import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CSVLink } from "react-csv";
import MapLoadingOverlay from "../shared/MapLoadingOverlay";
import { geoAlbersUsa, geoMercator, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import countiesTopoJson from "../../files/maps/counties-10m.json";
import brazilMunicipalitiesTopoJson from "../../files/maps/brazil-municipalities-min.json";
import SoybeanStoryboardProductionTrendCard, {
    SoybeanProductionTrendPoint
} from "./SoybeanStoryboardProductionTrendCard";
import {
    formatCompactAcres,
    getPlantedAcresLegendValues,
    isFiniteNumber,
    ProductionDetailFrame,
    ProductionDetailRow,
    ProductionRankingRow,
    ProductionSegmentTab,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL
} from "./soybeanApi";

export type { ProductionDetailFrame, ProductionDetailRow, ProductionRankingRow } from "./soybeanApi";
const MAP_VIEWBOX_WIDTH = 760;
const BRAZIL_MAP_VIEWBOX_HEIGHT = 1080;
const US_MAP_VIEWBOX_HEIGHT = 620;
const LEGEND_COLORS = ["#CAF2B2", "#85F047", "#46AF08", "#4DD100", "#276A00"];

type LegendConfig = {
    subtitle: string;
    titleStrong: string;
};

type TrendCardConfig = {
    buttonLabel: string;
    label: string;
};

export type ProductionDetailColumn = {
    key: string;
    label: string;
    sortValue?: (row: ProductionDetailRow) => number | string | null;
    value: (row: ProductionDetailRow) => string;
};

type ProductionRankingConfig = {
    growthLabel: string;
    label: string;
    rows: ProductionRankingRow[];
    title: string;
};

type SoybeanStoryboardProductionOverviewProps = {
    card: TrendCardConfig;
    detailColumns: ProductionDetailColumn[];
    detailFileNamePrefix: string;
    geography: "brazil" | "us";
    legend: LegendConfig;
    mapAriaLabel: string;
    canLoadHistoricalFrames?: boolean;
    isDetailLoading?: boolean;
    onRequestHistoricalFrames?: () => Promise<void>;
    overlayNote?: string;
    productionFrames?: ProductionDetailFrame[];
    rankingForYear: (year: string) => ProductionRankingConfig;
    secondarySidebarContent?: React.ReactNode;
    tabs: ProductionSegmentTab[];
    title: string;
    trendPoints: SoybeanProductionTrendPoint[];
};

type TooltipState = {
    row: ProductionDetailRow;
};

type DetailSortState = {
    direction: "asc" | "desc";
    key: string;
};

function getProductionFillForValue(
    value: number | undefined,
    legendValues: number[]
): { fill: string; opacity: number } | null {
    if (!isFiniteNumber(value) || value <= 0 || legendValues.length === 0) {
        return null;
    }
    let colorIndex = 0;
    for (let index = 1; index < legendValues.length - 1; index += 1) {
        if (value >= legendValues[index]) {
            colorIndex = index;
        }
    }
    return {
        fill: LEGEND_COLORS[Math.min(LEGEND_COLORS.length - 1, colorIndex)],
        opacity: 0.96
    };
}

function getCsvData(columns: ProductionDetailColumn[], rows: ProductionDetailRow[]): string[][] {
    return [columns.map((column) => column.label), ...rows.map((row) => columns.map((column) => column.value(row)))];
}

export default function SoybeanStoryboardProductionOverview({
    card,
    detailColumns,
    detailFileNamePrefix,
    geography,
    legend,
    mapAriaLabel,
    canLoadHistoricalFrames = false,
    isDetailLoading = false,
    onRequestHistoricalFrames,
    overlayNote,
    productionFrames = [],
    rankingForYear,
    secondarySidebarContent,
    tabs,
    title,
    trendPoints
}: SoybeanStoryboardProductionOverviewProps): JSX.Element {
    const [isPlaybackActive, setIsPlaybackActive] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isTableOpen, setIsTableOpen] = React.useState(false);
    const [activeFrameIndex, setActiveFrameIndex] = React.useState(Math.max(0, productionFrames.length - 1));
    const [detailSearch, setDetailSearch] = React.useState("");
    const [detailSort, setDetailSort] = React.useState<DetailSortState>({ key: "area", direction: "desc" });
    const [tooltip, setTooltip] = React.useState<TooltipState | null>(null);
    const mapWrapRef = React.useRef<HTMLDivElement>(null);
    const mapStageRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const tooltipPositionRef = React.useRef({ x: 0, y: 0 });
    const tooltipAnimationFrameRef = React.useRef<number | null>(null);
    const pendingPlaybackRef = React.useRef(false);

    React.useEffect(() => {
        setActiveFrameIndex(Math.max(0, productionFrames.length - 1));
        setIsPlaybackActive(false);
        setIsPlaying(false);
        setIsTableOpen(false);
        setDetailSearch("");
        setDetailSort({ key: "area", direction: "desc" });
        setTooltip(null);
    }, [productionFrames]);

    React.useEffect(
        () => () => {
            if (tooltipAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(tooltipAnimationFrameRef.current);
            }
        },
        []
    );

    React.useEffect(() => {
        if (!pendingPlaybackRef.current || isDetailLoading) {
            return;
        }
        if (productionFrames.length > 1) {
            setActiveFrameIndex(0);
            setIsPlaybackActive(true);
            setIsPlaying(true);
        }

        pendingPlaybackRef.current = false;
    }, [isDetailLoading, productionFrames]);

    React.useEffect(() => {
        if (!isPlaying || productionFrames.length <= 1) {
            return undefined;
        }
        const intervalId = window.setInterval(() => {
            setActiveFrameIndex((currentIndex) => {
                const nextIndex = currentIndex + 1;
                if (nextIndex >= productionFrames.length - 1) {
                    setIsPlaying(false);
                    return productionFrames.length - 1;
                }
                return nextIndex;
            });
        }, 1200);
        return () => {
            window.clearInterval(intervalId);
        };
    }, [isPlaying, productionFrames]);
    const latestFrame = productionFrames[productionFrames.length - 1] || null;
    const activeFrame = productionFrames[activeFrameIndex] || latestFrame;
    const visibleFrame = isPlaybackActive && activeFrame ? activeFrame : latestFrame;
    const mapViewBoxHeight = geography === "brazil" ? BRAZIL_MAP_VIEWBOX_HEIGHT : US_MAP_VIEWBOX_HEIGHT;
    const tableFrame = visibleFrame;
    const visibleRowsById = React.useMemo(
        () =>
            (visibleFrame?.rows || []).reduce<Record<string, ProductionDetailRow>>((rowsById, row) => {
                rowsById[row.id] = row;
                return rowsById;
            }, {}),
        [visibleFrame]
    );
    const visiblePlantedAcresValues = visibleFrame?.plantedAcresValues || [];
    const visiblePlantedAcresByRegionId = visibleFrame?.plantedAcresByRegionId || {};
    const hasAnimatedFrames = productionFrames.length > 1;
    const canStartPlayback = hasAnimatedFrames || canLoadHistoricalFrames;
    const productionTrendPoints = React.useMemo(
        () => productionFrames.map((frame) => ({ totalAcres: frame.totalAcres, year: frame.year })),
        [productionFrames]
    );
    const baseTrendPoints = trendPoints.length > 0 ? trendPoints : productionTrendPoints;
    const activeTrendPoints = React.useMemo(() => {
        if (!isPlaybackActive || !hasAnimatedFrames || !visibleFrame) {
            return baseTrendPoints;
        }
        const activeYearNumber = Number(visibleFrame.year);
        const filteredPoints = baseTrendPoints.filter((point) => Number(point.year) <= activeYearNumber);
        return filteredPoints.length > 0 ? filteredPoints : baseTrendPoints;
    }, [baseTrendPoints, hasAnimatedFrames, isPlaybackActive, visibleFrame]);
    const activeLegendTitleStrong = visibleFrame
        ? `${visibleFrame.year} ${geography === "us" ? "U.S" : "Brazil"}`
        : legend.titleStrong;
    const detailRows = tableFrame?.rows || [];
    const ranking = rankingForYear(visibleFrame?.year || latestFrame?.year || "");
    const detailButtonLabel = isDetailLoading
        ? "Loading yearly data..."
        : isPlaybackActive && isPlaying
          ? "Pause year playback"
          : card.buttonLabel;
    const legendValues = React.useMemo(
        () => getPlantedAcresLegendValues(visiblePlantedAcresValues, LEGEND_COLORS.length),
        [visiblePlantedAcresValues]
    );
    const legendTickLabels = React.useMemo(
        () =>
            legendValues.length > 0
                ? legendValues.map((value) => formatCompactAcres(value, 2))
                : LEGEND_COLORS.map(() => SOYBEAN_STORYBOARD_NEED_DATA_LABEL).concat(
                      SOYBEAN_STORYBOARD_NEED_DATA_LABEL
                  ),
        [legendValues]
    );
    const brazilMunicipalities = React.useMemo(
        () =>
            ((
                topojson.feature(
                    brazilMunicipalitiesTopoJson as any,
                    (brazilMunicipalitiesTopoJson as any).objects.BRMU
                ) as any
            ).features || []) as any[],
        []
    );
    const brazilFeatureCollection = React.useMemo(
        () => ({
            type: "FeatureCollection",
            features: brazilMunicipalities
        }),
        [brazilMunicipalities]
    );
    const usNationFeature = React.useMemo(
        () => topojson.feature(countiesTopoJson as any, (countiesTopoJson as any).objects.nation) as any,
        []
    );
    const usStates = React.useMemo(
        () =>
            (topojson.feature(countiesTopoJson as any, (countiesTopoJson as any).objects.states) as any).features || [],
        []
    );
    const usCounties = React.useMemo(
        () =>
            (topojson.feature(countiesTopoJson as any, (countiesTopoJson as any).objects.counties) as any).features ||
            [],
        []
    );
    const projection = React.useMemo(() => {
        if (geography === "brazil") {
            return geoMercator().fitExtent(
                [
                    [24, 18],
                    [MAP_VIEWBOX_WIDTH - 18, mapViewBoxHeight - 20]
                ],
                brazilFeatureCollection as any
            );
        }
        return geoAlbersUsa().fitExtent(
            [
                [18, 32],
                [MAP_VIEWBOX_WIDTH - 18, mapViewBoxHeight - 24]
            ],
            usNationFeature
        );
    }, [brazilFeatureCollection, geography, mapViewBoxHeight, usNationFeature]);
    const pathGenerator = React.useMemo(() => geoPath(projection), [projection]);
    const basePath = React.useMemo(() => {
        if (geography === "brazil") {
            return pathGenerator(brazilFeatureCollection as any) || "";
        }
        return pathGenerator(usNationFeature) || "";
    }, [brazilFeatureCollection, geography, pathGenerator, usNationFeature]);
    const tableGridTemplateColumns = React.useMemo(
        () =>
            detailColumns.map((column) => (column.key === "area" ? "minmax(9rem, 0.9fr)" : "minmax(0, 1fr)")).join(" "),
        [detailColumns]
    );
    const filteredDetailRows = React.useMemo(() => {
        const normalizedSearch = detailSearch.trim().toLowerCase();
        if (!normalizedSearch) {
            return detailRows;
        }
        return detailRows.filter((row) =>
            detailColumns.some((column) => column.value(row).toLowerCase().includes(normalizedSearch))
        );
    }, [detailColumns, detailRows, detailSearch]);
    const sortedDetailRows = React.useMemo(() => {
        const activeColumn = detailColumns.find((column) => column.key === detailSort.key);
        if (!activeColumn) {
            return filteredDetailRows;
        }
        return [...filteredDetailRows].sort((rowA, rowB) => {
            const valueA = activeColumn.sortValue ? activeColumn.sortValue(rowA) : activeColumn.value(rowA);
            const valueB = activeColumn.sortValue ? activeColumn.sortValue(rowB) : activeColumn.value(rowB);
            if (typeof valueA === "number" && typeof valueB === "number") {
                return detailSort.direction === "asc" ? valueA - valueB : valueB - valueA;
            }
            const comparison = String(valueA ?? "").localeCompare(String(valueB ?? ""), "en-US", {
                numeric: true,
                sensitivity: "base"
            });
            return detailSort.direction === "asc" ? comparison : -comparison;
        });
    }, [detailColumns, detailSort, filteredDetailRows]);
    const csvData = React.useMemo(() => getCsvData(detailColumns, sortedDetailRows), [detailColumns, sortedDetailRows]);

    function handleDetailButtonClick(): void {
        if (isDetailLoading) {
            return;
        }
        if (!hasAnimatedFrames && canLoadHistoricalFrames && onRequestHistoricalFrames) {
            pendingPlaybackRef.current = true;
            void onRequestHistoricalFrames();
            return;
        }
        if (!hasAnimatedFrames) {
            setIsPlaying(false);
            return;
        }
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }
        setIsPlaybackActive(true);
        setIsPlaying(true);
        setActiveFrameIndex((currentIndex) => (currentIndex >= productionFrames.length - 1 ? 0 : currentIndex));
    }

    function handleDetailSort(columnKey: string): void {
        setDetailSort((currentSort) => ({
            key: columnKey,
            direction: currentSort.key === columnKey && currentSort.direction === "asc" ? "desc" : "asc"
        }));
    }

    function handleTableToggle(): void {
        setIsTableOpen((currentValue) => {
            const nextValue = !currentValue;
            if (nextValue) {
                window.requestAnimationFrame(() => {
                    mapWrapRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                });
            }
            return nextValue;
        });
    }

    function getTableSwatchStyle(area: number | null): React.CSSProperties {
        const style = getProductionFillForValue(area ?? undefined, legendValues);
        return {
            backgroundColor: style?.fill || "#1E353B",
            opacity: style?.opacity || 1
        };
    }

    function scheduleTooltipPositionUpdate(event: React.MouseEvent<SVGPathElement>): void {
        if (!mapStageRef.current) {
            return;
        }
        const stageRect = mapStageRef.current.getBoundingClientRect();
        tooltipPositionRef.current = {
            x: event.clientX - stageRect.left,
            y: event.clientY - stageRect.top
        };
        if (tooltipAnimationFrameRef.current !== null) {
            return;
        }
        tooltipAnimationFrameRef.current = window.requestAnimationFrame(() => {
            if (tooltipRef.current) {
                tooltipRef.current.style.left = `${tooltipPositionRef.current.x}px`;
                tooltipRef.current.style.top = `${tooltipPositionRef.current.y}px`;
            }
            tooltipAnimationFrameRef.current = null;
        });
    }

    function handleTooltipEnter(event: React.MouseEvent<SVGPathElement>, row: ProductionDetailRow | undefined): void {
        if (!row) {
            setTooltip(null);
            return;
        }
        scheduleTooltipPositionUpdate(event);
        setTooltip((currentTooltip) => (currentTooltip?.row.id === row.id ? currentTooltip : { row }));
    }

    function handleTooltipMove(event: React.MouseEvent<SVGPathElement>): void {
        scheduleTooltipPositionUpdate(event);
    }

    function handleTooltipLeave(): void {
        setTooltip(null);
    }
    return (
        <Box className="soybean-storyboard-production-shell">
            <Box className="soybean-storyboard-production-header">
                <Typography className="soybean-storyboard-subheader soybean-storyboard-production-title">
                    {title}
                </Typography>
                <Box
                    className="soybean-storyboard-production-tabs"
                    role="tablist"
                    aria-label={`${title} tabs`}
                    sx={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
                >
                    {tabs.map((tab) => (
                        <Box
                            key={tab.id}
                            component="button"
                            type="button"
                            disabled={!tab.active}
                            className={
                                tab.active
                                    ? "soybean-storyboard-production-tab soybean-storyboard-production-tab-active"
                                    : "soybean-storyboard-production-tab"
                            }
                        >
                            {tab.label}
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box className="soybean-storyboard-production-legend-wrap">
                <Typography className="soybean-storyboard-production-legend-title">
                    <span>{activeLegendTitleStrong}</span> {legend.subtitle}
                </Typography>
                <Box className="soybean-storyboard-production-legend-row">
                    <Box
                        className={
                            legendValues.length === 0
                                ? "soybean-storyboard-production-legend-item"
                                : "soybean-storyboard-production-legend-item soybean-storyboard-production-legend-item-placeholder"
                        }
                        aria-hidden={legendValues.length > 0}
                    >
                        <Box className="soybean-storyboard-production-legend-swatch soybean-storyboard-production-legend-swatch-nodata" />
                        <Typography className="soybean-storyboard-production-legend-label">
                            {SOYBEAN_STORYBOARD_NEED_DATA_LABEL}
                        </Typography>
                    </Box>
                    <Box className="soybean-storyboard-production-legend-item">
                        <Box className="soybean-storyboard-production-legend-swatch soybean-storyboard-production-legend-swatch-none" />
                        <Typography className="soybean-storyboard-production-legend-label">No planted</Typography>
                    </Box>
                    <Box className="soybean-storyboard-production-scale">
                        <Box
                            className="soybean-storyboard-production-scale-bar"
                            sx={{ gridTemplateColumns: `repeat(${LEGEND_COLORS.length}, 1fr)` }}
                        >
                            {LEGEND_COLORS.map((color) => (
                                <Box
                                    key={color}
                                    className="soybean-storyboard-production-scale-segment"
                                    sx={{ backgroundColor: color }}
                                />
                            ))}
                        </Box>
                        <Box
                            className="soybean-storyboard-production-scale-ticks"
                            sx={{ gridTemplateColumns: `repeat(${legendTickLabels.length}, 1fr)` }}
                        >
                            {legendTickLabels.map((label, index) => (
                                <Typography
                                    key={`${label}-${index}`}
                                    className="soybean-storyboard-production-scale-tick"
                                >
                                    {label}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box className="soybean-storyboard-production-content">
                <Box
                    ref={mapWrapRef}
                    className={`soybean-storyboard-production-map-wrap soybean-storyboard-production-map-wrap-${geography}`}
                >
                    {projection && basePath ? (
                        <Box ref={mapStageRef} className="soybean-storyboard-production-map-stage">
                            {overlayNote ? (
                                <Typography className="soybean-storyboard-production-map-note">
                                    {overlayNote}
                                </Typography>
                            ) : null}
                            <svg
                                viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${mapViewBoxHeight}`}
                                className="soybean-storyboard-production-map"
                                role="img"
                                aria-label={mapAriaLabel}
                            >
                                {geography === "brazil" ? (
                                    <>
                                        {brazilMunicipalities.map((municipalityFeature: any) => {
                                            const municipalityPath = pathGenerator(municipalityFeature);
                                            const municipalityId = String(
                                                municipalityFeature.properties?.codarea || ""
                                            );
                                            const row = visibleRowsById[municipalityId];
                                            const style = getProductionFillForValue(
                                                visiblePlantedAcresByRegionId[municipalityId],
                                                legendValues
                                            );
                                            if (!municipalityPath) {
                                                return null;
                                            }
                                            return (
                                                <path
                                                    key={municipalityId}
                                                    d={municipalityPath}
                                                    fill={style?.fill || "#1E353B"}
                                                    opacity={style?.opacity || 1}
                                                    stroke="rgba(223, 241, 216, 0.12)"
                                                    strokeWidth="0.18"
                                                    vectorEffect="non-scaling-stroke"
                                                    onMouseEnter={(event) => handleTooltipEnter(event, row)}
                                                    onMouseMove={handleTooltipMove}
                                                    onMouseLeave={handleTooltipLeave}
                                                />
                                            );
                                        })}
                                    </>
                                ) : (
                                    <>
                                        <path d={basePath} fill="#1E353B" stroke="#374B51" strokeWidth="1.2" />
                                        {usCounties.map((countyFeature: any) => {
                                            const countyPath = pathGenerator(countyFeature);
                                            const countyId = String(countyFeature.id).padStart(5, "0");
                                            const row = visibleRowsById[countyId];
                                            const style = getProductionFillForValue(
                                                visiblePlantedAcresByRegionId[countyId],
                                                legendValues
                                            );
                                            if (!countyPath) {
                                                return null;
                                            }
                                            return (
                                                <path
                                                    key={countyFeature.id}
                                                    d={countyPath}
                                                    fill={style?.fill || "#1E353B"}
                                                    opacity={style?.opacity || 1}
                                                    stroke="rgba(223, 241, 216, 0.16)"
                                                    strokeWidth="0.28"
                                                    vectorEffect="non-scaling-stroke"
                                                    onMouseEnter={(event) => handleTooltipEnter(event, row)}
                                                    onMouseMove={handleTooltipMove}
                                                    onMouseLeave={handleTooltipLeave}
                                                />
                                            );
                                        })}
                                        {usStates.map((stateFeature: any) => {
                                            const statePath = pathGenerator(stateFeature);
                                            if (!statePath) {
                                                return null;
                                            }
                                            return (
                                                <path
                                                    key={stateFeature.id}
                                                    d={statePath}
                                                    fill="none"
                                                    stroke="rgba(105, 120, 124, 0.24)"
                                                    strokeWidth="1"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </svg>
                            {isDetailLoading ? (
                                <MapLoadingOverlay
                                    backgroundColor="rgba(7, 22, 28, 0.82)"
                                    label="Loading yearly map data..."
                                    textColor="rgba(255, 255, 255, 0.84)"
                                    zIndex={4}
                                />
                            ) : null}
                            {tooltip ? (
                                <Box ref={tooltipRef} className="soybean-storyboard-production-tooltip">
                                    <Typography className="soybean-storyboard-production-tooltip-title">
                                        {tooltip.row.name}
                                    </Typography>
                                    <Box className="soybean-storyboard-production-tooltip-row">
                                        <Typography>Area planted</Typography>
                                        <Typography>{formatCompactAcres(tooltip.row.area, 2)}</Typography>
                                    </Box>
                                </Box>
                            ) : null}
                        </Box>
                    ) : (
                        <Box className="soybean-storyboard-map-loading soybean-storyboard-production-map-loading">
                            <Typography className="soybean-storyboard-map-loading-text">
                                {geography === "brazil" ? "Loading Brazil map..." : "Loading U.S. map..."}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box className="soybean-storyboard-production-sidebar">
                    <SoybeanStoryboardProductionTrendCard
                        buttonLabel={detailButtonLabel}
                        canStartPlayback={canStartPlayback}
                        isDetailLoading={isDetailLoading}
                        isPlaying={isPlaybackActive && isPlaying}
                        label={card.label}
                        onButtonClick={handleDetailButtonClick}
                        trendPoints={activeTrendPoints}
                    />
                    <Box className="soybean-storyboard-production-info-card">
                        <Box className="soybean-storyboard-production-info-card-header">
                            <Typography className="soybean-storyboard-production-info-card-title">
                                {ranking.title}
                            </Typography>
                            <Box
                                component="button"
                                type="button"
                                className="soybean-storyboard-production-info-card-link soybean-storyboard-production-info-card-link-button"
                                onClick={handleTableToggle}
                            >
                                {isTableOpen ? "Hide" : "View more ↗"}
                            </Box>
                        </Box>
                        <Box className="soybean-storyboard-production-table">
                            <Box className="soybean-storyboard-production-table-header">
                                <Typography>{ranking.label}</Typography>
                                <Typography>AREA PLANTED</Typography>
                                <Typography>{ranking.growthLabel}</Typography>
                            </Box>
                            {ranking.rows.map(({ area, areaValue, growth, key, label }) => (
                                <Box key={key} className="soybean-storyboard-production-table-row">
                                    <Typography>{label}</Typography>
                                    <Box className="soybean-storyboard-production-table-value">
                                        <Box
                                            className="soybean-storyboard-production-table-swatch"
                                            sx={getTableSwatchStyle(areaValue)}
                                        />
                                        <Typography>{area}</Typography>
                                    </Box>
                                    <Typography className="soybean-storyboard-production-table-growth">
                                        {growth}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    {isTableOpen ? (
                        <Box className="soybean-storyboard-production-info-card soybean-storyboard-production-detail">
                            <Box className="soybean-storyboard-production-detail-header">
                                <Typography className="soybean-storyboard-production-info-card-title">
                                    {tableFrame ? `${tableFrame.year} ${legend.subtitle}` : legend.subtitle}
                                </Typography>
                                <CSVLink
                                    className="soybean-storyboard-production-download-link"
                                    filename={`${detailFileNamePrefix}-${tableFrame?.year || "data"}.csv`}
                                    data={csvData}
                                >
                                    Download CSV
                                </CSVLink>
                            </Box>
                            <Box className="soybean-storyboard-production-detail-search-wrap">
                                <Typography className="soybean-storyboard-production-detail-search-label">
                                    Search:
                                </Typography>
                                <input
                                    value={detailSearch}
                                    onChange={(event) => setDetailSearch(event.target.value)}
                                    placeholder="Type to search..."
                                    className="soybean-storyboard-production-detail-search"
                                />
                            </Box>
                            <Box className="soybean-storyboard-production-detail-table">
                                <Box
                                    className="soybean-storyboard-production-detail-table-header"
                                    sx={{ gridTemplateColumns: tableGridTemplateColumns }}
                                >
                                    {detailColumns.map((column) => (
                                        <Box
                                            key={column.key}
                                            component="button"
                                            type="button"
                                            className="soybean-storyboard-production-detail-sort-button"
                                            onClick={() => handleDetailSort(column.key)}
                                        >
                                            <Typography>{column.label}</Typography>
                                            <Typography className="soybean-storyboard-production-detail-sort-indicator">
                                                {detailSort.key === column.key
                                                    ? detailSort.direction === "asc"
                                                        ? "▲"
                                                        : "▼"
                                                    : "↕"}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box className="soybean-storyboard-production-detail-table-body">
                                    {sortedDetailRows.map((row) => (
                                        <Box
                                            key={`${row.id}-${row.name}`}
                                            className="soybean-storyboard-production-detail-table-row"
                                            sx={{ gridTemplateColumns: tableGridTemplateColumns }}
                                        >
                                            {detailColumns.map((column) =>
                                                column.key === "area" ? (
                                                    <Box
                                                        key={column.key}
                                                        className="soybean-storyboard-production-table-value"
                                                    >
                                                        <Box
                                                            className="soybean-storyboard-production-table-swatch"
                                                            sx={getTableSwatchStyle(row.area)}
                                                        />
                                                        <Typography>{column.value(row)}</Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography key={column.key}>{column.value(row)}</Typography>
                                                )
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    ) : null}
                    {secondarySidebarContent}
                </Box>
            </Box>
        </Box>
    );
}
