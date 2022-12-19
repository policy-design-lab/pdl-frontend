import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import { Button, Card, CardActions, CardContent, CardMedia } from '@mui/material';
import senate from '../images/resources/Senate Committee on Agriculture, Nutrition, and Forestry.png';
import house from '../images/resources/House Agriculture Committee.png';
import department from '../images/resources/United States Department of Agriculture.png';
import farmdoc from '../images/resources/farmdoc.png';

export default function News(): JSX.Element {
    return (
        <Box sx={{ m: 'auto', width: '90%', my: '20px', mt: 10 }}>
            <Box sx={{ p: 1, m: 1 }}>
                <Typography variant="h4" className="smallCaps">
                    <strong>Related Resources</strong>
                </Typography>
                <Typography variant="h6" className="allSmallCaps">
                    <strong>Updated on DECEMBER 2022</strong>
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}
            >
                <Card variant="outlined" sx={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                    <CardMedia component="img" height="140" image={senate} />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Senate Committee on
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Agriculture, Nutrition,
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            and Forestry
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ mt: 'auto' }}>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                    <CardMedia component="img" height="140" image={house} />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            House Agriculture
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Committee
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ mt: 'auto' }}>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                    <CardMedia component="img" height="140" image={department} />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            United States
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Department of
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Agriculture
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ mt: 'auto' }}>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                    <CardMedia component="img" height="140" image={farmdoc} />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#242424' }}>
                            Farmdoc
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ mt: 'auto' }}>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
            </Box>
        </Box>
    );
}
