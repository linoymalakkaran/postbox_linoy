const fs = require('fs'),
    path = require('path'),
    ENV = process.env.npm_lifecycle_event,
    BUILD_MODE = (ENV === 'build' || ENV === 'dist') ? true : false,
    webpack = require('webpack'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ProvidePlugin = require('webpack/lib/ProvidePlugin'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    WebpackOnBuildPlugin = require('on-build-webpack');

const devServer = {
    stats: 'minimal',
    host: 'localhost',
    port: 8888
};

let outdir = path.resolve('../server/public');
let copySettings = [{
    from: path.resolve(__dirname, 'app', 'images'),
    to: BUILD_MODE ? path.resolve(outdir, 'images') : path.resolve(outdir, 'public', 'images')
},
{
    from: path.resolve(__dirname, 'app', 'views'),
    to: path.resolve(outdir, 'views')
},
{
    from: path.resolve(__dirname, 'app', '404.html'),
    to: path.resolve(outdir, '404.html')
},
{
    from: path.resolve(__dirname, 'app', 'invalid.html'),
    to: path.resolve(outdir, 'invalid.html')
},
{
    from: path.resolve(__dirname, 'app', 'paymenterror.html'),
    to: path.resolve(outdir, 'paymenterror.html')
},
{
    from: path.resolve(__dirname, 'app', 'paymentsuccess.html'),
    to: path.resolve(outdir, 'paymentsuccess.html')
},
{
    from: path.resolve(__dirname, 'app', 'static'),
    to: BUILD_MODE ? path.resolve(outdir, 'static') : path.resolve(outdir, 'public', 'static')
},
{
    from: path.resolve(__dirname, 'app', 'scripts', 'lib'),
    to: BUILD_MODE ? path.resolve(outdir, 'js') : path.resolve(outdir, 'public', 'js')
}];

let copyPluginSettings;
console.log(ENV);
if (ENV === 'dist') {
    copySettings.push({
        from: path.resolve('../server'),
        to: path.resolve('../dist'),
        ignore: [
            path.resolve('../server') + '/node_modules/*',
            path.resolve('../server') + 'app/config/*',
            path.resolve('../server') + 'log/*',
            path.resolve('../server') + 'package.json'
        ]
    });
    copyPluginSettings = new CopyWebpackPlugin(
        copySettings,
        {
            ignore: [
                path.resolve('../server') + '/node_modules/*',
                path.resolve('../server') + 'app/config/*',
                path.resolve('../server') + 'log/*',
                path.resolve('../server') + 'package.json'
            ]
        });
} else {
    copyPluginSettings = new CopyWebpackPlugin(copySettings);
}

let config = {
    entry: {
        'babel-polyfill': './app/scripts/app.js',
        'vendor': './app/scripts/vendor.js',
        'app': './app/scripts/app.js'
    },
    devtool: BUILD_MODE ? 'false' : 'source-map',
    output: {
        path: outdir,
        // filename: 'js/[name].[hash].js',
        filename: 'js/[name].js',
        publicPath: BUILD_MODE ? 'mypostbox/public/' : ''
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env', "es2015", "stage-0"]
                }
            }
        },
        {
            test: /\.(scss|css)$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ['css-loader'],
                allChunks: true
            })
        },
        {
            test: /\.(svg|woff|woff2|ttf|eot|otf|png)$/,
            use: ['url-loader']
        },
        {
            test: /\.html$/,
            loader: 'raw-loader'
        }
        ]
    },

    devServer: devServer,

    plugins: [
        new ExtractTextPlugin({
            // filename: 'css/style.[hash].css'
            filename: 'css/style.css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './app/index.html',
            inject: 'body'
        }),
        new ProvidePlugin({
            moment: "moment"
        }),
        new webpack.DefinePlugin({
            WEBPACK_MODE: BUILD_MODE ? JSON.stringify('build') : JSON.stringify('dev'),
            API_URL: BUILD_MODE ? JSON.stringify('mypostbox/api/') : JSON.stringify('http://localhost:7377/testing_mypostbox/api/')
        }),
        copyPluginSettings,
        new WebpackOnBuildPlugin(function (stats) {
            if (BUILD_MODE) {
            }
        })
    ]
};

// if (BUILD_MODE) {
//     config.plugins.push(new UglifyJSPlugin());
// }

if (!BUILD_MODE) {
    config.entry.getcookie = './app/scripts/lib/getcookie.local.js';
}

module.exports = config;