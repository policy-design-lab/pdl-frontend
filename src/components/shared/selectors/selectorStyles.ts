import { SxProps, Theme } from "@mui/material";

export const PDL_GREEN = "rgba(47, 113, 100, 1)";
export const PDL_GREEN_BORDER = "rgba(47, 113, 100, 0.5)";
export const PDL_GREEN_ACTIVE_BG = "rgba(47, 113, 100, 0.1)";
export const PDL_GREEN_HOVER_BG = "rgba(47, 113, 100, 0.05)";
export const SELECTOR_HEIGHT = "44px";
export const CHIP_CONTAINER_HEIGHT = "36px";
export const menuItemStyle: SxProps<Theme> = {
    fontSize: "0.875rem",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
};

export const selectStyle: SxProps<Theme> = {
    "height": SELECTOR_HEIGHT,
    "fontSize": "0.875rem",
    "fontFamily": "'Roboto', 'Helvetica', 'Arial', sans-serif",
    "color": PDL_GREEN,
    "border": `1px solid ${PDL_GREEN_BORDER}`,
    "backgroundColor": "white",
    ".MuiOutlinedInput-notchedOutline": {
        border: "none"
    },
    "&:hover": {
        backgroundColor: PDL_GREEN_HOVER_BG
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "none"
    },
    "& .MuiSelect-select": {
        display: "flex",
        alignItems: "flex-start",
        padding: "0 32px 0 14px",
        height: "100% !important",
        overflow: "hidden"
    },
    "&.Mui-focused": {
        color: PDL_GREEN
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none",
        boxShadow: "none"
    },
    "transition": "all 0.2s ease-in-out",
    "transform": "translateZ(0)",
    "willChange": "transform"
};

export const chipContainerStyle: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    minHeight: CHIP_CONTAINER_HEIGHT,
    height: CHIP_CONTAINER_HEIGHT,
    maxHeight: "36px",
    overflow: "hidden",
    alignItems: "center",
    width: "100%",
    transition: "all 0.2s ease-in-out",
    transform: "translateZ(0)",
    position: "relative"
};

export const autoHeightChipContainerStyle: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    minHeight: CHIP_CONTAINER_HEIGHT,
    overflow: "visible",
    alignItems: "center",
    width: "100%",
    py: 0.5,
    position: "relative"
};

export const autoHeightSelectStyle: SxProps<Theme> = {
    ...(selectStyle as Record<string, unknown>),
    "height": "auto",
    "minHeight": SELECTOR_HEIGHT,
    "& .MuiSelect-select": {
        display: "flex",
        alignItems: "center",
        padding: "4px 32px 4px 14px",
        height: "auto !important",
        minHeight: `calc(${SELECTOR_HEIGHT} - 8px)`,
        overflow: "visible"
    }
};

export const chipStyle: SxProps<Theme> = {
    borderRadius: 1,
    borderColor: "lightgray",
    color: PDL_GREEN,
    transition: "all 0.2s ease-in-out",
    height: "24px",
    transform: "translateZ(0)"
};

export const formLabelStyle: SxProps<Theme> = {
    "fontWeight": "bold",
    "fontSize": "1rem",
    "color": PDL_GREEN,
    "mb": 1,
    "display": "flex",
    "alignItems": "center",
    "&.Mui-focused": {
        color: PDL_GREEN
    },
    "&&": {
        color: PDL_GREEN
    }
};

export const formLabelStyleBasic: SxProps<Theme> = {
    fontWeight: "bold",
    fontSize: "1rem",
    color: PDL_GREEN,
    mb: 1,
    display: "flex",
    alignItems: "center"
};

export const formControlFocusStyle: SxProps<Theme> = {
    "& .MuiFormLabel-root.Mui-focused": {
        color: PDL_GREEN
    },
    "& .MuiInputBase-root.Mui-focused": {
        color: PDL_GREEN
    },
    "& .MuiOutlinedInput-root": {
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        transform: "translateZ(0)"
    }
};

export const toggleButtonSx = (selected: boolean): SxProps<Theme> => ({
    "color": selected ? PDL_GREEN : "rgba(47, 113, 100, 0.8)",
    "backgroundColor": selected ? PDL_GREEN_ACTIVE_BG : "transparent",
    "fontWeight": selected ? "bold" : "normal",
    "border": `1px solid ${PDL_GREEN_BORDER}`,
    "height": SELECTOR_HEIGHT,
    "&:hover": {
        backgroundColor: PDL_GREEN_HOVER_BG
    }
});

export const activeSelectHighlight = {
    fontWeight: "bold",
    backgroundColor: PDL_GREEN_ACTIVE_BG
} as const;
