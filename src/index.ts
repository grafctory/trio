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
 * RDF 1.1 data model.
 *
 * Defines the terms and statements that make up an RDF graph. Factories build only well-formed terms, rejecting a
 * malformed IRI, blank-node label, language tag or lexical form where the term is created. Utilities read back the
 * lexical form of any term and replace the document-scoped blank nodes of a graph with minted named resources.
 *
 * The standard RDF, RDFS, OWL and SHACL vocabularies are exposed as closed namespaces, so that their terms are referred
 * to by name rather than spelled out as IRIs, with typos caught at compile time.
 *
 * @module index
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/ RDF 1.1 Concepts and Abstract Syntax}
 */

import { error, isNumber, isString, type Scalar } from "@metreeca/core";
import { xsd } from "@metreeca/core/datatype";
import { isTag, type Tag } from "@metreeca/core/language";
import { type IRI, isIRI } from "@metreeca/core/resource";
import { createScope } from "@metreeca/core/scope";
import { isWellFormed } from "@metreeca/core/strings";
import { immutable } from "@metreeca/core/values";
import { BLANK_NODE } from "./index.core.js";


/**
 * Matches a well-formed string blank-node label.
 *
 * Anchors {@link BLANK_NODE} to the whole string, as the label validation performed by {@link blank} requires.
 */
const BlankPattern = new RegExp(`^${BLANK_NODE}$`, "u");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export { rdf } from "./namespaces/rdf.js";
export { rdfs } from "./namespaces/rdfs.js";
export { owl } from "./namespaces/owl.js";
export { shacl } from "./namespaces/shacl.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * An RDF graph, as a flat sequence of {@link Triple | triples}.
 *
 * Carried as a plain array of statements; read as an RDF graph, neither their order nor any repetition is significant.
 * Construct one with {@link graph}.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-graph RDF 1.1 Graphs}
 */
export type Graph =
	readonly Triple[];

/**
 * An RDF triple, as a subject/predicate/object statement.
 *
 * The subject is a {@link Named | named resource} or a {@link Blank | blank node}, the predicate always a named
 * resource, and the object any {@link Term}: a named resource, a blank node, or a language-{@link Tagged | tagged} or
 * datatype-{@link Typed | typed} literal.
 *
 * A typing statement carries the `type` IRI of the {@link rdf} vocabulary namespace in predicate position: the `a`
 * shorthand of the Turtle and SPARQL syntaxes is a serialisation concern, foreign to the data model.
 *
 * Construct one with {@link triple}.
 *
 * > [!NOTE]
 * > A {@link Blank | blank node} carries no stable identity across queries or stores: its label is meaningful only
 * > within the document that introduced it. An anchor that must survive a round-trip is better minted as an opaque
 * > `urn:uuid:` resource with {@link named} than left blank.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-triple RDF 1.1 Triples}
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-subject RDF 1.1 Subject}
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-predicate RDF 1.1 Predicate}
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-object RDF 1.1 Object}
 */
export type Triple =
	readonly [Blank | Named, Named, Term];

/**
 * An RDF term.
 *
 * The tagged union of a {@link Blank | blank node}, a {@link Named | named resource}, a
 * language-{@link Tagged | tagged} literal, and a datatype-{@link Typed | typed} literal: the values admitted in the
 * object position of a {@link Triple}, whose subject and predicate positions admit narrower subsets. Every form carries
 * a `kind` discriminator, so a term is narrowed by testing that tag rather than by probing for properties, or read
 * with {@link lexical} without narrowing at all.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-term RDF 1.1 Terms}
 */
export type Term =
	| Blank
	| Named
	| Tagged
	| Typed;

/**
 * An RDF blank node.
 *
 * Carries the bare label identifying the node within a single document, for example `0` for the `_:0` rendering: the
 * `_:` prefix belongs to the N-Triples/SPARQL syntax and is supplied by the serialisers rather than stored.
 * Blank-node identity is document-scoped: a label carries no meaning across queries or stores. Mint one with
 * {@link blank}.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node RDF 1.1 Blank Nodes}
 */
export type Blank = {

	readonly kind: "blank";

	readonly label: string

};

/**
 * An RDF named resource.
 *
 * Carries the absolute {@link IRI} denoting an RDF resource. Admitted in every {@link Triple} position: always as the
 * predicate, and as one of the forms the subject and object {@link Term | terms} may take. Construct one with
 * {@link named}.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#section-IRIs RDF 1.1 IRIs}
 */
export type Named = {

	readonly kind: "named";

	readonly iri: IRI

};

