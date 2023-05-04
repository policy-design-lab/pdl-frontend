const baseConfig = {
    // put any unchanging configuration information in here
};

const deployConfig = {
    apiUrl: "/pdl",
    ...baseConfig
};

const developConfig = {
    apiUrl: "https://policydesignlab-dev.ncsa.illinois.edu/pdl",
    ...baseConfig
};

const localConfig = {
    apiUrl: "http://localhost:5000/pdl",
    ...baseConfig
};

// eslint-disable-next-line no-unused-vars
function getConfig() {
    if (process.env.APP_ENV === "local") {
        return localConfig;
    }
    if (process.env.APP_ENV === "development") {
        return developConfig;
    }
    return deployConfig;
}

export const config = getConfig();
