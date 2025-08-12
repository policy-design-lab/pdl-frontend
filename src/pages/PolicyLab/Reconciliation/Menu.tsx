import { ListItemButton, Box, ListItemText, Collapse, List } from "@mui/material";
import React, { useState } from "react";

export interface MenuItem {
    title: string;
    items?: MenuItem[];
}

export const reconciliationMenu: MenuItem[] = [
    {
        title: "Titles",
        items: [
            {
                title: "Overview"
            },
            {
                title: "TitleI"
            }
        ]
    }
];

export function MenuItem({
    item,
    index,
    level = 0,
    selectedItem,
    onMenuSelect
}: {
    item: MenuItem;
    index: number;
    level?: number;
    selectedItem: string;
    onMenuSelect: (value: string) => void;
}): JSX.Element {
    const [open, setOpen] = useState(false);
    const hasSubItems = item.items && item.items.length > 0;
    const currentIndex = `${level}-${index}`;
    const isSelected = selectedItem === currentIndex;

    const handleClick = () => {
        if (hasSubItems) {
            setOpen(!open);
        } else {
            onMenuSelect(currentIndex);
        }
    };

    const textColor = isSelected || level === 0 ? "#2F7164" : "#666";
    const backgroundColor = isSelected ? "rgba(47, 113, 100, 0.08)" : "transparent";
    const fontSize = level === 0 ? "1.1rem" : "1rem";
    const fontWeight = level === 0 || isSelected ? 600 : 400;

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                sx={{
                    "pl": level * 2 + 2,
                    "py": 1,
                    backgroundColor,
                    "&:hover": {
                        backgroundColor: "rgba(47, 113, 100, 0.04)"
                    },
                    "borderRadius": 1,
                    "mb": 0.5
                }}
            >
                <ListItemText
                    primary={item.title}
                    sx={{
                        "& .MuiListItemText-primary": {
                            color: textColor,
                            fontSize,
                            fontWeight
                        }
                    }}
                />
            </ListItemButton>
            {hasSubItems && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.items?.map((subItem, subIndex) => (
                            <MenuItem
                                key={subItem.title}
                                item={subItem}
                                index={subIndex}
                                level={level + 1}
                                selectedItem={selectedItem}
                                onMenuSelect={onMenuSelect}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}

export function MenuList({
    menu,
    selectedItem,
    onMenuSelect
}: {
    menu: MenuItem[];
    selectedItem: string;
    onMenuSelect: (value: string) => void;
}): JSX.Element {
    return (
        <Box sx={{ width: "100%", minWidth: 250 }}>
            <List component="nav" aria-labelledby="nested-list-subheader">
                {menu.map((item, index) => (
                    <MenuItem
                        key={item.title}
                        item={item}
                        index={index}
                        selectedItem={selectedItem}
                        onMenuSelect={onMenuSelect}
                    />
                ))}
            </List>
        </Box>
    );
}
