import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import { Button, Card, CardActions, CardContent, CardMedia } from '@mui/material';
import forest from '../images/forest.png';

export default function News(): JSX.Element {
    return (
        <Box sx={{ m: 'auto', width: '90%', my: '10px' }}>
            <Box sx={{ p: 1, m: 1 }}>
                <Typography variant="h4" className="smallCaps">
                    <strong>Related News</strong>
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
                <Card variant="outlined" sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#242424' }}>
                            News
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            placeholder
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#242424' }}>
                            News
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            placeholder
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#242424' }}>
                            News
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            placeholder
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#242424' }}>
                            News
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            placeholder
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
            </Box>
        </Box>
    );
}
