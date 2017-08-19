/**
 * Global compilation configuration file for webpack
 *
 * Output is in /addon
 *
 * It produces three bundles:
 *
 * - /background/background.js
 * - /content_scripts/view.js
 * - /options/options.js
 *
 * It also copies the necessary HTML files and icons.
 */

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
    /** background script */
    'background/background': path.resolve(source_path, "background.js"),

    /** options script and its assets, used for addon options.
        The HTML is extracted with the extract text plugin */
    'options/options': glob.sync(path.resolve(source_path, "options/options.*")),

    /** content scripts, emitted as a single bundle, including CSS */
    'content_scripts/view': [
      path.resolve(source_path, "content_scripts/js/messageHandler.js")
    ].concat(
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
      /** Copies the icons and the manifest to the target location */
      {
        from: path.resolve(source_path, "manifest.json"),
        to:   path.resolve(addon, "manifest.json")
      },
      {
        from: path.resolve(source_path, "icons"),
        to:   path.resolve(addon, "icons")
      }
    ]),
    CssTextPlugin,
    HtmlTextPlugin
  ],
  resolve: {
    /** This hack is here because sinon uses 'require' in buggy ways */
    alias: {
      sinon: path.resolve(__dirname, 'node_modules/sinon/pkg/sinon.js') // require dist version instead
    }
  },
  module: {
    /** See above comment on resolve.alias.sinon */
    noParse: [ /node_modules\/sinon$/ ],

    rules: [
      {
        /** run all js files through babel loader with es2015, except node_modules */
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            plugins: ['transform-runtime', 'transform-object-rest-spread']
          }
        }
      },
      {
        /** CSS files are loaded with the css-loader and extracted */
        test: /\.css$/,
        loader: CssTextPlugin.extract({fallback: "style-loader", use: "css-loader"})
      },
      {
        /** SCSS files are first run through the SCSS compiler, and then processd just like CSS files */
        test: /\.scss$/,
        loader: CssTextPlugin.extract({fallback: "style-loader", use: "css-loader!sass-loader"})
      },
      {
        /** HTML files in content_scripts are included in the JS bundle, and not extracted. */
        test: /.*content_scripts.*\.html$/,
        loader: "html-loader"
      },
      {
        /** PNGs are loaded inline in JS bundles */
        test: /.*\.png$/,
        loader: "url-loader?mimetype=image/png"
      },
      {
        /** GIFs are loaded inline in JS bundles */
        test: /.*\.gif$/,
        loader: "url-loader?mimetype=image/gif"
      },
      {
        /** The html file for options is extracted separately, as it needs
            to be present for the webextensions options mechanism to work.*/
        test: /.*(options).*\.html$/,
        loader: HtmlTextPlugin.extract({use: "raw-loader"})
      }
    ]
  }
};
