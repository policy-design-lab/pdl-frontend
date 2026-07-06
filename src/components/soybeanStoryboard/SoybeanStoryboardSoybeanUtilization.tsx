import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import utilizationTopFlow7 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-7.svg";
import utilizationTopFlow8 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-8.svg";
import utilizationTopFlow9 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-9.svg";
import utilizationTopFlow10 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-10.svg";
import utilizationTopFlow11 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-11.svg";
import utilizationTopFlow12 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-12.svg";
import utilizationTopFlow13 from "../../images/soybean/soybean_utilization/Portugal_Angola_2-13.svg";
import utilizationChinaFlow from "../../images/soybean/soybean_utilization/Portugal_Angola_2-15.svg";
import utilizationOtherCountryFlow from "../../images/soybean/soybean_utilization/Portugal_Angola_2-18.svg";
import utilizationOtherCountry2Flow from "../../images/soybean/soybean_utilization/Portugal_Angola_2-19.svg";
import utilizationRestOfWorldFlow from "../../images/soybean/soybean_utilization/Portugal_Angola_2-20.svg";
import utilizationTotalBlock from "../../images/soybean/soybean_utilization/Rectangle 2561.svg";
import utilizationDomesticBlock from "../../images/soybean/soybean_utilization/Subtract.svg";
import utilizationExportBlock from "../../images/soybean/soybean_utilization/Rectangle 2563.svg";
import utilizationEndingStockConnector from "../../images/soybean/soybean_utilization/Union.svg";
import {
    convertMetricTonsToUnit,
    formatRatioAsPercentage,
    formatSoybeanQuantity,
    getExportsForCountry,
    getMarketBalanceForCountry,
    getPreferredYear,
    getSortedYears,
    getSoybeanBalanceValue,
    getSoybeanTotalSupplyValue,
    isFiniteNumber,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SOYBEAN_STORYBOARD_PREFERRED_YEAR,
    SoybeanExportsRecord,
    SoybeanMarketBalanceCountry,
    SoybeanQuantityUnit,
    SoybeanYearRecord
} from "./soybeanApi";
import SoybeanStoryboardUnitSelect from "./SoybeanStoryboardUnitSelect";
import SoybeanStoryboardYearSelect from "./SoybeanStoryboardYearSelect";
const UTILIZATION_CANVAS_WIDTH = 1558;
const UTILIZATION_CANVAS_HEIGHT = 1648;
const TOP_FLOW_ASSETS = [
    utilizationTopFlow7,
    utilizationTopFlow8,
    utilizationTopFlow9,
    utilizationTopFlow10,
    utilizationTopFlow11,
    utilizationTopFlow12,
    utilizationTopFlow13
];
const TOP_FLOW_RIGHT_X = [937, 913, 889, 865, 841, 817, 793];
const TOP_FLOW_LEFT_X = [78, 102, 126, 150, 174, 198, 222];
const MARKET_LABEL_X_POSITIONS = [782, 995, 1165, 1354];
const STATIC_LAYERS = [
    { src: utilizationTotalBlock, x: 608, y: 349, width: 347, height: 359 },
    { src: utilizationDomesticBlock, x: 541, y: 709, width: 279, height: 329 },
    { src: utilizationExportBlock, x: 824, y: 709, width: 122, height: 326 },
    { src: utilizationChinaFlow, x: 687, y: 1037, width: 191, height: 464 },
    { src: utilizationOtherCountryFlow, x: 880, y: 1037, width: 159, height: 464 },
    { src: utilizationOtherCountry2Flow, x: 912, y: 1037, width: 280, height: 460 },
    { src: utilizationRestOfWorldFlow, x: 933, y: 1037, width: 429, height: 460 },
    { src: utilizationEndingStockConnector, x: 947, y: 709, width: 218, height: 50 }
];

type SoybeanStoryboardSoybeanUtilizationProps = {
    exports: SoybeanYearRecord<SoybeanExportsRecord[]>;
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
};

function toPercent(value: number, total: number): string {
    return `${(value / total) * 100}%`;
}

function createLayerStyle(
    x: number,
    y: number,
    width: number,
    height: number,
    transform?: string
): React.CSSProperties {
    return {
        position: "absolute",
        left: toPercent(x, UTILIZATION_CANVAS_WIDTH),
        top: toPercent(y, UTILIZATION_CANVAS_HEIGHT),
        width: toPercent(width, UTILIZATION_CANVAS_WIDTH),
        height: toPercent(height, UTILIZATION_CANVAS_HEIGHT),
        transform
    };
}

