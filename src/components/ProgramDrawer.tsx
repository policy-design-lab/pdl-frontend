import React from 'react';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { Popper, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';

const drawerWidth = 240;

EQIPCheckboxList.propTypes = {
    setEQIPChecked: PropTypes.func,
    setShowPopUp: PropTypes.func
};

ProgramDrawer.propTypes = {
    setEQIPChecked: PropTypes.func
};

let currentChecked = -1;
function EQIPCheckboxList({ setEQIPChecked, setShowPopUp }) {
    const [checked, setChecked] = React.useState(currentChecked);

    const handleToggle = (value: number) => () => {
        setChecked(value);
        setEQIPChecked(value);
        currentChecked = value;
        setShowPopUp(false);
    };

    const EQIPList = [
        'Total EQIP Benefits',
        'Land management',
        'Forest management',
        'Structural',
        'Soil remediation',
        'Vegetative',
        'Other improvement',
        'Soil testing',
        'Other planning',
        'Conservation planning assessment',
        'Resource-conserving crop rotation',
        'Soil health',
        'Comprehensive Nutrient Mgt.'
    ];

    return (
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {EQIPList.map((category, value) => {
                const labelId = `checkbox-list-label-${value}`;
                if (
                    category !== 'Land management' &&
                    category !== 'Other planning' &&
                    category !== 'Total EQIP Benefits'
                ) {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked === value}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={category} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === 'Total EQIP Benefits') {
                    return (
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked === value}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={category} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                if (category === 'Land management') {
                    return (
                        <Box>
                            <Typography sx={{ pl: 8 }}>
                                <strong>(6)(A) Practices</strong>
                            </Typography>
                            <ListItem key={category} disablePadding>
                                <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked === value}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={category} />
                                </ListItemButton>
                            </ListItem>
                        </Box>
                    );
                }
                return (
                    <Box key={category}>
                        <Typography sx={{ pl: 8 }}>
                            <strong>(6)(B) Practices</strong>
                        </Typography>
                        <ListItem key={category} disablePadding>
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked === value}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={category} />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                );
            })}
        </List>
    );
}

export default function ProgramDrawer({ setEQIPChecked }): JSX.Element {
    const [eqipOpen, setEqipOpen] = React.useState(false);
    const eqipRef = React.useRef<HTMLLIElement>(null);
    const handleEqipClick = () => {
        setEqipOpen((prevEqipOpen) => !prevEqipOpen);
    };
    const prevEqipOpen = React.useRef(eqipOpen);
    React.useEffect(() => {
        if (prevEqipOpen.current === true && eqipOpen === false) {
            eqipRef.current.focus();
        }

        prevEqipOpen.current = eqipOpen;
    }, [eqipOpen]);

    return (
        <Drawer
            variant="permanent"
            sx={{
                'display': { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
            }}
            open
        >
            <Box sx={{ height: 100 }} />
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                Total Conservation Programs Benefits
            </MenuItem>
            <Box>
                <MenuItem ref={eqipRef} style={{ whiteSpace: 'normal' }} sx={{ my: 1 }} onClick={handleEqipClick}>
                    EQIP: Environmental Quality Incentives Program
                </MenuItem>
                <Popper open={eqipOpen} anchorEl={eqipRef.current} role={undefined} placement="right-start">
                    <Box>
                        <EQIPCheckboxList setEQIPChecked={setEQIPChecked} setShowPopUp={setEqipOpen} />
                    </Box>
                </Popper>
            </Box>
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                CSP: Conservation Stewardship Program
            </MenuItem>
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                CRP: Conservation Reserve Program
            </MenuItem>
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                ACEP: Argriculture Conservation Easement Program
            </MenuItem>
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                RCPP: Regional Conservation Partnership Program
            </MenuItem>
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                Other Conservation
            </MenuItem>
        </Drawer>
    );
}
