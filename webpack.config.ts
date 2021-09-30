import path from 'path'

import { Configuration } from 'webpack'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const isDev = process.env.NODE_ENV === 'development'

const base: Configuration = {
  mode: isDev ? 'development' : 'production',
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
    filename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  devtool: isDev ? 'inline-source-map' : false,
}

// for main
const main: Configuration = {
  ...base,
  target: 'electron-main',
  entry: {
    main: './src/main/index.ts',
  },
}

// for preload
const preload: Configuration = {
  ...base,
  target: 'electron-preload',
  entry: {
    preload: './src/preload/index.ts',
  },
}

// for renderer
const renderer: Configuration = {
  ...base,
  // no use 'electron-renderer' for security
  target: 'web',
  entry: {
    renderer: './src/renderer/index.tsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: !isDev,
      inject: 'body',
      filename: 'index.html',
      scriptLoading: 'blocking',
    }),
  ],
}

/**
 * メイン，プリロード，レンダラーそれぞれの設定を
 * 配列に入れてエクスポート
 */
export default [main, preload, renderer]
