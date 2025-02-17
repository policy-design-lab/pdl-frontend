import styled from "@emotion/styled";
import { Tab } from "@mui/material";
import React from "react";

interface StyledTabProps {
    label: JSX.Element;
    customsx?: Record<string, any>;
    selectedsx?: Record<string, any>;
}

export const CustomTab = styled((props: StyledTabProps) => (
    <Tab
        disableRipple
        {...props}
        sx={{
            "&.Mui-selected": {
                color: "#2f7164",
                fontWeight: 600,
                ...props.selectedsx
            },
            "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
                transition: "background-color 0.3s ease"
            },
            "textTransform": "none",
            "minWidth": 120,
            "padding": "12px 24px",
            "margin": "0 8px",
            "fontSize": "1.5rem",
            ...props.customsx
        }}
    />
))({});
