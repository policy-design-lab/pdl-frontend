import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Section = {
    id: string;
    navLabel: string;
};

type SoybeanStoryboardSecondaryNavProps = {
    activeSectionId: string;
    onSelect: (sectionId: string) => void;
    sections: Section[];
};

export default function SoybeanStoryboardSecondaryNav({
    activeSectionId,
    onSelect,
    sections
}: SoybeanStoryboardSecondaryNavProps): JSX.Element {
    return (
        <Box className="soybean-storyboard-secondary-nav">
            <Box className="soybean-storyboard-secondary-nav-inner">
                {sections.map((section, index) => {
                    const isActive = section.id === activeSectionId;
                    return (
                        <React.Fragment key={section.id}>
                            <Button
                                disableRipple
                                onClick={() => onSelect(section.id)}
                                className={
                                    isActive
                                        ? "soybean-storyboard-secondary-button active"
                                        : "soybean-storyboard-secondary-button"
                                }
                            >
                                {section.navLabel}
                            </Button>
                            {index < sections.length - 1 ? (
                                <Typography className="soybean-storyboard-secondary-divider">-</Typography>
                            ) : null}
                        </React.Fragment>
                    );
                })}
            </Box>
        </Box>
    );
}
