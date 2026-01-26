import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAssessmentHref, resolveRelativePath } from "../dist/index.js";

describe("resolveAssessmentHref", () => {
  it("resolves relative hrefs against assessment-test path", () => {
    const resolved = resolveAssessmentHref("qti/assessment-test.qti.xml", "items/item-1.qti.xml");
    assert.equal(resolved, "qti/items/item-1.qti.xml");
  });

  it("rejects parent traversal", () => {
    assert.throws(() => resolveAssessmentHref("assessment-test.qti.xml", "../item.qti.xml"));
  });
});

describe("resolveRelativePath", () => {
  it("resolves with parent segments", () => {
    const resolved = resolveRelativePath("items/section/item.qti.xml", "../img.png");
    assert.equal(resolved, "items/img.png");
  });

  it("returns null when traversal escapes root", () => {
    const resolved = resolveRelativePath("item.qti.xml", "../../img.png");
    assert.equal(resolved, null);
  });
});
