export interface AssessmentItemRef {
  identifier: string;
  href: string;
}

export interface ResultItemRef {
  identifier: string;
  sequenceIndex: number | null;
  hasSequenceIndex: boolean;
}

export type AssessmentItemRefError =
  | { code: 'missing-itemref-identifier-or-href' }
  | { code: 'no-itemref' };

export type ResultItemRefError =
  | { code: 'missing-itemresult-identifier' }
  | { code: 'invalid-sequence-index'; identifier: string }
  | { code: 'no-itemresult' };

export interface AssessmentItemRefParseResult {
  itemRefs: AssessmentItemRef[];
  errors: AssessmentItemRefError[];
}

export interface ResultItemRefParseResult {
  itemRefs: ResultItemRef[];
  errors: ResultItemRefError[];
}

export interface QtiRawItemResult {
  identifier: string;
  sequenceIndex?: number;
  responseVariables: Record<string, string[]>;
  outcomeVariables: Record<string, string[]>;
}

export interface QtiRawResults {
  sourcedId: string;
  sessionIdentifiers: Record<string, string>;
  itemResults: QtiRawItemResult[];
}

import { DOMParser as XmlDomParser } from '@xmldom/xmldom';

const getElementsByLocalName = (root: Element, localName: string): Element[] => {
  const withNamespace = Array.from(root.getElementsByTagNameNS('*', localName));
  if (withNamespace.length > 0) return withNamespace as Element[];
  return Array.from(root.getElementsByTagName(localName));
};

const parseXml = (xml: string): Document => {
  if (typeof globalThis.DOMParser === 'function') {
    return new globalThis.DOMParser().parseFromString(xml, 'application/xml');
  }
  return new XmlDomParser().parseFromString(xml, 'application/xml') as unknown as Document;
};

const parsePositiveInteger = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return undefined;
  return parsed;
};

const normalizeRelativePath = (value: string): string => {
  const parts = value.replace(/\\/g, '/').split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      throw new Error(`Invalid relative path: ${value}`);
    }
    stack.push(part);
  }
  return stack.join('/');
};

const normalizeRelativePathAllowParent = (value: string): string | null => {
  const parts = value.replace(/\\/g, '/').split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (stack.length === 0) return null;
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join('/');
};

export const resolveAssessmentHref = (assessmentTestPath: string, href: string): string => {
  const testPath = normalizeRelativePath(assessmentTestPath);
  const baseDirParts = testPath.split('/');
  baseDirParts.pop();
  const baseDir = baseDirParts.join('/');
  const combined = baseDir ? `${baseDir}/${href}` : href;
  return normalizeRelativePath(combined);
};

export const resolveRelativePath = (baseFilePath: string, relativePath: string): string | null => {
  const normalized = baseFilePath.replace(/\\/g, '/');
  const segments = normalized.split('/');
  segments.pop();
  const baseDir = segments.join('/');
  const combined = baseDir ? `${baseDir}/${relativePath}` : relativePath;
  return normalizeRelativePathAllowParent(combined);
};

export const extractItemIdentifier = (xml: string): string | null => {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root) return null;
  if (root.nodeName === 'parsererror') return null;
  if (root.localName === 'qti-assessment-item') {
    return root.getAttribute('identifier');
  }
  const itemNode = getElementsByLocalName(root, 'qti-assessment-item')[0];
  return itemNode?.getAttribute('identifier') ?? null;
};

export const parseAssessmentTestXml = (xml: string): AssessmentItemRef[] => {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root) {
    throw new Error('assessmentTest XML parse failed');
  }
  if (root.nodeName === 'parsererror') {
    throw new Error('assessmentTest XML parse failed');
  }
  if (root.localName !== 'qti-assessment-test') {
    throw new Error('assessmentTest root element is invalid');
  }
  const refNodes = getElementsByLocalName(root, 'qti-assessment-item-ref');
  const itemRefs = refNodes.map((node) => {
    const identifier = node.getAttribute('identifier') ?? '';
    const href = node.getAttribute('href') ?? '';
    return { identifier, href };
  });
  if (itemRefs.length === 0) {
    throw new Error('assessmentTest has no itemRef');
  }
  const missing = itemRefs.filter((ref) => !ref.identifier || !ref.href);
  if (missing.length > 0) {
    throw new Error('assessmentTest itemRef missing identifier or href');
  }
  return itemRefs;
};

