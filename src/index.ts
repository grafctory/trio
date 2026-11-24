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
 * Typings for the RDF 1.1 data model.
 *
 * Factories reject malformed IRIs, blank-node labels, language tags and lexical forms when the term is created.
 *
 * The standard RDF, RDFS, OWL and SHACL vocabularies are exposed as closed namespaces, so that their terms are referred
 * to by name rather than spelled out as IRIs, with typos caught at compile time.
 *
 * @module index
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/ RDF 1.1 Concepts and Abstract Syntax}
 */

import { error, isNumber, isString, type Scalar } from "@grafctory/core";
import { xsd } from "@grafctory/core/datatype";
import { isTag, type Tag } from "@grafctory/core/language";
import { type IRI, isIRI } from "@grafctory/core/resource";
import { createScope } from "@grafctory/core/scope";
import { isWellFormed } from "@grafctory/core/strings";
import { immutable } from "@grafctory/core/values";
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
 * An RDF graph.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-graph RDF 1.1 Graphs}
 */
export type Graph =
	readonly Triple[];

/**
 * An RDF triple.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-triple RDF 1.1 Triples}
 */
export type Triple =
	readonly [Subject, Predicate, Object];


/**
 * An RDF triple subject.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-subject RDF 1.1 Subject}
 */
export type Subject =
	| Blank
	| Named;

/**
 * An RDF triple predicate.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-predicate RDF 1.1 Predicate}
 */
export type Predicate =
	| Named;

/**
 * An RDF triple object.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-object RDF 1.1 Object}
 */
export type Object =
	| Term;


/**
 * An RDF term.
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
 * The label is stored bare, without the `_:` prefix: `0` for the `_:0` rendering.
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
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#section-IRIs RDF 1.1 IRIs}
 */
export type Named = {

	readonly kind: "named";

	readonly iri: IRI

};

/**
 * An RDF language-tagged string.
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
 * The supplied triples are cloned, so later changes to them are not reflected in the graph.
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
 * @param subject - The statement subject
 * @param predicate - The statement predicate
 * @param object - The statement object
 *
 * @returns An immutable {@link Triple}
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-rdf-triple RDF 1.1 Triples}
 */
export function triple(subject: Subject, predicate: Predicate, object: Object): Triple {
	return immutable([subject, predicate, object]);
}

/**
 * Creates an RDF {@link Blank | blank node}.
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
 * Extends the lexical form to resources, returning the label of a blank node or the IRI of a named resource. The
 * string carries no serialisation syntax: no `_:` prefix, angle brackets, quotes, language tag or datatype.
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
 * Each blank node is replaced with a fresh `urn:uuid:` resource, one per label. Labels are correlated within a single
 * call only: the same label skolemised in a later call is mapped to a different resource.
 *
 * @param graph - The graph to skolemise
 *
 * @returns A new {@link Graph} with every blank node replaced by a minted named resource
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
