const path = require("path");
const glob = require("glob");

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CssTextPlugin = new ExtractTextPlugin("[name].css");
const HtmlTextPlugin = new ExtractTextPlugin("[name].html");

const addon = path.resolve(__dirname, "addon");
const source_path = path.resolve(__dirname, "./viewWE");

module.exports = {
  entry: {
    'background/background': path.resolve(source_path, "background.js"),
    'toolbar/toolbar': glob.sync(path.resolve(source_path, "toolbar/toolbar.*")),
    'options/options': glob.sync(path.resolve(source_path, "options/options.*")),
    'content_scripts/view': [].concat(
      glob.sync(path.resolve(source_path, "content_scripts/js/**/*.js")),
      glob.sync(path.resolve(source_path, "content_scripts/css/**/*.css")),
      glob.sync(path.resolve(source_path, "content_scripts/css/**/*.html"))
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
    CssTextPlugin,
    HtmlTextPlugin
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: CssTextPlugin.extract({fallback: "style-loader", use: "css-loader"})
      },
      {
        test: /\.scss$/,
        loader: CssTextPlugin.extract({fallback: "style-loader", use: "css-loader!sass-loader"})
      },
      {
        test: /\.html$/,
        loader: HtmlTextPlugin.extract({use: "raw-loader"})
      }
    ]
  }
};
