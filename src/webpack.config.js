const path = require("path");
const glob = require("glob");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const addon = path.resolve(__dirname, "addon");
const content_scripts_path = path.resolve(__dirname, "./viewWE/content_scripts/");

module.exports = {
  entry: {
    'background/background': "./viewWE/background.js",
    'toolbar/toolbar': "./viewWE/toolbar/toolbar.js",
    'content_scripts/view': glob.sync(path.resolve(content_scripts_path, "js/**/*.js"))
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
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: { sourceMap : true }
          },
          {
            loader: "sass-loader",
            options: { sourceMap : true }
          }
        ]
      }
    ]
  }
};
