/* global module, __dirname */

// -- modules
var fs = require("fs");
var path = require("path");
var webpack = require("webpack");
var header = require("string-template");
var glob = require("glob");

// -- plugins
var DefineWebpackPlugin = webpack.DefinePlugin;
var ExtractTextWebPackPlugin = require("extract-text-webpack-plugin");
var BannerWebPackPlugin = webpack.BannerPlugin;
var UglifyJsWebPackPlugin = require("uglifyjs-webpack-plugin");
// var UglifyJsWebPackPlugin = webpack.optimize.UglifyJsPlugin;
var ReplaceWebpackPlugin = require("replace-bundle-webpack-plugin");
var JsDocWebPackPlugin = require("jsdoc-webpack-plugin");
var HandlebarsPlugin = require("./scripts/webpackPlugins/handlebars-plugin");
var HandlebarsLayoutPlugin = require("handlebars-layouts");
var CopyWebpackPlugin = require("copy-webpack-plugin");

// -- performances
var SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
var smp = new SpeedMeasurePlugin();

// -- variables
var pkg = require(path.join(__dirname, "package.json"));

module.exports = env => {
    // environnement d'execution
    var production = (env) ? env.production : false;
    var development = (env) ? env.development : false;

    var _mode = (production) ? "" : (development) ? "-map" : "-src";

    return smp.wrap({
        // attention : importance de l'ordre des css pour que la surcharge se fasse correctement
        entry : [
            path.join(__dirname, "node_modules", "ol", "ol.css"),
            path.join(__dirname, "node_modules", "geoportal-extensions-openlayers", "dist", "GpPluginOpenLayers-src.css"),
            path.join(__dirname, "src", "SDK2D")
        ],
        output : {
            path : path.join(__dirname, "dist", "2d"),
            filename : "GpSDK2D" + _mode + ".js",
            library : "Gp",
            libraryTarget : "umd",
            umdNamedDefine : true
        },
        resolve : {
            alias : {
                // "geoportal-extensions-openlayers" : auto (npm)
                // "ol-mapbox-style" : auto (npm)
                // "ol" : auto (npm)
                //        path.join(__dirname, "lib", "openlayers", "ol"),
                "ol-dist" : path.join(__dirname, "lib", "openlayers", "index.js")
            }
        },
        externals : {
            request : {
                commonjs2 : "request",
                commonjs : "request",
                amd : "require"
            },
            xmldom : {
                commonjs2 : "xmldom",
                commonjs : "xmldom",
                amd : "require"
            }
        },
        devtool : (development) ? "eval-source-map" : false,
        module : {
            rules : [
                {
                    test : /\.js$/,
                    include : [
                        path.join(__dirname, "src")
                    ],
                    // exclude : [/node_modules/],
                    use : {
                        loader : "babel-loader",
                        options : {
                            presets : ["env"]
                        }
                    }
                },
                {
                    test : /\.js$/,
                    enforce : "pre",
                    include : [
                        path.join(__dirname, "src")
                    ],
                    exclude : [
                        /node_modules/,
                        path.resolve(__dirname, "lib"),
                        path.resolve(__dirname, "src", "Map.js")
                    ],
                    use : [
                        {
                            loader : "eslint-loader",
                            options : {
                                emitWarning : true
                            }
                        }
                    ]
                },
                {
                    /** openlayers est exposé en global : ol ! */
                    test : path.resolve(__dirname, "lib", "openlayers", "index.js"),
                    use : [{
                        loader : "expose-loader",
                        options : "ol"
                    }]
                },
                {
                    /** ol-mapbox-style est exposé en global : olms !
                    * (require.resolve("ol-mapbox-style"))
                    */
                    test : /node_modules\/ol-mapbox-style\/index\.js$/,
                    use : [{
                        loader : "expose-loader",
                        options : "olms"
                    }]
                },
                {
                    test : /\.css$/,
                    // exclude : [/node_modules/],
                    include : [
                        path.join(__dirname, "node_modules", "ol"),
                        path.join(__dirname, "node_modules", "geoportal-extensions-openlayers", "dist"),
                        path.join(__dirname, "res", "OpenLayers")
                    ],
                    use : ExtractTextWebPackPlugin.extract({
                        fallback : {
                            loader : "style-loader",
                            options : {
                                sourceMap : false
                            }
                        },
                        use : {
                            loader : "css-loader",
                            options : {
                                sourceMap : true, // FIXME ?
                                minimize : (production) ? true : false
                            }
                        }
                    })
                }
            ]
        },
        plugins : [
            /** REPLACEMENT DE VALEURS */
            new ReplaceWebpackPlugin(
                [
                    {
                        partten : /__DATE__/g,
                        /** replacement de la clef __DATE__ par la date du build */
                        replacement : function () {
                            return pkg.date;
                        }
                    }
                ]
            ),
            /** GESTION DU LOGGER */
            new DefineWebpackPlugin({
                __PRODUCTION__ : JSON.stringify(production),
                __SWITCH2D3D_ALLOWED__ : JSON.stringify(false)
            }),
            /** GENERATION DE LA JSDOC */
            new JsDocWebPackPlugin({
                conf : path.join(__dirname, "doc/jsdoc.json")
            }),
            /* COPIE DES RESSOURCES IMAGES JSDOC */
            new CopyWebpackPlugin([
                {
                    from : path.join(__dirname, "doc", "images", "**/*"),
                    to : path.join(__dirname, "jsdoc", "images"),
                    context : path.join(__dirname, "doc", "images")
                }
            ]),
            /** CSS / IMAGES */
            new ExtractTextWebPackPlugin("GpSDK2D" + _mode + ".css"),
            /** HANDLEBARS TEMPLATES */
            new HandlebarsPlugin(
                {
                    entry : {
                        path : path.join(__dirname, "samples-src", "pages", "2d"),
                        pattern : "**/*-bundle.html"
                    },
                    output : {
                        path : path.join(__dirname, "samples", "2d"),
                        flatten : false,
                        filename : "[name]" + _mode + ".html"
                    },
                    helpers : [
                        HandlebarsLayoutPlugin
                    ],
                    partials : [
                        path.join(__dirname, "samples-src", "templates", "2d", "*.hbs"),
                        path.join(__dirname, "samples-src", "templates", "partials", "*.hbs"),
                        path.join(__dirname, "samples-src", "templates", "partials", "2d", "*.hbs")
                    ],
                    context : [
                        path.join(__dirname, "samples-src", "config-2d.json"),
                        {
                            mode : _mode
                        }
                    ]
                }
            ),
            /** TEMPLATES INDEX */
            new HandlebarsPlugin(
                {
                    entry : path.join(__dirname, "samples-src", "pages", "index-2d.html"),
                    output : {
                        path : path.join(__dirname, "samples"),
                        filename : "[name]" + _mode + ".html"
                    },
                    context : {
                        samples : () => {
                            var root = path.join(__dirname, "samples-src", "pages", "2d");
                            var list = glob.sync(path.join(root, "**", "*-bundle.html"));
                            list = list.map(function (filePath) {
                                var relativePath = path.relative(root, filePath);
                                var label = relativePath.replace("/", " -- ");
                                var pathObj = path.parse(relativePath);
                                return {
                                    filePath : path.join("2d", pathObj.dir, pathObj.name.concat(_mode).concat(pathObj.ext)),
                                    label : label
                                };
                            });
                            return list;
                        }
                    }
                }
            ),
            /* RESOURCES COPY FOR SAMPLES */
            new CopyWebpackPlugin([
                {
                    from : path.join(__dirname, "samples-src", "resources", "**/*"),
                    to : path.join(__dirname, "samples", "resources"),
                    context : path.join(__dirname, "samples-src", "resources")
                }
            ])
        ]
        /** MINIFICATION */
        .concat(
            (production) ? [
                new UglifyJsWebPackPlugin({
                    uglifyOptions : {
                        output : {
                            comments : false,
                            beautify : false
                        },
                        mangle : true,
                        warnings : false,
                        compress : false
                    }
                })] : []
        )
        /** AJOUT DES LICENCES */
        .concat([
            new BannerWebPackPlugin({
                banner : fs.readFileSync(path.join(__dirname, "licences", "licence-proj4js.txt"), "utf8"),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : fs.readFileSync(path.join(__dirname, "licences", "licence-es6promise.txt"), "utf8"),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : fs.readFileSync(path.join(__dirname, "licences", "licence-sortable.txt"), "utf8"),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : header(fs.readFileSync(path.join(__dirname, "licences", "licence-openlayers.tmpl"), "utf8"), {
                    __VERSION__ : pkg.dependencies.ol,
                }),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : header(fs.readFileSync(path.join(__dirname, "licences", "licence-olms.tmpl"), "utf8"), {
                    __VERSION__ : pkg.dependencies["ol-mapbox-style"],
                }),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : header(fs.readFileSync(path.join(__dirname, "licences", "licence-geoportal-extensions.tmpl"), "utf8"), {
                    __NAME__ : "geoportal-extensions-openlayers",
                    __VERSION__ : pkg.dependencies["geoportal-extensions-openlayers"],
                }),
                raw : true
            }),
            new BannerWebPackPlugin({
                banner : header(fs.readFileSync(path.join(__dirname, "licences", "licence-ign.tmpl"), "utf8"), {
                    __BRIEF__ : pkg.description,
                    __VERSION__ : pkg.SDK2DVersion,
                    __DATE__ : pkg.date
                }),
                raw : true,
                entryOnly : true
            })
        ])
    });
};
