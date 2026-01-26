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

- Requires a DOMParser implementation in the runtime.

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

```bash
npm run build
npm test
```

## Environment variables

None.

## Publishing

This repository is consumed via GitHub dependency (not published to npm).
