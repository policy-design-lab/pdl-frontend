import React, { useState } from "react";
import { Box, Collapse, Drawer, List, ListItemButton, ListItemText } from "@mui/material";
import styled from "styled-components";
import { menu } from "./SideBarMenuItem";
import { hasChildren } from "./Utils";

const Styles = styled.div`
    .Mui-disabled {
        pointerevents: auto !important;
        opacity: 1 !important;
    }
`;
let currentChecked = "0";

export default function SideBar({ setTitle1Checked }): JSX.Element {
    const [checked, setChecked] = React.useState(currentChecked);
    const [selectedItem, setSelectedItem] = useState("0");
    const handleToggle = (value: string) => () => {
        setChecked(value);
        setTitle1Checked(value);
        currentChecked = value;
        setSelectedItem(value === selectedItem ? "" : value);
        return null;
    };
    const sameCategory = (item, value) => {
        if (value[0] === selectedItem[0]) {
            return true;
        }
        return false;
    };
    const SideBarItem = ({ item, value, childStyle }) => {
        const Component = hasChildren(item) ? MultiLevel : SingleLevel;
        return <Component item={item} value={value} childStyle={childStyle} />;
    };

    const SingleLevel = ({ value, item, childStyle }) => {
        const highlight = sameCategory(item, value);
        return (
            <ListItemButton
                id={item.title}
                onClick={handleToggle(value)}
                sx={{
                    my: 0,
                    py: 3,
                    color: selectedItem === value ? "#2F7164" : "#272727",
                    width: 300,
                    maxHeight: "7em",
                    backgroundColor: selectedItem === value || highlight === true ? "#ECF0EE" : "inherit"
                }}
                selected={selectedItem === item}
                disabled={selectedItem === value}
            >
                {selectedItem === value ? (
                    <ListItemText
                        primary={
                            <Box
                                sx={{
                                    paddingLeft: childStyle === true ? 2 : "auto",
                                    mx: 3,
                                    fontFamily: '"Roboto", sans-serif',
                                    fontWeight: 600,
                                    borderLeft: childStyle === true ? "4px solid #2F7164" : "none"
                                }}
                            >
                                {item.title}
                            </Box>
                        }
                    />
                ) : (
                    <ListItemText
                        primary={
                            <Box
                                sx={{
                                    paddingLeft: childStyle === true ? 2 : "auto",
                                    mx: 3,
                                    fontFamily: '"Roboto", sans-serif',
                                    fontWeight: 400,
                                    borderLeft: childStyle === true ? "4px solid #ccd7d1" : "none"
                                }}
                            >
                                {item.title}
                            </Box>
                        }
                    />
                )}
            </ListItemButton>
        );
    };

    const MultiLevel = ({ value, item }) => {
        const { items: children } = item;
        const [open, setOpen] = useState(false);
        const handleClick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            setOpen((prev) => !prev);
        };
        const highlight = sameCategory(item, value);
        return (
            <Box>
                <ListItemButton
                    id={item.title}
                    onClick={handleToggle(value)}
                    style={{ whiteSpace: "normal" }}
                    sx={{
                        my: 0,
                        py: 3,
                        maxHeight: "7em",
                        color: "#272727",
                        width: 300,
                        backgroundColor: selectedItem === value || highlight === true ? "#ECF0EE" : "inherit"
                    }}
                    disabled={selectedItem === value}
                >
                    <ListItemText
                        primary={
                            <Box
                                sx={{
                                    mx: 3,
                                    color: selectedItem === value ? "#2F7164" : "#272727",
                                    fontWeight: selectedItem === value ? 600 : 400
                                }}
                            >
                                {item.title}
                            </Box>
                        }
                    />
                </ListItemButton>
                <Collapse in timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {children.map((child, k) => (
                            <SideBarItem
                                key={item.title}
                                childStyle
                                item={child}
                                value={value.toString() + k.toString()}
                            />
                        ))}
                    </List>
                </Collapse>
            </Box>
        );
    };

    return (
        <Styles>
            <Drawer
                className="sideBar"
                variant="permanent"
                anchor="left"
                sx={{
                    "display": { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: 300 }
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: "#ffffff",
                        color: "gray"
                    }
                }}
                open
            >
                <Box id="filler" sx={{ minHeight: 180 }} />
                {menu.map((item, key) => (
                    <SideBarItem key={item.title + item} item={item} value={key.toString()} />
                ))}
            </Drawer>
        </Styles>
    );
}
