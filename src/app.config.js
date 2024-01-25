const baseConfig = {
    // put any unchanging configuration information in here
};

const deployConfig = {
    apiUrl: "/pdl",
    ga_tracking_id: "G-GFR8PTXMDM",
    ...baseConfig
};

const developConfig = {
    apiUrl: "https://policydesignlab-dev.ncsa.illinois.edu/pdl",
    ga_tracking_id: "G-K4MLHWSVVT",
    ...baseConfig
};

const localConfig = {
    apiUrl: "http://localhost:5000/pdl",
    ga_tracking_id: "none",
    ...baseConfig
};

// eslint-disable-next-line no-unused-vars
function getConfig() {
    if (!process.env.APP_ENV) {
        throw new Error("APP_ENV environment variable not set or being detected. You will not be able to parse your json");
    }
    if (process.env.APP_ENV === "local") {
        return localConfig;
    }
    if (process.env.APP_ENV === "development") {
        return developConfig;
    }
    return deployConfig;
}

export const config = getConfig();
