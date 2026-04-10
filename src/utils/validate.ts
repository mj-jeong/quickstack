const PROJECT_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const RESERVED_NAMES = new Set(["node_modules", "favicon.ico", "test", "__proto__", "constructor"]);

const MAX_LENGTH = 214;

export function validateProjectName(name: string): { valid: boolean; message?: string } {
	if (name.length === 0) {
		return { valid: false, message: "Project name must not be empty." };
	}

	if (name.length > MAX_LENGTH) {
		return {
			valid: false,
			message: `Project name must be at most ${MAX_LENGTH} characters.`,
		};
	}

	if (RESERVED_NAMES.has(name)) {
		return { valid: false, message: `"${name}" is a reserved name and cannot be used.` };
	}

	if (!PROJECT_NAME_REGEX.test(name)) {
		if (/[A-Z]/.test(name)) {
			return {
				valid: false,
				message: "Project name must be lowercase (no uppercase letters).",
			};
		}
		if (name.startsWith("-")) {
			return { valid: false, message: "Project name must not start with a hyphen." };
		}
		if (name.endsWith("-")) {
			return { valid: false, message: "Project name must not end with a hyphen." };
		}
		if (/\s/.test(name)) {
			return { valid: false, message: "Project name must not contain spaces." };
		}
		return {
			valid: false,
			message: "Project name may only contain lowercase letters, numbers, and hyphens.",
		};
	}

	return { valid: true };
}
