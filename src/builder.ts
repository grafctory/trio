/*
 * Copyright © 2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Builders for RDF graphs.
 *
 * Provides declarative combinators that map domain resources to the RDF {@link Graph | graphs} representing them.
 *
 * **Types**
 *
 * - {@link Mapper} — maps a domain value to its RDF rendering
 *
 * **Combinators**
 *
 * - {@link resource} — builds a resource graph anchored at a chosen subject, threading it into a builder callback and
 *   checking every built statement hangs off it
 * - {@link description} — builds a resource description by concatenating per-property graphs
 * - {@link property} — links subjects to objects under a predicate, taking objects either as ready
 *   {@link Term | terms} or as values run through a {@link Mapper} and embedded at their own root
 *
 * **Term encoders**
 *
 * - {@link link} — encodes IRIs as named-resource terms
 * - {@link data} — encodes scalars as datatype-typed literals
 * - {@link text} — encodes a language map as language-tagged or plain literals
 * - {@link term} — applies a per-value encoder across a {@link Some} input, one term per value
 *
 * **Usage**
 *
 * Every combinator returns a {@link Graph}, so a resource and its embedded sub-resources assemble as one nested
 * expression:
 *
 * ```ts
 * const ex = createNamespace("https://example.org/");
 *
 * function encodeVendor(vendor: Vendor): Graph {
 *     return resource(named(vendor.id), id => description(            // anchored at the vendor's own IRI
 *         property(id, rdf.type, link(vendor.types)),                 // typing statements
 *         property(id, ex.name, text(vendor.name)),                   // language map to tagged/plain literals
 *         property(id, ex.founded, data(vendor.founded, xsd.gYear)),  // scalar to a datatype-typed literal
 *         property(id, ex.address, vendor.address, encodeAddress),    // embed a sub-resource at its own root
 *         property(link(vendor.products), ex.vendor, id)              // inverse: each product links back to it
 *     ));
 * }
 *
 * function encodeAddress(address: Address): Graph {
 *     return resource(blank(), anchor => description(                 // self-anchored at a fresh blank node
 *         property(anchor, ex.street, data(address.street)),
 *         property(anchor, ex.city, data(address.city))
 *     ));
 * }
 * ```
 *
 * @module
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/ RDF 1.1 Concepts}
 */

import { error, isString, type Scalar } from "@metreeca/core";
import { some, type Some } from "@metreeca/core/arrays";
import { type Tag } from "@metreeca/core/language";
import { type IRI } from "@metreeca/core/resource";
import {
	type Blank,
	blank,
	type Graph,
	type Named,
	named,
	type Tagged,
	tagged,
	type Term,
	type Typed,
	typed
} from "./index.js";


/**
 * Maps a domain value to its RDF rendering: either a single {@link Term} or a whole {@link Graph}.
 *
 * How each rendering is consumed is the caller's concern: {@link property} takes a {@link Term} as a direct triple
 * object and a {@link Graph} as a sub-resource linked at its own root. A mapper is otherwise a plain value-to-graph
 * function, free to mint its own blank-node anchors and never handed one by the caller.
 *
 * @typeParam T - The domain value being mapped
 */
