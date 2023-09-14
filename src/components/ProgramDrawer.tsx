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

const drawerWidth = 240;

EQIPCheckboxList.propTypes = {
    setEQIPChecked: PropTypes.func,
    setShowPopUp: PropTypes.func
};

ProgramDrawer.propTypes = {
    setEQIPChecked: PropTypes.func
};

let currentChecked = 0;
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

    return (
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
            {EQIPList.map((category, value) => {
                const labelId = `checkbox-list-label-${value}`;
                if (zeroCategory && zeroCategory.includes(category)) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
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
                                    sx={{ fontStyle: "italic", color: "#7676764D" }}
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
                                <ListItemText id={labelId} primary={category} />
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
                                <ListItemText id={labelId} primary={category} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "Land management") {
                    return (
                        <Box>
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
                                    <ListItemText id={labelId} primary={category} />
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
                                <ListItemText id={labelId} primary={category} />
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
                                    sx={{ fontStyle: "italic", color: "#7676764D" }}
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
                                <ListItemText id={labelId} primary={category} />
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
                                <ListItemText id={labelId} primary={category} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === "2018 Practices" || category === "2014 Eligible Land") {
                    return (
                        <Box>
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
                                <ListItemText id={labelId} primary={category} />
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
                                    sx={{ fontStyle: "italic", color: "#7676764D" }}
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
                                <ListItemText id={labelId} primary={category} />
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
                                <ListItemText id={labelId} primary={category} />
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
    zeroCategories?: string[];
}

export default function ProgramDrawer({
    setEQIPChecked,
    setCSPChecked,
    setCRPChecked,
    zeroCategories
}: ProgramDrawerProps): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const [zeroCategory, setZeroCategory] = React.useState(zeroCategories);
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

    const crpMenuHeight = window.innerHeight < 900 ? "38%" : "40%";

    return (
        <Drawer
            variant="permanent"
            sx={{
                "display": { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, pt: 9 }
            }}
            PaperProps={{
                sx: {
                    backgroundColor: "#ffffff",
                    color: "gray"
                }
            }}
            open
        >
            <Box sx={{ height: 100 }} />
            <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
                <Typography>Total Conservation Programs Benefits</Typography>
            </MenuItem>
            <Box>
                <MenuItem
                    ref={eqipRef}
                    style={{ whiteSpace: "normal" }}
                    sx={{ my: 1, pl: 3, pr: 0, py: 0, backgroundColor: eqipOpen ? "#ecf0ee" : "grey" }}
                    onClick={handleEqipClick}
                >
                    <Box sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}>
                        {location.pathname === "/eqip" ? (
                            <Typography sx={{ color: "#2f7164" }}>
                                <strong>EQIP: Environmental Quality Incentives Program</strong>
                            </Typography>
                        ) : (
                            <Typography>EQIP: Environmental Quality Incentives Program</Typography>
                        )}
                        <Box
                            sx={{
                                maxWidth: 40,
                                py: 3,
                                color: "#ffffff",
                                backgroundColor: "#2f7164",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                maxHeight: 48
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                <Box sx={{ display: "flex", flexDirection: "horizontal" }}>
                                    <strong>STATUTE</strong>
                                    <KeyboardArrowDownIcon />
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </MenuItem>
                <Popper
                    open={eqipOpen}
                    anchorEl={eqipRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ height: "50%", overflowY: "scroll", maxWidth: "20%" }}
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
                    sx={{ my: 1, pl: 3, pr: 0, py: 0, backgroundColor: cspOpen ? "#ecf0ee" : "grey" }}
                    onClick={handleCspClick}
                >
                    <Box sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}>
                        {location.pathname === "/csp" ? (
                            <Typography sx={{ color: "#2f7164" }}>
                                <strong>CSP: Conservation Stewardship Program</strong>
                            </Typography>
                        ) : (
                            <Typography>CSP: Conservation Stewardship Program</Typography>
                        )}
                        <Box
                            sx={{
                                maxWidth: 40,
                                py: 3,
                                color: "#ffffff",
                                backgroundColor: "#2f7164",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                maxHeight: 48
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                <Box sx={{ display: "flex", flexDirection: "horizontal" }}>
                                    <strong>STATUTE</strong>
                                    <KeyboardArrowDownIcon />
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </MenuItem>
                <Popper
                    open={cspOpen}
                    anchorEl={cspRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ height: crpMenuHeight, overflowY: "scroll", maxWidth: "20%" }}
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
                    sx={{ my: 1, pl: 3, pr: 0, py: 0, backgroundColor: crpOpen ? "#ecf0ee" : "grey" }}
                    onClick={handleCrpClick}
                >
                    <Box sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}>
                        {location.pathname === "/crp" ? (
                            <Typography sx={{ color: "#2f7164" }}>
                                <strong>CRP: Conservation Reserve Program</strong>
                            </Typography>
                        ) : (
                            <Typography>CRP: Conservation Reserve Program</Typography>
                        )}
                        <Box
                            sx={{
                                maxWidth: 40,
                                py: 3,
                                color: "#ffffff",
                                backgroundColor: "#2f7164",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                maxHeight: 48
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
                                <Box sx={{ display: "flex", flexDirection: "horizontal" }}>
                                    <strong>STATUTE</strong>
                                    <KeyboardArrowDownIcon />
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </MenuItem>
                <Popper
                    open={crpOpen}
                    anchorEl={crpRef.current}
                    role={undefined}
                    placement="right-start"
                    sx={{ height: "40%", overflowY: "scroll", maxWidth: "20%" }}
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
            <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
                <Typography>ACEP: Agriculture Conservation Easement Program</Typography>
            </MenuItem>
            <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
                <Typography>RCPP: Regional Conservation Partnership Program</Typography>
            </MenuItem>
            <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
                <Typography>Other Conservation</Typography>
            </MenuItem>
        </Drawer>
    );
}
