import { ValidationError } from "../core/errors.js";
import type { Integration } from "./types.js";

const registry = new Map<string, Integration>();

export function registerIntegration(integration: Integration): void {
	registry.set(integration.id, integration);
}

export function getIntegration(id: string): Integration | undefined {
	return registry.get(id);
}

export function resolveExecutionOrder(selectedIds: string[]): string[] {
	if (selectedIds.length === 0) {
		return [];
	}

	// Build adjacency: id -> list of ids it depends on (requires)
	const inDegree = new Map<string, number>();
	const dependents = new Map<string, string[]>(); // dependency -> list of ids that require it

	for (const id of selectedIds) {
		inDegree.set(id, 0);
		dependents.set(id, []);
	}

	for (const id of selectedIds) {
		const integration = registry.get(id);
		const requires = integration?.requires ?? [];
		for (const dep of requires) {
			if (!selectedIds.includes(dep)) {
				continue;
			}
			// id requires dep, so dep must come before id
			inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
			dependents.get(dep)?.push(id);
		}
	}

	// Kahn's algorithm
	const queue: string[] = [];
	for (const id of selectedIds) {
		if ((inDegree.get(id) ?? 0) === 0) {
			queue.push(id);
		}
	}

	const result: string[] = [];
	while (queue.length > 0) {
		const current = queue.shift() as string;
		result.push(current);

		for (const dependent of dependents.get(current) ?? []) {
			const newDegree = (inDegree.get(dependent) ?? 0) - 1;
			inDegree.set(dependent, newDegree);
			if (newDegree === 0) {
				queue.push(dependent);
			}
		}
	}

	if (result.length !== selectedIds.length) {
		throw new ValidationError(
			`Circular dependency detected among integrations: ${selectedIds.join(", ")}`,
		);
	}

	return result;
}

export function detectConflicts(
	selectedIds: string[],
): Array<{ file: string; integrations: string[] }> {
	// Build requires set: pairs (a, b) where a requires b or b requires a
	const requiresRelated = new Set<string>();
	for (const id of selectedIds) {
		const integration = registry.get(id);
		for (const dep of integration?.requires ?? []) {
			requiresRelated.add(`${id}:${dep}`);
			requiresRelated.add(`${dep}:${id}`);
		}
	}

	// Build file -> integrations map
	const fileToIntegrations = new Map<string, string[]>();
	for (const id of selectedIds) {
		const integration = registry.get(id);
		for (const file of integration?.modifies ?? []) {
			if (!fileToIntegrations.has(file)) {
				fileToIntegrations.set(file, []);
			}
			fileToIntegrations.get(file)?.push(id);
		}
	}

	const conflicts: Array<{ file: string; integrations: string[] }> = [];

	for (const [file, ids] of fileToIntegrations) {
		if (ids.length < 2) {
			continue;
		}

		// Check if any pair lacks a requires relationship
		let hasUnrelatedPair = false;
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const a = ids[i];
				const b = ids[j];
				if (!requiresRelated.has(`${a}:${b}`)) {
					hasUnrelatedPair = true;
					break;
				}
			}
			if (hasUnrelatedPair) {
				break;
			}
		}

		if (hasUnrelatedPair) {
			conflicts.push({ file, integrations: ids });
		}
	}

	return conflicts;
}
