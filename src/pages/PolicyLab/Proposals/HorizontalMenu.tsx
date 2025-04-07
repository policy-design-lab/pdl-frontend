import React, { useState, useEffect } from "react";
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
    const selectedParts = selectedItem.split("-").map((part) => parseInt(part));

    const [visibleLevels, setVisibleLevels] = useState<{
        topLevel: MenuItemType[] | null;
        midLevel: MenuItemType[] | null;
        leafLevel: MenuItemType[] | null;
    }>({
        topLevel: menu,
        midLevel: null,
        leafLevel: null
    });

    useEffect(() => {
        updateVisibleMenus();
    }, [selectedItem, menu]);

    const updateVisibleMenus = () => {
        const topLevel = menu;

        const midLevel =
            selectedParts.length > 0 && selectedParts[0] >= 0 && topLevel && topLevel[selectedParts[0]]?.items
                ? topLevel[selectedParts[0]].items
                : null;

        const leafLevel =
            selectedParts.length > 1 && selectedParts[1] >= 0 && midLevel && midLevel[selectedParts[1]]?.items
                ? midLevel[selectedParts[1]].items
                : null;

        setVisibleLevels({
            topLevel,
            midLevel,
            leafLevel
        });
    };

    const handleTopLevelClick = (index: number) => {
        const hasChildren = menu[index]?.items && menu[index].items.length > 0;

        if (hasChildren) {
            setVisibleLevels({
                topLevel: menu,
                midLevel: menu[index].items,
                leafLevel: null
            });
        } else {
            onMenuSelect(`${index}`);
        }
    };

    const handleMidLevelClick = (topIndex: number, midIndex: number) => {
        const hasChildren = menu[topIndex]?.items?.[midIndex]?.items && menu[topIndex].items[midIndex].items.length > 0;

        if (hasChildren) {
            setVisibleLevels({
                topLevel: menu,
                midLevel: menu[topIndex].items,
                leafLevel: menu[topIndex].items[midIndex].items
            });
        } else {
            onMenuSelect(`${topIndex}-${midIndex}`);
        }
    };

    const handleLeafLevelClick = (topIndex: number, midIndex: number, leafIndex: number) => {
        onMenuSelect(`${topIndex}-${midIndex}-${leafIndex}`);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
            {visibleLevels.topLevel &&
                visibleLevels.topLevel.map((item, topIndex) => {
                    const isActive = selectedParts[0] === topIndex;
                    return (
                        <React.Fragment key={`top-${topIndex}`}>
                            <Button
                                variant={isActive ? "contained" : "outlined"}
                                sx={{
                                    "color": isActive ? "white" : "#2F7164",
                                    "backgroundColor": isActive ? "#2F7164" : "transparent",
                                    "&:hover": {
                                        backgroundColor: isActive ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                                    },
                                    "fontWeight": 600,
                                    "mr": 1,
                                    "borderColor": "#2F7164"
                                }}
                                onClick={() => handleTopLevelClick(topIndex)}
                            >
                                {item.title}
                            </Button>
                            {topIndex === selectedParts[0] && visibleLevels.midLevel && (
                                <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                            )}
                        </React.Fragment>
                    );
                })}
            {visibleLevels.midLevel &&
                visibleLevels.midLevel.map((item, midIndex) => {
                    const isActive = selectedParts[0] === selectedParts[0] && selectedParts[1] === midIndex;
                    return (
                        <React.Fragment key={`mid-${selectedParts[0]}-${midIndex}`}>
                            <Button
                                variant={isActive ? "contained" : "outlined"}
                                size="small"
                                sx={{
                                    "color": isActive ? "white" : "#2F7164",
                                    "backgroundColor": isActive ? "#2F7164" : "transparent",
                                    "&:hover": {
                                        backgroundColor: isActive ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                                    },
                                    "fontWeight": isActive ? 600 : 400,
                                    "mr": 1,
                                    "borderColor": "#2F7164"
                                }}
                                onClick={() => handleMidLevelClick(selectedParts[0], midIndex)}
                            >
                                {item.title}
                            </Button>
                            {midIndex === selectedParts[1] && visibleLevels.leafLevel && (
                                <NavigateNextIcon sx={{ mx: 1, color: "#666" }} />
                            )}
                        </React.Fragment>
                    );
                })}
            {visibleLevels.leafLevel &&
                visibleLevels.leafLevel.map((item, leafIndex) => {
                    const isActive =
                        selectedParts[0] === selectedParts[0] &&
                        selectedParts[1] === selectedParts[1] &&
                        selectedParts[2] === leafIndex;
                    return (
                        <Button
                            key={`leaf-${selectedParts[0]}-${selectedParts[1]}-${leafIndex}`}
                            variant={isActive ? "contained" : "outlined"}
                            size="small"
                            sx={{
                                "ml": 0.5,
                                "color": isActive ? "white" : "#2F7164",
                                "backgroundColor": isActive ? "#2F7164" : "transparent",
                                "borderColor": "#2F7164",
                                "&:hover": {
                                    backgroundColor: isActive ? "#2F7164" : "rgba(47, 113, 100, 0.1)"
                                },
                                "fontWeight": isActive ? 600 : 400,
                                "mr": 1
                            }}
                            onClick={() => handleLeafLevelClick(selectedParts[0], selectedParts[1], leafIndex)}
                        >
                            {item.title}
                        </Button>
                    );
                })}
        </Box>
    );
}
