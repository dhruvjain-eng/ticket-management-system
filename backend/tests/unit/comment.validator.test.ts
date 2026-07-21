import { createCommentBodySchema } from "../../src/validators/comment.validator.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("comment.validator", () => {
  describe("createCommentBodySchema", () => {
    it("accepts valid input", () => {
      const result = createCommentBodySchema.safeParse({
        message: "Customer confirmed the fix.",
        createdById: VALID_UUID,
      });

      expect(result.success).toBe(true);
    });

    it("trims message whitespace", () => {
      const result = createCommentBodySchema.parse({
        message: "  Trimmed comment  ",
        createdById: VALID_UUID,
      });

      expect(result.message).toBe("Trimmed comment");
    });

    it("rejects empty message", () => {
      const result = createCommentBodySchema.safeParse({
        message: "   ",
        createdById: VALID_UUID,
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid createdById", () => {
      const result = createCommentBodySchema.safeParse({
        message: "Valid message",
        createdById: "bad-id",
      });

      expect(result.success).toBe(false);
    });
  });
});
