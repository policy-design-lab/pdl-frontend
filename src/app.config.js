// let config = {};

let hostname = window.location.hostname;

// for local test to connect dev api server
// const hostname = process.env.APP_ENV === "development" ? "policydesignlab-dev.ncsa.illinois.edu" : window.location.hostname;

const baseConfig = {
	// put any unchanging configuration information in here
};

const deployConfig = {
    apiUrl: `https://${hostname}/pdl`,
	...baseConfig
};

const localConfig = {
	apiUrl: `http://${hostname}:5000/pdl`,
	...baseConfig
};

// eslint-disable-next-line no-unused-vars
function getConfig() {
    if (process.env.APP_ENV === 'local') {
        console.log("ENV is local")
        return localConfig;
    }
    console.log("ENV is deployment")
    return deployConfig;
}

export const config = getConfig();
