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

import { immutable } from "@metreeca/core/values";
import { createScope } from "@metreeca/core/scope";
import { BLANK_NODE } from "../../index.core.js";
import { type Blank, blank, type Graph, type Named, named, tagged, type Term, typed } from "../../index.js";


//// Terminals /////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Matches the `HEX` production: one hexadecimal digit, in either case.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-HEX N-Triples §3 — HEX}
 */
const HEX =
	String.raw`[0-9A-Fa-f]`;

/**
 * Matches the `UCHAR` production: a four- or eight-digit code-point escape.
 *
 * Written as a bare alternation, so an embedding pattern must group it.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-UCHAR N-Triples §3 — UCHAR}
 */
const UCHAR =
	String.raw`\\u${HEX}{4}|\\U${HEX}{8}`;

/**
 * Matches the `UCHAR` production, capturing the four- and eight-digit hex in that order.
 *
 * Kept apart from {@link UCHAR}, which stays capture-free so that embedding it leaves the capture indices of the
 * enclosing pattern untouched.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-UCHAR N-Triples §3 — UCHAR}
 */
const UCHAR_HEX =
	String.raw`\\u(${HEX}{4})|\\U(${HEX}{8})`;

/**
 * Matches a high/low pair of {@link UCHAR} escapes encoding one supplementary code point, capturing the joined hex.
 *
 * Has no counterpart production: `UCHAR` is defined over code points, while a document produced by a UTF-16 writer may
 * spell a supplementary one as two escaped surrogate halves. Matching the pair before {@link UCHAR_HEX} lets it
 * round-trip, leaving isolated halves to the single-escape branches, where they are rejected.
 */
const UCHAR_PAIR =
	String.raw`\\u(D[89ABab]${HEX}{2}\\uD[CDEFcdef]${HEX}{2})`;

/**
 * Matches the `ECHAR` production: a backslash escape of a control character, quote, or backslash.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-ECHAR N-Triples §3 — ECHAR}
 */
const ECHAR =
	String.raw`\\[tbnrf"'\\]`;

/**
 * Matches the `ECHAR` production, capturing the escaped character.
 *
 * Kept apart from {@link ECHAR} for the reason given for {@link UCHAR_HEX}.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-ECHAR N-Triples §3 — ECHAR}
 */
const ECHAR_CHAR =
	String.raw`\\([tbnrf"'\\])`;

/**
 * Matches the `IRIREF` production, angle brackets included.
 *
 * Admits any character other than `>` within the brackets, rather than enumerating the control, delimiter, and
 * surrogate ranges the production excludes: {@link decodeNTriples} resolves the {@link UCHAR} escapes and hands the
 * result to the {@link index.named | named} factory, which rejects a relative or otherwise malformed IRI.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-IRIREF N-Triples §3 — IRIREF}
 */
const IRIREF =
	String.raw`<[^>]*>`;

/**
 * Matches the `BLANK_NODE_LABEL` production, `_:` marker included.
 *
 * Prefixes the shared {@link BLANK_NODE} body, so that a decoded label is one the {@link index.blank | blank} factory
 * would accept: `:` is consequently rejected even though this document syntax admits it.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-BLANK_NODE_LABEL N-Triples §3 — BLANK_NODE_LABEL}
 */
const BLANK_NODE_LABEL =
	String.raw`_:${BLANK_NODE}`;

/**
 * Matches the `STRING_LITERAL_QUOTE` production, quotes included, capturing the still-escaped lexical form.
 *
 * The body admits any character other than `"`, `\`, LF, or CR, plus {@link ECHAR} and {@link UCHAR} escapes. An
 * unrecognised escape (for example `\z`, `\uWXYZ`) fails the match, so {@link TriplePattern} rejects the line rather
 * than passing the bad escape through.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-STRING_LITERAL_QUOTE N-Triples §3 —
 * 		STRING_LITERAL_QUOTE}
 */
const STRING_LITERAL_QUOTE =
	String.raw`"((?:[^"\\\n\r]|${ECHAR}|${UCHAR})*)"`;

/**
 * Matches the `LANGTAG` production, `@` marker included, capturing the tag.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-LANGTAG N-Triples §3 — LANGTAG}
 */
const LANGTAG =
	String.raw`@([A-Za-z]+(?:-[A-Za-z0-9]+)*)`;


//// Symbols ///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Matches the `subject` production: an {@link IRIREF} or a {@link BLANK_NODE_LABEL}.
 *
 * Also covers the resource alternatives of the `object` production, which extends this one with a {@link literal}.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-subject N-Triples §3 — subject}
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-object N-Triples §3 — object}
 */
