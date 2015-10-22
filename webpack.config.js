var webpack = require("webpack");

module.exports = {
    entry: "./app/index.js",
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel'
        }]
    },
    output: {
        filename: "dist/index.js"
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin(
            '[file].map', null, "../[resource-path]", "../[resource-path]"),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true
        })
    ]
};
