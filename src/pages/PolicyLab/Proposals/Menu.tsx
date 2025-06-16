import { ListItemButton, Box, ListItemText, Collapse, List } from "@mui/material";
import React, { useState } from "react";

export interface MenuItem {
    title: string;
    items?: MenuItem[];
}

export const houseProjectionMenu: MenuItem[] = [
    {
        title: "2024 Proposals",
        items: []
    },
    {
        title: "Select Proposals",
        items: [
            {
                title: "EQIP Projection"
            },
            {
                title: "ARC-PLC Payments"
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
    const isTop2024Proposals = level === 0 && item.title === "2024 Proposals";
    const isHouseAgCommittee = level === 0 && item.title === "House Ag Committee";

    const [isOpen, setIsOpen] = useState(true);

    const isSelected = selectedItem === index;
    const hasSelectedChild = selectedItem.startsWith(`${index}-`);

    const handleClick = () => {
        if (isHouseAgCommittee) {
            setIsOpen(!isOpen);
        } else if (!isTop2024Proposals) {
            onMenuSelect(index);
        }
    };

    const getTextColor = () => {
        if (isSelected || hasSelectedChild) return "#2F7164";
        return "#666666";
    };

    const getBackgroundColor = () => {
        if (level > 0) return "#F5F7F6";
        return "#ECF0EE";
    };

    const getHoverBackgroundColor = () => {
        if (isTop2024Proposals) return "inherit";
        if (level > 0) return "rgba(0, 0, 0, 0.08)";
        return "rgba(0, 0, 0, 0.04)";
    };

    const showBorder = level > 0;

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                disabled={isTop2024Proposals}
                sx={{
                    "my": 0,
                    "py": level === 0 ? 2 : 1.5,
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
                    "cursor": isTop2024Proposals ? "default" : "pointer"
                }}
            >
                <ListItemText
                    primary={
                        <Box
                            sx={{
                                mx: 3,
                                fontFamily: '"Roboto", sans-serif',
                                fontWeight: level === 0 ? 600 : 500,
                                fontSize: level === 0 ? "inherit" : "0.95em",
                                borderLeft: showBorder
                                    ? `4px solid ${isSelected || hasSelectedChild ? "#2F7164" : "#ccd7d1"}`
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
                        {item.items.map(
                            (subItem, subIndex) =>
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
                        )}
                    </List>
                </Collapse>
            )}
        </>
    );
}
