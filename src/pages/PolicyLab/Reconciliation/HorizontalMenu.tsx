import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import { MenuItem as MenuItemType } from "./Menu";

const buttonBaseStyle = {
    transition: "all 0.2s ease-in-out",
    borderColor: "#2F7164",
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
    const navigate = useNavigate();
    const [topLevel, midLevel] = selectedItem.split("-").map(Number);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMainButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleDropdownClose = () => {
        setAnchorEl(null);
    };
    const handleDropdownSelect = (subIndex: number) => {
        if (subIndex === 0) {
            navigate("/policy-lab/2025-reconciliation-farm-bill");
            onMenuSelect("0-0");
        } else if (subIndex === 1) {
            navigate("/policy-lab/2025-reconciliation-farm-bill/title-i/arc-plc-payments");
            onMenuSelect(`0-${subIndex}`);
        }
        setAnchorEl(null);
    };
    const getSecondLevelTitle = (level: number): string => {
        if (level === 0) return "Overview";
        if (level === 1) return "ARC-PLC Payments";
        return "";
    };
    const getMenuItemTitle = (index: number, itemTitle: string): string => {
        if (index === 0) return "Overview";
        if (index === 1) return "Title I";
        return itemTitle;
    };

    const getMainButtonTitle = (): string => {
        if (!Number.isNaN(topLevel) && topLevel === 0 && !Number.isNaN(midLevel)) {
            if (midLevel === 0) return "Titles";
            if (midLevel === 1) return "Title I";
        }
        return "Titles";
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
                            "color": "#2F7164",
                            "backgroundColor": "transparent",
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": 600,
                            "mr": 1,
                            "display": "flex",
                            "alignItems": "center"
                        }}
                        onClick={handleMainButtonClick}
                        endIcon={<ArrowDropDownIcon sx={{ color: "#2F7164", ml: 0.5, fontSize: 28 }} />}
                    >
                        {getMainButtonTitle()}
                    </Button>
                    {selectedItem && topLevel === 0 && midLevel >= 0 && (
                        <>
                            <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    backgroundColor: "#2F7164",
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
                                        color: "#2F7164"
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
