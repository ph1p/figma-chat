const webpack = require('webpack');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CreateFileWebpack = require('create-file-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { ESBuildPlugin } = require('esbuild-loader');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const { figmaPlugin } = require('./package.json');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2016,
          compress: {
            arguments: true,
            drop_console: true,
          },
        },
      }),
    ],
  },
  entry: {
    ui: './src/Ui.tsx',
    code: './src/main/index.ts',
  },
  watchOptions: {
    ignored: ['node_modules/**'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx', // Or 'ts' if you don't need tsx
          target: 'es2015',
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|webp|svg|zip|mp3)$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mp3'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      string_decoder: false,
      events: false,
    },
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, figmaPlugin.name),
  },
  plugins: [
    // argv.mode !== 'production' ? new BundleAnalyzerPlugin() : null,
    // new webpack.ProvidePlugin({
    //   Buffer: ['buffer', 'Buffer'],
    // }),
    new webpack.DefinePlugin({
      process: {
        env: {
          REACT_APP_SC_ATTR: JSON.stringify('data-styled-figma-chat'),
          SC_ATTR: JSON.stringify('data-styled-figma-chat'),
          REACT_APP_SC_DISABLE_SPEEDY: JSON.stringify('false'),
        },
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
      inject: false,
      templateContent: ({ compilation, htmlWebpackPlugin }) => `
        <html>
          <body>
          <div id="app"></div>
          ${htmlWebpackPlugin.files.js.map(
            (jsFile) =>
              `<script>${compilation.assets[
                jsFile.substr(htmlWebpackPlugin.files.publicPath.length)
              ].source()}</script>`
          )}
          </body>
        </html>
      `,
    }),
    new CreateFileWebpack({
      path: path.resolve(__dirname, figmaPlugin.name),
      fileName: 'manifest.json',
      content: JSON.stringify(figmaPlugin),
    }),
  ].filter(Boolean),
});
