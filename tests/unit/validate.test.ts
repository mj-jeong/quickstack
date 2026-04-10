import { describe, expect, it } from "vitest";
import { validateProjectName } from "../../src/utils/validate.js";

describe("validateProjectName", () => {
	it("accepts 'my-app'", () => {
		expect(validateProjectName("my-app").valid).toBe(true);
	});

	it("accepts 'app123'", () => {
		expect(validateProjectName("app123").valid).toBe(true);
	});

	it("accepts single character 'a' (minimum length)", () => {
		expect(validateProjectName("a").valid).toBe(true);
	});

	it("rejects 'My-App' (uppercase letters)", () => {
		const result = validateProjectName("My-App");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});

	it("rejects '-my-app' (starts with hyphen)", () => {
		const result = validateProjectName("-my-app");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});

	it("rejects 'my-app-' (ends with hyphen)", () => {
		const result = validateProjectName("my-app-");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});

	it("rejects 'my app' (contains space)", () => {
		const result = validateProjectName("my app");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});

	it("rejects 'node_modules' (reserved name)", () => {
		const result = validateProjectName("node_modules");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});

	it("rejects empty string", () => {
		const result = validateProjectName("");
		expect(result.valid).toBe(false);
		expect(result.message).toBeTruthy();
	});
});
