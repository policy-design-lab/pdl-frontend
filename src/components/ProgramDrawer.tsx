import React from "react";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { Popper, Radio, Typography } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { makeStyles } from "@mui/styles";

/** ALL MENUs */
const drawerWidth = 240;
const commonMenuStyles = {
    topMenu: {
        marginRight: 8
    },
    topMenuItem: {
        paddingLeft: "1.5em",
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    },
    statue_common: {
        maxWidth: 40,
        paddingTop: "1.5em",
        paddingBottom: "1.5em",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        maxHeight: 48
    }
};

// xxx_top are styles that should be added to top level menu items only
const useStyles = makeStyles(() => ({
    // background classes for menuItem
    bk_on: {
        ...commonMenuStyles.topMenuItem,
        backgroundColor: "#ECF0EE"
    },
    bk_off: {
        ...commonMenuStyles.topMenuItem,
        backgroundColor: "transparent"
    },
    // text classes for the top box inside the menuItem and listIemText(submenu)
    regular: {
        "& .MuiTypography-root": {
            ...commonMenuStyles.topMenu,
            color: "#3F3F3F"
        }
    },
    regular_top: {
        paddingTop: 24,
        paddingBottom: 24
    },
    selected: {
        "& .MuiTypography-root": {
            ...commonMenuStyles.topMenu,
            color: "#2f7164",
            fontWeight: 700
        }
    },
    disabled: {
        "& .MuiTypography-root": {
            ...commonMenuStyles.topMenu,
            color: "#00000061",
            cursor: "not-allowed"
        }
    },
    disabled_top: {
        paddingTop: 24,
        paddingBottom: 24
    },
    // statue classes for box wrapping the text and icon
    no_statue: {
        paddingTop: "1.5em",
        paddingBottom: "1.5em"
    },
    statue_on: {
        ...commonMenuStyles.statue_common,
        color: "#ffffff",
        backgroundColor: "#2f7164"
    },
    statue_off: {
        ...commonMenuStyles.statue_common,
        color: "transparent",
        backgroundColor: "transparent"
    },
    // statue class for text inside the box
    statue_text: {
        color: "white",
        fontSize: "0.875em"
    }
}));

/** EQIP */
EQIPCheckboxList.propTypes = {
    setEQIPChecked: PropTypes.func,
    setShowPopUp: PropTypes.func
};

ProgramDrawer.propTypes = {
    setEQIPChecked: PropTypes.func
};

let currentChecked = 0;
const menuHeight = window.innerHeight < 900 ? "38%" : "40%";

function EQIPCheckboxList({ setEQIPChecked, setShowPopUp, zeroCategory }) {
    const [checked, setChecked] = React.useState(currentChecked);

    const handleToggle = (value: number) => () => {
        setChecked(value);
        setEQIPChecked(value);
        currentChecked = value;
        setShowPopUp(false);
    };

    const EQIPList = [
        "Total EQIP Benefits",
        "Land management",
        "Forest management",
        "Structural",
        "Soil remediation",
        "Vegetative",
        "Other improvement",
        "Soil testing",
        "Other planning",
        "Conservation planning assessment",
        "Resource-conserving crop rotation",
        "Soil health",
        "Comprehensive Nutrient Mgt."
    ];

    const classes = useStyles();
    return (
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
            {EQIPList.map((category, value) => {
                const labelId = `checkbox-list-label-${value}`;
                if (zeroCategory && zeroCategory.includes(category)) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    disabled
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={`No payment reported for ${category}`}
                                    className={classes.disabled}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (
                    category !== "Land management" &&
                    category !== "Other planning" &&
                    category !== "Total EQIP Benefits"
                ) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "Total EQIP Benefits") {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "Land management") {
                    return (
                        <Box key={category}>
                            <Typography sx={{ pl: 8 }}>
                                <strong>(6)(A) Improvements</strong>
                            </Typography>
                            <ListItem key={category} disablePadding>
                                <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                    <Radio
                                        edge="start"
                                        checked={checked === value}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ "aria-labelledby": labelId }}
                                        sx={{
                                            "&.Mui-checked": {
                                                color: "#2f7164"
                                            }
                                        }}
                                    />
                                    <ListItemText
                                        id={labelId}
                                        primary={category}
                                        className={checked === value ? classes.selected : classes.regular}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </Box>
                    );
                }
                return (
                    <Box key={category}>
                        <Typography sx={{ pl: 8 }}>
                            <strong>(6)(B) Planning</strong>
                        </Typography>
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                );
            })}
        </List>
    );
}

