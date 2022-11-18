import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, CardMedia, Grid, Typography } from '@mui/material';
import library from '../images/library.png';

export default function LandingDisplay(): JSX.Element {
    return (
        <Box sx={{ m: 'auto', width: '90%', mt: '60px' }}>
            <Typography variant="h4" display="block" align="center" sx={{ m: '20px', color: '#2F7164' }}>
                <strong>About Us - Design Policy Lab</strong>
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}
            >
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        p: 1,
                        my: 1,
                        borderRadius: 1,
                        width: '100%'
                    }}
                >
                    <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
                        <CardMedia component="img" src={library} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                mx: 'auto',
                                my: 0,
                                width: '80%',
                                alignContent: 'center'
                            }}
                        >
                            <Typography sx={{ mt: 1, color: '#242424' }}>
                                {/* eslint-disable-next-line max-len */}
                                The Policy Design Lab is a collaboration with ACES Office of Research, iSEE, and NCSA,
                                that will develop unique capabilities to translate, apply and integrate research from
                                multiple disciplines to the evaluation of existing federal policy and to the development
                                of federal policy concepts or ideas, beginning with agricultural conservation,
                                sustainability and climate change through the Farm Bill Mapping Initiative.
                            </Typography>

                            <Typography display="block" sx={{ mt: 1, color: '#242424' }}>
                                {/* eslint-disable-next-line max-len */}
                                This Initiative will make use of computational simulation and optimization modeling,
                                research and technology applied to federal policy design. It will develop functional and
                                adaptable models for policy decision making by transdisciplinary teams of scholars to
                                maximize the University of Illinois System’s impacts on policy scholarship and public
                                engagement.
                            </Typography>

                            <Button
                                size="large"
                                variant="contained"
                                href="/about-us"
                                sx={{ borderRadius: 16, mt: 5, backgroundColor: 'success.main', maxWidth: 200 }}
                            >
                                Learn more
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
