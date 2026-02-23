# Changelog

## 0.1.3

### Tests

- Add comprehensive test suite covering all parser functions (`extractItemIdentifier`, `parseAssessmentTestXml`, `parseAssessmentItemRefsFromXml`, `parseResultItemRefsFromXml`, `parseResultsXmlRaw`).

### Chores

- Apply consistent double-quote formatting across source and test files (Prettier).
- Add ESLint config (`eslint.config.js`) and Prettier config (`.prettierrc`, `.prettierignore`).
- Add `.npmignore` to exclude `node_modules` and `dist` from git-based installs.
- Add OSV Scanner dependency vulnerability scanning to CI workflow.
- Update `package.json` with `lint`, `format`, `format:check`, `typecheck`, and `verify` scripts.
- Update `tsconfig.json` and devDependencies (`eslint`, `typescript-eslint`, `prettier`).

## 0.1.2

- Add item identifier extraction and assessment/results item reference parsing helpers.
- Add relative path resolution helper with parent traversal support.
- Add @xmldom/xmldom fallback for DOMParser in Node.

## 0.1.0

- Initial release with assessment-test parsing, results raw parsing, and href resolution.
