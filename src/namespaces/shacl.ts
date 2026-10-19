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
 * SHACL vocabulary namespace.
 *
 * Lets code refer to the terms of the SHACL vocabulary and its extensions by name, so that shape and validation report
 * IRIs are neither spelled out nor mistyped. The namespace is closed and complete.
 *
 * The core vocabulary covers shapes and targets, node kinds, property paths, constraint parameters and components,
 * non-validating property shape characteristics, the validation report, and the constraint component metamodel with
 * its parameter declarations. The extensions cover SHACL-SPARQL, the SHACL Advanced Features (custom targets,
 * annotations, functions, node expressions, rules) and the SHACL JavaScript Extensions.
 *
 * > [!NOTE]
 * > The parameter declarations of the built-in constraint components carry hyphenated names, so they are accessed with
 * > bracket notation (e.g. `shacl["AndConstraintComponent-and"]`).
 *
 * @see {@link https://www.w3.org/TR/shacl/ Shapes Constraint Language (SHACL)}
 * @see {@link https://www.w3.org/TR/shacl-af/ SHACL Advanced Features}
 * @see {@link https://www.w3.org/TR/shacl-js/ SHACL JavaScript Extensions}
 */
export const shacl = createNamespace("http://www.w3.org/ns/shacl#", [

	"Shape",
	"NodeShape",
	"PropertyShape",
	"deactivated",
	"message",
	"severity",

	"targetClass",
	"targetNode",
	"targetObjectsOf",
	"targetSubjectsOf",

	"NodeKind",
	"BlankNode",
	"IRI",
	"Literal",
	"BlankNodeOrIRI",
	"BlankNodeOrLiteral",
	"IRIOrLiteral",

	"path",
	"inversePath",
	"alternativePath",
	"zeroOrMorePath",
	"oneOrMorePath",
	"zeroOrOnePath",

	"class",
	"datatype",
	"nodeKind",
	"minCount",
	"maxCount",
	"minExclusive",
	"minInclusive",
	"maxExclusive",
	"maxInclusive",
	"minLength",
	"maxLength",
	"pattern",
	"flags",
	"languageIn",
	"uniqueLang",
	"equals",
	"disjoint",
	"lessThan",
	"lessThanOrEquals",
	"not",
	"and",
	"or",
	"xone",
	"node",
	"property",
	"qualifiedValueShape",
	"qualifiedValueShapesDisjoint",
	"qualifiedMinCount",
	"qualifiedMaxCount",
	"closed",
	"ignoredProperties",
	"hasValue",
	"in",

	"ClassConstraintComponent",
	"DatatypeConstraintComponent",
	"NodeKindConstraintComponent",
	"MinCountConstraintComponent",
	"MaxCountConstraintComponent",
	"MinExclusiveConstraintComponent",
	"MinInclusiveConstraintComponent",
	"MaxExclusiveConstraintComponent",
	"MaxInclusiveConstraintComponent",
	"MinLengthConstraintComponent",
	"MaxLengthConstraintComponent",
	"PatternConstraintComponent",
	"LanguageInConstraintComponent",
	"UniqueLangConstraintComponent",
	"EqualsConstraintComponent",
	"DisjointConstraintComponent",
	"LessThanConstraintComponent",
	"LessThanOrEqualsConstraintComponent",
	"NotConstraintComponent",
	"AndConstraintComponent",
	"OrConstraintComponent",
	"XoneConstraintComponent",
	"NodeConstraintComponent",
	"PropertyConstraintComponent",
	"QualifiedMinCountConstraintComponent",
	"QualifiedMaxCountConstraintComponent",
	"ClosedConstraintComponent",
	"HasValueConstraintComponent",
	"InConstraintComponent",

	"ClassConstraintComponent-class",
	"DatatypeConstraintComponent-datatype",
	"NodeKindConstraintComponent-nodeKind",
	"MinCountConstraintComponent-minCount",
	"MaxCountConstraintComponent-maxCount",
	"MinExclusiveConstraintComponent-minExclusive",
	"MinInclusiveConstraintComponent-minInclusive",
	"MaxExclusiveConstraintComponent-maxExclusive",
	"MaxInclusiveConstraintComponent-maxInclusive",
	"MinLengthConstraintComponent-minLength",
	"MaxLengthConstraintComponent-maxLength",
	"PatternConstraintComponent-pattern",
	"PatternConstraintComponent-flags",
	"LanguageInConstraintComponent-languageIn",
	"UniqueLangConstraintComponent-uniqueLang",
	"EqualsConstraintComponent-equals",
	"DisjointConstraintComponent-disjoint",
	"LessThanConstraintComponent-lessThan",
	"LessThanOrEqualsConstraintComponent-lessThanOrEquals",
	"NotConstraintComponent-not",
	"AndConstraintComponent-and",
	"OrConstraintComponent-or",
	"XoneConstraintComponent-xone",
	"NodeConstraintComponent-node",
	"PropertyConstraintComponent-property",
	"QualifiedMinCountConstraintComponent-qualifiedValueShape",
	"QualifiedMinCountConstraintComponent-qualifiedValueShapesDisjoint",
	"QualifiedMinCountConstraintComponent-qualifiedMinCount",
	"QualifiedMaxCountConstraintComponent-qualifiedValueShape",
	"QualifiedMaxCountConstraintComponent-qualifiedValueShapesDisjoint",
	"QualifiedMaxCountConstraintComponent-qualifiedMaxCount",
	"ClosedConstraintComponent-closed",
	"ClosedConstraintComponent-ignoredProperties",
	"HasValueConstraintComponent-hasValue",
	"InConstraintComponent-in",

	"name",
	"description",
	"order",
	"group",
	"PropertyGroup",
	"defaultValue",

	"ValidationReport",
	"conforms",
	"result",
	"shapesGraphWellFormed",
	"AbstractResult",
	"ValidationResult",
	"focusNode",
	"resultPath",
	"value",
	"sourceShape",
	"sourceConstraint",
	"sourceConstraintComponent",
	"detail",
	"resultMessage",
	"resultSeverity",
	"Severity",
	"Info",
	"Warning",
	"Violation",

	"shapesGraph",
	"suggestedShapesGraph",
	"entailment",

	"Parameterizable",
	"parameter",
	"labelTemplate",
	"Parameter",
	"optional",
	"ConstraintComponent",
	"validator",
	"nodeValidator",
	"propertyValidator",
	"Validator",
	"SPARQLAskValidator",
	"SPARQLSelectValidator",

	"SPARQLExecutable",
	"SPARQLAskExecutable",
	"SPARQLConstructExecutable",
	"SPARQLSelectExecutable",
	"SPARQLUpdateExecutable",
	"ask",
	"construct",
	"select",
	"update",
	"prefixes",
	"PrefixDeclaration",
	"declare",
	"prefix",
	"namespace",
	"SPARQLConstraint",
	"SPARQLConstraintComponent",
	"SPARQLConstraintComponent-sparql",
	"sparql",
	"this",

	"Target",
	"TargetType",
	"target",
	"SPARQLTarget",
	"SPARQLTargetType",

	"ResultAnnotation",
	"resultAnnotation",
	"annotationProperty",
	"annotationValue",
	"annotationVarName",

	"Function",
	"returnType",
	"SPARQLFunction",

	"ExpressionConstraintComponent",
	"ExpressionConstraintComponent-expression",
	"expression",
	"nodes",
	"filterShape",
	"intersection",
	"union",

	"Rule",
	"rule",
	"condition",
	"TripleRule",
	"subject",
	"predicate",
	"object",
	"SPARQLRule",

	"JSExecutable",
	"JSFunction",
	"JSLibrary",
	"JSConstraint",
	"JSConstraint-js",
	"JSConstraintComponent",
	"JSValidator",
	"JSTarget",
	"JSTargetType",
	"JSRule",
	"js",
	"jsFunctionName",
	"jsLibrary",
	"jsLibraryURL"

]);
