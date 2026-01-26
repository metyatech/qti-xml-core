export interface AssessmentItemRef {
    identifier: string;
    href: string;
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
export declare const resolveAssessmentHref: (assessmentTestPath: string, href: string) => string;
export declare const parseAssessmentTestXml: (xml: string) => AssessmentItemRef[];
export declare const parseResultsXmlRaw: (xml: string) => QtiRawResults;
