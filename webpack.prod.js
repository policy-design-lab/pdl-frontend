const Webpack = require('webpack');
const { merge } = require('webpack-merge');
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
        new Webpack.DefinePlugin({
            ENV: JSON.stringify('production')
        })
    ]
});
