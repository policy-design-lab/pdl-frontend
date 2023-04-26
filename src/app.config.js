const baseConfig = {
    // put any unchanging configuration information in here
};

const deployConfig = {
    apiUrl: "/pdl",
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
    return deployConfig;
}

export const config = getConfig();
