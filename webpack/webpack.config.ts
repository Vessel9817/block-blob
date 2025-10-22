import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

process.env.NODE_ENV = 'development';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = "dist";

const config: webpack.Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        // Background script
        background: {
            import: path.join(PROJECT_ROOT, 'src', 'background.ts')
        },

        // Content script used for testing
        test: {
            import: path.join(PROJECT_ROOT, 'test', 'index.ts')
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
        new webpack.ProgressPlugin(),

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
