# @metreeca/trio

[![npm](https://img.shields.io/npm/v/@metreeca/trio)](https://www.npmjs.com/package/@metreeca/trio)

A lightweight TypeScript library for RDF data modelling, graph assembly and serialisation.

**@metreeca/trio** provides the RDF substrate shared by Metreeca packages: the term and graph data model, declarative
combinators for assembling graphs from domain objects, and codecs for standard RDF serialisations. It is
query-language-agnostic and carries no store or protocol dependencies.

# Installation

```shell
npm install @metreeca/trio
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Core Usage

> [!NOTE]
>
> This section introduces essential concepts and common patterns: see the
> [API reference](https://metreeca.github.io/trio/) for complete coverage.

# Support

- open an [issue](https://github.com/metreeca/trio/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/trio/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/trio?tab=Apache-2.0-1-ov-file) file for details.