function CSPCheckboxList({ setCSPChecked, setShowPopUp, zeroCategory }) {
    const [checked, setChecked] = React.useState(currentChecked);

    const handleToggle = (value: number) => () => {
        setChecked(value);
        setCSPChecked(value);
        currentChecked = value;
        setShowPopUp(false);
    };

    // Match PR89 suggestions
    const CSPList = [
        "Total CSP Benefits",
        "2018 Practices",
        "Structural",
        "Vegetative",
        "Land management",
        "Forest management",
        "Soil remediation",
        "Existing activity payments",
        "Bundles",
        "Soil testing",
        "Other improvement",

        "2014 Eligible Land",
        "Cropland",
        "Grassland",
        "Rangeland",
        "Pastureland",
        "Non-industrial private forestland",
        "Other: supplemental, adjustment & other"
    ];
    const classes = useStyles();
    return (
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
            {CSPList.map((category, value) => {
                const labelId = `checkbox-list-label-${value}`;
                if (zeroCategory && zeroCategory.includes(category)) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} dense sx={{ pl: 8, cursor: "pointer" }}>
                                <Radio
                                    edge="start"
                                    disabled
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={`No payment reported for ${category}`}
                                    className={classes.disabled}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (
                    category !== "2018 Practices" &&
                    category !== "2014 Eligible Land" &&
                    category !== "Total CSP Benefits"
                ) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "Total CSP Benefits") {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "2018 Practices" || category === "2014 Eligible Land") {
                    return (
                        <Box key={category}>
                            <ListItem key={category} disablePadding>
                                <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 4 }}>
                                    <Radio
                                        edge="start"
                                        checked={checked === value}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ "aria-labelledby": labelId }}
                                        sx={{
                                            "&.Mui-checked": {
                                                color: "#2f7164"
                                            }
                                        }}
                                    />
                                    <ListItemText
                                        id={labelId}
                                        primary={category}
                                        primaryTypographyProps={{ fontWeight: 700 }}
                                        className={checked === value ? classes.selected : classes.regular}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </Box>
                    );
                }
                return (
                    <Box key={category}>
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                );
            })}
        </List>
    );
}

function CRPCheckboxList({ setCRPChecked, setShowPopUp, zeroCategory }) {
    const [checked, setChecked] = React.useState(currentChecked);

    const handleToggle = (value: number) => () => {
        setChecked(value);
        setCRPChecked(value);
        currentChecked = value;
        setShowPopUp(false);
    };

    const CRPList = [
        "Total CRP",
        "Total General Sign-up",
        "Total Continuous Sign-Up",
        "CREP Only",
        "Continuous Non-CREP",
        "Farmable Wetland",
        "Grassland"
    ];
    const classes = useStyles();
    return (
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
            {CRPList.map((category, value) => {
                const labelId = `checkbox-list-label-${value}`;
                if (zeroCategory && zeroCategory.includes(category)) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} dense sx={{ pl: 8, cursor: "pointer" }}>
                                <Radio
                                    edge="start"
                                    disabled
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={`No payment reported for ${category}`}
                                    className={classes.disabled}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category !== "CREP Only" && category !== "Continuous Non-CREP" && category !== "Farmable Wetland") {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 4 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                return (
                    <Box key={category}>
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <Radio
                                    edge="start"
                                    checked={checked === value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#2f7164"
                                        }
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={category}
                                    className={checked === value ? classes.selected : classes.regular}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                );
            })}
        </List>
    );
}

interface ProgramDrawerProps {
    setEQIPChecked?: (value: number) => void;
    setCSPChecked?: (value: number) => void;
    setCRPChecked?: (value: number) => void;
    setRCPPChecked?: (value: number) => void;
    zeroCategories?: string[];
}

