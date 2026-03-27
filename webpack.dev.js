const Webpack = require("webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
    mode: "development",
    devtool: "eval-source-map",

    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    },

    devServer: {
        hot: true,
        host: "localhost",
        port: 3000,
        open: true,
        inline: true,
        stats: "minimal",
        historyApiFallback: true,
        allowedHosts: JSON.parse(process.env.ALLOWED_HOSTS || '["localhost"]'),
        headers: { "Access-Control-Allow-Origin": "*" }
    },

    plugins: [
        new ESLintPlugin({
            extensions: ["js", "jsx", "ts", "tsx"],
            files: "src",
            emitWarning: true
        }),
        new Webpack.DefinePlugin({
            ENV: JSON.stringify("development")
        }),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 8081 })
    ]
});
