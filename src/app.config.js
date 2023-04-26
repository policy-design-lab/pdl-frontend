const baseConfig = {
    // put any unchanging configuration information in here
};

const deployConfig = {
<<<<<<< HEAD
	apiUrl: "/pdl",
  ...baseConfig
};

const localConfig = {
	apiUrl: "http://localhost:5000/pdl",
	...baseConfig,
=======
    apiUrl: "/pdl",
    ...baseConfig
};

const localConfig = {
    apiUrl: "http://localhost:5000/pdl",
    ...baseConfig
>>>>>>> develop
};

// eslint-disable-next-line no-unused-vars
function getConfig() {
    if (process.env.APP_ENV === "local") {
        return localConfig;
    }
    return deployConfig;
}

export const config = getConfig();
