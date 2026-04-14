import { z } from "zod";

export const Framework = z.enum(["nextjs"]);
export const PackageManager = z.enum(["npm", "pnpm", "yarn"]);
export const Preset = z.enum(["minimal", "recommended"]);
export const StylingLib = z.enum(["tailwind", "shadcn", "lucide-react", "framer-motion"]);
export const UtilityLib = z.enum(["zod", "date-fns", "ts-pattern", "es-toolkit"]);
export const StateFormLib = z.enum(["zustand", "react-hook-form"]);
export const AuthLib = z.enum(["next-auth"]);
export const DatabaseLib = z.enum(["prisma", "drizzle", "supabase"]);

export const SetupMode = z.enum(["new-directory", "current-directory"]);

export const ProjectContextSchema = z.object({
	projectName: z
		.string()
		.min(1)
		.regex(/^[a-z0-9-]+$/),
	setupMode: SetupMode,
	framework: Framework,
	packageManager: PackageManager,
	preset: Preset,
	styling: z.array(StylingLib),
	utilities: z.array(UtilityLib),
	stateForm: z.array(StateFormLib),
	auth: z.array(AuthLib),
	database: z.array(DatabaseLib),
	dryRun: z.boolean().default(false),
});

export type ProjectContext = z.infer<typeof ProjectContextSchema>;
