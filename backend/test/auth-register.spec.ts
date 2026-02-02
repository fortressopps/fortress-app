import { describe, it, expect } from "vitest";
import { app } from "../src/app";

describe("Auth Register & Email Verification", () => {
  it("should register user and send verification email", async () => {
    const res = await app.request("http://localhost/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "testuser@example.com",
        password: "testpass123",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("should not register with existing email", async () => {
    await app.request("http://localhost/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "testuser-dupe@example.com",
        password: "testpass123",
      }),
    });
    const res = await app.request("http://localhost/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "testuser-dupe@example.com",
        password: "testpass123",
      }),
    });
    expect(res.status).toBe(409);
  });

  it("should fail verification with invalid token", async () => {
    const res = await app.request("http://localhost/auth/verify-email?token=invalidtoken");
    expect(res.status).toBe(400);
  });
});
