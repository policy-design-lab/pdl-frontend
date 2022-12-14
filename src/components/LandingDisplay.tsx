import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, CardMedia, Grid, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import gov from '../images/gov.png';
import teamButton from '../images/buttons/PDL Team Button.png';
import resourceButton from '../images/buttons/Data Resource Button.png';
import '../styles/fonts.css';

export default function LandingDisplay(): JSX.Element {
    return (
        <Box sx={{ mx: 'auto', width: '90%', mt: 0 }}>
            <div style={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        p: 1,
                        m: 1,
                        bgcolor: '#ECF0EE',
                        my: 15
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: -15,
                            right: 8
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#2F7164', minWidth: 400, minHeight: 40, borderRadius: 0 }}
                            disableElevation
                        >
                            Explore Maps of Total Farm Bill <ArrowForwardIcon />
                        </Button>
                    </div>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '85%'
                        }}
                    >
                        <Box sx={{ mt: 5 }}>
                            <Typography>
                                <strong>What is Farm Bill?</strong>
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <Typography sx={{ my: 5 }}>
                                Federal agricultural, conservation and food assistance policy is periodically
                                reauthorized in omnibus legislation commonly known as the Farm Bill, with federal
                                mandatory outlays exceeding $100 billion annually. The Farm Bill authorizes 4 major
                                categories of mandatory spending programs: programs: commodities; conservation
                                assistance; crop insurance; and the Supplemental Nutrition Nutrition Program (SNAP)
                                which provides food assistance to low income families. The most recent reauthorization
                                was the Agricultural Improvement Act of 2018 and is scheduled to expire in 2023,
                                requiring a reauthorization debate in Congress.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </div>
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
                        <CardMedia component="img" src={gov} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                mx: 'auto',
                                my: '5%',
                                width: '80%',
                                alignContent: 'center'
                            }}
                        >
                            <Typography variant="h6" className="allSmallCaps">
                                <strong>Learn more about</strong>
                            </Typography>
                            <Typography variant="h4" className="smallCaps">
                                <strong>Policy Design Lab</strong>
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography display="block" sx={{ mt: 1, color: '#242424' }}>
                                {/* eslint-disable-next-line max-len */}
                                The Policy Design Lab is a collaboration with ACES Office of Research, iSEE, and NCSA,
                                that will develop unique capabilities to translate, apply and integrate research from
                                multiple disciplines to the evaluation of existing federal policy and to the development
                                of federal policy concepts or ideas, beginning with agricultural conservation,
                                sustainability and climate change through the Farm Bill Mapping Initiative.
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 8 }}>
                                <CardMedia component="img" src={resourceButton} sx={{ maxWidth: 250, mr: 4 }} />
                                <CardMedia component="img" src={teamButton} sx={{ maxWidth: 250 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
