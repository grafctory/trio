# @grafctory/trio

[![npm](https://img.shields.io/npm/v/@grafctory/trio)](https://www.npmjs.com/package/@grafctory/trio)

RDF 1.1 data modelling, graph assembly and serialisation.

**@grafctory/trio** provides an RDF substrate for TypeScript applications, covering the term and graph data model,
declarative combinators for assembling graphs from domain objects, and codecs for standard RDF serialisations. Terms and
graphs are built through validating factories and combinators, so that nothing malformed reaches a serialisation:

- **Checked at Source**: malformed IRIs, blank-node labels, and language tags rejected where the term is built
- **Immutable Records**: terms and statements returned frozen, safe to share across graphs
- **Spec-Verified Codecs**: every codec verified against the W3C RDF 1.1 syntax test suite for its serialisation

# Installation

```shell
npm install @grafctory/trio
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the API reference:
>
> | Module                    | Description                                               |
> |---------------------------|-----------------------------------------------------------|
> | [@grafctory/trio]          | Typings for the RDF 1.1 data model                        |
> | [@grafctory/trio/builder]  | Declarative builders for RDF graphs                       |
> | [@grafctory/trio/ntriples] | N-Triples codec                                           |

[@grafctory/trio]: https://grafctory.github.io/trio/modules/index.html

[@grafctory/trio/builder]: https://grafctory.github.io/trio/modules/builder.html

[@grafctory/trio/ntriples]: https://grafctory.github.io/trio/modules/ntriples.html

## Building Terms

Terms are built through validating factories returning frozen records, statements with `triple` and graphs with `graph`:

```typescript
import { xsd } from "@grafctory/core/datatype";
import { createNamespace } from "@grafctory/core/resource";
import { graph, named, rdf, tagged, triple, typed } from "@grafctory/trio";

const ex = createNamespace("https://example.org/");

const widget = named(ex["products/123"]);

const statements = graph(
	triple(widget, rdf.type, named(ex.Product)),
	triple(widget, named(ex.name), tagged("Widget", "en")),
	triple(widget, named(ex.price), typed(99.99, xsd.decimal))
);
```

Malformed components are rejected where the term is built, rather than escaping into a serialisation: a relative IRI, a
blank-node label outside the intersection of the N-Triples, Turtle and SPARQL 1.1 grammars, a language tag outside BCP
47, or a lexical form holding an isolated UTF-16 surrogate all throw a `RangeError`.

`lexical` reads back the bare string a term carries: the blank-node label, the IRI, or the literal lexical form.

`skolemize` replaces every blank node of a graph with a minted `urn:uuid:` resource, one per label.

## Assembling Graphs

The [@grafctory/trio/builder] module maps domain objects to the graphs representing them: `resource` anchors a
description at a chosen subject, `description` concatenates per-property graphs, and `property` links subjects to
objects, taken either as ready terms or as values run through a mapper and embedded at their own root:

```typescript
import { xsd } from "@grafctory/core/datatype";
import { createNamespace } from "@grafctory/core/resource";
import { blank, type Graph, named, rdf } from "@grafctory/trio";
import { data, description, link, property, resource, text } from "@grafctory/trio/builder";

const ex = createNamespace("https://example.org/");

function encodeVendor(vendor: Vendor): Graph {
	return resource(named(vendor.id), id => description(            // anchored at the vendor's own IRI
		property(id, rdf.type, link(vendor.types)),                 // typing statements
		property(id, ex.name, text(vendor.name)),                   // language map to tagged/plain literals
		property(id, ex.founded, data(vendor.founded, xsd.gYear)),  // scalar to a datatype-typed literal
		property(id, ex.address, vendor.address, encodeAddress),    // embed a sub-resource at its own root
		property(link(vendor.products), ex.vendor, id)              // inverse: each product links back to it
	));
}

function encodeAddress(address: Address): Graph {
	return resource(blank(), anchor => description(                 // self-anchored at a fresh blank node
		property(anchor, ex.street, data(address.street)),
		property(anchor, ex.city, data(address.city))
	));
}
```

Every combinator returns a graph, so a resource and its embedded sub-resources assemble as one nested expression.
`resource` checks that every statement of a non-empty built graph hangs off its subject, walking statements in either
direction, so an inverse statement anchors its own subtree just as a direct one does; an embedded graph must likewise
hang off a single root, never pointed back at from the outside. Graphs failing either check throw a `RangeError`
instead of being silently mislinked.

## Reading and Writing N-Triples

The [@grafctory/trio/ntriples] module decodes and encodes [N-Triples](https://www.w3.org/TR/n-triples/) documents,
alongside the `NTriples` media type for content negotiation:

```typescript
import { decodeNTriples, encodeNTriples, NTriples } from "@grafctory/trio/ntriples";

const document = encodeNTriples(statements);

// <https://example.org/products/123> <https://example.org/name> "Widget"@en .

await fetch(ex["graphs/products"], {
	method: "PUT",
	headers: { "content-type": NTriples },
	body: document
});

const decoded = decodeNTriples(document);
```

Encoding does not validate terms, relying on graphs being assembled through the factories. Decoding renumbers blank-node
labels and throws a `SyntaxError` on a malformed statement; it is verified against the
[W3C RDF 1.1 N-Triples syntax test suite](https://w3c.github.io/rdf-tests/rdf/rdf11/rdf-n-triples/).

# Support

- open an [issue](https://github.com/grafctory/trio/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/grafctory/trio/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/grafctory/trio?tab=Apache-2.0-1-ov-file) file for details.
