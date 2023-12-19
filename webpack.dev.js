const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',

    module: {
        rules: [
            {
                // Use babel-loader for ts, tsx, js, and jsx files
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    {
                        // Show eslint messages in the output
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    }
                ]
            },
        ]
    },
    
    devServer: {
        hot: true,
        host: 'localhost',
        port: 3000,
        open: true,
        inline: true,
        stats: 'minimal',
        historyApiFallback: true,
        allowedHosts: JSON.parse(process.env.ALLOWED_HOSTS || '["localhost"]'),
        headers: { 'Access-Control-Allow-Origin': '*' }
    },

    plugins: [
        new Webpack.DefinePlugin({
            ENV: JSON.stringify('development'),
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
             GA_URL: 'https://www.googletagmanager.com/gtag/js?id=G-K4MLHWSVVT',
        }),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 8081 })
    ],

});