function InlineSvgLayer({
    asset,
    x,
    y,
    width,
    height,
    transform
}: {
    asset: string;
    x: number;
    y: number;
    width: number;
    height: number;
    transform?: string;
}): JSX.Element {
    return (
        <Box
            aria-hidden="true"
            className="soybean-storyboard-utilization-layer"
            style={createLayerStyle(x, y, width, height, transform)}
            dangerouslySetInnerHTML={{ __html: asset }}
        />
    );
}

function createTextStyle(
    x: number,
    y: number,
    options?: {
        width?: number;
        align?: "left" | "center" | "right";
        transform?: string;
    }
): React.CSSProperties {
    return {
        position: "absolute",
        left: toPercent(x, UTILIZATION_CANVAS_WIDTH),
        top: toPercent(y, UTILIZATION_CANVAS_HEIGHT),
        width: options?.width ? toPercent(options.width, UTILIZATION_CANVAS_WIDTH) : undefined,
        textAlign: options?.align ?? "center",
        transform: options?.transform ?? "translate(-50%, -50%)"
    };
}

function formatShareMeta(value: number | null | undefined, total: number | null | undefined): string {
    const percentage = formatRatioAsPercentage(value, total);
    return percentage === SOYBEAN_STORYBOARD_NEED_DATA_LABEL
        ? `(${SOYBEAN_STORYBOARD_NEED_DATA_LABEL})`
        : `(${percentage})`;
}

