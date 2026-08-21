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
import { blank, named, tagged, type Triple, typed } from "../index.js";
import { decodeNTriples, encodeNTriples } from "./index.js";


describe("round-trip", () => {

	test("re-parses encoded output back to the original model", () => {

		const s = named("http://example.com/s");
		const p = named("http://example.com/p");

		const triples: readonly Triple[] = [
			[s, named("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), named("http://example.com/o")],
			[s, p, typed("value")],
			[s, p, typed("42", "http://www.w3.org/2001/XMLSchema#integer")],
			[s, p, tagged("hello", "en")]
		];

		expect(decodeNTriples(encodeNTriples(triples))).toEqual(triples);

	});

	test("is idempotent through a decode/encode cycle with blank nodes", () => {

		const document = encodeNTriples([[blank(0), named("http://example.com/p"), typed("x")]]);

		expect(encodeNTriples(decodeNTriples(document))).toBe(document);

	});

});
