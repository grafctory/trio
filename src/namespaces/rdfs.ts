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
 * RDFS vocabulary namespace.
 *
 * Lets code refer to the terms of the RDF Schema 1.1 vocabulary by name, so that their IRIs are neither spelled out
 * nor mistyped. The namespace is closed and complete, covering the schema classes, the class and property hierarchy
 * relations, the property signature relations, the annotation properties, and the container membership shorthand.
 *
 * @see {@link https://www.w3.org/TR/rdf-schema/ RDF Schema 1.1}
 */
export const rdfs = createNamespace("http://www.w3.org/2000/01/rdf-schema#", [

	"Resource",
	"Class",
	"Literal",
	"Datatype",
	"Container",
	"ContainerMembershipProperty",

	"subClassOf",
	"subPropertyOf",

	"domain",
	"range",

	"label",
	"comment",

	"seeAlso",
	"isDefinedBy",

	"member"

]);
