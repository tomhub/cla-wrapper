### Vitest Coverage Provider Update (Nov 2025)

- Vitest v4 no longer supports "c8" coverage provider.
- Updated vitest.config.ts to use provider "v8".
- Added "html" reporter for CI artifacts.
- Coverage thresholds remain enforced (80% lines/functions/statements, 70% branches).

### Node.js Support Policy (Nov 2025)

- Runtime/library code supports Node.js ≥18.
- CI tests run on Node 18 and Node 20.
- Release workflow (semantic-release v25) requires Node 20.
- Maintainers should use Node 20 locally when running semantic-release.
