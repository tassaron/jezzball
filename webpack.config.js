const webpack = require("webpack");
const path = require("path");
const TerserPlugin =  require('terser-webpack-plugin')

module.exports = (env, argv) => {
    const config = {
        context: path.resolve(__dirname),
        entry: ['./main.js'],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                }
            ]
        },
        resolve: {
            extensions: ['.js'],
        },
        output: {
            path: path.resolve(__dirname),
            filename: 'bundle.js',
        },
    };

    if (argv.mode == "production") {
        const TerserPlugin = require('terser-webpack-plugin');
        config.optimization = {
            minimizer: [new TerserPlugin({})],
        }
    } else if (argv.mode == "development") {
        config.devtool = 'source-map';
    }

    return config;
}