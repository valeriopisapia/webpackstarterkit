"use strict";

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackStripLoader = require('strip-loader');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const WebpackStableModuleIdAndHash = require('webpack-stable-module-id-and-hash');

const path = require('path');
const PROD = JSON.parse(process.env.PROD_ENV || '0');


let pathEnv = {
    src: 'src',
    dev : 'dev',
    prod: 'dist',
    vend: 'node_modules'
};

let plugins = [
    new ExtractTextPlugin('style.css', {
        allChunks: true
    }),
    new OptimizeCssAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } }
    }),
    new CopyWebpackPlugin([
        {
            from: pathEnv.src + '/assets/images',
            to: './assets/images',
            toType: 'dir'
        }
    ]),
    new HtmlWebpackPlugin({
        title: 'WebPack Configuration',
        hash: true,
        inject: true,
        appMountId: 'app',
        filename: 'index.html',
        template: 'ejs!src/index.ejs'
        /*minify: {
            removeCommets: true,
            collapseWhitespace: true
        }*/
    }),
    new webpack.optimize.OccurenceOrderPlugin()
];

let config = {
    context: __dirname,
	entry: {
        vendor: './' + pathEnv.src + '/vendor.js',
        build:  './' + pathEnv.src + '/app.js'
    },
	output: {
	    path: PROD ? path.join(__dirname, pathEnv.prod) : path.join(__dirname, pathEnv.dev),
        filename: PROD ? '[name].[chunkhash].js' : '[name].js',
        chunkFilename: PROD ? '[name].[chunkhash].js' : '[name].js'
	},
	module: {
        preLoaders: [
            {
                test: [/\.js$/, /\.css$/, /\.scss$/],
                exclude: /node_modules/,
                loader: 'jshint-loader'
            }
        ],
        loaders: [
            {
                test: [/\.js$/, /\.es6$/],
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract('css-loader?sourceMap!sass-loader?sourceMap')
            },
            {
                test: /\.png$/,
                exclude: /node_modules/,
                loader: "url-loader"
            }
        ]
	},
    resolve: {
        extensions: ['', '.js', '.es6']
    },
    watch: true,
    devtool: '#source-map'
};

if (PROD) {
    plugins.push(
        new WebpackUglifyJsPlugin({
                cacheFolder: path.resolve(__dirname, pathEnv.prod),
                debug: true,
                minimize: true,
                sourceMap: false,
                output: {
                    comments: false
                },
                compressor: {
                    warnings: false
                }
            },
            new webpack.optimize.CommonsChunkPlugin({
                name: ["vendor"],
                minChunks: Infinity
            }),
            new WebpackMd5Hash(),
            new ManifestPlugin(),
            new InlineManifestWebpackPlugin({
                name: 'webpackManifest'
            }),
            new WebpackStableModuleIdAndHash()
        )
    );

    config.module.loaders.push({
            test: [/\.js$/, /\.es6$/],
            exclude: /node_modules/,
            loader: WebpackStripLoader.loader('console.log')
        }
    );
}

config.plugins = plugins;
module.exports = config;