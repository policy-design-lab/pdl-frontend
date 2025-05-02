import { ListItemButton, Box, ListItemText, Collapse, List } from "@mui/material";
import React, { useState } from "react";

export interface MenuItem {
    title: string;
    items?: MenuItem[];
}

export const houseProjectionMenu: MenuItem[] = [
    {
        title: "House Ag Committee",
        items: []
    },
    {
        title: "2024 Proposals",
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
    const isTopHouseAgCommittee = level === 0 && item.title === "House Ag Committee";
    const is2024Proposals = level === 0 && item.title === "2024 Proposals";

    const [isOpen, setIsOpen] = useState(true);

    const isSelected = selectedItem === index;

    const hasSelectedChild = selectedItem.startsWith(`${index}-`);

    const handleClick = () => {
        if (is2024Proposals) {
            setIsOpen(!isOpen);
        } else if (!isTopHouseAgCommittee) {
            onMenuSelect(index);
        }
    };

    const getTextColor = () => {
        if (isSelected || hasSelectedChild) return "#2F7164";
        return "#666666";
    };

    const getBackgroundColor = () => {
        return "#ECF0EE";
    };

    const getHoverBackgroundColor = () => {
        if (isTopHouseAgCommittee) return "inherit";
        return "rgba(0, 0, 0, 0.04)";
    };

    const showBorder = level > 0;

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                disabled={isTopHouseAgCommittee}
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
                    "cursor": isTopHouseAgCommittee ? "default" : "pointer"
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