export type Mapper<T> = (value: T) => Term | Graph;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Builds a resource graph anchored at a chosen subject.
 *
 * Passes `subject` to `builder`, boxing a bare IRI through {@link named} first, and returns the {@link Graph} it
 * produces, checked to hang off that subject. The subject is the caller's to choose: a {@link Named | named resource}
 * for an identified one, or a {@link blank | blank node} for an anonymous embedded one. An empty built graph is a
 * no-op, returned as it is: a resource whose properties are all absent contributes no statements and has nothing to
 * anchor.
 *
 * > [!IMPORTANT]
 * > Every triple of a non-empty built graph must be reachable from `subject`, walking statements in either direction
 * > through their resource positions: an inverse statement pointing back at the subject keeps its own subtree
 * > anchored just as a direct one does. Literals carry no identity and are never walked through, so triples sharing
 * > a literal value stay unconnected. The two ways a graph fails to hang off `subject` are reported apart rather than
 * > returned half-anchored:
 * >
 * > - **missing** — no triple names `subject`, in either position, the typical mark of a builder ignoring the subject
 * >   threaded into it;
 * > - **detached** — some triples name `subject`, but others are stranded out of its reach (reported as disjoint).
 *
 * @param subject - The subject the built properties hang off, as a ready {@link Blank | blank node} or
 * 		{@link Named | named resource}, or the IRI standing for a named one
 * @param builder - Builds the resource graph anchored at `subject`
 *
 * @returns The assembled resource graph
 *
 * @throws RangeError if `subject` is a relative or otherwise malformed IRI, or if the built graph is non-empty and
 * 		either leaves `subject` unmentioned or strands triples away from it
 */
export function resource(subject: IRI | Blank | Named, builder: (subject: Blank | Named) => Graph): Graph {

	const root = isString(subject) ? named(subject) : subject;
	const graph = builder(root);

	return graph.length === 0 ? graph
		: !mentions(graph, root) ? error(new RangeError(`missing subject <${key(root)}> in resource graph`))
			: !connected(graph, root) ? error(new RangeError(`disjoint resource graph detached from <${key(root)}>`))
				: graph;

}

/**
 * Builds a resource description by concatenating property {@link Graph | graphs} into one flat graph.
 *
 * @param properties - The property graphs to merge
 *
 * @returns The concatenated graph
 */
export function description(...properties: readonly Graph[]): Graph {

	return properties.flat();

}

/**
 * Builds direct triples linking each subject to each object term.
 *
 * Every subject/object pair yields one direct triple, the object taken as an RDF {@link Term}. The predicate, and any
 * object supplied as a bare IRI, are boxed through {@link named}.
 *
 * @param subject - The subject(s) the statements hang off
 * @param predicate - The predicate IRI shared by every emitted statement
 * @param objects - The RDF {@link Term | term} object(s), or the IRIs standing for named ones
 *
 * @returns The graph of direct statements
 *
 * @throws RangeError if `predicate`, or an object supplied as a bare IRI, is relative or otherwise malformed
 */
export function property(subject: Some<Blank | Named>, predicate: IRI, objects: Some<IRI | Term>): Graph;

/**
 * Builds triples by {@link Mapper | mapping} each object, embedding sub-graphs at their root.
 *
 * Each object is run through `mapper`: a {@link Term} result becomes a direct triple object, while a {@link Graph}
 * result is embedded as a sub-resource and linked at its own root. That root is derived structurally rather than
 * supplied: the single source-only subject the encoded graph hangs off, letting encoders self-root their output at a
 * fresh blank node and freeing callers from threading anchors. An empty encoded graph contributes no triples.
 *
 * > [!IMPORTANT]
 * > A {@link Graph} returned by `mapper` must hang off a single root: exactly one subject is source-only, never
 * > appearing in object position, and every triple is reachable from it. Reachability is all that is asked for, not a
 * > tree shape: branches merging back into a shared node link like any other. Inverse statements are welcome deeper
 * > inside the graph but must not point back at its root, which any incoming statement disqualifies, leaving the graph
 * > rooted elsewhere or not at all. The shapes leaving no such root throw rather than being silently mislinked:
 * >
 * > - **cyclic** — every subject appears in object position, leaving no source-only one (reported as a missing root);
 * > - **multi-rooted** — independent components each contribute a source-only subject (reported as disjoint);
 * > - **detached** — a single root is left, but cyclic components strand triples out of its reach (reported as
 * >   disjoint).
 *
 * @typeParam V - The domain value type accepted by `mapper`
 *
 * @param subject - The subject(s) the statements hang off
 * @param predicate - The predicate IRI shared by every emitted statement
 * @param objects - The object value(s) passed to `mapper`
 * @param mapper - Maps each object to a term or an embedded graph
 *
 * @returns The graph of emitted statements, including any embedded sub-resources
 *
 * @throws RangeError On an encoded graph not hanging off a single root subject, whether cyclic, multi-rooted or
 *     detached
 */
