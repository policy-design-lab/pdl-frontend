import React from 'react';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { Popper } from '@mui/material';

const drawerWidth = 240;

export default function ProgramDrawer(): JSX.Element {
    const [eqipOpen, setEqipOpen] = React.useState(false);
    const eqipRef = React.useRef<HTMLLIElement>(null);
    const handleEqipClick = () => {
        setEqipOpen((prevEqipOpen) => !prevEqipOpen);
    };
    const prevEqipOpen = React.useRef(eqipOpen);
    React.useEffect(() => {
        if (prevEqipOpen.current === true && eqipOpen === false) {
            eqipRef.current!.focus();
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
                    <Box>test test test</Box>
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
