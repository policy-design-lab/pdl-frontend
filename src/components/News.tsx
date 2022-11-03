import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import { Button, Card, CardActions, CardContent, CardMedia } from '@mui/material';
import forest from '../images/forest.png';

export default function News() {
    return (
        <Box sx={{ my: '10px' }}>
            <Typography variant="h4" display="block" align="center" sx={{ m: '20px', color: 'success.dark' }}>
                <strong>Related News</strong>
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
                <Card sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
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
                <Card sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
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
                <Card sx={{ maxWidth: 345 }}>
                    <CardMedia component="img" height="140" image={forest} />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
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
