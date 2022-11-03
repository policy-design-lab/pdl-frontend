import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CardMedia, Grid } from '@mui/material';
import uiuc from '../images/uiuc.png';
import ncsa from '../images/ncsa.png';

function UIUCLogo() {
    return (
        <div>
            <CardMedia component="img" image={uiuc} sx={{ width: 'auto', height: 'auto', m: 3 }} />
        </div>
    );
}

function NCSALogo() {
    return (
        <div>
            <CardMedia component="img" image={ncsa} sx={{ width: 'auto', height: 'auto', m: 3 }} />
        </div>
    );
}

export default function Footer(): JSX.Element {
    return (
        <Box>
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]
                }}
            >
                <Grid container>
                    <Grid item xs={8}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}
                        >
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                                <Typography variant="h5" sx={{ mx: 2 }}>
                                    Farm Bill
                                </Typography>
                                <Typography sx={{ mx: 2 }}>Farm Bill</Typography>
                                <Typography sx={{ mx: 2 }}>Farm Bill</Typography>
                                <Typography sx={{ mx: 2 }}>Farm Bill</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                                <Typography variant="h5" sx={{ mx: 2 }}>
                                    Data Resources
                                </Typography>
                                <Typography sx={{ mx: 2 }}>Data Resources</Typography>
                                <Typography sx={{ mx: 2 }}>Data Resources</Typography>
                                <Typography sx={{ mx: 2 }}>Data Resources</Typography>
                                <Typography sx={{ mx: 2 }}>Data Resources</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', m: 2, flexDirection: 'column' }}>
                                <Typography variant="h5" sx={{ mx: 2 }}>
                                    About Us
                                </Typography>
                                <Typography sx={{ mx: 2 }}>About Us</Typography>
                                <Typography sx={{ mx: 2 }}>About Us</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ mt: 1 }}>
                        <NCSALogo />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
