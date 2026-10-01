import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { MenuItem as MenuItemType } from "./Menu";
import { BRAND_GREEN, BRAND_GREEN_10 } from "../../../components/shared/colors";

const buttonBaseStyle = {
    transition: "all 0.2s ease-in-out",
    borderColor: BRAND_GREEN,
    transform: "translateZ(0)",
    willChange: "transform, background-color, color"
};

export function HorizontalMenu({
    menu,
    selectedItem,
    onMenuSelect
}: {
    menu: MenuItemType[];
    selectedItem: string;
    onMenuSelect: (value: string) => void;
}): JSX.Element {
    const [topLevel, midLevel] = selectedItem.split("-").map(Number);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleDropdownClose = () => {
        setAnchorEl(null);
    };
    const handleDropdownSelect = (subIndex: number) => {
        if (subIndex === 0) {
            onMenuSelect("0-0");
        } else if (subIndex === 1) {
            onMenuSelect("0-1-0");
        } else if (subIndex === 2) {
            onMenuSelect("0-2-0");
        } else {
            onMenuSelect(`0-${subIndex}`);
        }
        setAnchorEl(null);
    };
    const getSecondLevelTitle = (level: number): string => {
        if (level === 0) return "Overview";
        if (level === 1) return "ARC-PLC Payments";
        if (level === 2) return "EQIP Projection";
        return "";
    };
    const getMenuItemTitle = (index: number, itemTitle: string): string => {
        if (index === 0) return "Overview";
        if (index === 1) return "2025";
        if (index === 2) return "2024";
        return itemTitle;
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                transition: "all 0.2s ease-in-out",
                height: "40px",
                transform: "translateZ(0)"
            }}
        >
            {menu[0] && (
                <>
                    <Button
                        variant="outlined"
                        sx={{
                            ...buttonBaseStyle,
                            "color": BRAND_GREEN,
                            "backgroundColor": "transparent",
                            "&:hover": {
                                backgroundColor: BRAND_GREEN_10
                            },
                            "fontWeight": 600,
                            "mr": 1,
                            "display": "flex",
                            "alignItems": "center"
                        }}
                        onClick={handleDropdownClick}
                        endIcon={<ArrowDropDownIcon sx={{ color: BRAND_GREEN, ml: 0.5, fontSize: 28 }} />}
                    >
                        {menu[0].title}
                    </Button>
                    {selectedItem && topLevel === 0 && midLevel >= 0 && (
                        <>
                            <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    backgroundColor: BRAND_GREEN,
                                    color: "white",
                                    borderRadius: 1,
                                    fontWeight: 600,
                                    fontSize: "14px"
                                }}
                            >
                                {getSecondLevelTitle(midLevel)}
                            </Box>
                        </>
                    )}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleDropdownClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        {menu[0]?.items &&
                            menu[0].items.map((item, subIndex) => (
                                <MenuItem
                                    key={`submenu-${item.title}`}
                                    selected={topLevel === 0 && midLevel === subIndex}
                                    onClick={() => handleDropdownSelect(subIndex)}
                                    sx={{
                                        fontWeight: topLevel === 0 && midLevel === subIndex ? 600 : 400,
                                        color: BRAND_GREEN
                                    }}
                                >
                                    {getMenuItemTitle(subIndex, item.title)}
                                </MenuItem>
                            ))}
                    </Menu>
                </>
            )}
        </Box>
    );
}
