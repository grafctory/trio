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
 * RDF term grammar fragments.
 *
 * Provides the character-class and production fragments shared by the RDF data model factories and the N-Triples
 * decoder, as unanchored regex sources embedding patterns compose. Every fragment enforces the intersection of the
 * N-Triples, Turtle and SPARQL 1.1 grammars, so that a term accepted anywhere in the package is serialisable in all
 * three syntaxes; embedding patterns must carry the `u` flag, as required by the code-point escapes in
 * {@link PN_CHARS_BASE}.
 *
 * @module
 *
 * @see {@link https://www.w3.org/TR/n-triples/#n-triples-grammar N-Triples §3 — Grammar}
 * @see {@link https://www.w3.org/TR/turtle/#sec-grammar-grammar Turtle §6 — Grammar}
 * @see {@link https://www.w3.org/TR/sparql11-query/#sparqlGrammar SPARQL 1.1 §19 — SPARQL Grammar}
 */


/**
 * Matches the `PN_CHARS_BASE` production, as a character-class body.
 *
 * Enumerates the letter ranges the N-Triples, Turtle and SPARQL grammars define identically. The supplementary range
 * U+10000–U+EFFFF is written as a code-point escape, so every pattern embedding this fragment requires the `u` flag.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-PN_CHARS_BASE N-Triples §3 — PN_CHARS_BASE}
 */
export const PN_CHARS_BASE =
	String.raw`A-Za-z\u{00C0}-\u{00D6}\u{00D8}-\u{00F6}\u{00F8}-\u{02FF}\u{0370}-\u{037D}`
	+String.raw`\u{037F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}`
	+String.raw`\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}`;

/**
 * Matches the `PN_CHARS_U` production, as a character-class body.
 *
 * Extends {@link PN_CHARS_BASE} with `_`.
 *
 * > [!NOTE]
 * > The three target grammars disagree on this production alone: N-Triples defines it as
 * > `PN_CHARS_BASE | '_' | ':'`, Turtle and SPARQL 1.1 as `PN_CHARS_BASE | '_'`. This fragment enforces their
 * > intersection, so `:` is excluded even though N-Triples admits it, and every term built on it is serialisable in
 * > all three syntaxes; RDF 1.2 drops `:` from the N-Triples production, converging on the same reading.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-PN_CHARS_U N-Triples §3 — PN_CHARS_U}
 * @see {@link https://www.w3.org/TR/turtle/#grammar-production-PN_CHARS_U Turtle §6.5 — PN_CHARS_U}
 * @see {@link https://www.w3.org/TR/sparql11-query/#rPN_CHARS_U SPARQL 1.1 §19.8 — PN_CHARS_U}
 */
export const PN_CHARS_U =
	String.raw`${PN_CHARS_BASE}_`;

/**
 * Matches the `PN_CHARS` production, as a character-class body.
 *
 * Extends {@link PN_CHARS_U} with digits, `-`, the middle dot, and the combining and connector marks.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-PN_CHARS N-Triples §3 — PN_CHARS}
 */
export const PN_CHARS =
	String.raw`${PN_CHARS_U}0-9\-\u{00B7}\u{0300}-\u{036F}\u{203F}-\u{2040}`;

/**
 * Matches the `BLANK_NODE_LABEL` body, bare of its `_:` marker.
 *
 * Enforces a leading {@link PN_CHARS_U} or digit, an optional interior run that may also carry `.`, and a trailing
 * {@link PN_CHARS} — the shape shared by the blank-node label validation the factories perform and the labels the
 * N-Triples decoder reads. The production admits no delimiter character, so an embedded label remains
 * self-delimiting, stopping at the `<`, `"`, or whitespace that opens the next term rather than greedily swallowing
 * it. Embedding patterns must carry the `u` flag, as required by the code-point escapes in {@link PN_CHARS_BASE};
 * `:` is excluded, as {@link PN_CHARS_U} explains.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#grammar-production-BLANK_NODE_LABEL N-Triples §3 — BLANK_NODE_LABEL}
 * @see {@link https://www.w3.org/TR/turtle/#grammar-production-BLANK_NODE_LABEL Turtle §6.5 — BLANK_NODE_LABEL}
 * @see {@link https://www.w3.org/TR/sparql11-query/#rBLANK_NODE_LABEL SPARQL 1.1 §19.8 — BLANK_NODE_LABEL}
 */
export const BLANK_NODE =
	String.raw`[${PN_CHARS_U}0-9](?:[${PN_CHARS}.]*[${PN_CHARS}])?`;
