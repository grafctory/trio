# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/trio/compare/v0.1.3...HEAD)

## [0.1.3](https://github.com/metreeca/trio/compare/v0.1.2...v0.1.3) - 2026-10-14

### Changed

- Upgrade `@metreeca/core` to `^0.12.1`
- Published exports declare the `@metreeca/source` condition, resolving each entry point to its TypeScript source in
  checkouts linked for local development, while registry consumers keep resolving to the compiled `dist` modules

## [0.1.2](https://github.com/metreeca/trio/compare/v0.1.1...v0.1.2) - 2026-10-01

### Changed

- Realign to the renamed `@metreeca/core` values module, raising the minimum supported version to `0.12.0`: `immutable`
  is imported from `@metreeca/core/values` in place of `@metreeca/core/structures`
- Raise the minimum supported Node.js version to `22.22.0`

## [0.1.1](https://github.com/metreeca/trio/releases/tag/v0.1.1) - 2026-09-09

### Added

- `@metreeca/trio` RDF data model, exposing the `Graph`, `Triple`, `Term`, `Blank`, `Named`, `Tagged` and `Typed`
  types, the `graph`, `triple`, `blank`, `named`, `tagged` and `typed` factories, the `lexical` and `skolemize`
  utilities, and the `rdf` and `rdfs` vocabulary namespaces
- `@metreeca/trio/builder` module of declarative combinators for assembling RDF graphs from domain objects, exposing
  the `Mapper` type, the `resource`, `description` and `property` combinators, and the `link`, `data`, `text` and
  `term` encoders
- `@metreeca/trio/ntriples` module codec for the N-Triples serialisation, exposing the `NTriples` media type and the
  `decodeNTriples` and `encodeNTriples` functions
