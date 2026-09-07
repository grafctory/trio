> [!CAUTION]
>
> - **UNDER NO CIRCUMSTANCES** rearchitect or refactor unrelated code beyond the requested scope.
> - **NEVER** make unsolicited changes or revert **unrelated** user edits.
> - **ONLY** modify code when explicitly requested or clearly required.

> [!IMPORTANT]
>
> - **ALL** relevant skills **MUST** be used when applicable without continuous prompting.
> - **SKILL** guidance **ALWAYS** supersedes internal general-purpose knowledge.

# Overview

`@metreeca/trio` is the RDF substrate shared across Metreeca packages: the term and graph data model, declarative
combinators for assembling graphs from domain objects, and codecs for standard RDF serialisations.

The package is query-language-agnostic and carries no store or protocol dependencies. SPARQL-specific concerns
(`Repository`, `SPARQL`, `Tuple`, `Pattern`, `Variable`) remain in `@metreeca/wire-sparql`, which depends on this
package.

# References

- [@metreeca/core](https://github.com/metreeca/core) - Core utilities and shared types
- [@metreeca/wire](https://github.com/metreeca/wire) - Storage connectors, including the SPARQL family

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Configure for local development
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Serve live docs

# Documentation Synchronization

The following descriptions must be kept in sync:

- `package.json`: `description` field
- `README.md`: first line after badges
- GitHub repository "About" section
