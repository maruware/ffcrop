import path from 'path'

/** エディタで補完を効かせるために型定義をインポート */
import { Configuration } from 'webpack'

import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const isDev = process.env.NODE_ENV === 'development'

/** 共通設定 */
const base: Configuration = {
  mode: isDev ? 'development' : 'production',
  // メインプロセスで __dirname でパスを取得できるようにする
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  output: {
    // バンドルファイルの出力先（ここではプロジェクト直下の 'dist' ディレクトリ）
    path: path.resolve(__dirname, 'dist'),
    // webpack@5.x + electron では必須の設定
    publicPath: './',
    filename: '[name].js',
    // 画像などのアセットは 'assets' フォルダへ配置する
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    rules: [
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * node_modules ディレクトリは除外する
         */
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        /** 拡張子 '.css' （正規表現）のファイル */
        test: /\.css$/,
        /** use 配列に指定したローダーは *最後尾から* 順に適用される */
        use: [
          /* セキュリティ対策のため（後述）style-loader は使用しない **/
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: isDev },
          },
        ],
      },
      {
        /** 画像やフォントなどのアセット類 */
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        /** アセット類も同様に asset/inline は使用しない */
        /** なお、webpack@5.x では file-loader or url-loader は不要になった */
        type: 'asset/resource',
      },
    ],
  },
  /**
   * developmentモードではソースマップを付ける
   *
   * レンダラープロセスでは development モード時に
   * ソースマップがないと electron のデベロッパーコンソールに
   * 'Uncaught EvalError' が表示されてしまうことに注意
   */
  devtool: isDev ? 'inline-source-map' : false,
}

// for main
const main: Configuration = {
  // 共通設定の読み込み
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
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: 'web',
  entry: {
    renderer: './src/renderer/index.tsx',
  },
  plugins: [
    /**
     * バンドルしたJSファイルを <script></script> タグとして差し込んだ
     * HTMLファイルを出力するプラグイン
     */
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: !isDev,
      inject: 'body',
      filename: 'index.html',
      scriptLoading: 'blocking',
    }),
    new MiniCssExtractPlugin(),
  ],
}

/**
 * メイン，プリロード，レンダラーそれぞれの設定を
 * 配列に入れてエクスポート
 */
export default [main, preload, renderer]
