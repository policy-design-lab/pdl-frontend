import { config } from "../../app.config";
import { TitleIICountyProgram } from "../shared/titleii/TitleIICountyMethods";

export const CSP_TOTAL_CATEGORY = "Total CSP Benefits";

export const CSP_CATEGORIES = [
    CSP_TOTAL_CATEGORY,
    "2018 Practices",
    "Structural",
    "Vegetative",
    "Land management",
    "Forest management",
    "Soil remediation",
    "Existing activity payments",
    "Soil testing",
    "Other improvements",
    "2014 Eligible Land",
    "Cropland",
    "Grassland",
    "Rangeland",
    "Pastureland",
    "Non-Industrial Private Forestland (NIPF)",
    "Other CSP",
    "Miscellaneous",
    "Bundles",
    "(6)(B) Planning"
];

export const CSP_COUNTY_PROGRAM: TitleIICountyProgram = {
    name: "CSP",
    totalCategory: CSP_TOTAL_CATEGORY,
    totalLabel: "Total CSP",
    countyDistributionUrl: `${config.apiUrl}/titles/title-ii/programs/csp/county-distribution`
};
