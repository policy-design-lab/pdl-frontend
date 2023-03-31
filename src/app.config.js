const baseConfig = {
	// put any unchaging configuration information in here
};

const prodConfig = {
	apiUrl: "https://api.policydesignlab.ncsa.illinois.edu/pdl",
	...baseConfig
};

const devConfig = {
	apiUrl: "https://api.policydesignlab-dev.ncsa.illinois.edu/pdl",
	...baseConfig
};

const localConfig = {
	apiUrl: "http://localhost:5000/pdl",
	...baseConfig
};

// eslint-disable-next-line no-unused-vars
export const config = getConfig();

function getConfig() {
	if (process.env.APP_ENV === 'production') {
	    return prodConfig;
	}
	if (process.env.APP_ENV === 'development') {
	    return devConfig;
	}
	return localConfig;
}
