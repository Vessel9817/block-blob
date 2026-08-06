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
        publicPath: '/',
        iife: true
    },
    resolve: {
        extensions: [
            '.mts', // CTS/MTS before TS
            '.ts', // TS must come before JS
            '.mjs', // CJS/MJS before JS
            '.js'
        ]
    },
    module: {
        rules: [
            // TS/TSX (must come before JS/JSX)
            {
                test: /\.(mts|ts|tsx)$/,
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
                test: /\.(mjs|js|jsx)$/,
                exclude: /node_modules/,
                type: 'javascript/esm',
                use: [
                    {
                        loader: 'source-map-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),

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
