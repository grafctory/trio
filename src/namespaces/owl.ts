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
 * OWL vocabulary namespace.
 *
 * Closed and complete over the OWL 2 vocabulary.
 *
 * > [!NOTE]
 * > The OWL 1 terms deprecated by OWL 2 (`DataRange`, `DeprecatedClass`, `DeprecatedProperty`) are included, as they
 * > remain part of the vocabulary and may still occur in published ontologies.
 *
 * @see {@link https://www.w3.org/TR/owl2-overview/ OWL 2 Web Ontology Language Document Overview}
 * @see {@link https://www.w3.org/TR/owl2-syntax/ OWL 2 Web Ontology Language Structural Specification}
 * @see {@link https://www.w3.org/TR/owl2-mapping-to-rdf/ OWL 2 Web Ontology Language Mapping to RDF Graphs}
 */
export const owl = createNamespace("http://www.w3.org/2002/07/owl#", [

	"Ontology",
	"OntologyProperty",
	"imports",
	"versionIRI",
	"versionInfo",
	"priorVersion",
	"backwardCompatibleWith",
	"incompatibleWith",

	"Thing",
	"Nothing",
	"topObjectProperty",
	"bottomObjectProperty",
	"topDataProperty",
	"bottomDataProperty",

	"Class",
	"NamedIndividual",
	"ObjectProperty",
	"DatatypeProperty",
	"AnnotationProperty",

	"FunctionalProperty",
	"InverseFunctionalProperty",
	"ReflexiveProperty",
	"IrreflexiveProperty",
	"SymmetricProperty",
	"AsymmetricProperty",
	"TransitiveProperty",

	"intersectionOf",
	"unionOf",
	"complementOf",
	"oneOf",
	"datatypeComplementOf",
	"onDatatype",
	"withRestrictions",

	"Restriction",
	"onProperty",
	"onProperties",
	"someValuesFrom",
	"allValuesFrom",
	"hasValue",
	"hasSelf",
	"cardinality",
	"minCardinality",
	"maxCardinality",
	"qualifiedCardinality",
	"minQualifiedCardinality",
	"maxQualifiedCardinality",
	"onClass",
	"onDataRange",

	"equivalentClass",
	"disjointWith",
	"disjointUnionOf",
	"AllDisjointClasses",
	"equivalentProperty",
	"propertyDisjointWith",
	"AllDisjointProperties",
	"inverseOf",
	"propertyChainAxiom",
	"hasKey",
	"sameAs",
	"differentFrom",
	"AllDifferent",
	"distinctMembers",
	"members",

	"NegativePropertyAssertion",
	"sourceIndividual",
	"assertionProperty",
	"targetIndividual",
	"targetValue",

	"Axiom",
	"Annotation",
	"annotatedSource",
	"annotatedProperty",
	"annotatedTarget",
	"deprecated",

	"real",
	"rational",

	"DataRange",
	"DeprecatedClass",
	"DeprecatedProperty"

]);
