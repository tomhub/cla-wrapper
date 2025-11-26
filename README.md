# CLA Wrapper

A modernized CDISC Library API wrapper for Node.js, written in TypeScript.
Provides convenient classes and utilities for interacting with CDISC Library endpoints, parsing responses, and managing product metadata.

[CDISC Library API](https://www.cdisc.org/cdisc-library/api-documentation#/).

## Features

- **TypeScript first:** Strongly typed interfaces and classes.
- **Modern build tooling:** Node.js 18+ supported, CI/CD with GitHub Actions.
- **Governance aligned:** Explicit configs for ESLint 9, Prettier, semantic-release 25.
- **API utilities:**
  - Request handling with traffic stats.
  - Product, group, and terminology management.
  - Search and scope queries.
- **Developer experience:**
  - Pre-commit hooks with simple-git-hooks.
  - Automated releases to npm and GitHub.
  - Prettier formatting enforced.

# Installation

To add CLA Wrapper to your project, run

```bash
npm install tomhub/cla-wrapper
```

# Usage and Documentation

In order to use the API you need CDISC Library credentials(Basic Auth) or API key(OAuth2). See [CDISC page](https://www.cdisc.org/cdisc-library) for more details.

## Usage

```ts
import { CdiscLibrary } from "cla-wrapper";

const lib = new CdiscLibrary({ apiKey: process.env.CDISC_API_KEY });

async function run() {
  const products = await lib.getProductClasses();
  console.log(Object.keys(products));
}
run();
```

## Original Authors

- [**Dmitry Kolosov**](https://www.linkedin.com/in/dmitry-kolosov-91751413/)
- [**Sergei Krivtcov**](https://www.linkedin.com/in/sergey-krivtsov-677419b4/)

[github]: https://github.com/defineEditor/cla-wrapper

# Update

Updated by Copilot, ChatGPT, Gemini, Claude (as requested by Tomas Demčenko) to modernize the code and build process.

## Development

### Requirements

- Node.js 18+ (20+ recommended for rimraf v6).
- npm (standardized package manager).

### Setup

```bash
git clone https://github.com/tomhub/cla-wrapper.git
cd cla-wrapper
npm ci
```

### Scripts

```bash
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm test           # Run tests (Vitest)
npm run clean      # Remove build artifacts with rimraf
npm run build      # Compile TypeScript
```

## Linting & Formatting

- ESLint 9 with flat config (`eslint.config.js`).
- Prettier 10.1.8 integrated to avoid conflicts.

Run:

```bash
npx eslint .
npx prettier --write .
```

## Release Workflow

- Automated with semantic-release v25.
- Publishes to npm and GitHub Releases.
- CI/CD pipeline defined in `.github/workflows/release.yml`.
- Requires `NPM_TOKEN` secret in GitHub Actions.

## Node.js Support Policy

- **Minimum supported:** Node.js 18 (LTS).
- **Recommended:** Node.js 20 (LTS) for rimraf v6 compatibility.
- CI tests against both 18 and 20.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Run `npm run lint` && `npm test`.
4. Submit a PR.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
