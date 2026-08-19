import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type SoybeanStoryboardIntroProps = {
    title: string;
    description: React.ReactNode;
};

export default function SoybeanStoryboardIntro({ title, description }: SoybeanStoryboardIntroProps): JSX.Element {
    return (
        <Box className="soybean-storyboard-intro">
            <Typography component="div" className="soybean-storyboard-intro-title">
                {title}
            </Typography>
            <Typography component="p" className="soybean-storyboard-intro-description">
                {description}
            </Typography>
        </Box>
    );
}
