import fipsToState from "../files/maps/fipsToStateMap";

export type StateViewport = {
    center: [number, number];
    zoom: number;
};

export type CountyMapPosition = {
    coordinates: [number, number];
    zoom: number;
};

export type CountyMapBounds = {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
};

export const COUNTY_TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
export const STATE_TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const COUNTY_MAP_DEFAULT_CENTER: [number, number] = [-95, 40];
export const COUNTY_MAP_DEFAULT_ZOOM = 1;

export const COUNTY_MAP_BOUNDS: CountyMapBounds = {
    minLon: -170,
    maxLon: -60,
    minLat: 15,
    maxLat: 75
};

export const STATE_VIEW_SETTINGS: Record<string, StateViewport> = {
    "Alabama": { center: [-86.8, 32.7], zoom: 5 },
    "Alaska": { center: [-150, 63], zoom: 3 },
    "Arizona": { center: [-111.5, 34.5], zoom: 4.5 },
    "Arkansas": { center: [-92.5, 35], zoom: 5 },
    "California": { center: [-119, 37], zoom: 4 },
    "Colorado": { center: [-105.5, 39], zoom: 5 },
    "Connecticut": { center: [-72.7, 41.5], zoom: 7 },
    "Delaware": { center: [-75.5, 39], zoom: 7 },
    "Florida": { center: [-83, 28], zoom: 5 },
    "Georgia": { center: [-83.5, 32.5], zoom: 5 },
    "Hawaii": { center: [-157, 20], zoom: 6 },
    "Idaho": { center: [-114, 44.5], zoom: 5 },
    "Illinois": { center: [-89, 40], zoom: 5 },
    "Indiana": { center: [-86, 40], zoom: 5 },
    "Iowa": { center: [-93.5, 42], zoom: 5 },
    "Kansas": { center: [-98, 38.5], zoom: 5 },
    "Kentucky": { center: [-85, 37.5], zoom: 5 },
    "Louisiana": { center: [-92, 31], zoom: 5 },
    "Maine": { center: [-69, 45], zoom: 5 },
    "Maryland": { center: [-77, 39], zoom: 6 },
    "Massachusetts": { center: [-71.5, 42], zoom: 6 },
    "Michigan": { center: [-85, 44.5], zoom: 5 },
    "Minnesota": { center: [-94, 46], zoom: 5 },
    "Mississippi": { center: [-89.5, 33], zoom: 5 },
    "Missouri": { center: [-92.5, 38.5], zoom: 5 },
    "Montana": { center: [-110, 47], zoom: 5 },
    "Nebraska": { center: [-99.5, 41.5], zoom: 5 },
    "Nevada": { center: [-117, 39], zoom: 5 },
    "New Hampshire": { center: [-71.5, 43.5], zoom: 6 },
    "New Jersey": { center: [-74.5, 40], zoom: 6 },
    "New Mexico": { center: [-106, 34], zoom: 5 },
    "New York": { center: [-75.5, 43], zoom: 5 },
    "North Carolina": { center: [-79.5, 35.5], zoom: 5 },
    "North Dakota": { center: [-100.5, 47.5], zoom: 5 },
    "Ohio": { center: [-82.5, 40], zoom: 5 },
    "Oklahoma": { center: [-97, 35.5], zoom: 5 },
    "Oregon": { center: [-120.5, 44], zoom: 5 },
    "Pennsylvania": { center: [-77.5, 41], zoom: 5 },
    "Rhode Island": { center: [-71.5, 41.5], zoom: 7 },
    "South Carolina": { center: [-81, 34], zoom: 5 },
    "South Dakota": { center: [-100, 44.5], zoom: 5 },
    "Tennessee": { center: [-86, 36], zoom: 5 },
    "Texas": { center: [-99, 31], zoom: 4 },
    "Utah": { center: [-111.5, 39.5], zoom: 5 },
    "Vermont": { center: [-72.5, 44], zoom: 6 },
    "Virginia": { center: [-79, 37.5], zoom: 5 },
    "Washington": { center: [-120.5, 47.5], zoom: 5 },
    "West Virginia": { center: [-80.5, 39], zoom: 5 },
    "Wisconsin": { center: [-89.5, 44.5], zoom: 5 },
    "Wyoming": { center: [-107.5, 43], zoom: 5 },
    "District of Columbia": { center: [-77, 38.9], zoom: 9 }
};

export const STATE_FIPS_TO_NAME: Record<string, string> = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
    "05": "Arkansas",
    "06": "California",
    "08": "Colorado",
    "09": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming"
};

export const STATE_NAME_TO_FIPS: Record<string, string> = Object.entries(STATE_FIPS_TO_NAME).reduce(
    (acc, [fips, stateName]) => {
        acc[stateName] = fips;
        return acc;
    },
    {} as Record<string, string>
);

export const STATE_ABBR_TO_FIPS: Record<string, string> = Object.entries(fipsToState).reduce(
    (acc, [fips, stateAbbreviation]) => {
        acc[stateAbbreviation] = fips;
        return acc;
    },
    {} as Record<string, string>
);

export const normalizeCountyFips = (countyFips: unknown): string | null => {
    const raw = String(countyFips ?? "").trim();
    if (!raw || !/^\d+$/.test(raw) || raw.length > 5) {
        return null;
    }
    return raw.padStart(5, "0");
};

export const normalizeStateFips = (stateFips: unknown): string | null => {
    const raw = String(stateFips ?? "").trim();
    if (!raw || !/^\d+$/.test(raw) || raw.length > 2) {
        return null;
    }
    return raw.padStart(2, "0");
};

export const getStateFipsFromName = (stateName: string): string | null => {
    return STATE_NAME_TO_FIPS[stateName] || null;
};

export const getStateViewport = (selectedState: string): StateViewport | null => {
    return STATE_VIEW_SETTINGS[selectedState] || null;
};

export const getCountyMapPosition = (selectedState: string, zoomLevel: number): CountyMapPosition => {
    if (selectedState === "All States") {
        return { coordinates: COUNTY_MAP_DEFAULT_CENTER, zoom: COUNTY_MAP_DEFAULT_ZOOM * zoomLevel };
    }
    const stateView = getStateViewport(selectedState);
    if (stateView) {
        return { coordinates: stateView.center, zoom: stateView.zoom * zoomLevel };
    }
    return { coordinates: COUNTY_MAP_DEFAULT_CENTER, zoom: COUNTY_MAP_DEFAULT_ZOOM * zoomLevel };
};

export const clampCountyMapCenter = (
    coordinates: number[],
    bounds: CountyMapBounds = COUNTY_MAP_BOUNDS
): [number, number] => {
    const [longitude, latitude] = coordinates;
    return [
        Math.min(bounds.maxLon, Math.max(bounds.minLon, longitude)),
        Math.min(bounds.maxLat, Math.max(bounds.minLat, latitude))
    ];
};
