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

import { describe, expect, test } from "vitest";
import { blank, named, type Named, tagged, typed } from "../index.js";
import { encodeNTriples } from "./encoder.js";


const s = named("http://example.com/s");
const p = named("http://example.com/p");
const o = named("http://example.com/o");


describe("encodeNTriples", () => {

	test("encodes an IRI triple", () => {

		expect(encodeNTriples([[s, p, o]]))
			.toBe("<http://example.com/s> <http://example.com/p> <http://example.com/o> .\n");

	});

	test("encodes a plain literal without datatype", () => {

		expect(encodeNTriples([[s, p, typed("value")]]))
			.toBe("<http://example.com/s> <http://example.com/p> \"value\" .\n");

	});

	test("encodes a datatype-typed literal", () => {

		expect(encodeNTriples([[s, p, typed("42", "http://www.w3.org/2001/XMLSchema#integer")]]))
			.toBe("<http://example.com/s> <http://example.com/p> "
				+"\"42\"^^<http://www.w3.org/2001/XMLSchema#integer> .\n");

	});

	test("encodes a language-tagged literal", () => {

		expect(encodeNTriples([[s, p, tagged("hello", "en-GB")]]))
			.toBe("<http://example.com/s> <http://example.com/p> \"hello\"@en-GB .\n");

	});

	test("escapes quotes, backslashes, and control characters in literals", () => {

		expect(encodeNTriples([[s, p, typed("a\"b\\c\nd")]]))
			.toBe("<http://example.com/s> <http://example.com/p> \"a\\\"b\\\\c\\nd\" .\n");

	});

	test("escapes characters forbidden in an IRI reference", () => {

		expect(encodeNTriples([[named("http://example.com/\u{1F600}"), p, o]]))
			.toBe("<http://example.com/\\U0001F600> <http://example.com/p> <http://example.com/o> .\n");

	});

	test("leaves non-ASCII BMP characters in an IRI unchanged", () => {

		expect(encodeNTriples([[named("http://example.com/é世"), p, o]]))
			.toBe("<http://example.com/é世> <http://example.com/p> <http://example.com/o> .\n");

	});

	test("escapes a character forbidden by the IRIREF production", () => {

		// bypasses named(), which rejects the IRI on construction, since the encoder escapes rather than validates

		const subject: Named = { kind: "named", iri: "http://example.com/a b" };

		expect(encodeNTriples([[subject, p, o]]))
			.toBe("<http://example.com/a\\u0020b> <http://example.com/p> <http://example.com/o> .\n");

	});

	test("encodes blank-node subjects and objects, preserving label correlation", () => {

		const node = blank(1);

		expect(encodeNTriples([[node, p, node]]))
			.toBe("_:1 <http://example.com/p> _:1 .\n");

	});

	test("encodes multiple triples on separate lines", () => {

		expect(encodeNTriples([
			[named("http://example.com/s1"), p, named("http://example.com/o1")],
			[named("http://example.com/s2"), p, named("http://example.com/o2")]
		])).toBe("<http://example.com/s1> <http://example.com/p> <http://example.com/o1> .\n"
			+"<http://example.com/s2> <http://example.com/p> <http://example.com/o2> .\n");

	});

	test("encodes the empty graph as the empty document", () => {

		expect(encodeNTriples([])).toBe("");

	});

});
