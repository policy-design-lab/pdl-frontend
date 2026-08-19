import * as React from "react";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import SoybeanStoryboardSecondaryNav from "../components/soybeanStoryboard/SoybeanStoryboardSecondaryNav";
import SoybeanStoryboardProgressNav from "../components/soybeanStoryboard/SoybeanStoryboardProgressNav";
import SoybeanStoryboardIntro from "../components/soybeanStoryboard/SoybeanStoryboardIntro";
import SoybeanStoryboardChinaDemand from "../components/soybeanStoryboard/SoybeanStoryboardChinaDemand";
import SoybeanStoryboardInfluenceDrivers from "../components/soybeanStoryboard/SoybeanStoryboardInfluenceDrivers";
import SoybeanStoryboardCompetitorMap from "../components/soybeanStoryboard/SoybeanStoryboardCompetitorMap";
import SoybeanStoryboardBrazilProduction from "../components/soybeanStoryboard/SoybeanStoryboardBrazilProduction";
import SoybeanStoryboardSoybeanUtilization from "../components/soybeanStoryboard/SoybeanStoryboardSoybeanUtilization";
import SoybeanStoryboardUSOverview from "../components/soybeanStoryboard/SoybeanStoryboardUSOverview";
import SoybeanStoryboardUSProduction from "../components/soybeanStoryboard/SoybeanStoryboardUSProduction";
import SoybeanStoryboardTradeTable from "../components/soybeanStoryboard/SoybeanStoryboardTradeTable";
import SoybeanStoryboardYearSelect from "../components/soybeanStoryboard/SoybeanStoryboardYearSelect";
import SoybeanStoryboardWorldMap from "../components/soybeanStoryboard/SoybeanStoryboardWorldMap";
import {
    globalStoryboardFrames,
    InsightStatement,
    SoybeanStoryboardGlyph,
    STORYBOARD_HEADER_HEIGHT,
    STORYBOARD_SECONDARY_NAV_HEIGHT,
    storyboardIntros,
    storyboardSections
} from "../components/soybeanStoryboard/constants";
import { getLatestYear, getSortedYears, useSoybeanStoryboardData } from "../components/soybeanStoryboard/soybeanApi";
import "../styles/soybeanStoryboard.css";

const defaultTheme = createTheme();
const STORYBOARD_GRID_COLUMNS = 1000;
const STORYBOARD_CONTENT_COLUMNS = 928;
const STORYBOARD_HEADER_HIDE_THRESHOLD = 36;
const STORYBOARD_SCROLL_GUTTER = 24;

function getStoryboardScrollOffset(targetTop: number): number {
    const collapsedOffset = STORYBOARD_SECONDARY_NAV_HEIGHT + STORYBOARD_SCROLL_GUTTER;
    const expandedOffset = STORYBOARD_HEADER_HEIGHT + collapsedOffset;
    return targetTop - collapsedOffset > STORYBOARD_HEADER_HIDE_THRESHOLD ? collapsedOffset : expandedOffset;
}

