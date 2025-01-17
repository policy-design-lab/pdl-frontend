import React from "react";
import { List, ListItemButton, ListItemText, Box } from "@mui/material";
import styled from "styled-components";
import { MenuItem } from "./Menu";

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
    menu: MenuItem[];
    selectedItem: string;
    onMenuSelect: (value: string) => void;
}): JSX.Element {
    const handleSelect = (value: string) => {
        onMenuSelect(value);
    };
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
                    <ListItemButton
                        key={item.title}
                        onClick={() => handleSelect(index.toString())}
                        sx={{
                            my: 0,
                            py: 3,
                            color: selectedItem === index.toString() ? "#2F7164" : "#272727",
                            backgroundColor: selectedItem === index.toString() ? "#ECF0EE !important" : "inherit"
                        }}
                        selected={selectedItem === index.toString()}
                        disabled={selectedItem === index.toString()}
                    >
                        <ListItemText
                            primary={
                                <Box
                                    sx={{
                                        mx: 3,
                                        fontFamily: '"Roboto", sans-serif',
                                        fontWeight: selectedItem === index.toString() ? 600 : 400
                                    }}
                                >
                                    {item.title}
                                </Box>
                            }
                        />
                    </ListItemButton>
                ))}
            </List>
        </StyledSidebarContainer>
    );
    //     onMenuSelect(value);
    // };
    // return (
    //     <Styles>
    //         <Drawer
    //             variant="permanent"
    //             anchor="left"
    //             sx={{
    //                 "& .MuiDrawer-paper": {
    //                     boxSizing: "border-box",
    //                     width: 300,
    //                     position: 'static'
    //                 }
    //             }}
    //             PaperProps={{
    //                 sx: {
    //                     backgroundColor: "#ffffff",
    //                     color: "gray"
    //                 }
    //             }}
    //             open
    //         >
    //             <List>
    //                 {menu.map((item, key) => (
    //                     <ListItemButton
    //                         key={item.title}
    //                         onClick={() => handleMenuSelect(key.toString())}
    //                         sx={{
    //                             my: 0,
    //                             py: 3,
    //                             color: selectedItem === key.toString() ? "#2F7164" : "#272727",
    //                             backgroundColor: selectedItem === key.toString() ? "#ECF0EE" : "inherit"
    //                         }}
    //                     >
    //                         <ListItemText
    //                             primary={
    //                                 <Box
    //                                     sx={{
    //                                         mx: 3,
    //                                         fontFamily: '"Roboto", sans-serif',
    //                                         fontWeight: selectedItem === key.toString() ? 600 : 400
    //                                     }}
    //                                 >
    //                                     {item.title}
    //                                 </Box>
    //                             }
    //                         />
    //                     </ListItemButton>
    //                 ))}
    //             </List>
    //         </Drawer>
    //     </Styles>
    // );
}
