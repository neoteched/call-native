const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/call-native",
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'neo-call-native.min.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ],
    resolve: {
        extensions: [".js"]
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: "babel-loader",
                options: {
                    presets: [
                        "env"
                    ],
                }
            }]
        }]
    }
};
