import React from "react";
import soybeanGlyph from "../../images/soybean/soybean.svg";

export const STORYBOARD_HEADER_HEIGHT = 68;
export const STORYBOARD_SECONDARY_NAV_HEIGHT = 56;

export const unitedStatesColor = "#00A098";
export const brazilColor = "#4D9F45";
export const argentinaColor = "#167AB4";
export const mainlandChinaColor = "#FFB368";
export const mutedCountryFill = "#1E353B";
export const mutedCountryStroke = "#374B51";
export const worldGeographyUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export type StoryboardSection = {
    id: string;
    navLabel: string;
    title: string;
};

export type StoryboardFrame = {
    id: string;
    sectionId: string;
    title: string;
};

export const storyboardSections: StoryboardSection[] = [
    {
        id: "global-soybean-landscape",
        navLabel: "Global soybean landscape",
        title: "Global Landscape of Soybean"
    },
    {
        id: "us-soy-industry",
        navLabel: "U.S Soybean Industry",
        title: "U.S Soybean Industry"
    },
    {
        id: "policy-approaches",
        navLabel: "Policy Approaches (coming soon)",
        title: "Policy Approaches"
    }
];

export const globalStoryboardFrames: StoryboardFrame[] = [
    {
        id: "global-overview",
        sectionId: "global-soybean-landscape",
        title: "Global Overview"
    },
    {
        id: "global-trading-market",
        sectionId: "global-soybean-landscape",
        title: "Soybean Trading Market"
    },
    {
        id: "china-demand-of-soybean",
        sectionId: "global-soybean-landscape",
        title: "China's Demand Of Soybean"
    },
    {
        id: "china-market-influence",
        sectionId: "global-soybean-landscape",
        title: "Why Mainland China Is Influential"
    },
    {
        id: "brazil-competitor",
        sectionId: "global-soybean-landscape",
        title: "Brazil Major Competitor"
    },
    {
        id: "brazil-soybean-production",
        sectionId: "global-soybean-landscape",
        title: "Brazil Soybean Production"
    },
    {
        id: "us-soybean-overview",
        sectionId: "us-soy-industry",
        title: "U.S. Soybean Overview"
    },
    {
        id: "us-soybean-production",
        sectionId: "us-soy-industry",
        title: "U.S. Soybean Production"
    },
    {
        id: "us-soybean-utilization",
        sectionId: "us-soy-industry",
        title: "Soybean Utilization"
    }
];

export function SoybeanStoryboardGlyph(): JSX.Element {
    return (
        <span
            className="soybean-storyboard-glyph-single"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: soybeanGlyph }}
        />
    );
}

export function InsightStatement(): JSX.Element {
    return (
        <>
            Global soybean flows reveal a concentrated trade structure, with{" "}
            <span style={{ color: brazilColor }}>Brazil</span>,{" "}
            <span style={{ color: unitedStatesColor }}>the United States</span>, and{" "}
            <span style={{ color: argentinaColor }}>Argentina</span> as primary suppliers and{" "}
            <span style={{ color: mainlandChinaColor }}>Mainland China</span> as the world&apos;s largest importer.
        </>
    );
}
