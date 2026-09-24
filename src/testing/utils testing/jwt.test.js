process.env.JWT_ACCESS_SECRET = "test_access_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";

const { create_tokens, verify_access_token, verify_refresh_token } = require("../../utils/jwt");
const AppError = require("../../utils/apperror");

describe("JWT Utilities", () => {
  const mockPayload = { id: 1 };

  describe("create_tokens", () => {
    it("should return both access_token and refresh_token", () => {
      const tokens = create_tokens(mockPayload);

      expect(tokens).toHaveProperty("access_token");
      expect(tokens).toHaveProperty("refresh_token");
      expect(typeof tokens.access_token).toBe("string");
      expect(typeof tokens.refresh_token).toBe("string");
    });

    it("should produce different tokens for different payloads", () => {
      const tokens1 = create_tokens({ id: 1 });
      const tokens2 = create_tokens({ id: 2 });

      expect(tokens1.access_token).not.toBe(tokens2.access_token);
      expect(tokens1.refresh_token).not.toBe(tokens2.refresh_token);
    });
  });

  describe("verify_access_token", () => {
    it("should return the decoded payload for a valid access token", () => {
      const { access_token } = create_tokens(mockPayload);
      const decoded = verify_access_token(access_token);

      expect(decoded).toHaveProperty("id", mockPayload.id);
    });

    it("should throw AppError for an invalid access token", () => {
      expect(() => verify_access_token("invalid.token.here")).toThrow(AppError);
      expect(() => verify_access_token("invalid.token.here")).toThrow("Invalid token");
    });

    it("should throw AppError for an empty token", () => {
      expect(() => verify_access_token("")).toThrow(AppError);
    });

    it("should throw AppError if refresh token is used instead of access token", () => {
      const { refresh_token } = create_tokens(mockPayload);

      expect(() => verify_access_token(refresh_token)).toThrow(AppError);
    });
  });

  describe("verify_refresh_token", () => {
    it("should return the decoded payload for a valid refresh token", () => {
      const { refresh_token } = create_tokens(mockPayload);
      const decoded = verify_refresh_token(refresh_token);

      expect(decoded).toHaveProperty("id", mockPayload.id);
    });

    it("should throw AppError for an invalid refresh token", () => {
      expect(() => verify_refresh_token("invalid.token.here")).toThrow(AppError);
      expect(() => verify_refresh_token("invalid.token.here")).toThrow("Invalid token");
    });

    it("should throw AppError if access token is used instead of refresh token", () => {
      const { access_token } = create_tokens(mockPayload);

      expect(() => verify_refresh_token(access_token)).toThrow(AppError);
    });
  });
});