export default function SoybeanStoryboardSoybeanUtilization({
    exports,
    marketBalance
}: SoybeanStoryboardSoybeanUtilizationProps): JSX.Element {
    const [unit, setUnit] = React.useState<SoybeanQuantityUnit>("mmt");
    const [year, setYear] = React.useState(SOYBEAN_STORYBOARD_PREFERRED_YEAR);
    const exportsYears = React.useMemo(() => new Set(getSortedYears(exports)), [exports]);
    const availableYears = React.useMemo(
        () => getSortedYears(marketBalance).filter((y) => exportsYears.has(y)),
        [marketBalance, exportsYears]
    );
    const preferredYear = React.useMemo(() => getPreferredYear(exports), [exports]);
    const activeYear = availableYears.includes(year) ? year : preferredYear;
    const yearOptions = availableYears.length > 0 ? [...availableYears].reverse() : [activeYear];
    const usBalance = React.useMemo(
        () => getMarketBalanceForCountry(marketBalance, activeYear, "US"),
        [activeYear, marketBalance]
    );
    const totalValue = getSoybeanTotalSupplyValue(usBalance, unit);
    const domesticUseValue = getSoybeanBalanceValue(usBalance, "consumption", unit);
    const exportValue = getSoybeanBalanceValue(usBalance, "exports", unit);
    const endingStockValue = getSoybeanBalanceValue(usBalance, "endingStock", unit);
    const usExports = React.useMemo(() => getExportsForCountry(exports, activeYear, "US"), [exports, activeYear]);
    const marketLabelPositions = React.useMemo(() => {
        const topDest1 = usExports?.top_destinations?.[1];
        const topDest2 = usExports?.top_destinations?.[2];
        return [
            { x: MARKET_LABEL_X_POSITIONS[0], label: "Mainland China", exportValue: usExports?.china ?? null },
            {
                x: MARKET_LABEL_X_POSITIONS[1],
                label: topDest1?.country ?? SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
                exportValue: topDest1?.amount ?? null
            },
            {
                x: MARKET_LABEL_X_POSITIONS[2],
                label: topDest2?.country ?? SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
                exportValue: topDest2?.amount ?? null
            },
            { x: MARKET_LABEL_X_POSITIONS[3], label: "Rest Of World", exportValue: usExports?.rest_of_world ?? null }
        ];
    }, [usExports]);

    React.useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(year)) {
            setYear(preferredYear);
        }
    }, [availableYears, preferredYear, year]);
    return (
        <Box className="soybean-storyboard-utilization-shell">
            <Box className="soybean-storyboard-utilization-stage">
                <Box className="soybean-storyboard-utilization-header-overlay">
                    <Typography className="soybean-storyboard-subheader soybean-storyboard-utilization-title">
                        Soybean Utilization
                    </Typography>
                    <Typography className="soybean-storyboard-utilization-description">
                        Lorem ipsum dolor sit amet consectetur. Ultrices consectetur ipsum mauris porta libero sed sit
                        diam. Eu ultrices cursus urna sodales.
                    </Typography>
                    <Box className="soybean-storyboard-utilization-controls">
                        <SoybeanStoryboardUnitSelect
                            value={unit}
                            onChange={setUnit}
                            className="soybean-storyboard-utilization-control"
                        />
                        <SoybeanStoryboardYearSelect
                            value={activeYear}
                            years={yearOptions}
                            onChange={setYear}
                            className="soybean-storyboard-utilization-control"
                        />
                    </Box>
                </Box>
                <Box className="soybean-storyboard-utilization-chart-wrap">
                    <Box
                        className="soybean-storyboard-utilization-canvas"
                        role="img"
                        aria-label="Soybean utilization flow diagram"
                    >
                        {TOP_FLOW_ASSETS.map((asset, index) => (
                            <InlineSvgLayer
                                key={`top-right-${index}`}
                                asset={asset}
                                x={TOP_FLOW_RIGHT_X[index]}
                                y={22}
                                width={545}
                                height={328}
                            />
                        ))}
                        {TOP_FLOW_ASSETS.map((asset, index) => (
                            <InlineSvgLayer
                                key={`top-left-${index}`}
                                asset={asset}
                                x={TOP_FLOW_LEFT_X[index]}
                                y={22}
                                width={545}
                                height={328}
                                transform="scaleX(-1)"
                            />
                        ))}
                        {STATIC_LAYERS.map((layer) => (
                            <InlineSvgLayer
                                key={`${layer.src}-${layer.x}-${layer.y}`}
                                asset={layer.src}
                                x={layer.x}
                                y={layer.y}
                                width={layer.width}
                                height={layer.height}
                            />
                        ))}

                        <Typography
                            className="soybean-storyboard-utilization-box-label"
                            style={createTextStyle(779, 505)}
                        >
                            Total Supply
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-value"
                            style={createTextStyle(779, 549)}
                        >
                            {formatSoybeanQuantity(totalValue, unit)}
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-label"
                            style={createTextStyle(638, 943)}
                        >
                            Domestic Use
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-value-small"
                            style={createTextStyle(638, 977)}
                        >
                            {formatSoybeanQuantity(domesticUseValue, unit, false)}
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-meta"
                            style={createTextStyle(638, 1000)}
                        >
                            {formatShareMeta(domesticUseValue, totalValue)}
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-label"
                            style={createTextStyle(886, 902)}
                        >
                            Export
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-value-small"
                            style={createTextStyle(886, 935)}
                        >
                            {formatSoybeanQuantity(exportValue, unit, false)}
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-box-meta"
                            style={createTextStyle(886, 958)}
                        >
                            {formatShareMeta(exportValue, totalValue)}
                        </Typography>

                        <Typography
                            className="soybean-storyboard-utilization-side-label"
                            style={createTextStyle(1178, 752, {
                                width: 260,
                                align: "left",
                                transform: "translateY(-50%)"
                            })}
                        >
                            Ending STOCK
                        </Typography>
                        <Typography
                            className="soybean-storyboard-utilization-side-meta"
                            style={createTextStyle(1178, 773, {
                                width: 260,
                                align: "left",
                                transform: "translateY(-50%)"
                            })}
                        >
                            {formatSoybeanQuantity(endingStockValue, unit, false)}{" "}
                            {formatShareMeta(endingStockValue, totalValue)}
                        </Typography>

                        {marketLabelPositions.map((market) => {
                            const marketValue = convertMetricTonsToUnit(market.exportValue, unit);
                            const exportQuantity = formatSoybeanQuantity(marketValue, unit);
                            const exportShare =
                                isFiniteNumber(marketValue) && isFiniteNumber(totalValue)
                                    ? formatShareMeta(marketValue, totalValue)
                                    : SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
                            return (
                                <React.Fragment key={market.label + market.x}>
                                    <Typography
                                        className="soybean-storyboard-utilization-bottom-label"
                                        style={createTextStyle(market.x, 1528)}
                                    >
                                        {market.label}
                                    </Typography>
                                    <Typography
                                        className="soybean-storyboard-utilization-bottom-meta"
                                        style={createTextStyle(market.x, 1556)}
                                    >
                                        {exportQuantity}
                                    </Typography>
                                    <Typography
                                        className="soybean-storyboard-utilization-bottom-meta"
                                        style={createTextStyle(market.x, 1576)}
                                    >
                                        {exportShare}
                                    </Typography>
                                </React.Fragment>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
