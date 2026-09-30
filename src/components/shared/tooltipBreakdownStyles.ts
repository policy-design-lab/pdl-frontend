import { CSSProperties } from "react";
import { BRAND_GREEN, BRAND_GREEN_08, BRAND_GREEN_10, BRAND_GREEN_12 } from "./colors";

const BREAKDOWN_TEXT_COLOR = "#00000099";

export const tooltipSectionHeaderStyle: CSSProperties = {
    backgroundColor: BRAND_GREEN_10,
    color: BRAND_GREEN,
    fontWeight: "bold",
    textAlign: "center",
    padding: "6px 8px",
    borderRadius: "3px"
};

export const tooltipTableHeaderStyle: CSSProperties = {
    backgroundColor: BRAND_GREEN_08,
    color: BRAND_GREEN,
    fontWeight: "bold",
    textAlign: "center",
    padding: "6px 4px",
    border: "1px solid rgba(47, 113, 100, 0.2)",
    fontSize: "0.8em"
};

export const tooltipRowHeaderStyle: CSSProperties = {
    backgroundColor: BRAND_GREEN_12,
    fontWeight: "bold",
    textAlign: "left",
    padding: "5px 8px",
    border: "1px solid rgba(47, 113, 100, 0.2)",
    color: BRAND_GREEN,
    whiteSpace: "nowrap"
};

export const tooltipCellStyle: CSSProperties = {
    textAlign: "right",
    verticalAlign: "middle",
    padding: "4px 8px",
    border: "1px solid rgba(47, 113, 100, 0.15)",
    color: BREAKDOWN_TEXT_COLOR,
    backgroundColor: "white",
    fontSize: "0.85em",
    whiteSpace: "nowrap"
};

export const tooltipBreakdownTableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    color: BREAKDOWN_TEXT_COLOR,
    fontSize: "0.85em"
};

export const tooltipBreakdownContainerStyle: CSSProperties = {
    backgroundColor: "white",
    color: BREAKDOWN_TEXT_COLOR,
    padding: "0 8px 8px 8px"
};
