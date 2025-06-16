import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
        onMenuSelect(`1-${subIndex}`);
        setAnchorEl(null);
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
                        variant={topLevel === 0 ? "contained" : "outlined"}
                        sx={{
                            ...buttonBaseStyle,
                            "color": topLevel === 0 ? "white" : "#2F7164",
                            "backgroundColor": topLevel === 0 ? "#2F7164" : "transparent",
                            "&:hover": {
                                backgroundColor: topLevel === 0 ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": 600,
                            "mr": 1
                        }}
                        onClick={() => onMenuSelect("0-0")}
                    >
                        {menu[0].title}
                    </Button>
                    <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                </>
            )}
            {menu[1] && (
                <>
                    <Button
                        variant={topLevel === 1 ? "contained" : "outlined"}
                        sx={{
                            ...buttonBaseStyle,
                            "color": topLevel === 1 ? "white" : "#2F7164",
                            "backgroundColor": topLevel === 1 ? "#2F7164" : "transparent",
                            "&:hover": {
                                backgroundColor: topLevel === 1 ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": 600,
                            "mr": 1,
                            "display": "flex",
                            "alignItems": "center"
                        }}
                        onClick={handleDropdownClick}
                        endIcon={
                            <ArrowDropDownIcon
                                sx={{ color: topLevel === 1 ? "white" : "#2F7164", ml: 0.5, fontSize: 28 }}
                            />
                        }
                    >
                        {topLevel === 1 && midLevel >= 0 && menu[1].items && menu[1].items[midLevel]
                            ? menu[1].items[midLevel].title
                            : menu[1].title}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleDropdownClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        {menu[1]?.items &&
                            menu[1].items.map((item, subIndex) => (
                                <MenuItem
                                    key={`submenu-${item.title}`}
                                    selected={topLevel === 1 && midLevel === subIndex}
                                    onClick={() => handleDropdownSelect(subIndex)}
                                    sx={{
                                        fontWeight: topLevel === 1 && midLevel === subIndex ? 600 : 400,
                                        color: "#2F7164"
                                    }}
                                >
                                    {item.title}
                                </MenuItem>
                            ))}
                    </Menu>
                </>
            )}
        </Box>
    );
}
