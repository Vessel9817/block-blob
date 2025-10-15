import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'node:path';
import webpack, { ProgressPlugin } from 'webpack';

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = "dist";

const config: webpack.Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        // Content script
        content: {
            import: path.join(PROJECT_ROOT, 'src', 'content.ts')
        },

        // Used for debugging purposes 
        test: {
            import: path.join(PROJECT_ROOT, 'test', 'contentTest.ts')
        }
    },
    output: {
        // Extra clarification that paths change on build
        filename: '[name].bundle.js',
        path: path.join(PROJECT_ROOT, OUTPUT_DIR),
        clean: true,
        publicPath: '/'
    },
    resolve: {
        extensions: [
            '.ts', // TS must come before JS
            '.cjs',
            '.mjs', // CJS/MJS before JS
            '.js'
        ]
    },
    module: {
        rules: [
            // TS/TSX (must come before JS/JSX)
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            },

            // JS/JSX
            {
                test: /\.(cjs|mjs|js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'source-map-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        // Cleaning the build directory
        new CleanWebpackPlugin({
            verbose: false,
            protectWebpackAssets: false
        }),
        new ProgressPlugin(),

        // assert depends on process
        // https://github.com/browserify/commonjs-assert/issues/55#issuecomment-996543717
        new webpack.ProvidePlugin({
            process: 'process/browser'
        }),
        
        // Copying files
        new CopyWebpackPlugin({
            patterns: ['manifest.json', 'LICENSE']
        })
    ],
    infrastructureLogging: {
        level: 'info'
    }
};

export default config;
