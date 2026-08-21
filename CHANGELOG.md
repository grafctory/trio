# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unpublished](https://github.com/metreeca/trio/commits/HEAD)

### Added

- `@metreeca/trio` RDF data model, exposing the `Graph`, `Triple`, `Term`, `Blank`, `Named`, `Tagged` and `Typed`
  types, the `graph`, `triple`, `blank`, `named`, `tagged` and `typed` factories, the `skolemize` utility, and the
  `rdf` and `rdfs` vocabulary namespaces
- `@metreeca/trio/builder` module of declarative combinators for assembling RDF graphs from domain objects, exposing
  the `Mapper` type, the `resource`, `description` and `property` combinators, and the `link`, `data`, `text` and
  `term` encoders
- `@metreeca/trio/ntriples` module codec for the N-Triples serialisation, exposing the `NTriples` media type and the
  `decodeNTriples` and `encodeNTriples` functions
