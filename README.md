# qti-xml-core

Minimal, dependency-free helpers for parsing QTI XML with DOMParser.

## Overview

This library provides small, focused utilities for parsing QTI 3.0 XML using
the runtime's DOMParser.

## Install

```bash
npm install qti-xml-core
```

## Setup

- Uses the runtime DOMParser when available; falls back to @xmldom/xmldom in Node.

## Usage

```ts
import {
  extractItemIdentifier,
  parseAssessmentItemRefsFromXml,
  parseAssessmentTestXml,
  parseResultItemRefsFromXml,
  parseResultsXmlRaw,
  resolveAssessmentHref,
  resolveRelativePath,
} from "qti-xml-core";
```

## Development commands

- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Format: `npm run format`
- Typecheck: `npm run typecheck`
- Verify (all checks): `npm run verify`

## Publishing

This repository is consumed via GitHub dependency (not published to npm).

## Related Documents

- [LICENSE](./LICENSE)
- [CHANGELOG](./CHANGELOG.md)
- [SECURITY](./SECURITY.md)
- [CONTRIBUTING](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md)
