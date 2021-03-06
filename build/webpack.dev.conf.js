/**将webpack的热重载客户端代码添加到每个entry对应的应用
    合并基础的webpack配置
    配置样式文件的处理规则，styleLoaders
    配置Source Maps
    配置webpack插件
 */

let utils = require('./utils');
let webpack = require('webpack');
let config = require('../config');
// webpack-merge是一个可以合并数组和对象的插件
let merge = require('webpack-merge');
let baseWebpackConfig = require('./webpack.base.conf');
// html-webpack-plugin用于将webpack编译打包后的产品文件注入到html模板中
// 即自动在index.html里面加上<link>和<script>标签引用webpack打包后的文件
let HtmlWebpackPlugin = require('html-webpack-plugin');
// friendly-errors-webpack-plugin用于更友好地输出webpack的警告、错误等信息
let FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

// add hot-reload related code to entry chunks
// 给每个入口页面(应用)加上dev-client，用于跟dev-server的热重载插件通信，实现热更新
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./dev-client'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
  module: {
    // 样式文件的处理规则，对css/sass/scss等不同内容使用相应的styleLoaders
    // 由utils配置出各种类型的预处理语言所需要使用的loader，例如sass需要使用sass-loader
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  // 使用这种source-map更快
  devtool: '#cheap-module-eval-source-map',
  // webpack插件
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // 开启webpack热更新功能
    new webpack.HotModuleReplacementPlugin(),
    // webpack编译过程中出错的时候跳过报错阶段，不会阻塞编译，在编译结束后报错
    new webpack.NoEmitOnErrorsPlugin(),
    // 自动将依赖注入html模板，并输出最终的html文件到目标文件夹
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
});
