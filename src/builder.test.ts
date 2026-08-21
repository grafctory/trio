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
import { describe, expect, test } from "vitest";
import { data, description, link, property, resource, term, text } from "./builder.js";
import { blank, graph, named, tagged, triple, typed } from "./index.js";


const ex = "http://example.com/";

const s = named(`${ex}s`);
const p = named(`${ex}p`);
const o = named(`${ex}o`);


describe("resource", () => {

	test("returns the graph built at the subject", () => {

		expect(resource(s, subject => [[subject, p, o]])).toEqual([[s, p, o]]);

	});

	test("boxes a bare IRI subject", () => {

		expect(resource(`${ex}s`, subject => [[subject, p, o]])).toEqual([[s, p, o]]);

	});

	test("takes a blank node as an anonymous subject", () => {

		expect(resource(blank("x"), subject => [[subject, p, o]])).toEqual([[blank("x"), p, o]]);

	});

	test("returns an empty built graph as it is", () => {

		expect(resource(s, () => [])).toEqual([]);

	});

	test("anchors the subject through inverse statements", () => {

		expect(resource(s, subject => [[o, p, subject]])).toEqual([[o, p, s]]);

	});

	test("rejects a graph leaving the subject unmentioned", () => {

		expect(() => resource(s, () => [[o, p, typed("value")]])).toThrow(RangeError);

	});

	test("rejects a graph stranding triples away from the subject", () => {

		expect(() => resource(s, subject => [
			[subject, p, typed("value")],
			[o, p, named(`${ex}x`)]
		])).toThrow(RangeError);

	});

	test("rejects a relative subject IRI", () => {

		expect(() => resource("/s", subject => [[subject, p, o]])).toThrow(RangeError);

	});

});

describe("description", () => {

	test("concatenates property graphs into one flat graph", () => {

		expect(description(
			[[s, p, o]],
			[[s, p, typed("value")]]
		)).toEqual([
			[s, p, o],
			[s, p, typed("value")]
		]);

	});

	test("returns the empty graph with no properties", () => {

		expect(description()).toEqual([]);

	});

});


describe("property", () => {

	test("links each subject to each object", () => {

		expect(property([s, o], `${ex}p`, [o, typed("value")])).toEqual([
			[s, p, o],
			[s, p, typed("value")],
			[o, p, o],
			[o, p, typed("value")]
		]);

	});

	test("boxes the predicate and bare IRI objects", () => {

		expect(property(s, `${ex}p`, `${ex}o`)).toEqual([[s, p, o]]);

	});

	test("contributes no triples for absent objects", () => {

		expect(property(s, `${ex}p`, undefined)).toEqual([]);

	});

	test("rejects a relative predicate IRI", () => {

		expect(() => property(s, "/p", o)).toThrow(RangeError);

	});

	describe("with a mapper", () => {

		test("takes a term result as the triple object", () => {

			expect(property(s, `${ex}p`, [1, 2], value => typed(value, xsd.integer))).toEqual([
				[s, p, typed("1", xsd.integer)],
				[s, p, typed("2", xsd.integer)]
			]);

		});

		test("embeds a graph result at its root", () => {

			expect(property(s, `${ex}p`, ["acme"], name => graph(
				triple(blank("x"), named(`${ex}name`), typed(name))
			))).toEqual([
				[s, p, blank("x")],
				[blank("x"), named(`${ex}name`), typed("acme")]
			]);

		});

		test("contributes no triples for an empty encoded graph", () => {

			expect(property(s, `${ex}p`, ["acme"], () => graph())).toEqual([]);

		});

		test("rejects a cyclic encoded graph", () => {

			expect(() => property(s, `${ex}p`, ["acme"], () => graph(
				triple(blank("x"), p, blank("y")),
				triple(blank("y"), p, blank("x"))
			))).toThrow(RangeError);

		});

		test("rejects a multi-rooted encoded graph", () => {

			expect(() => property(s, `${ex}p`, ["acme"], () => graph(
				triple(blank("x"), p, typed("1")),
				triple(blank("y"), p, typed("2"))
			))).toThrow(RangeError);

		});

		test("rejects an encoded graph stranding triples away from its root", () => {

			expect(() => property(s, `${ex}p`, ["acme"], () => graph(
				triple(blank("x"), p, typed("1")),
				triple(blank("y"), p, blank("z")),
				triple(blank("z"), p, blank("y"))
			))).toThrow(RangeError);

		});

	});

});


describe("link", () => {

	test("encodes IRIs as named terms", () => {

		expect(link([`${ex}s`, `${ex}o`])).toEqual([s, o]);

	});

	test("returns no terms for absent input", () => {

		expect(link(undefined)).toEqual([]);

	});

	test("rejects a relative IRI", () => {

		expect(() => link("/s")).toThrow(RangeError);

	});

});

describe("data", () => {

	test("encodes scalars as plain literals by default", () => {

		expect(data("value")).toEqual([typed("value")]);

	});

	test("encodes scalars with an explicit datatype", () => {

		expect(data([1, 2], xsd.integer)).toEqual([
			typed("1", xsd.integer),
			typed("2", xsd.integer)
		]);

	});

	test("stringifies non-string scalars", () => {

		expect(data(true)).toEqual([typed("true")]);

	});

});

describe("text", () => {

	test("encodes tagged content as language-tagged literals", () => {

		expect(text({ en: "hello", it: "ciao" })).toEqual([
			tagged("hello", "en"),
			tagged("ciao", "it")
		]);

	});

	test("encodes undetermined content as plain literals", () => {

		expect(text({ und: "acme" })).toEqual([typed("acme")]);

	});

	test("encodes several values under the same tag", () => {

		expect(text({ en: ["hello", "hi"] })).toEqual([
			tagged("hello", "en"),
			tagged("hi", "en")
		]);

	});

	test("rejects a malformed language tag", () => {

		expect(() => text({ "en-": "hello" })).toThrow(RangeError);

	});

});

describe("term", () => {

	test("applies the encoder to every value", () => {

		expect(term([1, 2], value => typed(value, xsd.integer))).toEqual([
			typed("1", xsd.integer),
			typed("2", xsd.integer)
		]);

	});

	test("returns no terms for absent input", () => {

		expect(term(undefined, typed)).toEqual([]);

	});

});
