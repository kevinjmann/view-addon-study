const path = require("path");

module.exports = {
    entry: {
        background: "./viewWE/background.js"
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, "addon"),
        filename: "[name]/index.js"
    }
};