export function property<V>(subject: Some<Blank | Named>, predicate: IRI, objects: Some<V>, mapper: Mapper<V>): Graph;

/**
 * Builds direct triples, or {@link Mapper | maps} each object and embeds sub-graphs at their root.
 */
export function property<V>(subject: Some<Blank | Named>, predicate: IRI, objects: Some<V>, mapper?: Mapper<V>): Graph {

	if ( mapper ) {

		return some(objects).flatMap(object => {

			const rdf = mapper(object);

			return isTerm(rdf) ? property(subject, predicate, rdf)
				: rdf.length > 0 ? description(property(subject, predicate, anchor(rdf)), rdf)
					: [];

		});

	} else { // ;(cast) the non-embedded overload accepts only Some<IRI | Term>

		return some(subject).flatMap(subject => some(objects).map(object =>
			[subject, named(predicate), isString(object) ? named(object) : object as Term]
		));

	}

}


/**
 * Encodes IRIs as {@link Named | named resource} terms.
 *
 * @param link - The IRI(s) to encode
 *
 * @returns The encoded named-resource terms
 *
 * @throws RangeError On a relative or otherwise malformed IRI
 */
export function link(link: Some<IRI>): readonly Named[] {

	return term(link, named);

}

/**
 * Encodes scalars as datatype-{@link Typed | typed} literals.
 *
 * @param data - The scalar value(s) to encode, stringified to their lexical form
 * @param datatype - The IRI of the literal datatype; omitted for plain `xsd:string` literals
 *
 * @returns The encoded typed literals
 *
 * @throws RangeError On a lexical form holding an isolated UTF-16 surrogate code point, or on a relative or otherwise
 *     malformed datatype IRI
 */
export function data(data: Some<Scalar>, datatype?: IRI): readonly Typed[] {

	return term(data, data => typed(String(data), datatype));

}

/**
 * Encodes a language map as language-tagged or plain literals.
 *
 * > [!IMPORTANT]
 * > By convention the `und` (undetermined) tag yields a plain {@link Typed} literal; every other tag yields a
 * > language-{@link Tagged} literal.
 *
 * @param text - The tag-to-content map(s) to encode
 *
 * @returns The encoded tagged and plain literals
 *
 * @throws RangeError On a content string holding an isolated UTF-16 surrogate code point, or on a key that is not a
 *     well-formed BCP 47 language tag
 */
export function text(text: Some<{ [tag: Tag]: Some<string> }>): readonly (Tagged | Typed)[] {

	return some(text).flatMap(text => Object.entries(text).flatMap(([tag, content]) =>
		some(content).map(value => tag === "und" ? typed(value) : tagged(value, tag))
	));

}

/**
 * Maps each value of a {@link Some} input through an encoder into RDF terms.
 *
 * The shared spine of {@link link} and {@link data}: normalises the input to an array and applies `encoder`
 * elementwise.
 *
 * @typeParam V - The source value type
 * @typeParam T - The {@link Term} subtype produced by `encoder`
 *
 * @param source - The source value(s) to encode
 * @param encoder - Maps a single source value to a term
 *
 * @returns The encoded terms, one per source value
 */
