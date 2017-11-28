/**
 * Created by junhui on 2017/3/7.
 *  配置打包文件
 */
var webpack = require('webpack');
//var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.app');
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CompressionWebpackPlugin = require('compression-webpack-plugin');
// 一个用于生成HTML文件并自动注入依赖文件（link/script）的webpack插件
var HtmlWebpackPlugin = require('html-webpack-plugin');
//分析 Webpack 生成的包体组成并且以可视化的方式反馈给开发者
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    //插件项
    plugins: [
        //commonsPlugin,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new OpenBrowserPlugin({ url: 'http://localhost:7777' }),
        // new BundleAnalyzerPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            //加入了这个插件之后，编译的速度会明显变慢
            //忽略压缩的文件
            // mangle: {
            //     except: ['$super', '$', 'exports', 'require', 'module', '_']
            // },
            beautify: false,// 最紧凑的输出
            comments: false,// 删除所有的注释
            compress: {
                warnings: false ,    //忽略警告,要不然会有一大堆的黄色字体出现……
                drop_console: true,// 删除所有的 `console` 语句 还可以兼容ie浏览器
                collapse_vars: true,// 内嵌定义了但是只用到一次的变量
                reduce_vars: true,// 提取出出现多次但是没有定义成变量去引用的静态值
            },
            // // sourceMap: true,
            output: {
                comments: false,
            }
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html', //以根index.html为模板生成
            inject: 'body', //指定插入js的位置 head/body
        }),
        new webpack.DefinePlugin({  //定义生成环境，不然压缩会警告
            'process.env':{
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new CompressionWebpackPlugin({ //gzip 压缩
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(js|css)$'    //压缩 js 与 css
            ),
            threshold: 10240,
            minRatio: 0.8
        }),
    ],
    //页面入口文件配置
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter',
        'react-router-redux': 'ReactRouterRedux',
        'babel-polyfill': 'window', // polyfill 直接写 {} 也是可以的
        'es5-shim': 'window',
        'whatwg-fetch': 'fetch',
        'console-polyfill': 'console',
        'antd':'antd',
        'amazeui-react':'AMUIReact',
        moment:'moment',
    },
    entry:[
        'webpack/hot/dev-server',
        path.resolve(__dirname,'app/main.js'),
    ],
    //入口文件输出配置
    output:{
        path: path.resolve(__dirname,'./build'),
        filename: 'build.[hash].js',
        // chunkFilename:"[id].chunk.js"
    },
    module: {
        //加载器配置
        loaders: [
            //LESS文件先通过less-load处理成css，然后再通过css-loader加载成css模块，最后由style-loader加载器对其做最后的处理，
            // 从而运行时可以通过style标签将其应用到最终的浏览器环境
            {test: /\.less/,
                loader: 'style-loader!css-loader!less-loader',
                options: {
                    minimize: true
                }},
            //.css 文件使用 style-loader 和 css-loader 来处理
            { test: /\.css$/,
                loader: 'style-loader!css-loader' ,
                options: {
                    minimize: true
                }},
            //.app 文件使用 jsx-loader 来编译处理 jsx-loader可以添加?harmony参数使其支持ES6语法
            { test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query:{//备注：es2015用于支持ES6语法，react用于解决render()报错的问题
                    presets:['es2015','react']
                },
                options: {
                    presets: ["react", "es2015", "stage-0"],
                    plugins: [//mobx的转码插件
                        "transform-decorators-legacy",
                        "transform-class-properties",
                        ['import',{'libraryName':'antd','style':'css'}] //antd按需加载组件和样式
                    ]
                }
            },
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            { test: /\.(png|jpg|jpeg|gif)$/, loader: 'url-loader?limit=8192'},
            // 字体loader
            {
                test: /\.(eot|woff|woff2|ttf|svg)$/,
                loader: 'url-loader?limit=8192',
            }
        ],
        noParse: [pathToReact]
    },
    //其它解决方案配置
    resolve: {
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['', '.js', '.json', '.scss','.jsx','.less'],
        //模块别名定义，方便后续直接引用别名，无须多写长长的地址
        alias: {
            // 'react': pathToReact,
            moment:'moment',
        }
    },
    devServer: {
        inline: true,
        port: 7777,
        host:'0.0.0.0',
        compress: true, //启用 gzip 压缩
	    disableHostCheck: true
    },
};
