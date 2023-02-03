const baseConfig = {
	// put any unchaging configuration information in here
};

const prodConfig = {
	apiUrl: "https://pdl.ncsa.illinois.edu/pdl",
	...baseConfig
};

const devConfig = {
	apiUrl: "https://pdl-dev.ncsa.illinois.edu/pdl",
	...baseConfig
};

const localConfig = {
	apiUrl: "http://localhost:5000/pdl",
	...baseConfig
};

// eslint-disable-next-line no-unused-vars
export const config = getConfig();

function getConfig() {
	// if (process.env.REACT_APP_ENV === 'production') {
	//     return prodConfig;
	// }
	// if (process.env.REACT_APP_ENV === 'development') {
	//     return devConfig;
	// }
	return localConfig;
}
