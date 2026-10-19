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

import { createNamespace } from "@metreeca/core/resource";


/**
 * RDF vocabulary namespace.
 *
 * Closed over the RDF 1.1 vocabulary.
 *
 * > [!NOTE]
 * > RDF/XML syntax terms (`RDF`, `Description`, `about`, `parseType`, and so on) are not included: they carry
 * > document-serialisation semantics of little use as standalone vocabulary identifiers. The open-ended container
 * > membership properties (`_1`, `_2`, …) are likewise omitted, as they cannot be enumerated.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/ RDF 1.1 Concepts and Abstract Syntax}
 */
export const rdf = createNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", [

	"Property",
	"Statement",

	"Bag",
	"Seq",
	"Alt",

	"List",
	"nil",

	"XMLLiteral",
	"HTML",
	"langString",

	"type",

	"subject",
	"predicate",
	"object",

	"value",

	"first",
	"rest"

]);
