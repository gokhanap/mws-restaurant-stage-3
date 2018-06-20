const path = require('path'),
      webpack = require('webpack'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin'),
      UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// const extractPlugin = new ExtractTextPlugin('./assets/css/styles.css');

const config = {

  // absolute path for project root with the 'src' folder
  context: path.resolve(__dirname, 'src'),

  entry: {
    // relative path declaration
    // app: './app.js'
    main: './assets/js/main.js',
    restaurant: './assets/js/restaurant_info.js'
  },

  output: {
    // absolute path declaration
    path: path.resolve(__dirname, 'dist'),
    filename: './assets/js/[name].bundle.js'
  },

  module: {
    rules: [

      // babel-loader with 'env' preset
      { test: /\.js$/, include: /src/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ['env'] } } },
      // html-loader
      { test: /\.html$/, use: ['html-loader'] },
      // sass-loader with sourceMap activated
      // {
      //   test: /\.scss$/,
        // include: [path.resolve(__dirname, 'src', 'assets', 'scss')],
        // use: extractPlugin.extract({
        //   use: [
        //     {
        //       loader: 'css-loader',
        //       options: {
        //         sourceMap: true
        //       }
        //     },
        //     {
        //       loader: 'sass-loader',
        //       options: {
        //         sourceMap: true
        //       }
        //     }
        //   ],
        //   fallback: 'style-loader'
        // })
      // },
      // css-loader 
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },

      // file-loader(for images)
      { test: /\.(jpg|png|gif|svg)$/, use: [ { loader: 'file-loader', options: { name: '[name].[ext]', outputPath: './assets/media/' } } ] },
      // file-loader(for fonts)
      // { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] }

    ]
  },

  plugins: [
    // cleaning up only 'dist' folder
    new CleanWebpackPlugin(['dist']),
  //   new HtmlWebpackPlugin({
  //   chunks: ['main'],
  //   filename: 'index.html',
  //   template: 'index.html'
  // }),
  // new HtmlWebpackPlugin({
  //   chunks: ['restaurant'],
  //   filename: 'restaurant.html',
  //   template: 'restaurant.html'
  //   }),
    // extract-text-webpack-plugin instance
    // extractPlugin,
    // copy images to dist folder
    new CopyWebpackPlugin([
      { from:'assets/media', to:'assets/media' },
      { from:'sw.js', to:'sw.js' },
      { from:'manifest.json', to:'manifest.json' },
      { from:'index.html', to:'index.html' },
      { from:'restaurant.html', to:'restaurant.html' }
    ]),
    new UglifyJsPlugin()
  ],

  
  // devServer: {
  //   // static files served from here
  //   contentBase: path.resolve(__dirname, "./dist/assets/media"),
  //   compress: true,
  //   // open app in localhost:2000
  //   port: 2000,
  //   stats: 'errors-only',
  //   open: true
  // },

  devtool: 'eval'

};

module.exports = config;