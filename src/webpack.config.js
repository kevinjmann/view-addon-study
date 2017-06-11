const path = require("path");
const glob = require("glob");

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const addon = path.resolve(__dirname, "addon");
const source_path = path.resolve(__dirname, "./viewWE");

module.exports = {
  entry: {
    'background/background': path.resolve(source_path, "background.js"),
    'toolbar/toolbar': [
      path.resolve(source_path, "toolbar/toolbar.js"),
      path.resolve(source_path, "toolbar/toolbar.css")
    ],
    'content_scripts/view': [].concat(
      glob.sync(path.resolve(source_path, "content_scripts/js/**/*.js")),
      glob.sync(path.resolve(source_path, "content_scripts/css/**/*.css"))
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
