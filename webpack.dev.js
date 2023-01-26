const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',

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
            ENV: JSON.stringify('development')
        }),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 8081 })
    ]
});
