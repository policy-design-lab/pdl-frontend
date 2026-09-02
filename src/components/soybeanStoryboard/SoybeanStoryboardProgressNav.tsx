import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type Section = {
    id: string;
    title: string;
};

type SoybeanStoryboardProgressNavProps = {
    activeSectionId: string;
    onSelect: (sectionId: string) => void;
    sections: Section[];
};

export default function SoybeanStoryboardProgressNav({
    activeSectionId,
    onSelect,
    sections
}: SoybeanStoryboardProgressNavProps): JSX.Element {
    return (
        <Box className="soybean-storyboard-progress-nav">
            <Box className="soybean-storyboard-progress-rail" />
            <Box className="soybean-storyboard-progress-markers">
                {sections.map((section) => {
                    const isActive = section.id === activeSectionId;
                    return (
                        <Button
                            key={section.id}
                            disableRipple
                            onClick={() => onSelect(section.id)}
                            className={
                                isActive
                                    ? "soybean-storyboard-progress-button active"
                                    : "soybean-storyboard-progress-button"
                            }
                            aria-label={section.title}
                        >
                            <Box className="soybean-storyboard-progress-dot" />
                        </Button>
                    );
                })}
            </Box>
        </Box>
    );
}
