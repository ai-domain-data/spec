# Changelog

All notable changes to the AI Domain Data Standard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **WordPress Plugin**: Official WordPress plugin now available at [wordpress.org/plugins/ai-domain-data](https://wordpress.org/plugins/ai-domain-data/). Provides admin interface for generating and serving `domain-profile.json` via REST API.
- **GitHub Action**: Official GitHub Action [`ai-domain-data-validate-action`](https://github.com/ai-domain-data/ai-domain-data-validate-action) now available for validating `domain-profile.json` files in CI/CD workflows.

### Documentation

- Updated all documentation to reflect WordPress plugin and GitHub Action availability
- Moved WordPress plugin from roadmap to available integrations section
- Updated implementation overview and technical guide with current integration status

## [0.1.1] - 2025-11-18

### Added

- **`jsonld` field**: Optional field for embedding schema.org JSON-LD blocks directly in the domain profile. This enables seamless interoperability with existing structured data pipelines and tools that already process schema.org data.
- **Entity type vocabulary guidance**: The `entity_type` field now uses schema.org `@type` values directly (Organization, Person, Blog, NGO, Community, Project, CreativeWork, SoftwareApplication, Thing) for maximum compatibility.
- **Schema.org mapping and interoperability**: Enhanced documentation and examples demonstrating how AIDD records integrate with schema.org vocabulary, eliminating the need for translation layers.
- **Comprehensive test suite**: Added automated test suites covering schema validation, examples, backward compatibility, and edge cases to ensure production-ready reliability.
- **Integrator Quickstart guide**: New `spec/docs/integrator-quickstart.md` providing practical implementation guidance for plugin authors, CMS developers, and platform builders.
- **Canonical examples**: Added `spec/examples/basic.json` (minimal record) and `spec/examples/with-jsonld.json` (complete record with all optional fields).
- **Enhanced tooling**:
  - Generator now supports `jsonld` field with UI for embedding JSON-LD blocks
  - Checker validates `jsonld` field and provides detailed error messages
  - CLI includes `jsonld` field in template and validation
  - Resolver SDK correctly types and handles `jsonld` field

### Changed

- **Schema `$id`**: Updated to canonical URL `https://ai-domain-data.org/spec/schema-v0.1.json` for stable reference.
- **Schema title**: Updated to "AI Domain Data v0.1.1" while maintaining backward compatibility.
- **Entity type validation**: Added `enum` constraint to `entity_type` property, enforcing valid schema.org `@type` values.
- **Documentation**: Updated all references to reflect v0.1.1 as current version while maintaining `https://ai-domain-data.org/spec/v0.1` as the constant `spec` field value for backward compatibility.

### Fixed

- **Schema validation**: Corrected schema import paths across all tooling to use the canonical schema location.
- **TypeScript types**: Improved type safety in Resolver SDK with explicit `AIDDPayload` type including `jsonld` field.
- **Validation error messages**: Enhanced checker to display detailed, actionable validation errors for invalid records.

### Documentation

- **Technical Guide**: Updated to v0.1.1 with schema.org integration guidance and removed all SaaS references.
- **Adoption Guide**: Added quick reference section with links to example files.
- **Implementation Overview**: Updated to reflect v0.1.1 precedence rules and new tooling capabilities.
- **Specification**: Added "For integrators" section linking to quickstart guide.

### Backward Compatibility

**All changes in v0.1.1 are backward-compatible with v0.1.**

- Existing v0.1 records (without `jsonld`, `logo`, or `entity_type`) continue to validate
- The `spec` field value remains `https://ai-domain-data.org/spec/v0.1` in JSON records
- All new fields are optional
- Schema accepts records with or without optional fields
- Breaking changes will use a new spec URL (e.g., `v0.2`) rather than `v0.1.2`

## [0.1.0] - 2025-11-14

### Added

- Initial release of the AI Domain Data Standard
- Core specification defining the JSON schema and retrieval process
- Required fields: `spec`, `name`, `description`, `website`, `contact`
- Optional fields: `logo`, `entity_type`
- HTTPS endpoint: `/.well-known/domain-profile.json`
- DNS fallback: `_ai.<domain>` TXT record with `ai-json=<base64>` format
- Resolution precedence: HTTPS primary, DNS fallback
- Reference tooling: Generator, Checker, CLI, and Resolver SDK
- Documentation: Specification, technical guide, adoption guide, implementation overview

