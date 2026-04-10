import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		passWithNoTests: true,
		projects: [
			{
				test: {
					name: "unit",
					include: ["tests/unit/**/*.test.ts"],
					globals: true,
					testTimeout: 5_000,
					passWithNoTests: true,
				},
			},
			{
				test: {
					name: "integration",
					include: ["tests/integration/**/*.test.ts"],
					globals: true,
					testTimeout: 30_000,
					fileParallelism: true,
					passWithNoTests: true,
				},
			},
			{
				test: {
					name: "e2e",
					include: ["tests/e2e/**/*.test.ts"],
					globals: true,
					testTimeout: 120_000,
					fileParallelism: false,
					poolOptions: {
						forks: { singleFork: true },
					},
					passWithNoTests: true,
				},
			},
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
		},
	},
});
