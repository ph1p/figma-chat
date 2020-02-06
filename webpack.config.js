const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CreateFileWebpack = require('create-file-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const { figmaPlugin } = require('./package.json');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  entry: {
    ui: './src/Ui.tsx',
    code: './src/code.ts'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        loader: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
      },
      {
        test: /\.(png|jpg|gif|webp|svg|zip)$/,
        loader: [{ loader: 'url-loader' }]
      }
    ]
  },
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, figmaPlugin.name)
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui']
    }),
    new CreateFileWebpack({
      path: path.resolve(__dirname, figmaPlugin.name),
      fileName: 'manifest.json',
      content: JSON.stringify(figmaPlugin)
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
});
