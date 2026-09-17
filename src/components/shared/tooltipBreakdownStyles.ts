import { CSSProperties } from "react";

const BREAKDOWN_TEXT_COLOR = "#00000099";

export const tooltipSectionHeaderStyle: CSSProperties = {
    backgroundColor: "rgba(47, 113, 100, 0.1)",
    color: "#2F7164",
    fontWeight: "bold",
    textAlign: "center",
    padding: "6px 8px",
    borderRadius: "3px"
};

export const tooltipTableHeaderStyle: CSSProperties = {
    backgroundColor: "rgba(47, 113, 100, 0.08)",
    color: "#2F7164",
    fontWeight: "bold",
    textAlign: "center",
    padding: "6px 4px",
    border: "1px solid rgba(47, 113, 100, 0.2)",
    fontSize: "0.8em"
};

export const tooltipRowHeaderStyle: CSSProperties = {
    backgroundColor: "rgba(47, 113, 100, 0.12)",
    fontWeight: "bold",
    textAlign: "left",
    padding: "5px 8px",
    border: "1px solid rgba(47, 113, 100, 0.2)",
    color: "#2F7164",
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