export default function ProgramDrawer({
    setEQIPChecked,
    setCSPChecked,
    setCRPChecked,
    setRCPPChecked,
    zeroCategories // different page will pass different zeroCategories
}: ProgramDrawerProps): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const [zeroCategory, setZeroCategory] = React.useState(zeroCategories);
    // Total Menu
    const [totalOpen, setTotalOpen] = React.useState(false);
    const totalRef = React.useRef<HTMLLIElement>(null);
    const handleTotalClick = () => {
        if (location.pathname !== "/title2") {
            navigate("/title2");
            window.location.reload(false);
        } else {
            setTotalOpen((prevTotalOpen) => !prevTotalOpen);
        }
    };
    const prevTotalOpen = React.useRef(totalOpen);
    React.useEffect(() => {
        if (prevTotalOpen.current && !totalOpen) {
            totalRef.current.focus();
        }

        prevTotalOpen.current = totalOpen;
    }, [totalOpen]);
    // EQIP Menu
    const [eqipOpen, setEqipOpen] = React.useState(false);
    const eqipRef = React.useRef<HTMLLIElement>(null);
    const handleEqipClick = () => {
        if (location.pathname !== "/eqip") {
            navigate("/eqip");
            window.location.reload(false);
        } else {
            setEqipOpen((prevEqipOpen) => !prevEqipOpen);
        }
    };
    const prevEqipOpen = React.useRef(eqipOpen);
    React.useEffect(() => {
        if (prevEqipOpen.current && !eqipOpen) {
            eqipRef.current.focus();
        }

        prevEqipOpen.current = eqipOpen;
    }, [eqipOpen]);
    // CSP
    const [cspOpen, setCspOpen] = React.useState(false);
    const cspRef = React.useRef<HTMLLIElement>(null);
    const handleCspClick = () => {
        if (location.pathname !== "/csp") {
            navigate("/csp");
            window.location.reload(false);
        } else {
            setCspOpen((prevCspOpen) => !prevCspOpen);
        }
    };
    const prevCspOpen = React.useRef(cspOpen);
    React.useEffect(() => {
        if (prevCspOpen.current && !cspOpen) {
            cspRef.current.focus();
        }

        prevCspOpen.current = cspOpen;
    }, [cspOpen]);
    const [crpOpen, setCrpOpen] = React.useState(false);
    const crpRef = React.useRef<HTMLLIElement>(null);
    const handleCrpClick = () => {
        if (location.pathname !== "/crp") {
            navigate("/crp");
            window.location.reload(false);
        } else {
            setCrpOpen((prevCrpOpen) => !prevCrpOpen);
        }
    };
    const prevCrpOpen = React.useRef(crpOpen);
    React.useEffect(() => {
        if (prevCrpOpen.current && !crpOpen) {
            crpRef.current.focus();
        }

        prevCrpOpen.current = crpOpen;
    }, [crpOpen]);
    const [rcppOpen, setRcppOpen] = React.useState(false);
    const rcppRef = React.useRef<HTMLLIElement>(null);
    const handleRcppClick = () => {
        if (location.pathname !== "/rcpp") {
            navigate("/rcpp");
            window.location.reload(false);
        }
    };
    const prevRcppOpen = React.useRef(rcppOpen);
    React.useEffect(() => {
        if (prevRcppOpen.current && !rcppOpen) {
            rcppRef.current.focus();
        }

        prevRcppOpen.current = rcppOpen;
    }, [rcppOpen]);

    // ACEP Menu
    const [acepOpen, setAcepOpen] = React.useState(false);
    const acepRef = React.useRef<HTMLLIElement>(null);
    const handleAcepClick = () => {
        if (location.pathname !== "/acep") {
            navigate("/acep");
            window.location.reload(false);
        } else {
            setAcepOpen((prevAcepOpen) => !prevAcepOpen);
        }
    };
    const prevAcepOpen = React.useRef(acepOpen);
    React.useEffect(() => {
        if (prevAcepOpen.current && !acepOpen) {
            acepRef.current.focus();
        }

        prevAcepOpen.current = acepOpen;
    }, [acepOpen]);

    return (
        <Drawer
            variant="permanent"
            sx={{
                "display": { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, pt: 9 }
            }}
            PaperProps={{
                sx: {
                    backgroundColor: "#ffffff"
                }
            }}
            open
        >
            <Box id="filler" sx={{ minHeight: 100 }} />
            <Box>
                <MenuItem
                    ref={totalRef}
                    style={{ whiteSpace: "normal" }}
                    className={location.pathname === "/title2" ? classes.bk_on : classes.bk_off}
                    onClick={handleTotalClick}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/title2"
                                ? `${classes.selected} ${classes.selected_top}  ${classes.no_statue}`
                                : `${classes.regular} ${classes.regular_top}  ${classes.no_statue}`
                        }
                    >
                        <Typography>Total Conservation Program Benefits</Typography>
                    </Box>
                </MenuItem>
            </Box>
            <Box>
                <MenuItem
                    ref={eqipRef}
                    style={{ whiteSpace: "normal" }}
                    onClick={handleEqipClick}
                    className={location.pathname === "/eqip" ? classes.bk_on : classes.bk_off}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/eqip"
                                ? `${classes.selected} ${classes.selected_top}`
                                : `${classes.regular} ${classes.regular_top}`
                        }
                    >
                        <Typography>EQIP: Environmental Quality Incentives Program</Typography>
                        {location.pathname === "/eqip" ? (
                            <Box className={classes.statue_on}>
                                <Box sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                    <Box
                                        sx={{ display: "flex", flexDirection: "horizontal" }}
                                        className={classes.statue_text}
                                    >
                                        <strong>STATUTE</strong>
                                        {eqipOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box className={classes.statue_off} />
                        )}
                    </Box>
                </MenuItem>
                <Popper
                    open={eqipOpen}
                    anchorEl={eqipRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ height: "50%", overflowY: "auto", maxWidth: "20%" }}
                >
                    <Box>
                        <EQIPCheckboxList
                            setEQIPChecked={setEQIPChecked}
                            setShowPopUp={setEqipOpen}
                            zeroCategory={zeroCategory}
                        />
                    </Box>
                </Popper>
            </Box>
            <Box>
                <MenuItem
                    ref={cspRef}
                    style={{ whiteSpace: "normal" }}
                    className={location.pathname === "/csp" ? classes.bk_on : classes.bk_off}
                    onClick={handleCspClick}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/csp"
                                ? `${classes.selected} ${classes.selected_top}`
                                : `${classes.regular} ${classes.regular_top}`
                        }
                    >
                        <Typography>CSP: Conservation Stewardship Program</Typography>
                        {location.pathname === "/csp" ? (
                            <Box className={classes.statue_on}>
                                <Box sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                    <Box
                                        sx={{ display: "flex", flexDirection: "horizontal" }}
                                        className={classes.statue_text}
                                    >
                                        <strong>STATUTE</strong>
                                        {cspOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box className={classes.statue_off} />
                        )}
                    </Box>
                </MenuItem>
                <Popper
                    open={cspOpen}
                    anchorEl={cspRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ maxHeight: menuHeight, overflowY: "auto", maxWidth: "20%" }}
                >
                    <Box>
                        <CSPCheckboxList
                            setCSPChecked={setCSPChecked}
                            setShowPopUp={setCspOpen}
                            zeroCategory={zeroCategory}
                        />
                    </Box>
                </Popper>
            </Box>
            <Box>
                <MenuItem
                    ref={crpRef}
                    style={{ whiteSpace: "normal" }}
                    className={location.pathname === "/crp" ? classes.bk_on : classes.bk_off}
                    onClick={handleCrpClick}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/crp"
                                ? `${classes.selected} ${classes.selected_top}`
                                : `${classes.regular} ${classes.regular_top}`
                        }
                    >
                        <Typography>CRP: Conservation Reserve Program</Typography>
                        {location.pathname === "/crp" ? (
                            <Box className={classes.statue_on}>
                                <Box sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                    <Box
                                        sx={{ display: "flex", flexDirection: "horizontal" }}
                                        className={classes.statue_text}
                                    >
                                        <strong>STATUTE</strong>
                                        {crpOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box className={classes.statue_off} />
                        )}
                    </Box>
                </MenuItem>
                <Popper
                    open={crpOpen}
                    anchorEl={crpRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ maxHeight: menuHeight, overflowY: "auto", maxWidth: "20%" }}
                >
                    <Box>
                        <CRPCheckboxList
                            setCRPChecked={setCRPChecked}
                            setShowPopUp={setCrpOpen}
                            zeroCategory={zeroCategory}
                        />
                    </Box>
                </Popper>
            </Box>
            <Box>
                <MenuItem
                    ref={acepRef}
                    style={{ whiteSpace: "normal" }}
                    className={location.pathname === "/acep" ? classes.bk_on : classes.bk_off}
                    onClick={handleAcepClick}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/acep"
                                ? `${classes.selected} ${classes.selected_top}  ${classes.no_statue}`
                                : `${classes.regular} ${classes.regular_top}  ${classes.no_statue}`
                        }
                    >
                        <Typography>ACEP: Agriculture Conservation Easement Program</Typography>
                    </Box>
                </MenuItem>
            </Box>
            <Box>
                <MenuItem
                    ref={rcppRef}
                    style={{ whiteSpace: "normal" }}
                    className={location.pathname === "/rcpp" ? classes.bk_on : classes.bk_off}
                    onClick={handleRcppClick}
                >
                    <Box
                        sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}
                        className={
                            location.pathname === "/rcpp"
                                ? `${classes.selected} ${classes.selected_top}  ${classes.no_statue}`
                                : `${classes.regular} ${classes.regular_top}  ${classes.no_statue}`
                        }
                    >
                        <Typography>RCPP: Regional Conservation Partnership Program</Typography>
                    </Box>
                </MenuItem>
            </Box>
            <MenuItem
                className={`${classes.bk_off} ${classes.disabled_top} ${classes.disabled} ${classes.no_statue}`}
                style={{ whiteSpace: "normal" }}
            >
                <Typography>Other Conservation</Typography>
            </MenuItem>
        </Drawer>
    );
}
