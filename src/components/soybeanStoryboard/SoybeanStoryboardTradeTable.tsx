import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { argentinaColor, brazilColor, mainlandChinaColor, unitedStatesColor } from "./constants";
import {
    formatMillionMetricTons,
    formatPercentage,
    getMarketBalanceForCountry,
    SOYBEAN_STORYBOARD_NEED_DATA_LABEL,
    SoybeanMarketBalanceCountry,
    SoybeanMarketBalanceMetric,
    SoybeanYearRecord
} from "./soybeanApi";

type SoybeanStoryboardTradeTableProps = {
    marketBalance: SoybeanYearRecord<SoybeanMarketBalanceCountry[]>;
    marketBalanceYear: string;
};

type TradeTableCountry = {
    code: string;
    color: string;
    label: string;
};

type TradeTableMetric = {
    key: keyof Pick<
        SoybeanMarketBalanceMetric,
        "productionMT" | "exportsMT" | "importsMT" | "consumptionMT" | "importPercentageWorldwide" | "endingStockMT"
    >;
    label: string;
    type: "metricTons" | "percentage";
};

const TRADE_TABLE_COUNTRIES: TradeTableCountry[] = [
    { code: "BR", color: brazilColor, label: "Brazil" },
    { code: "CN", color: mainlandChinaColor, label: "Mainland China" },
    { code: "US", color: unitedStatesColor, label: "United States" },
    { code: "AR", color: argentinaColor, label: "Argentina" }
];

const TRADE_TABLE_METRICS: TradeTableMetric[] = [
    { key: "productionMT", label: "Production", type: "metricTons" },
    { key: "exportsMT", label: "Exports", type: "metricTons" },
    { key: "importsMT", label: "Imports", type: "metricTons" },
    { key: "consumptionMT", label: "Consumption", type: "metricTons" },
    { key: "importPercentageWorldwide", label: "Global Import Share", type: "percentage" },
    { key: "endingStockMT", label: "Ending Stocks", type: "metricTons" }
];

function formatTableValue(balance: SoybeanMarketBalanceMetric | null, metric: TradeTableMetric): string {
    if (!balance) {
        return SOYBEAN_STORYBOARD_NEED_DATA_LABEL;
    }

    const value = balance[metric.key];
    if (metric.type === "percentage") {
        return formatPercentage(value, 1);
    }
    return formatMillionMetricTons(value);
}

export default function SoybeanStoryboardTradeTable({
    marketBalance,
    marketBalanceYear
}: SoybeanStoryboardTradeTableProps): JSX.Element {
    return (
        <Box className="soybean-storyboard-trade-table-shell">
            <Box className="soybean-storyboard-trade-table">
                <Box className="soybean-storyboard-trade-table-header">
                    <Typography className="soybean-storyboard-trade-table-heading">Country</Typography>
                    {TRADE_TABLE_METRICS.map((metric) => (
                        <Typography key={metric.key} className="soybean-storyboard-trade-table-heading">
                            {metric.label}
                        </Typography>
                    ))}
                </Box>
                {TRADE_TABLE_COUNTRIES.map((country) => {
                    const balance = getMarketBalanceForCountry(marketBalance, marketBalanceYear, country.code);
                    return (
                        <Box key={country.code} className="soybean-storyboard-trade-table-row">
                            <Box className="soybean-storyboard-trade-table-country">
                                <Box
                                    className="soybean-storyboard-trade-table-swatch"
                                    sx={{ backgroundColor: country.color }}
                                />
                                <Typography className="soybean-storyboard-trade-table-country-name">
                                    {country.label}
                                </Typography>
                            </Box>
                            {TRADE_TABLE_METRICS.map((metric) => (
                                <Typography
                                    key={`${country.code}-${metric.key}`}
                                    className={
                                        balance
                                            ? "soybean-storyboard-trade-table-value"
                                            : "soybean-storyboard-trade-table-value soybean-storyboard-trade-table-value-muted"
                                    }
                                >
                                    {formatTableValue(balance, metric)}
                                </Typography>
                            ))}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
