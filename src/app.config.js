import { Warning } from "@mui/icons-material";

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

    // In case APP_ENV is not set, we will try to determine the environment based on the hostname
    if (!webpack_env.APP_ENV) {
        const hostname = window && window.location && window.location.hostname;
        if (hostname === "localhost") {
            return localConfig;
        }
        if (hostname === "policydesignlab-dev.ncsa.illinois.edu") {
            return developConfig;
        }
    } else {
        if (webpack_env.APP_ENV === "local") {
            return localConfig;
        }
        if (webpack_env.APP_ENV === "development") {
            return developConfig;
        }
    }
    return deployConfig;
}

export const config = getConfig();
