# block-blob

[MIT License][license-badge]
[![CI][ci-badge]][ci-workflow]

## About

Inspired by [NoScript](https://github.com/hackademix/noscript),
this extension blocks the `blob:` protocol by overriding `URL.createObjectURL`
to create fake `blob:` URIs that result in failed fetches.
This extension is intended for developer use only.

## Builds

### Installing

- Install `npm`
- In the project root, run `npm ci`

### Running

- In the project root, run `npm start`

[license-badge]: https://raw.githubusercontent.com/Vessel9817/source-inspector/refs/heads/main/license.svg
[ci-badge]: https://github.com/Vessel9817/block-blob/actions/workflows/ci.yml/badge.svg
[ci-workflow]: https://github.com/Vessel9817/block-blob/actions/workflows/ci.yml
