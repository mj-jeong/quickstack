export interface PresetDefinition {
	id: string;
	name: string;
	description: string;
	cnaOptions: {
		srcDir: boolean;
		tailwind: boolean;
		eslint: boolean;
		app: boolean;
		turbopack: boolean;
		importAlias: string;
	};
	directories: string[];
}
