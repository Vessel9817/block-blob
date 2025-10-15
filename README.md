# block-blob

## About

Inspired by [NoScript](https://github.com/hackademix/noscript),
this extension blocks the `blob:` protocol by overriding `URL.createObjectURL`
to create fake `blob:` URIs that result in failed fetches.
This extension is intended for developer use only.

## Builds

### Installing

- Install `npm`
- In the project root, run `npm i`

### Running

- In the project root, run `npm start`
