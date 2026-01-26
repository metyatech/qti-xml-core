const getElementsByLocalName = (root, localName) => {
    const withNamespace = Array.from(root.getElementsByTagNameNS('*', localName));
    if (withNamespace.length > 0)
        return withNamespace;
    return Array.from(root.getElementsByTagName(localName));
};
const parsePositiveInteger = (value) => {
    if (!value)
        return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1)
        return undefined;
    return parsed;
};
const normalizeRelativePath = (value) => {
    const parts = value.replace(/\\/g, '/').split('/');
    const stack = [];
    for (const part of parts) {
        if (!part || part === '.')
            continue;
        if (part === '..') {
            throw new Error(`Invalid relative path: ${value}`);
        }
        stack.push(part);
    }
    return stack.join('/');
};
export const resolveAssessmentHref = (assessmentTestPath, href) => {
    const testPath = normalizeRelativePath(assessmentTestPath);
    const baseDirParts = testPath.split('/');
    baseDirParts.pop();
    const baseDir = baseDirParts.join('/');
    const combined = baseDir ? `${baseDir}/${href}` : href;
    return normalizeRelativePath(combined);
};
export const parseAssessmentTestXml = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const root = doc.documentElement;
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
export const parseResultsXmlRaw = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const root = doc.documentElement;
    if (root.nodeName === 'parsererror') {
        throw new Error('results XML parse failed');
    }
    const context = getElementsByLocalName(root, 'context')[0];
    const sourcedId = context?.getAttribute('sourcedId') ?? '';
    const sessionIdentifiers = {};
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
    const itemResults = [];
    const itemResultNodes = getElementsByLocalName(root, 'itemResult');
    for (const itemResult of itemResultNodes) {
        const identifier = itemResult.getAttribute('identifier') ?? '';
        const sequenceIndex = parsePositiveInteger(itemResult.getAttribute('sequenceIndex'));
        const responseVariables = {};
        const responseVarNodes = getElementsByLocalName(itemResult, 'responseVariable');
        for (const rv of responseVarNodes) {
            const rvId = rv.getAttribute('identifier') ?? '';
            const candidateResponse = getElementsByLocalName(rv, 'candidateResponse')[0];
            if (!rvId || !candidateResponse)
                continue;
            const values = getElementsByLocalName(candidateResponse, 'value').map((v) => v.textContent ?? '');
            responseVariables[rvId] = values;
        }
        const outcomeVariables = {};
        const outcomeVarNodes = getElementsByLocalName(itemResult, 'outcomeVariable');
        for (const ov of outcomeVarNodes) {
            const ovId = ov.getAttribute('identifier') ?? '';
            if (!ovId)
                continue;
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
//# sourceMappingURL=index.js.map