import React from "react";
import { Box, Button } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { MenuItem as MenuItemType } from "./Menu";

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

    return (
        <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
            {menu[0] && (
                <>
                    <Button
                        variant={topLevel === 0 ? "contained" : "outlined"}
                        sx={{
                            "color": topLevel === 0 ? "white" : "#2F7164",
                            "backgroundColor": topLevel === 0 ? "#2F7164" : "transparent",
                            "&:hover": {
                                backgroundColor: topLevel === 0 ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": 600,
                            "mr": 1,
                            "borderColor": "#2F7164"
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
                            "color": topLevel === 1 ? "white" : "#2F7164",
                            "backgroundColor": topLevel === 1 ? "#2F7164" : "transparent",
                            "&:hover": {
                                backgroundColor: topLevel === 1 ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": 600,
                            "mr": 1,
                            "borderColor": "#2F7164"
                        }}
                        onClick={() => onMenuSelect("1-0")}
                    >
                        {menu[1].title}
                    </Button>
                    <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                </>
            )}
            {menu[1]?.items &&
                menu[1].items.map((item, subIndex) => (
                    <Button
                        key={`submenu-${subIndex}`}
                        variant={topLevel === 1 && midLevel === subIndex ? "contained" : "outlined"}
                        size="small"
                        sx={{
                            "color": topLevel === 1 && midLevel === subIndex ? "white" : "#2F7164",
                            "backgroundColor": topLevel === 1 && midLevel === subIndex ? "#2F7164" : "transparent",
                            "&:hover": {
                                backgroundColor:
                                    topLevel === 1 && midLevel === subIndex ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                            },
                            "fontWeight": topLevel === 1 && midLevel === subIndex ? 600 : 400,
                            "mr": 1,
                            "borderColor": "#2F7164"
                        }}
                        onClick={() => onMenuSelect(`1-${subIndex}`)}
                    >
                        {item.title}
                    </Button>
                ))}
        </Box>
    );
}
