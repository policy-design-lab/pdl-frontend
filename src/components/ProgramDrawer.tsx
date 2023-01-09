import React from 'react';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

const drawerWidth = 240;

export default function ProgramDrawer(): JSX.Element {
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
            <MenuItem style={{ whiteSpace: 'normal' }} sx={{ my: 1 }}>
                EQIP: Environmental Quality Incentives Program
            </MenuItem>
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