const subject =
	String.raw`${IRIREF}|${BLANK_NODE_LABEL}`;

/**
 * Matches the `predicate` production: an {@link IRIREF}.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-predicate N-Triples §3 — predicate}
 */
const predicate =
	String.raw`${IRIREF}`;

/**
 * Matches the `literal` production: a {@link STRING_LITERAL_QUOTE} with an optional `^^` datatype {@link IRIREF} or
 * {@link LANGTAG} suffix, capturing the lexical form, the bracketed datatype IRI, and the language tag in that order.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-literal N-Triples §3 — literal}
 */
const literal =
	String.raw`${STRING_LITERAL_QUOTE}(?:\^\^(${IRIREF})|${LANGTAG})?`;

/**
 * Matches the `triple` production: a {@link subject}, a {@link predicate}, an object, and the closing `.`, each
 * separated by optional whitespace.
 *
 * Captures, in order:
 *
 * 1. subject token (`IRIREF` with brackets or `_:` blank-node label)
 * 2. predicate `IRIREF` (with brackets)
 * 3. object `IRIREF`/blank-node token (`undefined` when the object is a {@link literal})
 * 4. literal lexical form (still escaped)
 * 5. literal datatype `IRIREF` (with brackets)
 * 6. literal language tag
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-triple N-Triples §3 — triple}
 */
const triple =
	String.raw`\s*(${subject})`
	+String.raw`\s*(${predicate})`
	+String.raw`\s*(?:(${subject})|${literal})`
	+String.raw`\s*\.`;

/**
 * Matches a comment: a `#` and everything up to the end of the line.
 *
 * A pseudo-symbol, as the grammar defines no `comment` production: the syntax section instead states that a `#`
 * outside an {@link IRIREF} or a quoted literal opens a comment running to the end of the line.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#sec-grammar-comments N-Triples §2 — Comments}
 */
const comment =
	String.raw`#.*`;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Matches a blank or `#`-prefixed comment line; used to skip non-triple lines during {@link decodeNTriples} iteration.
 */
const CommentPattern = new RegExp(String.raw`^\s*(?:${comment})?$`);

/**
 * Matches a {@link UCHAR} escape sequence within an {@link IRIREF} body — the only escape production legal in an IRI.
 * The leading alternative joins a high/low UCHAR pair into a single match so that valid surrogate sequences round-trip
 * to a supplementary code point and isolated surrogate halves fall through to the single-UCHAR branch where they are
 * rejected.
 *
 * Captures: `1` paired high/low surrogate UCHAR hex (`DXXX\uDXXX`), `2` four-digit UCHAR hex (`\uXXXX`), `3`
 * eight-digit UCHAR hex (`\UXXXXXXXX`).
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-UCHAR N-Triples §3 — UCHAR}
 */
const IRIEscapePattern = new RegExp(`${UCHAR_PAIR}|${UCHAR_HEX}`, "g");

/**
 * Matches a {@link UCHAR} or {@link ECHAR} escape sequence within a literal lexical form. The leading alternative joins
 * a high/low UCHAR pair into a single match so that valid surrogate sequences round-trip to a supplementary code point
 * and isolated surrogate halves fall through to the single-UCHAR branch where they are rejected.
 *
 * Captures: `1` paired high/low surrogate UCHAR hex (`DXXX\uDXXX`), `2` four-digit UCHAR hex (`\uXXXX`), `3`
 * eight-digit UCHAR hex (`\UXXXXXXXX`), `4` ECHAR character.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-ECHAR N-Triples §3 — ECHAR}
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-UCHAR N-Triples §3 — UCHAR}
 */
const LiteralEscapePattern = new RegExp(`${UCHAR_PAIR}|${UCHAR_HEX}|${ECHAR_CHAR}`, "g");

/**
 * Matches a complete N-Triples statement line: a {@link triple}, whose captures it inherits, followed by optional
 * whitespace and `#` comment.
 *
 * Compiled with the `u` flag, as required by the code-point escapes {@link BLANK_NODE_LABEL} embeds: supplementary
 * characters are consequently matched as single units throughout the line.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-triple N-Triples §3 — triple}
 */
const TriplePattern = new RegExp(String.raw`^${triple}\s*(?:${comment})?$`, "u");


/**
 * Maps the eight {@link ECHAR} escape characters to their unescaped form.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-ECHAR N-Triples §3 — ECHAR}
 */
