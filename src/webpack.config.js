const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const addon = path.resolve(__dirname, "addon");

module.exports = {
  entry: {
    'background/index': "./viewWE/background.js",
    'content_scripts/view': "./viewWE/content_scripts/js/view.js"
  },
  devtool: 'source-map',
  output: {
    path: addon,
    filename: "[name].js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./viewWE/manifest.json",
        "to": path.resolve(addon, "manifest.json")
      }
    ])
  ]
};