/**
 * An RDF language-tagged string.
 *
 * Pairs the lexical form with the BCP 47 tag identifying its natural language. Distinct from a
 * {@link Typed} literal because the language tag participates in term identity and equality. One of the
 * literal forms making up {@link Term}. Construct one with {@link tagged}.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-language-tagged-string RDF 1.1 Language-tagged strings}
 */
export type Tagged = {

	readonly kind: "tagged";

	readonly text: string;
	readonly language: Tag

};

/**
 * An RDF typed literal.
 *
 * Pairs the lexical form with the {@link IRI} of its XSD (or user-defined) datatype. Per RDF 1.1, a literal with no
 * datatype IRI is interpreted as `xsd:string`: `datatype` is always present, carrying that IRI explicitly for a plain
 * literal, so readers never test for its absence. One of the literal forms making up {@link Term}. Construct one with
 * {@link typed}.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-literal RDF 1.1 Literals}
 */
export type Typed = {

	readonly kind: "typed";

	readonly text: string;
	readonly datatype: IRI

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an RDF {@link Graph}.
 *
 * Collects the supplied {@link Triple | triples} into a flat sequence. The supplied triples are cloned, so later
 * changes to them are not reflected in the graph.
 *
 * @param triples - The triples making up the graph
 *
 * @returns An immutable {@link Graph} of the supplied triples
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-graph RDF 1.1 Graphs}
 */
export function graph(...triples: readonly Triple[]): Graph {
	return immutable(triples);
}

/**
 * Creates an RDF {@link Triple}.
 *
 * Assembles a subject/predicate/object statement from ready positions.
 *
 * @param subject - The subject: a {@link Blank | blank node} or a {@link Named | named resource}
 * @param predicate - The predicate: a {@link Named | named resource}
 * @param object - The object: any RDF {@link Term}
 *
 * @returns An immutable {@link Triple} of the three positions
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-triple RDF 1.1 Triples}
 */
export function triple(subject: Blank | Named, predicate: Named, object: Term): Triple {
	return immutable([subject, predicate, object]);
}

/**
 * Creates an RDF {@link Blank | blank node}.
 *
 * Wraps the supplied label into a blank node, storing it bare: the `_:` prefix belongs to the N-Triples/SPARQL syntax
 * and is added by the serialisers. With no argument, mints a fresh node with a random label for an anonymous one;
 * supply a label only where blank-node identity must be correlated within a single document. The returned record is
 * frozen.
 *
 * > [!WARNING]
 * > A string label is validated against the intersection of the N-Triples, Turtle and SPARQL 1.1 `BLANK_NODE_LABEL`
 * > productions, so that every accepted label is serialisable in all three syntaxes; the grammars differ only on `:`,
 * > which N-Triples admits within a label and the other two do not, and which is consequently rejected.
 *
 * @param label - The blank-node label: a non-negative integer, or a string matching the `BLANK_NODE_LABEL` body;
 * 		omitted to mint a fresh anonymous node
 *
 * @returns A frozen {@link Blank} record carrying the label
 *
 * @throws RangeError if `label` is a negative or non-integer number, or a malformed string label
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-BLANK_NODE_LABEL N-Triples §3 — BLANK_NODE_LABEL}
 * @see {@link https://www.w3.org/TR/turtle/#grammar-production-BLANK_NODE_LABEL Turtle §6.5 — BLANK_NODE_LABEL}
 * @see {@link https://www.w3.org/TR/sparql11-query/#rBLANK_NODE_LABEL SPARQL 1.1 §19.8 — BLANK_NODE_LABEL}
 */
export function blank(label?: number | string): Blank {
	return label === undefined ? immutable({ kind: "blank", label: crypto.randomUUID().replaceAll("-", "") })
		: isNumber(label) && Number.isInteger(label) && label >= 0 ? immutable({ kind: "blank", label: String(label) })
			: isString(label) && BlankPattern.test(label) ? immutable({ kind: "blank", label })
				: error(new RangeError(`malformed blank-node label <${label}>`));
}

/**
 * Creates an RDF {@link Named | named resource}.
 *
 * Boxes a well-formed absolute IRI. With no argument, mints a fresh opaque `urn:uuid:` resource for an anonymous
 * anchor. A blank-node label is not an absolute IRI and is rejected like any other malformed value. The returned
 * record is frozen.
 *
 * @param iri - The IRI to validate and box; omitted to mint a fresh `urn:uuid:` resource
 *
 * @returns A frozen {@link Named} record carrying the validated or minted IRI
 *
 * @throws RangeError if `iri` is a relative or otherwise malformed IRI
 */
export function named(iri?: IRI): Named {
	return iri === undefined ? immutable({ kind: "named", iri: `urn:uuid:${crypto.randomUUID()}` })
		: isIRI(iri, "absolute") ? immutable({ kind: "named", iri })
			: error(new RangeError(`relative or malformed IRI reference <${iri}>`));
}

