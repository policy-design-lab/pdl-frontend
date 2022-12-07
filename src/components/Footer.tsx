import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CardMedia, Grid } from '@mui/material';
import ncsa from '../images/logos/ncsa logo.png';
import aces from '../images/logos/aces logo.png';
import isee from '../images/logos/isee logo.png';
import igpa from '../images/logos/igpa logo.png';

function ISEELogo() {
    return (
        <div>
            <CardMedia component="img" image={isee} sx={{ maxWidth: '300px', mb: 3 }} />
        </div>
    );
}

function ACESLogo() {
    return (
        <div>
            <CardMedia component="img" image={aces} sx={{ maxWidth: '300px', mb: 3 }} />
        </div>
    );
}

function IGPALogo() {
    return (
        <div>
            <CardMedia component="img" image={igpa} sx={{ maxWidth: '300px', mb: 3 }} />
        </div>
    );
}

function NCSALogo() {
    return (
        <div>
            <CardMedia component="img" image={ncsa} sx={{ maxWidth: '300px', mb: 3 }} />
        </div>
    );
}

export default function Footer(): JSX.Element {
    return (
        <Box
            component="footer"
            sx={{
                mt: 12,
                pt: 3,
                backgroundColor: '#ECF0EE'
            }}
        >
            <Grid container>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ mx: 2, color: '#242424' }}>
                                Farm Bill
                            </Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Farm Bill</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Farm Bill</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Farm Bill</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ mx: 2, color: '#242424' }}>
                                Data Resources
                            </Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Data Resources</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Data Resources</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Data Resources</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>Data Resources</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ mx: 2, color: '#242424' }}>
                                About Us
                            </Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>About Us</Typography>
                            <Typography sx={{ mx: 2, color: '#242424' }}>About Us</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                            <ACESLogo />
                            <ISEELogo />
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                            <NCSALogo />
                            <IGPALogo />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Grid sx={{ display: 'flex', p: 1, bgcolor: '#2F7164' }}>
                <Box sx={{ flexGrow: 1, ml: 10 }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        COPYRIGHT © 2022 UNIVERSITY OF ILLINOIS. ALL RIGHTS RESERVED
                    </Typography>
                </Box>
                <Box sx={{ mr: 3 }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        PRIVACY STATEMENT & TERMS OF USE
                    </Typography>
                </Box>
                <Box sx={{ mr: 3 }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        IMAGE ATTRIBUTION
                    </Typography>
                </Box>
            </Grid>
        </Box>
    );
}
