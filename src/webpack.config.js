const path = require("path");
const glob = require("glob");

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const addon = path.resolve(__dirname, "addon");
const content_scripts_path = path.resolve(__dirname, "./viewWE/content_scripts/");

module.exports = {
  entry: {
    'background/background': "./viewWE/background.js",
    'toolbar/toolbar': "./viewWE/toolbar/toolbar.js",
    'content_scripts/view': [].concat(
      glob.sync(path.resolve(content_scripts_path, "js/**/*.js")),
      glob.sync(path.resolve(content_scripts_path, "css/**/*.css"))
    )
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
    ]),
    new ExtractTextPlugin("[name].css")
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader"})
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader!sass-loader"})
      }
    ]
  }
};