/**
 * Creates an RDF language-tagged string.
 *
 * Pairs the validated lexical form with the validated BCP 47 tag identifying its natural language. The returned record
 * is frozen.
 *
 * Both components are checked here rather than at serialisation: {@link Tag} is a documentation alias for `string`, so
 * nothing in the type stops a caller from supplying a tag carrying grammar delimiters, and no RDF syntax defines an
 * escape for a language tag, leaving a serialiser to render it verbatim into forged statements.
 *
 * @param text - The lexical form of the literal
 * @param language - The BCP 47 language tag
 *
 * @returns A frozen {@link Tagged} record carrying the lexical form and the language tag
 *
 * @throws RangeError if `text` is not a well-formed Unicode string, that is if it holds an isolated UTF-16 surrogate
 * 		code point, or if `language` is not a well-formed BCP 47 language tag
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-language-tagged-string RDF 1.1 Language-tagged strings}
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1 RFC 5646 § 2.1 - Language Tag Syntax}
 */
export function tagged(text: string, language: Tag): Tagged {
	return !isWellFormed(text) ? error(new RangeError(`malformed lexical form <${text}>`))
		: !isTag(language) ? error(new RangeError(`malformed language tag <${language}>`))
			: immutable({ kind: "tagged", text, language });
}

/**
 * Creates an RDF typed literal.
 *
 * Pairs the validated lexical form with the validated {@link IRI} of its XSD (or user-defined) datatype, defaulting
 * to the `xsd:string` IRI RDF 1.1 reads into an unannotated literal. A non-string scalar is coerced to its lexical
 * form via `String()`, and the coerced form is what gets validated. The returned record is frozen.
 *
 * @param text - The lexical form of the literal, as a {@link Scalar} coerced to a string via `String()`
 * @param datatype - The IRI of the literal datatype; defaults to `xsd:string`
 *
 * @returns A frozen {@link Typed} record carrying the lexical form and the datatype
 *
 * @throws RangeError if the coerced `text` is not a well-formed Unicode string, that is if it holds an isolated
 * 		UTF-16 surrogate code point, or if `datatype` is a relative or otherwise malformed IRI
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-literal RDF 1.1 Literals}
 */
export function typed(text: Scalar, datatype: IRI = xsd.string): Typed {

	const lexical = String(text);

	return !isWellFormed(lexical) ? error(new RangeError(`malformed lexical form <${lexical}>`))
		: !isIRI(datatype, "absolute") ? error(new RangeError(`relative or malformed datatype IRI <${datatype}>`))
			: immutable({ kind: "typed", text: lexical, datatype });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the lexical form of an RDF {@link Term}.
 *
 * Projects a term onto the bare string it carries: the document-scoped label of a {@link Blank | blank node}, the
 * absolute IRI of a {@link Named | named resource}, or the lexical form of a language-{@link Tagged | tagged} or
 * datatype-{@link Typed | typed} literal. RDF 1.1 defines the lexical form for literals alone: the projection is
 * extended to the other forms, so that a value is read off a term without first narrowing on its `kind`.
 *
 * The string is returned as stored, undecorated: the `_:` blank-node prefix, the IRI angle brackets, and the literal
 * quotes, language tag and datatype IRI are syntax supplied by the serialisers. Different terms may consequently
 * share a lexical form, which on its own does not identify a term.
 *
 * @param term - The term to project
 *
 * @returns The lexical form carried by `term`
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-lexical-form RDF 1.1 Lexical form}
 */
export function lexical(term: Term): string {

	switch ( term.kind ) {

		case "blank":

			return term.label;

		case "named":

			return term.iri;

		case "tagged":
		case "typed":

			return term.text;

	}

}

/**
 * Replaces blank nodes in a {@link Graph} with minted named resources.
 *
 * Skolemises each {@link Blank | blank node} to a fresh `urn:uuid:` {@link Named | named resource}, correlating
 * repeated labels to the same resource within the graph so blank-node identity is preserved; ground terms pass
 * through unchanged. The correlation scope is per call, so the same label skolemised in a later call yields a
 * different resource.
 *
 * @param graph - The graph to skolemise
 *
 * @returns A new {@link Graph} with every {@link Blank | blank node} replaced by a minted
 * 		{@link Named | named resource}
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#section-skolemization RDF 1.1 — Skolemization}
 */
export function skolemize(graph: Graph): Graph {

	const names = createScope(() => named());

	return graph.map(([subject, predicate, object]) =>
		[resolve(subject), resolve(predicate), resolve(object)]
	);

	function resolve<T extends Term>(term: T) {
		return term.kind === "blank" ? names.resolve(term.label) : term;
	}

}
