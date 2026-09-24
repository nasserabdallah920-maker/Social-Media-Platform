process.env.BCRYPT_SALT_ROUNDS = "10";

const { hash_password, verify_password } = require("../../utils/bcrypt");

describe("Bcrypt Utilities", () => {
  const plainPassword = "myStrongPassword123!";

  describe("hash_password", () => {
    it("should return a hashed string different from the original password", async () => {
      const hashed = await hash_password(plainPassword);

      expect(typeof hashed).toBe("string");
      expect(hashed).not.toBe(plainPassword);
    });

    it("should produce different hashes for the same password each time", async () => {
      const hash1 = await hash_password(plainPassword);
      const hash2 = await hash_password(plainPassword);

      // bcrypt includes a salt, so hashes should always differ
      expect(hash1).not.toBe(hash2);
    });

    it("should produce a hash that starts with the bcrypt identifier ($2b$)", async () => {
      const hashed = await hash_password(plainPassword);
      expect(hashed.startsWith("$2b$") || hashed.startsWith("$2a$")).toBe(true);
    });
  });

  describe("verify_password", () => {
    it("should return true for matching password and hash", async () => {
      const hashed = await hash_password(plainPassword);
      const isValid = await verify_password(plainPassword, hashed);

      expect(isValid).toBe(true);
    });

    it("should return false for a wrong password", async () => {
      const hashed = await hash_password(plainPassword);
      const isValid = await verify_password("wrongPassword", hashed);

      expect(isValid).toBe(false);
    });

    it("should return false for an empty password", async () => {
      const hashed = await hash_password(plainPassword);
      const isValid = await verify_password("", hashed);

      expect(isValid).toBe(false);
    });
  });
});
