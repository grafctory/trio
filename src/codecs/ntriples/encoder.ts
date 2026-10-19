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

import { xsd } from "@metreeca/core/datatype";
import { escape } from "@metreeca/core/strings";
import { type Blank, type Graph, type Named, type Tagged, type Term, type Typed } from "../../index.js";


/**
 * Matches every character {@link encodeNTriples} escapes within an IRIREF.
 *
 * Combines the characters the IRIREF production forbids, which a UCHAR escape makes representable, with every
 * supplementary code point above U+FFFF (each matched as a single unit under the `u` flag). A term built through the
 * data model factories carries none of the former, RFC 3987 excluding them from a reference, so in practice only
 * supplementary code points are ever escaped; the forbidden set is covered for completeness of the production.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-IRIREF N-Triples IRIREF}
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-UCHAR N-Triples UCHAR}
 */
const IRIEscapePattern = /[\x00-\x20<>"{}|^`\\]|[\u{10000}-\u{10FFFF}]/gu;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Encodes an RDF {@link Graph | graph} into an {@link https://www.w3.org/TR/n-triples/ N-Triples} document.
 *
 * Emits one statement per {@link index.Triple | triple}, each terminated by ` .` and a line feed, so the empty graph
 * encodes to the empty string. A literal carrying the redundant `xsd:string` datatype collapses to the bare quoted
 * form.
 *
 * Terms are taken as valid: IRIs, blank-node labels, lexical forms and language tags are validated by the data model
 * factories, which are the only supported way to build a {@link Graph}, so the encoder escapes rather than checks. A
 * record assembled without them is serialised as it stands, malformed components included.
 *
 * @param graph - The graph to serialise
 *
 * @returns The N-Triples document
 */
export function encodeNTriples(graph: Graph): string {

	return graph
		.map(([subject, predicate, object]) => `${term(subject)} ${term(predicate)} ${term(object)} .\n`)
		.join("");


	function term(term: Term): string {
		switch ( term.kind ) {

			case "blank":

				return blank(term);

			case "named":

				return named(term);

			case "tagged":

				return tagged(term);

			case "typed":

				return typed(term);

		}
	}


	function blank({ label }: Blank) {
		return `_:${label}`;
	}

	function named({ iri }: Named) {
		return `<${escapeIRI(iri)}>`;
	}

	function tagged({ text, language }: Tagged) {
		return `"${escape(text)}"@${language}`;
	}

	function typed({ text, datatype }: Typed) {
		return datatype === xsd.string
			? `"${escape(text)}"`
			: `"${escape(text)}"^^<${escapeIRI(datatype)}>`;
	}


	function escapeIRI(iri: string): string {
		return escape(iri, IRIEscapePattern, {});
	}

}
