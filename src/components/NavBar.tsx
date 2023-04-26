import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { CardMedia, createTheme, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import PDLLogo from "./PDLLogo";

const drawerWidth = 240;
const navItems = ["HOME", "EXPLORE FARM BILL DATA", "ABOUT PDL"];
const theme = createTheme({
    components: {
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: "#2F7164"
                }
            }
        }
    }
});

export default function NavBar(): JSX.Element {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Policy Design Lab
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }}>
                            <ListItemText primary={item} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <ThemeProvider theme={theme}>
                <AppBar variant="outlined" component="nav" sx={{ position: "relative" }}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: "none" } }}
                        />
                        <Button
                            disableRipple
                            component={Link}
                            to="/"
                            sx={{ flexGrow: 1, display: { xs: "none", sm: "block", color: "#fff" } }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "horizontal" }}>
                                <PDLLogo width="60" height="60" />
                                <Typography variant="h6" component="div" sx={{ pt: 1.6, ml: 1 }}>
                                    Policy Design Lab
                                </Typography>
                            </Box>
                        </Button>
                        <Box sx={{ display: { xs: "none", sm: "block" } }}>
                            {navItems.map((item) => {
                                if (item === "HOME") {
                                    return (
                                        <Button component={Link} to="/" key={item} sx={{ color: "#fff" }}>
                                            {item}
                                        </Button>
                                    );
                                }
                                return (
                                    <Button key={item} sx={{ color: "#fff" }}>
                                        {item}
                                    </Button>
                                );
                            })}
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box component="nav">
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true // Better open performance on mobile.
                        }}
                        sx={{
                            "display": { xs: "block", sm: "none" },
                            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Box>
            </ThemeProvider>
        </Box>
    );
}
