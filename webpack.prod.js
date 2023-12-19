const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
    mode: 'production',

    devtool: 'source-map',

    module: {
        rules: [
            {
                // Use babel-loader for ts, tsx, js, and jsx files
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    // {
                    //     // Show eslint messages in the output
                    //     loader: 'eslint-loader',
                    //     options: {
                    //         emitWarning: true
                    //     }
                    // }
                ]
            },
        ]
    },

    optimization: {
        minimize: true
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            GA_URL: 'https://www.googletagmanager.com/gtag/js?id=G-GFR8PTXMDM',
        }),
        new Webpack.DefinePlugin({
            ENV: JSON.stringify('production'),
            
        })
    ]
});
