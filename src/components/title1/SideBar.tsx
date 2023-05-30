import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
/**
 * Ideally derive any program style menu automatically from the data.
 * @param param0 Data is an array of objects with the following properties:
 * - name: string
 *
 * @returns
 */
export default function SideBar({
  drawerWidth,
  defaultItem,
  menuData,
  mainTitle,
}): JSX.Element {
  return (
    <Drawer
      className="sideBar"
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#ffffff",
          color: "gray",
        },
      }}
      open
    >
      <Box id="filler" />
      <ListItem
        style={{ whiteSpace: "normal" }}
        sx={{ px: 5, py: 3, color: "#272727" }}
      >
        <Typography>{mainTitle}</Typography>
      </ListItem>
      {Object.keys(menuData).length > 0 ? (
        Object.keys(menuData).map((program, index) => (
          <List>
            <ListItem disablePadding key={program}>
              <ListItemButton
                style={{ whiteSpace: "normal" }}
                sx={{
                  px: 5,
                  py: 3,
                  backgroundColor: defaultItem.includes(program)
                    ? "#ECF0EE"
                    : "grey",
                  // borderLeft: defaultItem.includes(program)
                  //   ? "0.5em solid #2F7164"
                  //   : "transparent",
                }}
              >
                <ListItemText
                  primary={program}
                  sx={{
                    color: defaultItem.includes(program)
                      ? "#2F7164"
                      : "#272727",
                  }}
                />
              </ListItemButton>
            </ListItem>

            {menuData[program].length !== 0
              ? menuData[program].map((subprogram, index) => (
                  <ListItem disablePadding key={subprogram}>
                    <ListItemButton
                      style={{ whiteSpace: "normal" }}
                      sx={{
                        pl: 10,
                        pr: 5,
                        py: 3,
                        backgroundColor: defaultItem.includes(program)
                          ? "#ECF0EE"
                          : "grey",
                      }}
                    >
                      <ListItemText
                        primary={subprogram}
                        sx={{
                          pl: 1,
                          color: defaultItem.includes(program)
                            ? "#2F7164"
                            : "#272727",
                          borderLeft: defaultItem.includes(program)
                            ? "0.5em solid #2F7164"
                            : "transparent",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              : null}
          </List>
        ))
      ) : (
        <ListItem>loading menu..</ListItem>
      )}
    </Drawer>
  );
}

const sideBarElement = () => {};
