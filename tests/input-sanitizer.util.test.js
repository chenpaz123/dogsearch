/**
 * Integration Tests for Input Sanitization
 */

const {
  sanitizeHtml,
  sanitizeText,
  stripHtml,
  sanitizeUrl,
  sanitizeObject,
} = require("../src/utils/input-sanitizer.util");

describe("Input Sanitizer Utility", () => {
  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("script");
      expect(result).not.toContain("alert");
    });

    it("should remove inline event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("onclick");
    });

    it("should remove javascript: protocol", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("javascript:");
    });

    it("should handle null input", () => {
      expect(sanitizeHtml(null)).toBe("");
      expect(sanitizeHtml(undefined)).toBe("");
    });
  });

  describe("sanitizeText", () => {
    it("should escape HTML special characters", () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeText(input);
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;"
      );
    });

    it("should escape ampersands", () => {
      const input = "Tom & Jerry";
      const result = sanitizeText(input);
      expect(result).toBe("Tom &amp; Jerry");
    });

    it("should handle empty string", () => {
      expect(sanitizeText("")).toBe("");
    });
  });

  describe("stripHtml", () => {
    it("should remove all HTML tags", () => {
      const input = "<p>Hello <b>World</b></p>";
      const result = stripHtml(input);
      expect(result).toBe("Hello World");
    });

    it("should decode HTML entities", () => {
      const input = "&lt;script&gt;";
      const result = stripHtml(input);
      expect(result).toBe("<script>");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow https URLs", () => {
      const input = "https://example.com";
      const result = sanitizeUrl(input);
      expect(result).toBe("https://example.com/");
    });

    it("should reject javascript: URLs", () => {
      const input = "javascript:alert(1)";
      const result = sanitizeUrl(input);
      expect(result).toBeNull();
    });

    it("should handle invalid URLs", () => {
      const input = "not a url";
      const result = sanitizeUrl(input);
      expect(result).toBeNull();
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize specified fields", () => {
      const input = {
        name: "<script>alert(1)</script>",
        desc: "Normal text",
      };
      const result = sanitizeObject(input, ["name", "desc"], "text");
      expect(result.name).not.toContain("<script>");
      expect(result.desc).toBe("Normal text");
    });

    it("should handle missing fields", () => {
      const input = { name: "Test" };
      const result = sanitizeObject(input, ["name", "missing"], "text");
      expect(result.name).toBe("Test");
      expect(result.missing).toBeUndefined();
    });
  });
});
