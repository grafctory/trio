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
 * N-Triples codec for the RDF {@link index.Graph | Graph} model.
 *
 * @module
 *
 * @see {@link https://www.w3.org/TR/n-triples/ RDF 1.1 N-Triples}
 */


/**
 * IANA media type for the N-Triples RDF serialisation.
 *
 * @see {@link https://www.w3.org/TR/n-triples/#sec-mediaReg-n-triples N-Triples §B — Internet Media Type, File
 * 		Extension and Macintosh File Type}
 */
export const NTriples = "application/n-triples";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export { decodeNTriples } from "./decoder.js";
export { encodeNTriples } from "./encoder.js";
