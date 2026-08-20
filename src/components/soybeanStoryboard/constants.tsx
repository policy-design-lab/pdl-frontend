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
        title: "Global Trade in Soybeans"
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

export type StoryboardIntro = {
    title: string;
    description: string;
};

export const storyboardIntros: Record<string, StoryboardIntro> = {
    "global-soybean-landscape": {
        title: "Introducing the Global Trade in Soybeans Storyboard",
        description:
            "Today, soybeans are the second largest crop in the United States in terms of acres planted; second only to corn, with which it is often planted in rotation (e.g., corn one year followed by soybeans the next). U.S. farmers have planted nearly 85 million acres to soybeans in recent years. In terms of federal policy, however, soybeans are in a relatively unique position. The crop was added to federal support programs in 2002, and the crop consistently receives the lowest level of payments while also experiencing relatively few losses in the federal crop insurance program. Soybeans status in federal policy has received additional attention in recent years due to trade conflicts and other geopolitical challenges; at the same time the crop is looked to for food, feed, and increasingly fuel. This storyboard seeks to provide an interactive visualization about soybeans with a goal of developing a better understanding of the issues facing soybean farmers. From that, this project’s goals include visualizing analysis of various policy design alternatives, options, and innovations. The work has been funded in part by the Illinois Soybean Association and is part of ongoing efforts at understanding policy design."
    }
};

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
        title: "Brazilian Soybean Production"
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
            Public data on global soybean flows reveal a trade structure in which{" "}
            <span style={{ color: brazilColor }}>Brazil</span>,{" "}
            <span style={{ color: unitedStatesColor }}>the United States</span>, and{" "}
            <span style={{ color: argentinaColor }}>Argentina</span> as primary suppliers and{" "}
            <span style={{ color: mainlandChinaColor }}>Mainland China</span> as the world&apos;s largest importer.
        </>
    );
}

export const soybeanDataSources = {
    marketView: {
        href: "https://marketviewdb.unitedsoybean.org/dashboards/?bi=Soy_SupplyDisappearance_TimeSeries",
        label: "United Soybean Board MarketView"
    },
    brazilPlantedAcres: {
        href: "https://sidra.ibge.gov.br/tabela/1612",
        label: "IBGE SIDRA Table 1612 (PAM)"
    },
    usdaGats: {
        href: "https://apps.fas.usda.gov/gats/",
        label: "USDA FAS Global Agricultural Trade System (GATS)"
    },
    usPlantedAcres: {
        href: "https://www.fsa.usda.gov/tools/informational/freedom-information-act-foia/electronic-reading-room/frequently-requested/crop-acreage-data",
        label: "USDA FSA Crop Acreage Data"
    },
    worldBankGdpPerCapita: {
        href: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=CN",
        label: "World Bank: GDP Per Capita"
    },
    worldBankTotalPopulation: {
        href: "https://data.worldbank.org/indicator/SP.POP.TOTL?locations=CN",
        label: "World Bank: Total Population"
    },
    worldBankUrbanPopulation: {
        href: "https://data.worldbank.org/indicator/SP.URB.TOTL?end=2024&locations=CN&start=1960&view=chart",
        label: "World Bank: Urban Population"
    }
};
