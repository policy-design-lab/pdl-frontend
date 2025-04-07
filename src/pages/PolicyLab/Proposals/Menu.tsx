import { ListItemButton, Box, ListItemText, Collapse, List } from "@mui/material";
import React, { useState } from "react";

export interface MenuItem {
    title: string;
    items?: MenuItem[];
}

export const houseProjectionMenu: MenuItem[] = [
    {
        title: "2024 Proposals",
        items: [
            {
                title: "House Ag Committee",
                items: [
                    {
                        title: "EQIP Projection"
                    },
                    {
                        title: "ARC-PLC Payments"
                    }
                ]
            }
        ]
    }
];

export function MenuItem({
    item,
    index,
    selectedItem,
    onMenuSelect,
    level
}: {
    item: MenuItem;
    index: string;
    selectedItem: string;
    onMenuSelect: (i: string) => void;
    level: number;
}): JSX.Element {
    const isParentLevel = level < 2;
    const [isOpen, setIsOpen] = useState(isParentLevel);
    const isExactlySelected = selectedItem === index && !isParentLevel;
    const handleClick = () => {
        if (!isParentLevel) {
            onMenuSelect(index);
        }
    };
    const getTextColor = () => {
        if (isParentLevel) return "#666666";
        if (isExactlySelected) return "#2F7164";
        return "#272727";
    };
    const getBackgroundColor = () => {
        return "#ECF0EE";
    };
    const getHoverBackgroundColor = () => {
        if (isParentLevel) return "inherit";
        if (isExactlySelected) return "#ECF0EE";
        return "rgba(0, 0, 0, 0.04)";
    };
    const showBorder = level > 0;
    return (
        <>
            <ListItemButton
                onClick={handleClick}
                disabled={isParentLevel}
                sx={{
                    "my": 0,
                    "py": 2,
                    "pl": level * 3,
                    "color": getTextColor(),
                    "backgroundColor": getBackgroundColor(),
                    "borderBottom": "1px solid #ccd7d1",
                    "&:hover": {
                        backgroundColor: getHoverBackgroundColor()
                    },
                    "&.Mui-disabled": {
                        opacity: 1,
                        color: "#666666"
                    },
                    "cursor": isParentLevel ? "default" : "pointer"
                }}
            >
                <ListItemText
                    primary={
                        <Box
                            sx={{
                                mx: 3,
                                fontFamily: '"Roboto", sans-serif',
                                fontWeight: 600,
                                borderLeft: showBorder
                                    ? `4px solid ${isExactlySelected ? "#2F7164" : "#ccd7d1"}`
                                    : "none",
                                paddingLeft: showBorder ? 2 : 0,
                                color: "inherit"
                            }}
                        >
                            {item.title}
                        </Box>
                    }
                />
            </ListItemButton>
            {item.items && item.items.length > 0 && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.items.map((subItem, subIndex) => (
                            subItem && (
                                <MenuItem
                                    key={subItem.title || `sub-item-${subIndex}`}
                                    item={subItem}
                                    index={`${index}-${subIndex}`}
                                    selectedItem={selectedItem}
                                    onMenuSelect={onMenuSelect}
                                    level={level + 1}
                                />
                            )
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}