export function term<V, T extends Term>(source: Some<V>, encoder: (value: V) => T): readonly T[] {

	return some(source).map(encoder);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Tests whether a {@link Mapper} result is a single {@link Term} rather than a {@link Graph}.
 *
 * Discriminates on array-ness, the sole structural difference: a graph is an array of triples, every term form is not.
 */
function isTerm(value: Term | Graph): value is Term {

	return !Array.isArray(value);

}

/**
 * Finds the root subject an embedded graph hangs off: the single subject that never appears in object position.
 *
 * Collects every subject that is not also used as an object, a well-formed graph leaving exactly one, then checks the
 * whole graph to be {@link connected} to that root. The {@link property} encoded overload documents the single-root
 * constraint and its cyclic, multi-rooted and detached failure modes.
 *
 * @param graph - The non-empty embedded graph to root
 *
 * @returns The graph's unique root subject
 *
 * @throws RangeError On a graph not hanging off a single root subject, whether cyclic, multi-rooted or detached
 */
function anchor(graph: Graph): Blank | Named {

	const objects = new Set(graph.map(([, , object]) => key(object)));
	const subjects = new Map(graph.map(([subject]) => [key(subject), subject]));

	const roots = [...subjects.values()].filter(subject => !objects.has(key(subject)));

	const [root, ...rest] = roots;

	if ( root === undefined ) {
		throw new RangeError(`missing root in cyclic embedded graph`);
	}

	if ( rest.length > 0 ) {
		throw new RangeError(`disjoint embedded graph with multiple roots [${roots.map(key).join(", ")}]`);
	}

	if ( !connected(graph, root) ) {
		throw new RangeError(`disjoint embedded graph detached from root <${key(root)}>`);
	}

	return root;
}

/**
 * Tests whether a graph mentions a resource at all, in either subject or object position.
 *
 * Separates the two ways a graph can fail to hang off a root: one that never names it at all, typically a builder
 * ignoring the subject threaded into it, and one that names it but strands triples away from it, reported by
 * {@link connected}.
 *
 * @param graph - The graph to test
 * @param root - The resource to look for
 *
 * @returns true if some triple of `graph` carries `root` as its subject or object; false otherwise
 */
function mentions(graph: Graph, root: Blank | Named): boolean {

	return graph.some(([subject, , object]) => key(subject) === key(root) || key(object) === key(root));

}

/**
 * Tests whether every triple of a graph hangs off a root resource.
 *
 * Grows the set of resources reached from `root` until it stops growing, walking statements in either direction: a
 * triple joins its subject to its object whenever the object is itself a resource, so an inverse statement anchors its
 * subject just as a direct one anchors its object. Literals are left out of the walk, being leaves that carry no
 * identity: two subjects stating the same literal value stay disjoint. A graph is connected when every triple has its
 * subject among the reached resources, the empty graph vacuously so.
 *
 * @param graph - The graph to test
 * @param root - The resource the graph is expected to hang off
 *
 * @returns true if every triple of `graph` is reachable from `root`; false otherwise
 */
function connected(graph: Graph, root: Blank | Named): boolean {

	const links = graph.filter(([, , object]) => object.kind === "blank" || object.kind === "named");

	const reached = expand(new Set([key(root)]));

	return graph.every(([subject]) => reached.has(key(subject)));


	function expand(seeds: ReadonlySet<string>): ReadonlySet<string> {

		const grown = new Set([...seeds, ...links.flatMap(([subject, , object]) =>
			seeds.has(key(subject)) ? [key(object)]
				: seeds.has(key(object)) ? [key(subject)]
					: []
		)]);

		return grown.size === seeds.size ? seeds : expand(grown);

	}

}

/**
 * Computes the key identifying a {@link Term} within a graph.
 *
 * Renders the term into the token standing for it, so graph positions are matched by value: terms are boxed records,
 * and two occurrences of one node are equal without being the same reference.
 *
 * @param term - The term to key
 *
 * @returns The key identifying `term`
 */
function key(term: Term): string {

	return term.kind === "blank" ? `_:${term.label}`
		: term.kind === "named" ? term.iri
			: term.kind === "tagged" ? `"${term.text}"@${term.language}`
				: `"${term.text}"^^${term.datatype}`;

}
