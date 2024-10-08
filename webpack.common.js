const path = require("path");
const Webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    target: "web",

    context: __dirname,

    entry: {
        polyfill: "./src/polyfill.js",
        style: "./src/styles/main.css",
        app: "./src/index.tsx"
    },

    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: process.env.PUBLIC_PATH || "/",
        filename: "js/[name]-[fullhash].js",
        crossOriginLoading: "anonymous"
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    },
                    "css-loader"
                ]
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader"
            },
            {
                test: /\.(jpg|jpeg|png|eot|ttf|woff|woff2|pdf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "files/[name]-[hash].[ext]"
                        }
                    }
                ]
            }
        ]
    },

    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "src/components/")
        },
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    },

    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                // Create a commons chunk, which includes all code shared between entry points.
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new Webpack.DefinePlugin({
            "process.env": {
                APP_ENV: JSON.stringify(process.env.APP_ENV)
            },
            "PUBLIC_PATH": JSON.stringify(process.env.PUBLIC_PATH || "/") // The base path for the app. It must end with a slash.
        }),
        new FaviconsWebpackPlugin({
            logo: "./src/images/favicon.png",
            prefix: "icons/",
            emitStats: false,
            inject: true,
            favicons: {
                icons: {
                    android: false,
                    appleIcon: false,
                    appleStartup: false,
                    coast: false,
                    favicons: true,
                    firefox: false,
                    windows: false,
                    yandex: false
                }
            }
        }),
        new MiniCssExtractPlugin({ filename: "css/[name]-[fullhash].css" }),
        new CleanWebpackPlugin()
    ]
};
