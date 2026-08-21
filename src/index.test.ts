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
import { blank, graph, named, rdf, rdfs, skolemize, tagged, triple, typed } from "./index.js";


const s = named("http://example.com/s");
const p = named("http://example.com/p");
const o = named("http://example.com/o");


describe("rdf", () => {

	test("exposes the RDF vocabulary IRIs", () => {

		expect(rdf.type).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
		expect(rdf.first).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");

	});

});

describe("rdfs", () => {

	test("exposes the RDFS vocabulary IRIs", () => {

		expect(rdfs.label).toBe("http://www.w3.org/2000/01/rdf-schema#label");
		expect(rdfs.subClassOf).toBe("http://www.w3.org/2000/01/rdf-schema#subClassOf");

	});

});


describe("graph", () => {

	test("collects the supplied triples", () => {

		expect(graph(triple(s, p, o), triple(s, p, typed("value")))).toEqual([
			[s, p, o],
			[s, p, typed("value")]
		]);

	});

	test("returns the empty graph with no triples", () => {

		expect(graph()).toEqual([]);

	});

	test("returns a frozen graph", () => {

		expect(Object.isFrozen(graph(triple(s, p, o)))).toBeTruthy();

	});

});

describe("triple", () => {

	test("assembles the three positions in order", () => {

		expect(triple(s, p, o)).toEqual([s, p, o]);

	});

	test("returns a frozen statement", () => {

		expect(Object.isFrozen(triple(s, p, o))).toBeTruthy();

	});

});


describe("blank", () => {

	test("mints a fresh anonymous node with no label", () => {

		expect(blank().label).toMatch(/^[0-9a-f]{32}$/);
		expect(blank().label).not.toBe(blank().label);

	});

	test("renders a non-negative integer label as a string", () => {

		expect(blank(0)).toEqual({ kind: "blank", label: "0" });
		expect(blank(42)).toEqual({ kind: "blank", label: "42" });

	});

	test("rejects a negative or fractional number label", () => {

		expect(() => blank(-1)).toThrow(RangeError);
		expect(() => blank(1.5)).toThrow(RangeError);

	});

	test("accepts a well-formed string label", () => {

		expect(blank("b1")).toEqual({ kind: "blank", label: "b1" });
		expect(blank("a.b")).toEqual({ kind: "blank", label: "a.b" });
		expect(blank("é日")).toEqual({ kind: "blank", label: "é日" });

	});

	test("rejects a malformed string label", () => {

		expect(() => blank("")).toThrow(RangeError);
		expect(() => blank(".b")).toThrow(RangeError);
		expect(() => blank("b.")).toThrow(RangeError);

	});

	test("rejects a colon-carrying label, admitted by N-Triples but not by Turtle or SPARQL", () => {

		expect(() => blank("a:b")).toThrow(RangeError);

	});

	test("returns a frozen node", () => {

		expect(Object.isFrozen(blank(0))).toBeTruthy();

	});

});

describe("named", () => {

	test("mints a fresh opaque resource with no IRI", () => {

		expect(named().iri).toMatch(/^urn:uuid:/);
		expect(named().iri).not.toBe(named().iri);

	});

	test("boxes an absolute IRI", () => {

		expect(named("http://example.com/s")).toEqual({ kind: "named", iri: "http://example.com/s" });

	});

	test("rejects a relative or otherwise malformed IRI", () => {

		expect(() => named("/path")).toThrow(RangeError);
		expect(() => named("example")).toThrow(RangeError);

	});

	test("rejects a blank-node label", () => {

		expect(() => named("_:b1")).toThrow(RangeError);

	});

	test("returns a frozen resource", () => {

		expect(Object.isFrozen(named("http://example.com/s"))).toBeTruthy();

	});

});

describe("tagged", () => {

	test("pairs the lexical form with the language tag", () => {

		expect(tagged("hello", "en-GB")).toEqual({ kind: "tagged", text: "hello", language: "en-GB" });

	});

	test("rejects a malformed language tag", () => {

		expect(() => tagged("hello", "en-")).toThrow(RangeError);
		expect(() => tagged("hello", "en\"@x")).toThrow(RangeError);

	});

	test("rejects a lexical form holding an isolated surrogate", () => {

		expect(() => tagged("\uD800", "en")).toThrow(RangeError);

	});

	test("returns a frozen literal", () => {

		expect(Object.isFrozen(tagged("hello", "en"))).toBeTruthy();

	});

});

describe("typed", () => {

	test("defaults to the xsd:string datatype", () => {

		expect(typed("value")).toEqual({ kind: "typed", text: "value", datatype: xsd.string });

	});

	test("boxes an explicit datatype", () => {

		expect(typed("42", xsd.integer)).toEqual({ kind: "typed", text: "42", datatype: xsd.integer });

	});

	test("coerces a non-string scalar to its lexical form", () => {

		expect(typed(42, xsd.integer).text).toBe("42");
		expect(typed(true, xsd.boolean).text).toBe("true");

	});

	test("rejects a relative or otherwise malformed datatype IRI", () => {

		expect(() => typed("42", "/integer")).toThrow(RangeError);

	});

	test("rejects a lexical form holding an isolated surrogate", () => {

		expect(() => typed("\uD800")).toThrow(RangeError);

	});

	test("returns a frozen literal", () => {

		expect(Object.isFrozen(typed("value"))).toBeTruthy();

	});

});


describe("skolemize", () => {

	test("replaces blank nodes with minted named resources", () => {

		const [[subject, , object]] = skolemize([[blank("a"), p, blank("b")]]);

		expect(subject.kind).toBe("named");
		expect(object.kind).toBe("named");

	});

	test("correlates repeated labels within the graph", () => {

		const [[subject, , object], [, , other]] = skolemize([
			[blank("a"), p, blank("a")],
			[s, p, blank("b")]
		]);

		expect(object).toEqual(subject);
		expect(other).not.toEqual(subject);

	});

	test("leaves ground terms unchanged", () => {

		expect(skolemize([[s, p, tagged("hello", "en")]])).toEqual([[s, p, tagged("hello", "en")]]);

	});

	test("scopes label correlation to a single call", () => {

		const [[first]] = skolemize([[blank("a"), p, o]]);
		const [[second]] = skolemize([[blank("a"), p, o]]);

		expect(second).not.toEqual(first);

	});

});
