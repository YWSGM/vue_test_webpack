/**合并基础的webpack配置
 配置样式文件的处理规则，styleLoaders
 配置webpack的输出
 配置webpack插件
 gzip模式下的webpack插件配置
 webpack-bundle分析
 说明： webpack插件里面多了丑化压缩代码以及抽离css文件等插件。
 */
let path = require('path');
let utils = require('./utils');
let webpack = require('webpack');
let config = require('../config');
let merge = require('webpack-merge');
let baseWebpackConfig = require('./webpack.base.conf');
// copy-webpack-plugin，用于将static中的静态文件复制到产品文件夹dist
let CopyWebpackPlugin = require('copy-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
// optimize-css-assets-webpack-plugin，用于优化和最小化css资源
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'),

  env = config.build.env,

  webpackConfig = merge(baseWebpackConfig, {
    module: {
      // 样式文件的处理规则，对css/sass/scss等不同内容使用相应的styleLoaders
      // 由utils配置出各种类型的预处理语言所需要使用的loader，例如sass需要使用sass-loader
      rules: utils.styleLoaders({
        sourceMap: config.build.productionSourceMap,
        extract: true
      })
    },
    // 是否使用source-map
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    // webpack输出路径和命名规则
    output: {
      path: config.build.assetsRoot,
      filename: utils.assetsPath('js/[name].[chunkhash].js'),
      chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },
    // webpack插件
    plugins: [
      // http://vuejs.github.io/vue-loader/en/workflow/production.html
      new webpack.DefinePlugin({
        'process.env': env
      }),
      // 丑化压缩JS代码
      // new webpack.optimize.UglifyJsPlugin({
      //   compress: {
      //     warnings: false
      //   },
      //   sourceMap: true
      // }),
      // extract css into its own file
      // 将css提取到单独的文件
      new ExtractTextPlugin({
        // filename: utils.assetsPath('css/[name].[contenthash].css')
        filename: '[name]_[md5:contenthash:hex:8].css'
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      // 优化、最小化css代码，如果只简单使用extract-text-plugin可能会造成css重复
      // 具体原因可以看npm上面optimize-css-assets-webpack-plugin的介绍
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      // 将产品文件的引用注入到index.html
      new HtmlWebpackPlugin({
        filename: config.build.index,
        template: './public/index.html',
        inject: true,
        minify: {
          // 删除index.html中的注释
          removeComments: true,
          // 删除index.html中的空格
          collapseWhitespace: true,
          // 删除各种html标签属性值的双引号
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        // 注入依赖的时候按照依赖先后顺序进行注入，比如，需要先注入vendor.js，再注入app.js
        chunksSortMode: 'dependency'
      }),
      // keep module.id stable when vender modules does not change
      new webpack.HashedModuleIdsPlugin(),
      // split vendor js into its own file
      // 将所有从node_modules中引入的js提取到vendor.js，即抽取库文件
      // new webpack.optimize.CommonsChunkPlugin({
      //     filename: 'bundle.min.js',
      //     // minChunks: module => module.context && module.context.indexOf("node_modules") !== -1,
      //     name: 'vendor',
      //     minChunks: function (module, count) {
      //         // any required modules inside node_modules are extracted to vendor
      //         return (
      //             module.resource &&
      //             (/\.js$/).test(module.resource) &&
      //             module.resource.indexOf(
      //                 path.join(__dirname, '../node_modules')
      //             ) === 0
      //         );
      //     }
      // }),
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      // 从vendor中提取出manifest，原因如上
      // new webpack.optimize.CommonsChunkPlugin({
      //     name: 'manifest',
      //     chunks: ['vendor']
      // }),
      // copy custom static assets
      // 将static文件夹里面的静态资源复制到dist/static
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, '../static'),
          to: config.build.assetsSubDirectory,
          ignore: ['.*']
        }
      ])
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  });

// 如果开启了产品gzip压缩，则利用插件将构建后的产品文件进行压缩
if (config.build.productionGzip) {
  // 一个用于压缩的webpack插件
  let CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      // 压缩算法
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

// 如果启动了report，则通过插件给出webpack构建打包后的产品文件分析报告
if (config.build.bundleAnalyzerReport) {
  let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
