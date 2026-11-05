import { config } from "../../app.config";
import { TitleIICountyProgram } from "../shared/titleii/TitleIICountyMethods";

export const EQIP_TOTAL_CATEGORY = "Total EQIP Benefits";

export const EQIP_CATEGORIES = [
    EQIP_TOTAL_CATEGORY,
    "Land management",
    "Forest management",
    "Structural",
    "Soil remediation",
    "Vegetative",
    "Other improvements",
    "Soil testing",
    "Other planning",
    "Conservation planning assessment",
    "Resource-conserving crop rotation",
    "Soil health",
    "Comprehensive Nutrient Mgt."
];

export const EQIP_COUNTY_PROGRAM: TitleIICountyProgram = {
    name: "EQIP",
    totalCategory: EQIP_TOTAL_CATEGORY,
    totalLabel: "Total EQIP",
    countyDistributionUrl: `${config.apiUrl}/titles/title-ii/programs/eqip/county-distribution`
};