export const parseAssessmentItemRefsFromXml = (xml: string): AssessmentItemRefParseResult => {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root) {
    return { itemRefs: [], errors: [{ code: 'no-itemref' }] };
  }
  if (root.nodeName === 'parsererror') {
    return { itemRefs: [], errors: [{ code: 'no-itemref' }] };
  }
  const refNodes = getElementsByLocalName(root, 'qti-assessment-item-ref');
  const errors: AssessmentItemRefError[] = [];
  const itemRefs: AssessmentItemRef[] = [];
  for (const node of refNodes) {
    const identifier = node.getAttribute('identifier') ?? '';
    const href = node.getAttribute('href') ?? '';
    if (!identifier || !href) {
      errors.push({ code: 'missing-itemref-identifier-or-href' });
      continue;
    }
    itemRefs.push({ identifier, href });
  }
  if (itemRefs.length === 0) {
    errors.push({ code: 'no-itemref' });
  }
  return { itemRefs, errors };
};

export const parseResultItemRefsFromXml = (xml: string): ResultItemRefParseResult => {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root) {
    return { itemRefs: [], errors: [{ code: 'no-itemresult' }] };
  }
  if (root.nodeName === 'parsererror') {
    return { itemRefs: [], errors: [{ code: 'no-itemresult' }] };
  }
  const errors: ResultItemRefError[] = [];
  const itemRefs: ResultItemRef[] = [];
  const itemResultNodes = getElementsByLocalName(root, 'itemResult');
  for (const itemResult of itemResultNodes) {
    const identifier = itemResult.getAttribute('identifier') ?? '';
    if (!identifier) {
      errors.push({ code: 'missing-itemresult-identifier' });
      continue;
    }
    const rawSequenceIndex = itemResult.getAttribute('sequenceIndex');
    const hasSequenceIndex = rawSequenceIndex !== null;
    const parsedSequenceIndex = rawSequenceIndex ? Number(rawSequenceIndex) : NaN;
    const sequenceIndex =
      hasSequenceIndex && Number.isInteger(parsedSequenceIndex) && parsedSequenceIndex > 0
        ? parsedSequenceIndex
        : null;
    if (hasSequenceIndex && sequenceIndex === null) {
      errors.push({ code: 'invalid-sequence-index', identifier });
    }
    itemRefs.push({ identifier, sequenceIndex, hasSequenceIndex });
  }
  if (itemRefs.length === 0) {
    errors.push({ code: 'no-itemresult' });
  }
  return { itemRefs, errors };
};

export const parseResultsXmlRaw = (xml: string): QtiRawResults => {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root) {
    throw new Error('results XML parse failed');
  }
  if (root.nodeName === 'parsererror') {
    throw new Error('results XML parse failed');
  }

  const context = getElementsByLocalName(root, 'context')[0];
  const sourcedId = context?.getAttribute('sourcedId') ?? '';
  const sessionIdentifiers: Record<string, string> = {};
  if (context) {
    const sessionNodes = getElementsByLocalName(context, 'sessionIdentifier');
    for (const node of sessionNodes) {
      const sourceId = node.getAttribute('sourceID') ?? '';
      const identifier = node.getAttribute('identifier') ?? '';
      if (sourceId && identifier) {
        sessionIdentifiers[sourceId] = identifier;
      }
    }
  }

  const itemResults: QtiRawItemResult[] = [];
  const itemResultNodes = getElementsByLocalName(root, 'itemResult');
  for (const itemResult of itemResultNodes) {
    const identifier = itemResult.getAttribute('identifier') ?? '';
    const sequenceIndex = parsePositiveInteger(itemResult.getAttribute('sequenceIndex'));

    const responseVariables: Record<string, string[]> = {};
    const responseVarNodes = getElementsByLocalName(itemResult, 'responseVariable');
    for (const rv of responseVarNodes) {
      const rvId = rv.getAttribute('identifier') ?? '';
      const candidateResponse = getElementsByLocalName(rv, 'candidateResponse')[0];
      if (!rvId || !candidateResponse) continue;
      const values = getElementsByLocalName(candidateResponse, 'value').map((v) => v.textContent ?? '');
      responseVariables[rvId] = values;
    }

    const outcomeVariables: Record<string, string[]> = {};
    const outcomeVarNodes = getElementsByLocalName(itemResult, 'outcomeVariable');
    for (const ov of outcomeVarNodes) {
      const ovId = ov.getAttribute('identifier') ?? '';
      if (!ovId) continue;
      const values = getElementsByLocalName(ov, 'value').map((v) => v.textContent ?? '');
      outcomeVariables[ovId] = values;
    }

    itemResults.push({
      identifier,
      sequenceIndex,
      responseVariables,
      outcomeVariables,
    });
  }

  return {
    sourcedId,
    sessionIdentifiers,
    itemResults,
  };
};
