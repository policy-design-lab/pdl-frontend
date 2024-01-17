import { makeStyles } from "@mui/styles";

// Shared Tooltip Styles for react-simplemap
export const tooltipBkgColor = "#dadada";
const regularTextColor = "#00000099";
const commonMenuStyles = {
    tooltip_cell: {
        margin: 0
    }
};

/**
 * New Styles that follow the same style as the bubble chart in Crop Insurance
 * Note the font-size has an increment of 0.2em
 */
export const useStyles = makeStyles(() => ({
    customized_tooltip: {
        backgroundColor: `${tooltipBkgColor} !important`,
        padding: "0 !important",
        margin: "0 !important",
        opacity: "1 !important"
    },
    tooltip_overall: {
        backgroundColor: "white",
        width: "100%",
        height: "100%"
    },
    tooltip_header: {
        padding: "0.5em 1em 0.5em 1em",
        textAlign: "left",
        fontSize: "1.1em",
        color: "black",
        margin: 0
    },
    tooltip_table: {
        backgroundColor: `${tooltipBkgColor} !important`,
        width: "100%",
        fontSize: "1em",
        color: `${regularTextColor}`,
        padding: 0,
        margin: 0,
        borderCollapse: "collapse"
    },
    tooltip_topcell_left: {
        ...commonMenuStyles.tooltip_cell,
        padding: "1em"
    },
    tooltip_topcell_right: {
        ...commonMenuStyles.tooltip_cell,
        textAlign: "right",
        padding: "1em",
        borderRight: "none"
    },
    tooltip_bottomcell_left: {
        ...commonMenuStyles.tooltip_cell,
        padding: "0 1em 1em 1em"
    },
    tooltip_bottomcell_right: {
        ...commonMenuStyles.tooltip_cell,
        textAlign: "right",
        padding: "0 1em 1em 1em",
        borderLeft: "none"
    },
    tooltip_regularcell_left: {
        ...commonMenuStyles.tooltip_cell,
        padding: "0 1em 1em 1em"
    },
    tooltip_regularcell_right: {
        ...commonMenuStyles.tooltip_cell,
        textAlign: "right",
        padding: "0 1em 1em 1em",
        borderLeft: "none"
    },
    tooltip_footer_left: {
        ...commonMenuStyles.tooltip_cell,
        textAlign: "left",
        padding: "1em",
        borderTop: `0.1em solid ${regularTextColor}`,
        color: "black",
        borderRight: "none",
        fontWeight: "bold"
    },
    tooltip_footer_right: {
        ...commonMenuStyles.tooltip_cell,
        textAlign: "right",
        padding: "1em",
        borderTop: `0.1em solid ${regularTextColor}`,
        color: "black",
        borderLeft: "none",
        fontWeight: "bold"
    }
}));
export const topTipStyle = {
    fontWeight: "bold",
    color: "#000000DE"
};
