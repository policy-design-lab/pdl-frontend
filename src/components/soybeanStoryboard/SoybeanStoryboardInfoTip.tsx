import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

type SoybeanStoryboardInfoTipProps = {
    explainer: React.ReactNode;
    label?: string;
};

export default function SoybeanStoryboardInfoTip({
    explainer,
    label = "More information"
}: SoybeanStoryboardInfoTipProps): JSX.Element {
    return (
        <Tooltip
            title={explainer}
            arrow
            enterTouchDelay={0}
            leaveTouchDelay={6000}
            classes={{
                tooltip: "soybean-storyboard-info-tip-popper",
                arrow: "soybean-storyboard-info-tip-arrow"
            }}
        >
            <Box component="span" className="soybean-storyboard-info-tip" tabIndex={0} role="button" aria-label={label}>
                ?
            </Box>
        </Tooltip>
    );
}
