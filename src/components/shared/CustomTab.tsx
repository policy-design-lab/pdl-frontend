import styled from "@emotion/styled";
import { Tab } from "@mui/material";
import React from "react";

interface StyledTabProps {
    label: JSX.Element;
    customSx?: Record<string, any>;
    selectedSX?: Record<string, any>;
}

export const CustomTab = styled((props: StyledTabProps) => (
    <Tab
        disableRipple
        {...props}
        sx={{
            "&.Mui-selected": {
                ...props.selectedSX
            },

            ...props.customSx
        }}
    />
))({});
