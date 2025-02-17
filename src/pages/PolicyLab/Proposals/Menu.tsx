import { ListItemButton, ListItemText, Collapse, List } from "@mui/material";
import React, { useState } from "react";
import { Box } from "react-bootstrap-icons";

export interface MenuItem {
    title: string;
    items?: MenuItem[];
}

// Menu items. Extend this one in the future if adding more items.
export const houseProjectionMenu: MenuItem[] = [
    {
        title: "2024 Proposals"
    }
    // {
    //    title: "House Ag Committee"
    // },
    // {
    //   title: "EQIP Projection"
    // }
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
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (item.items) {
            setIsOpen(!isOpen);
        }
        onMenuSelect(index);
    };

    const isSelected = selectedItem.startsWith(index);

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                sx={{
                    my: 0,
                    py: 3,
                    pl: level * 3,
                    color: isSelected ? "#2F7164" : "#272727",
                    backgroundColor: isSelected ? "#ECF0EE" : "inherit"
                }}
            >
                <ListItemText
                    primary={
                        <Box
                            sx={{
                                mx: 3,
                                fontFamily: '"Roboto", sans-serif',
                                fontWeight: isSelected ? 600 : 400,
                                borderLeft: level > 0 ? `4px solid ${isSelected ? "#2F7164" : "#ccd7d1"}` : "none",
                                paddingLeft: level > 0 ? 2 : 0
                            }}
                        >
                            {item.title}
                        </Box>
                    }
                />
            </ListItemButton>
            {item.items && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.items.map((subItem, subIndex) => (
                            <MenuItem
                                key={subItem.title}
                                item={subItem}
                                index={`${index}-${subIndex}`}
                                selectedItem={selectedItem}
                                onMenuSelect={onMenuSelect}
                                level={level + 1}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}
