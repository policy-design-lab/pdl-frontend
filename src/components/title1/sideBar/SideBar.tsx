import React, { useState } from "react";
import { menu } from "./SideBarMenuItem";
import { hasChildren } from "./Utils";
import {
    Box,
    Collapse,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Typography,
    styled
} from "@mui/material";

let currentChecked = "0";

export default function SideBar({ setTitle1Checked }): JSX.Element {
    const [checked, setChecked] = React.useState(currentChecked);
    const [selectedItem, setSelectedItem] = useState("0"); // State to track selected item
    const handleToggle = (value: string) => () => {
        setChecked(value);
        setTitle1Checked(value);
        currentChecked = value;
        setSelectedItem(value === selectedItem ? "" : value);
    };

    const SideBarItem = ({ key, item, value }) => {
        const Component = hasChildren(item) ? MultiLevel : SingleLevel;
        return <Component item={item} value={value} />;
    };

    const SingleLevel = ({ value, item }) => {
        return (
            <ListItem
                onClick={handleToggle(value)}
                button
                style={{ whiteSpace: "normal" }}
                sx={{
                    px: 5,
                    py: 3,
                    color: "#272727",
                    width: 300,
                    backgroundColor: selectedItem === value ? "#ECF0EE" : "inherit"
                }}
                selected={selectedItem === item}
            >
                <ListItemText primary={item.title} />
            </ListItem>
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

        return (
            <div>
                <ListItem
                    button
                    onClick={handleToggle(value)}
                    className="mainMenu"
                    style={{ whiteSpace: "normal" }}
                    sx={{
                        px: 5,
                        py: 3,
                        color: "#272727",
                        width: 300,
                        backgroundColor: selectedItem === value ? "#ECF0EE" : "inherit"
                    }}
                >
                    <ListItemText primary={item.title} />
                </ListItem>
                <Collapse in={true} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {children.map((child, key) => (
                            <SideBarItem key={key} item={child} value={value.toString() + key.toString()} />
                        ))}
                    </List>
                </Collapse>
            </div>
        );
    };

    return (
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
            <Box id="filler" sx={{minHeight: 180}}/>
            {/* <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
                <Typography>Total Commodities Programs Benefits</Typography>
            </MenuItem> */}
            {menu.map((item, key) => (
                <SideBarItem key={key} item={item} value={key.toString()} />
            ))}
        </Drawer>
    );
}
