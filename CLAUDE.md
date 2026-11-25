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

`@grafctory/trio` is the RDF substrate shared across Grafctory packages: the term and graph data model, declarative
combinators for assembling graphs from domain objects, and codecs for standard RDF serialisations.

The package is query-language-agnostic and carries no store or protocol dependencies. SPARQL-specific concerns
(`Repository`, `SPARQL`, `Tuple`, `Pattern`, `Variable`) remain in `@grafctory/wire-sparql`, which depends on this
package.

# References

- [@grafctory/core](https://github.com/grafctory/core) - Core utilities and shared types
- [@grafctory/wire](https://github.com/grafctory/wire) - Storage connectors, including the SPARQL family

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Install dependencies and link sibling `@grafctory/*` repositories
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Serve live docs

> [!CAUTION]
> **`prime` and `setup` are not interchangeable.** Run `prime` when finalising a public release: `@grafctory/*` imports
> resolve to the published releases recorded in the lockfile. Run `setup` for local development against unpublished
> sibling branches: imports resolve to the working copies in the neighbouring repositories.

# Documentation Scope

> [!CAUTION]
> **Consumers are assumed to know RDF 1.1 and its serialisations.** Docs state only what this package decides on top
> of the specs (validation rules, storage choices, renumbering, failure modes) and link the spec for the rest. Never
> restate RDF semantics, the union members a type already spells out, or the factory that builds a type.

# Documentation Synchronization

The following descriptions must be kept in sync:

- `package.json`: `description` field
- `README.md`: first line after badges
- GitHub repository "About" section
