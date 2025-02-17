import React from "react";
import { List, Box } from "@mui/material";
import styled from "styled-components";
import { MenuItem as MenuItemType, MenuItem } from "./Menu";

const StyledSidebarContainer = styled.div`
    .Mui-disabled {
        pointer-events: auto !important;
        opacity: 1 !important;
    }
`;

export function Sidebar({
    menu,
    selectedItem,
    onMenuSelect
}: {
    menu: MenuItemType[];
    selectedItem: string;
    onMenuSelect: (value: string) => void;
}): JSX.Element {
    return (
        <StyledSidebarContainer>
            <List
                sx={{
                    width: "300px",
                    height: "100%",
                    p: 0
                }}
            >
                {menu.map((item, index) => (
                    <MenuItem
                        key={item.title}
                        item={item}
                        index={index.toString()}
                        selectedItem={selectedItem}
                        onMenuSelect={onMenuSelect}
                        level={0}
                    />
                ))}
            </List>
        </StyledSidebarContainer>
    );
}