const Escapes: Record<string, string> = immutable({

	t: "\t",
	b: "\b",
	n: "\n",
	r: "\r",
	f: "\f",
	"\"": "\"",
	"'": "'",
	"\\": "\\"

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Decodes an {@link https://www.w3.org/TR/n-triples/ N-Triples} document into its RDF {@link Graph | graph}.
 *
 * Decodes each statement line to one {@link index.Triple | triple}, skipping blank lines and `#` comments, so a
 * document carrying no statements decodes to the empty graph. Blank-node subjects and objects (`_:bX`) decode to
 * scope-numbered {@link index.Blank | Blank} nodes: a per-document {@link createScope | scope} keyed by the external
 * label mints one node per distinct label, numbered by a short sequential id, so repeats of one label correlate to
 * the same node within the document.
 *
 * > [!WARNING]
 * > External labels are read against the intersection of the N-Triples, Turtle and SPARQL 1.1 `BLANK_NODE_LABEL`
 * > productions, so that every decoded label is one the {@link index.blank | blank} factory accepts; a label
 * > carrying `:`, which only N-Triples admits, is consequently rejected as malformed.
 *
 * @param value - The N-Triples document to decode
 *
 * @returns The decoded graph
 *
 * @throws SyntaxError if any non-empty, non-comment line is not a well-formed N-Triples triple, or if a `UCHAR`
 * 		escape within an IRI or a literal lexical form expands to an isolated UTF-16 surrogate code point
 * @throws RangeError if a component the document syntax admits is rejected by the data model factory building it:
 * 		a relative IRI, or a language tag outside the BCP 47 syntax the wider N-Triples `LANGTAG` production allows
 */
export function decodeNTriples(value: string): Graph {

	const blanks = createScope(blank);

	return value.split(/\r?\n/).flatMap((line, i): Graph => {

		if ( CommentPattern.test(line) ) {

			return [];

		} else {

			const match = TriplePattern.exec(line);

			if ( match === null ) {

				throw new SyntaxError(`malformed N-Triples at line ${i+1}: ${line}`);

			} else {

				const s = resource(match[1]);
				const p = iri(match[2]);
				const o = match[3] !== undefined
					? resource(match[3])
					: term(match[4], match[5], match[6]);

				return [[s, p, o]];

			}

		}

	});


	function resource(token: string): Blank | Named {

		return token.startsWith("_:")
			? blanks.resolve(token.slice(2))
			: iri(token);

	}

	function iri(token: string): Named {

		return named(unescapeIRI(token.slice(1, -1)));

	}

	function term(lex: string, datatype: string | undefined, language: string | undefined): Term {

		const text = unescapeLiteral(lex);

		if ( language !== undefined ) {

			return tagged(text, language);

		} else if ( datatype !== undefined ) {

			return typed(text, unescapeIRI(datatype.slice(1, -1)));

		} else {

			return typed(text);

		}

	}


	function unescapeIRI(text: string): string {

		return text.indexOf("\\") < 0 ? text : text.replace(IRIEscapePattern, (_raw, pair, u4, u8) =>

			pair !== undefined ? decodeSurrogate(pair)
				: decodeUchar(u4 ?? u8)
		);

	}

	function unescapeLiteral(text: string): string {

		return text.indexOf("\\") < 0 ? text : text.replace(LiteralEscapePattern, (raw, pair, u4, u8, e) =>

			pair !== undefined ? decodeSurrogate(pair)
				: e !== undefined ? (Escapes[e] ?? raw)
					: decodeUchar(u4 ?? u8)
		);

	}


	function decodeSurrogate(pair: string): string {

		return String.fromCharCode(parseInt(pair.slice(0, 4), 16), parseInt(pair.slice(-4), 16));

	}

	function decodeUchar(hex: string): string {

		const code = parseInt(hex, 16);

		if ( isSurrogate(code) ) {

			throw new SyntaxError(`surrogate code point in UCHAR escape U+${hex}`);

		} else {

			return String.fromCodePoint(code);

		}

	}

	/**
	 * Reports whether a code point falls within the UTF-16 surrogate range.
	 *
	 * Code points from U+D800 to U+DFFF are reserved for the halves of a surrogate pair and denote no character on
	 * their own, so a `UCHAR` escape resolving to one denotes no character either.
	 */
	function isSurrogate(code: number): boolean {
		return code >= 0xD800 && code <= 0xDFFF;
	}

}