export default function SoybeanStoryboardPage(): JSX.Element {
    const [activeStoryboardSectionId, setActiveStoryboardSectionId] = React.useState(storyboardSections[0].id);
    const [activeFrameId, setActiveFrameId] = React.useState(globalStoryboardFrames[0].id);
    const [headerHidden, setHeaderHidden] = React.useState(false);
    const [tradeView, setTradeView] = React.useState<"map" | "table">("map");
    const soybeanData = useSoybeanStoryboardData();
    const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const exportsYearSet = React.useMemo(() => new Set(getSortedYears(soybeanData.exports)), [soybeanData.exports]);
    const sharedYears = React.useMemo(
        () => getSortedYears(soybeanData.marketBalance).filter((y) => exportsYearSet.has(y)),
        [soybeanData.marketBalance, exportsYearSet]
    );
    const preferredSharedYear = React.useMemo(() => getLatestYear(soybeanData.exports), [soybeanData.exports]);
    const [tradeYear, setTradeYear] = React.useState(preferredSharedYear);
    const marketBalanceYear = sharedYears.includes(tradeYear) ? tradeYear : preferredSharedYear;
    const exportsYear = marketBalanceYear;

    React.useEffect(() => {
        if (sharedYears.length > 0 && !sharedYears.includes(tradeYear)) {
            setTradeYear(preferredSharedYear);
        }
    }, [sharedYears, preferredSharedYear, tradeYear]);

    const visibleStoryboardFrames = React.useMemo(
        () => globalStoryboardFrames.filter((frame) => frame.sectionId === activeStoryboardSectionId),
        [activeStoryboardSectionId]
    );

    React.useEffect(() => {
        const handleScroll = () => {
            setHeaderHidden(window.scrollY > STORYBOARD_HEADER_HIDE_THRESHOLD);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);
                if (visibleEntries.length > 0) {
                    setActiveFrameId(visibleEntries[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: "-26% 0px -42% 0px",
                threshold: [0.2, 0.35, 0.5, 0.7]
            }
        );

        visibleStoryboardFrames.forEach((frame) => {
            const element = sectionRefs.current[frame.id];
            if (element) {
                observer.observe(element);
            }
        });
        return () => {
            observer.disconnect();
        };
    }, [visibleStoryboardFrames]);

    React.useEffect(() => {
        const firstVisibleFrame = visibleStoryboardFrames[0];
        if (!firstVisibleFrame) {
            return;
        }

        setActiveFrameId(firstVisibleFrame.id);
        const contentTop = contentRef.current?.getBoundingClientRect().top;
        if (contentTop === undefined) {
            return;
        }

        const targetTop = window.scrollY + contentTop;
        window.scrollTo({
            top: targetTop - getStoryboardScrollOffset(targetTop),
            behavior: "smooth"
        });
    }, [activeStoryboardSectionId]);
    const handleFrameSelect = (frameId: string) => {
        const element = sectionRefs.current[frameId];
        if (!element) {
            return;
        }
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const top = elementTop - getStoryboardScrollOffset(elementTop);

        window.scrollTo({
            top,
            behavior: "smooth"
        });
        setActiveFrameId(frameId);
    };
    const registerSection = (sectionId: string) => (element: HTMLElement | null) => {
        sectionRefs.current[sectionId] = element;
    };
    const handleSectionSelect = (sectionId: string) => {
        if (sectionId !== activeStoryboardSectionId) {
            setActiveStoryboardSectionId(sectionId);
        }
    };
    const handleTradeViewToggle = () => {
        setTradeView((currentTradeView) => (currentTradeView === "map" ? "table" : "map"));
    };
    const activeStoryboardIntro = storyboardIntros[activeStoryboardSectionId];
    const renderSectionLayout = (content: JSX.Element, wide = false) => (
        <Grid
            container
            columns={STORYBOARD_GRID_COLUMNS}
            justifyContent="center"
            className="soybean-storyboard-section-grid"
        >
            <Grid
                item
                xs={wide ? STORYBOARD_GRID_COLUMNS : STORYBOARD_CONTENT_COLUMNS}
                className={
                    wide
                        ? "soybean-storyboard-section-grid-item soybean-storyboard-section-grid-item-wide"
                        : "soybean-storyboard-section-grid-item"
                }
            >
                {content}
            </Grid>
        </Grid>
    );
    return (
        <ThemeProvider theme={defaultTheme}>
            <Box className="soybean-storyboard-page">
                <Box
                    className={
                        headerHidden
                            ? "soybean-storyboard-header soybean-storyboard-header-hidden"
                            : "soybean-storyboard-header"
                    }
                >
                    <NavBar bkColor="rgba(5, 22, 27, 0.94)" ftColor="#FFFFFF" logo="dark" />
                </Box>
                <Box
                    className="soybean-storyboard-secondary-nav-wrap"
                    sx={{
                        top: headerHidden ? 0 : `${STORYBOARD_HEADER_HEIGHT}px`
                    }}
                >
                    <SoybeanStoryboardSecondaryNav
                        sections={storyboardSections}
                        activeSectionId={activeStoryboardSectionId}
                        onSelect={handleSectionSelect}
                    />
                </Box>
                <SoybeanStoryboardProgressNav
                    sections={visibleStoryboardFrames}
                    activeSectionId={activeFrameId}
                    onSelect={handleFrameSelect}
                />
                <Box
                    ref={contentRef}
                    className="soybean-storyboard-content"
                    sx={{
                        pt: `${STORYBOARD_HEADER_HEIGHT + STORYBOARD_SECONDARY_NAV_HEIGHT + 24}px`
                    }}
                >
                    {activeStoryboardIntro ? (
                        <Box component="section" className="soybean-storyboard-intro-band">
                            {renderSectionLayout(
                                <SoybeanStoryboardIntro
                                    title={activeStoryboardIntro.title}
                                    description={activeStoryboardIntro.description}
                                />
                            )}
                        </Box>
                    ) : null}
                    {activeStoryboardSectionId === "global-soybean-landscape" ? (
                        <>
                            <Box
                                id={globalStoryboardFrames[0].id}
                                ref={registerSection(globalStoryboardFrames[0].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-hero-section"
                            >
                                {renderSectionLayout(
                                    <Box>
                                        <Box className="soybean-storyboard-title-block">
                                            <Box className="soybean-storyboard-title-icon">
                                                <SoybeanStoryboardGlyph />
                                            </Box>
                                            <Box component="div" className="soybean-storyboard-title">
                                                {storyboardSections[0].title}
                                            </Box>
                                        </Box>
                                        <Box className="soybean-storyboard-map-shell">
                                            <SoybeanStoryboardWorldMap
                                                variant="overview"
                                                exports={soybeanData.exports}
                                                exportsYear={exportsYear}
                                                marketBalance={soybeanData.marketBalance}
                                                marketBalanceYear={marketBalanceYear}
                                            />
                                            <Box className="soybean-storyboard-insight-card">
                                                <Box component="div" className="soybean-storyboard-insight-text">
                                                    <InsightStatement />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[1].id}
                                ref={registerSection(globalStoryboardFrames[1].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-trade-section"
                            >
                                {renderSectionLayout(
                                    <Box className="soybean-storyboard-trade-shell">
                                        <Box className="soybean-storyboard-trade-title-row">
                                            <Box className="soybean-storyboard-trade-title-block">
                                                <Typography className="soybean-storyboard-subheader soybean-storyboard-trade-title">
                                                    {marketBalanceYear} Soybean Trading Market (MMT)
                                                </Typography>
                                                <SoybeanStoryboardYearSelect
                                                    value={marketBalanceYear}
                                                    years={
                                                        sharedYears.length > 0
                                                            ? [...sharedYears].reverse()
                                                            : [marketBalanceYear]
                                                    }
                                                    onChange={setTradeYear}
                                                    className="soybean-storyboard-trade-year-row"
                                                    selectWrapClassName="soybean-storyboard-trade-year-select-wrap"
                                                />
                                            </Box>
                                            <Tooltip title={tradeView === "map" ? "Show table" : "Show map"}>
                                                <IconButton
                                                    className="soybean-storyboard-trade-title-icon-button"
                                                    aria-label={
                                                        tradeView === "map"
                                                            ? "Show soybean market balance table"
                                                            : "Show soybean trading map"
                                                    }
                                                    onClick={handleTradeViewToggle}
                                                >
                                                    {tradeView === "map" ? (
                                                        <TableChartRoundedIcon />
                                                    ) : (
                                                        <PublicRoundedIcon />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Typography className="soybean-storyboard-trade-note">
                                            * Argentina primarily consumes whole soybeans domestically; exports are
                                            mainly processed products (meal and oil)
                                        </Typography>
                                        {tradeView === "map" ? (
                                            <SoybeanStoryboardWorldMap
                                                variant="trade"
                                                exports={soybeanData.exports}
                                                exportsYear={exportsYear}
                                                marketBalance={soybeanData.marketBalance}
                                                marketBalanceYear={marketBalanceYear}
                                            />
                                        ) : (
                                            <SoybeanStoryboardTradeTable
                                                marketBalance={soybeanData.marketBalance}
                                                marketBalanceYear={marketBalanceYear}
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[2].id}
                                ref={registerSection(globalStoryboardFrames[2].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-demand-section"
                            >
                                {renderSectionLayout(
                                    <SoybeanStoryboardChinaDemand marketBalance={soybeanData.marketBalance} />
                                )}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[3].id}
                                ref={registerSection(globalStoryboardFrames[3].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-influence-section"
                            >
                                {renderSectionLayout(
                                    <SoybeanStoryboardInfluenceDrivers
                                        commodities={soybeanData.commodities}
                                        socioeconomic={soybeanData.socioeconomic}
                                    />
                                )}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[4].id}
                                ref={registerSection(globalStoryboardFrames[4].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-competitor-section"
                            >
                                {renderSectionLayout(<SoybeanStoryboardCompetitorMap exports={soybeanData.exports} />)}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[5].id}
                                ref={registerSection(globalStoryboardFrames[5].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-production-section"
                            >
                                {renderSectionLayout(
                                    <SoybeanStoryboardBrazilProduction
                                        isPlantedAcresLoading={soybeanData.plantedAcresLoading.br}
                                        onRequestHistoricalFrames={(startYear, endYear) =>
                                            soybeanData.loadPlantedAcresRange("br", startYear, endYear)
                                        }
                                        plantedAcres={soybeanData.plantedAcres.br}
                                        plantedAcresSummary={soybeanData.plantedAcresSummary.br}
                                    />
                                )}
                            </Box>
                        </>
                    ) : null}
                    {activeStoryboardSectionId === "us-soy-industry" ? (
                        <>
                            <Box
                                id={globalStoryboardFrames[6].id}
                                ref={registerSection(globalStoryboardFrames[6].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-us-overview-section"
                            >
                                {renderSectionLayout(<SoybeanStoryboardUSOverview />)}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[7].id}
                                ref={registerSection(globalStoryboardFrames[7].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-us-production-section"
                            >
                                {renderSectionLayout(
                                    <SoybeanStoryboardUSProduction
                                        isPlantedAcresLoading={soybeanData.plantedAcresLoading.us}
                                        onRequestHistoricalFrames={(startYear, endYear) =>
                                            soybeanData.loadPlantedAcresRange("us", startYear, endYear)
                                        }
                                        plantedAcres={soybeanData.plantedAcres.us}
                                        plantedAcresSummary={soybeanData.plantedAcresSummary.us}
                                    />
                                )}
                            </Box>
                            <Box
                                id={globalStoryboardFrames[8].id}
                                ref={registerSection(globalStoryboardFrames[8].id)}
                                component="section"
                                className="soybean-storyboard-section soybean-storyboard-utilization-section"
                            >
                                {renderSectionLayout(
                                    <SoybeanStoryboardSoybeanUtilization
                                        exports={soybeanData.exports}
                                        marketBalance={soybeanData.marketBalance}
                                    />
                                )}
                            </Box>
                        </>
                    ) : null}
                    <Footer />
                </Box>
            </Box>
        </ThemeProvider>
    );
}
