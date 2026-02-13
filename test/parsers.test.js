import { describe, it } from "node:test";
import assert from "node:assert";
import {
  extractItemIdentifier,
  parseAssessmentTestXml,
  parseAssessmentItemRefsFromXml,
  parseResultItemRefsFromXml,
  parseResultsXmlRaw,
} from "../dist/index.js";

describe("extractItemIdentifier", () => {
  it("extracts identifier from qti-assessment-item root", () => {
    const xml = `<qti-assessment-item identifier="item-1" xmlns="http://www.imsglobal.org/xsd/qti_v3p0"></qti-assessment-item>`;
    assert.strictEqual(extractItemIdentifier(xml), "item-1");
  });

  it("extracts identifier from nested qti-assessment-item", () => {
    const xml = `<root><qti-assessment-item identifier="item-2"></qti-assessment-item></root>`;
    assert.strictEqual(extractItemIdentifier(xml), "item-2");
  });

  it("returns null if no identifier found", () => {
    const xml = `<root></root>`;
    assert.strictEqual(extractItemIdentifier(xml), null);
  });
});

describe("parseAssessmentTestXml", () => {
  it("parses item refs from assessment test", () => {
    const xml = `
      <qti-assessment-test identifier="test-1">
        <qti-assessment-item-ref identifier="item-1" href="item-1.xml" />
        <qti-assessment-item-ref identifier="item-2" href="item-2.xml" />
      </qti-assessment-test>
    `;
    const result = parseAssessmentTestXml(xml);
    assert.deepStrictEqual(result, [
      { identifier: "item-1", href: "item-1.xml" },
      { identifier: "item-2", href: "item-2.xml" },
    ]);
  });

  it("throws error on missing itemRef", () => {
    const xml = `<qti-assessment-test identifier="test-1"></qti-assessment-test>`;
    assert.throws(() => parseAssessmentTestXml(xml), /has no itemRef/);
  });
});

describe("parseAssessmentItemRefsFromXml", () => {
  it("parses item refs and returns errors for invalid ones", () => {
    const xml = `
      <root>
        <qti-assessment-item-ref identifier="item-1" href="item-1.xml" />
        <qti-assessment-item-ref identifier="item-2" />
      </root>
    `;
    const result = parseAssessmentItemRefsFromXml(xml);
    assert.strictEqual(result.itemRefs.length, 1);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(
      result.errors[0].code,
      "missing-itemref-identifier-or-href"
    );
  });
});

describe("parseResultItemRefsFromXml", () => {
  it("parses itemResult nodes", () => {
    const xml = `
      <assessmentResult>
        <itemResult identifier="item-1" sequenceIndex="1" />
        <itemResult identifier="item-2" sequenceIndex="invalid" />
      </assessmentResult>
    `;
    const result = parseResultItemRefsFromXml(xml);
    assert.strictEqual(result.itemRefs.length, 2);
    assert.strictEqual(result.itemRefs[0].sequenceIndex, 1);
    assert.strictEqual(result.itemRefs[1].sequenceIndex, null);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].code, "invalid-sequence-index");
  });
});

describe("parseResultsXmlRaw", () => {
  it("parses full results XML", () => {
    const xml = `
      <assessmentResult>
        <context sourcedId="student-1">
          <sessionIdentifier sourceID="session-1" identifier="id-1" />
        </context>
        <itemResult identifier="item-1">
          <responseVariable identifier="RESPONSE">
            <candidateResponse>
              <value>choice-1</value>
            </candidateResponse>
          </responseVariable>
          <outcomeVariable identifier="SCORE">
            <value>1.0</value>
          </outcomeVariable>
        </itemResult>
      </assessmentResult>
    `;
    const result = parseResultsXmlRaw(xml);
    assert.strictEqual(result.sourcedId, "student-1");
    assert.strictEqual(result.sessionIdentifiers["session-1"], "id-1");
    assert.strictEqual(result.itemResults[0].identifier, "item-1");
    assert.deepStrictEqual(
      result.itemResults[0].responseVariables["RESPONSE"],
      ["choice-1"]
    );
    assert.deepStrictEqual(result.itemResults[0].outcomeVariables["SCORE"], [
      "1.0",
    ]);
  });
});
