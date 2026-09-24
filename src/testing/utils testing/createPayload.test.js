const { create_payload } = require("../../utils/createPayload");

describe("createPayload", () => {
  describe("create_payload", () => {
    it("should return an object with only the user id", () => {
      const user = { id: 1, email: "test@test.com", password: "secret", name: "Test" };
      const payload = create_payload(user);

      expect(payload).toEqual({ id: 1 });
    });

    it("should not include sensitive fields like password or email", () => {
      const user = { id: 42, email: "admin@example.com", password: "hashed_password" };
      const payload = create_payload(user);

      expect(payload).not.toHaveProperty("email");
      expect(payload).not.toHaveProperty("password");
    });

    it("should return the correct id for different users", () => {
      expect(create_payload({ id: 1 })).toEqual({ id: 1 });
      expect(create_payload({ id: 99 })).toEqual({ id: 99 });
      expect(create_payload({ id: "abc" })).toEqual({ id: "abc" });
    });
  });
});
