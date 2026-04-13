let registered = false;

export async function registerAllIntegrations(): Promise<void> {
	if (registered) {
		return;
	}
	registered = true;

	// Each import's side-effect calls registerIntegration() into the global registry.
	// Dynamic imports are awaited to ensure all integrations are registered before
	// resolveExecutionOrder() is called.
	await import("./tailwind/index.js");
	await import("./shadcn/index.js");
	await import("./framer-motion/index.js");
	await import("./zod/index.js");
	await import("./date-fns/index.js");
	await import("./ts-pattern/index.js");
	await import("./es-toolkit/index.js");
	await import("./zustand/index.js");
	await import("./react-hook-form/index.js");
	await import("./supabase/index.js");
	await import("./lucide-react/index.js");
	await import("./next-auth/index.js");
	await import("./prisma/index.js");
	await import("./drizzle/index.js");
}
